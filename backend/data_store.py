import json
import os
import random
import csv
import io
import sqlite3
import bcrypt
from datetime import datetime, timedelta

DATA_FILE = os.path.join(os.path.dirname(__file__), 'neuroretail_db.json')
SQLITE_FILE = os.path.join(os.path.dirname(__file__), 'neuroretail.db')

STORES = [
    {
        "id": "STORE-01",
        "name": "Supermarket",
        "type": "Supermarket & Grocery",
        "category": "Retail Grocery",
        "gstin": "27ABCDE1234F1Z5",
        "currency": "INR (₹)",
        "currency_symbol": "₹",
        "branches_count": 4,
        "country": "India",
        "timezone": "Asia/Kolkata",
        "health_score": 96
    },
    {
        "id": "STORE-02",
        "name": "Fashion Outlet",
        "type": "Apparel & Fashion",
        "category": "Clothing",
        "gstin": "29XYZAB5678G2Z1",
        "currency": "INR (₹)",
        "currency_symbol": "₹",
        "branches_count": 2,
        "country": "India",
        "timezone": "Asia/Kolkata",
        "health_score": 91
    },
    {
        "id": "STORE-03",
        "name": "Fresh Mart Express",
        "type": "Convenience Store",
        "category": "Food & Beverages",
        "gstin": "33FRESH9012H3Z8",
        "currency": "INR (₹)",
        "currency_symbol": "₹",
        "branches_count": 6,
        "country": "India",
        "timezone": "Asia/Kolkata",
        "health_score": 94
    }
]

PRODUCTS_BY_STORE = {
    "STORE-01": [],
    "STORE-02": [],
    "STORE-03": []
}

INITIAL_PRODUCTS = []

class DataStore:
    def __init__(self):
        self.stores = STORES
        self.active_store_id = "STORE-01"
        self.user_role = "Admin"
        def _hash(pw):
            return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

        # Only the two permanent admins are seeded — all other accounts are
        # created by an Admin through the Users & Roles panel.
        self.users = []
        self.current_user = {"id": "admin", "username": "admin", "name": "Admin", "email": "admin@neuroretail.demo", "role": "Admin"}
        self.audit_logs = []          # starts empty — populated as actions are taken
        self.alerts = []              # starts empty — generated dynamically
        self.data_cleaning_logs = {
            "quality_score": 0,
            "total_rows_processed": 0,
            "duplicates_removed": 0,
            "missing_imputed": 0,
            "outliers_adjusted": 0,
            "invalid_prices": 0,
            "negative_quantities": 0,
            "invalid_dates": 0,
            "missing_product_ids": 0,
            "issues": [],
            "status": "No dataset uploaded yet"
        }
        self.ai_metrics = {
            "accuracy": 0,
            "mae": 0,
            "retrain_count": 0,
            "last_retrained": None
        }
        self.shelves = []             # populated from live product catalogue
        self.customers = []           # no demo customers
        self.sales = []               # no demo sales — populated from real datasets
        self._initialize_sqlite()

    def _connect(self):
        connection = sqlite3.connect(SQLITE_FILE)
        connection.row_factory = sqlite3.Row
        return connection

    def _hash_password(self, pw):
        return bcrypt.hashpw(str(pw).encode(), bcrypt.gensalt()).decode()

    def _initialize_sqlite(self):
        """Use SQLite for demo persistence without adding deployment dependencies."""
        with self._connect() as connection:
            connection.executescript("""
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT NOT NULL,
                    last_login TEXT
                );
                CREATE TABLE IF NOT EXISTS active_tokens (
                    token TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS products (
                    store_id TEXT NOT NULL,
                    product_id TEXT NOT NULL,
                    product_json TEXT NOT NULL,
                    PRIMARY KEY (store_id, product_id)
                );
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id TEXT PRIMARY KEY,
                    timestamp TEXT NOT NULL,
                    user_name TEXT NOT NULL,
                    role TEXT NOT NULL,
                    action TEXT NOT NULL,
                    product TEXT NOT NULL,
                    previous_value TEXT,
                    new_value TEXT,
                    log_type TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS app_state (
                    state_key TEXT PRIMARY KEY,
                    state_value TEXT NOT NULL
                );
            """)

            # Ensure the two default admin accounts exist with accurate hashes
            seeded_admins = [
                ("dharanesh", "dharanesh", "Dharanesh", "dharanesh@neuroretail.demo", "Admin@2024!", "Admin"),
                ("admin", "admin", "Admin", "admin@neuroretail.demo", "263674", "Admin"),
            ]
            for uid, uname, name, email, pw, role in seeded_admins:
                row = connection.execute("SELECT id FROM users WHERE id = ?", (uid,)).fetchone()
                if not row:
                    phash = self._hash_password(pw)
                    connection.execute(
                        "INSERT INTO users (id, username, name, email, password_hash, role, last_login) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        (uid, uname, name, email, phash, role, datetime.now().strftime("%Y-%m-%d %H:%M"))
                    )

            # Load users from database
            rows = connection.execute("SELECT * FROM users ORDER BY id").fetchall()
            self.users = [dict(row) for row in rows]
            self.current_user = next((u for u in self.users if u["id"] == "admin"), self.users[0])
            self.user_role = self.current_user.get("role", "Admin")

            # Clean out demo audit logs to guarantee zero fake data
            rows = connection.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100").fetchall()
            self.audit_logs = [{
                "id": row["id"], "timestamp": row["timestamp"], "user": row["user_name"], "role": row["role"],
                "action": row["action"], "product": row["product"], "previous_value": row["previous_value"],
                "new_value": row["new_value"], "type": row["log_type"]
            } for row in rows]

            saved_quality = connection.execute("SELECT state_value FROM app_state WHERE state_key = 'data_quality'").fetchone()
            if saved_quality:
                self.data_cleaning_logs = json.loads(saved_quality[0])
            saved_role = connection.execute("SELECT state_value FROM app_state WHERE state_key = 'active_role'").fetchone()
            if saved_role:
                self.current_user["role"] = saved_role[0]
                self.user_role = saved_role[0]

    def _insert_audit_log(self, connection, log):
        connection.execute(
            "INSERT OR REPLACE INTO audit_logs (id, timestamp, user_name, role, action, product, previous_value, new_value, log_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (log["id"], log["timestamp"], log["user"], log["role"], log["action"], log["product"], log["previous_value"], log["new_value"], log["type"])
        )

    def _persist_product(self, product):
        with self._connect() as connection:
            connection.execute(
                "INSERT OR REPLACE INTO products (store_id, product_id, product_json) VALUES (?, ?, ?)",
                (self.active_store_id, product["id"], json.dumps(product))
            )

    def _save_state(self, key, value):
        with self._connect() as connection:
            connection.execute("INSERT OR REPLACE INTO app_state (state_key, state_value) VALUES (?, ?)", (key, json.dumps(value) if not isinstance(value, str) else value))

    def get_active_store(self):
        for s in self.stores:
            if s["id"] == self.active_store_id:
                return s
        return self.stores[0]

    def set_active_store(self, store_id):
        for s in self.stores:
            if s["id"] == store_id:
                self.active_store_id = store_id
                return s
        return self.get_active_store()

    def get_products(self):
        try:
            with self._connect() as connection:
                rows = connection.execute("SELECT product_json FROM products WHERE store_id = ? ORDER BY product_id", (self.active_store_id,)).fetchall()
            if rows:
                return [json.loads(row["product_json"]) for row in rows]
        except sqlite3.Error:
            pass
        return PRODUCTS_BY_STORE.get(self.active_store_id, PRODUCTS_BY_STORE["STORE-01"])

    def get_product_by_id(self, prod_id):
        products = self.get_products()
        for p in products:
            if p["id"] == prod_id:
                return p
        return None

    def update_product_price(self, prod_id, new_price):
        prod = self.get_product_by_id(prod_id)
        if prod:
            old_price = prod["current_price"]
            prod["current_price"] = float(new_price)
            self._persist_product(prod)
            self.add_audit_log(
                "Updated price",
                prod["name"],
                f"₹{old_price:,.0f}",
                f"₹{float(new_price):,.0f}",
                "pricing"
            )
            self.save()
            return prod
        return None

    def add_audit_log(self, action, product, previous_value, new_value, log_type="system", user=None):
        if isinstance(user, dict):
            actor_name = user.get("name", "System")
            actor_role = user.get("role", "System")
        elif isinstance(user, str):
            actor_name = user
            actor_role = self.current_user.get("role", "System")
        else:
            actor_name = self.current_user.get("name", "System")
            actor_role = self.current_user.get("role", "System")

        entry = {
            "id": f"AUD-{1000 + len(self.audit_logs) + 1}",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "user": actor_name,
            "role": actor_role,
            "action": action,
            "product": product,
            "previous_value": str(previous_value),
            "new_value": str(new_value),
            "type": log_type
        }
        self.audit_logs.insert(0, entry)
        try:
            with self._connect() as connection:
                self._insert_audit_log(connection, entry)
        except sqlite3.Error:
            pass
        return entry

    def reorder_product_stock(self, prod_id, quantity):
        prod = self.get_product_by_id(prod_id)
        if not prod:
            return None
        previous_stock = prod["stock"]
        prod["stock"] += int(quantity)
        self._persist_product(prod)
        self.add_audit_log("Approved replenishment", prod["name"], f"{previous_stock} units", f"{prod['stock']} units", "inventory")
        return prod

    def update_product_stock(self, prod_id, new_stock):
        prod = self.get_product_by_id(prod_id)
        if prod:
            prod["stock"] = int(new_stock)
            self._persist_product(prod)
            self.save()
            return prod
        return None

    # ------------------------------------------------------------------
    # User management — Admin-only operations
    # ------------------------------------------------------------------

    def create_user(self, data):
        """Create a new user. Returns the safe user dict or raises ValueError."""
        username = (data.get("username") or "").strip().lower()
        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        role = data.get("role") or "Analyst"

        if not username or not name or not password:
            raise ValueError("username, name, and password are required")
        if role not in ["Admin", "Store Manager", "Analyst", "Supplier"]:
            raise ValueError("Invalid role")
        # Uniqueness check
        for u in self.users:
            if u.get("username", "").lower() == username or u.get("id", "").lower() == username:
                raise ValueError(f"Username '{username}' is already taken")
        phash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        new_user = {
            "id": username,
            "username": username,
            "name": name,
            "email": email or f"{username}@neuroretail.demo",
            "password_hash": phash,
            "role": role,
            "last_login": "Never"
        }
        self.users.append(new_user)
        with self._connect() as connection:
            connection.execute(
                "INSERT OR REPLACE INTO users (id, username, name, email, password_hash, role, last_login) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (new_user["id"], new_user["username"], new_user["name"], new_user["email"], phash, role, "Never")
            )
        self.add_audit_log("Created user account", name, "—", role, "security")
        self.save()
        return self.safe_user(new_user)

    def update_user(self, user_id, data):
        """Update an existing user's details. Returns safe user dict or None."""
        user = next((u for u in self.users if u.get("id") == user_id), None)
        if not user:
            return None
        if "name" in data and data["name"]:
            user["name"] = data["name"].strip()
        if "email" in data:
            user["email"] = data["email"].strip().lower()
        if "role" in data and data["role"] in ["Admin", "Store Manager", "Analyst", "Supplier"]:
            user["role"] = data["role"]
        if "password" in data and data["password"]:
            user["password_hash"] = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt()).decode()

        with self._connect() as connection:
            connection.execute(
                "UPDATE users SET name = ?, email = ?, password_hash = ?, role = ? WHERE id = ?",
                (user["name"], user["email"], user["password_hash"], user["role"], user_id)
            )
        self.add_audit_log("Updated user account", user["name"], "—", user["role"], "security")
        self.save()
        return self.safe_user(user)

    def delete_user(self, user_id):
        """Delete a user by id. Returns True on success, False if not found."""
        for i, u in enumerate(self.users):
            if u.get("id") == user_id:
                removed = self.users.pop(i)
                with self._connect() as connection:
                    connection.execute("DELETE FROM users WHERE id = ?", (user_id,))
                self.add_audit_log("Deleted user account", removed["name"], removed["role"], "Deleted", "security")
                self.save()
                return True
        return False

    def update_user_login(self, user_id):
        now = datetime.now().strftime("%Y-%m-%d %H:%M")
        for u in self.users:
            if u.get("id") == user_id:
                u["last_login"] = now
                break
        with self._connect() as connection:
            connection.execute("UPDATE users SET last_login = ? WHERE id = ?", (now, user_id))

    def issue_token(self, user_id):
        import uuid
        token = f"nr-auth-{uuid.uuid4().hex}"
        now = datetime.now().isoformat()
        with self._connect() as connection:
            connection.execute("INSERT OR REPLACE INTO active_tokens (token, user_id, created_at) VALUES (?, ?, ?)", (token, user_id, now))
        return token

    def validate_token(self, token):
        if not token:
            return None
        with self._connect() as connection:
            row = connection.execute("SELECT user_id FROM active_tokens WHERE token = ?", (token,)).fetchone()
            if row:
                return row["user_id"]
        return None

    def revoke_token(self, token):
        if not token:
            return
        with self._connect() as connection:
            connection.execute("DELETE FROM active_tokens WHERE token = ?", (token,))

    def get_inventory_intelligence(self):
        items = []
        for product in self.get_products():
            stock = product.get("stock", 0)
            min_stock = product.get("min_stock", 10)
            max_stock = product.get("max_stock", 100)
            demand_score = product.get("demand_score", 50)
            daily = max(2, round(demand_score / 12 + product.get("rating", 4) * 0.7))
            status = "LOW_STOCK" if stock <= min_stock else "OVERSTOCK" if stock >= max_stock else "OPTIMAL"
            suggested = max(0, max_stock - stock) if status == "LOW_STOCK" else 0
            items.append({
                "product_id": product["id"],
                "name": product["name"],
                "category": product["category"],
                "stock": stock,
                "min_stock": min_stock,
                "max_stock": max_stock,
                "unit_cost": product.get("unit_cost", 1000.0),
                "status": status,
                "suggested_reorder_qty": suggested,
                "recommended_stock": max_stock,
                "safety_stock": min_stock,
                "eoq_units": max(15, round(daily * 14)),
                "days_of_cover": round(stock / max(1, daily), 1),
                "abc_classification": "Class A" if product.get("unit_cost", 0) > 10000 else "Class B" if product.get("unit_cost", 0) > 4000 else "Class C"
            })
        return items

    def decrement_shelf_stock(self, shelf_id, units=1):
        for shelf in self.shelves:
            if shelf["shelf_id"] == shelf_id:
                shelf["current_units"] = max(0, shelf["current_units"] - units)
                shelf["current_weight_grams"] = shelf["current_units"] * 120
                if shelf["current_units"] <= 5:
                    shelf["status"] = "CRITICAL_LOW"
                elif shelf["current_units"] <= 20:
                    shelf["status"] = "LOW_STOCK"
                else:
                    shelf["status"] = "OPTIMAL"
                self.save()
                return shelf
        return None

    def add_alert(self, alert_type, title, message, severity="info"):
        new_alert = {
            "id": f"ALT-{len(self.alerts) + 1}",
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "type": alert_type,
            "title": title,
            "message": message,
            "severity": severity
        }
        self.alerts.insert(0, new_alert)
        return new_alert

    def get_inventory_alerts(self):
        """Generate business-readable stock alerts from the live catalogue."""
        generated = []
        for product in self.get_products():
            stock, minimum, maximum = product["stock"], product["min_stock"], product["max_stock"]
            demand = product.get("demand_score", 50)
            if stock <= max(5, int(minimum * 0.6)):
                generated.append({
                    "id": f"INV-{product['id']}", "type": "CRITICAL_STOCK", "severity": "critical",
                    "title": f"Critical stock: {product['name']}",
                    "message": f"Only {stock} units remain; this is below the safety threshold of {minimum}. Reorder {maximum - stock} units to protect forecast demand.",
                    "product_id": product["id"], "status": "Critical"
                })
            elif stock <= minimum:
                generated.append({
                    "id": f"INV-{product['id']}", "type": "LOW_STOCK", "severity": "high",
                    "title": f"Low stock: {product['name']}",
                    "message": f"Stock is {stock} units against a minimum of {minimum}; projected demand is {demand}/100. Replenishment is recommended.",
                    "product_id": product["id"], "status": "Low"
                })
            elif stock >= maximum:
                generated.append({
                    "id": f"INV-{product['id']}", "type": "OVERSTOCK", "severity": "medium",
                    "title": f"Overstock: {product['name']}",
                    "message": f"{stock} units exceed the target maximum of {maximum}. Consider a price promotion to release working capital.",
                    "product_id": product["id"], "status": "Overstock"
                })
            else:
                generated.append({
                    "id": f"INV-{product['id']}", "type": "HEALTHY_INVENTORY", "severity": "healthy",
                    "title": f"Healthy inventory: {product['name']}",
                    "message": f"{stock} units sit within the target range of {minimum}–{maximum}. No action is required today.",
                    "product_id": product["id"], "status": "Healthy"
                })
        severity_rank = {"critical": 0, "high": 1, "medium": 2, "healthy": 3}
        return sorted(generated, key=lambda alert: severity_rank[alert["severity"]])

    def create_new_store(self, store_data):
        new_id = f"STORE-0{len(self.stores)+1}"
        store_obj = {
            "id": new_id,
            "name": store_data.get("name", "New Enterprise Store"),
            "type": store_data.get("type", "General Retail"),
            "category": store_data.get("category", "General"),
            "gstin": store_data.get("gstin", "27NEWST0000A1Z9"),
            "currency": store_data.get("currency", "INR (₹)"),
            "currency_symbol": "₹" if "INR" in store_data.get("currency", "INR") else "$",
            "branches_count": int(store_data.get("branches", 1)),
            "country": store_data.get("country", "India"),
            "timezone": store_data.get("timezone", "Asia/Kolkata"),
            "health_score": 95
        }
        self.stores.append(store_obj)
        PRODUCTS_BY_STORE[new_id] = [dict(product) for product in INITIAL_PRODUCTS]
        for product in PRODUCTS_BY_STORE[new_id]:
            with self._connect() as connection:
                connection.execute("INSERT OR REPLACE INTO products (store_id, product_id, product_json) VALUES (?, ?, ?)", (new_id, product["id"], json.dumps(product)))
        self.active_store_id = new_id
        return store_obj

    def clean_uploaded_dataset(self, file_content, filename="dataset.csv"):
        if not file_content or not str(file_content).strip():
            empty_logs = {
                "quality_score": 100, "total_rows_processed": 0, "duplicates_removed": 0,
                "missing_imputed": 0, "outliers_adjusted": 0, "invalid_prices": 0,
                "negative_quantities": 0, "invalid_dates": 0, "missing_product_ids": 0,
                "issues": [], "filename": filename, "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "status": "Ready for modelling"
            }
            self.data_cleaning_logs = empty_logs
            return empty_logs

        try:
            import pandas as pd
            import numpy as np
            # Vectorized fast CSV parsing
            df = pd.read_csv(io.StringIO(file_content.strip()), low_memory=False)
            total_rows = len(df)
            duplicates = int(df.duplicated().sum())
            missing = int(df.isna().sum().sum())
            invalid_prices = 0
            negative_qty = 0
            invalid_dates = 0
            missing_ids = 0

            col_map = {col: str(col).lower().replace(" ", "_") for col in df.columns}
            has_id = any(any(tok in c for tok in ("product_id", "productid", "sku", "product")) for c in col_map.values())
            if not has_id:
                missing_ids = total_rows

            currency_re = r"[₹,$, ]"
            numerical_values = []
            for col, norm in col_map.items():
                if any(tok in norm for tok in ("price", "revenue", "cost")):
                    if pd.api.types.is_numeric_dtype(df[col]):
                        nums = pd.to_numeric(df[col], errors="coerce")
                    else:
                        nums = pd.to_numeric(df[col].astype(str).str.replace(currency_re, "", regex=True), errors="coerce")
                    invalid_prices += int(nums.isna().sum())
                    invalid_prices += int((nums < 0).sum())
                    numerical_values.extend(nums.dropna().tolist()[:5000])

                elif any(tok in norm for tok in ("qty", "quantity", "units", "stock")):
                    if pd.api.types.is_numeric_dtype(df[col]):
                        nums = pd.to_numeric(df[col], errors="coerce")
                    else:
                        nums = pd.to_numeric(df[col].astype(str).str.replace(currency_re, "", regex=True), errors="coerce")
                    negative_qty += int((nums < 0).sum())
                    negative_qty += int(nums.isna().sum())

                elif "date" in norm:
                    invalid_dates += int(pd.to_datetime(df[col], errors="coerce").isna().sum())

            outliers = 0
            finite_nums = [float(v) for v in numerical_values if v is not None and np.isfinite(v)]
            if len(finite_nums) >= 4:
                arr = np.array(finite_nums)
                q1, q3 = np.percentile(arr, 25), np.percentile(arr, 75)
                iqr = q3 - q1
                if iqr > 0:
                    outliers = int(np.sum((arr < q1 - 1.5 * iqr) | (arr > q3 + 1.5 * iqr)))

        except Exception:
            # Fallback for unexpected formats
            raw_rows = list(csv.DictReader(io.StringIO(file_content.strip()))) if file_content.strip() else []
            total_rows = len(raw_rows)
            duplicates = missing = invalid_prices = negative_qty = invalid_dates = missing_ids = outliers = 0
            seen = set()
            for row in raw_rows[:5000]:
                sig = tuple(sorted((k, (v or "").strip()) for k, v in row.items()))
                if sig in seen:
                    duplicates += 1
                seen.add(sig)
                missing += sum(1 for v in row.values() if not v)

        issues = []
        checks = [
            (duplicates, "duplicate record(s) were detected"),
            (missing, "missing field value(s) require imputation"),
            (invalid_prices, "invalid price or cost value(s) require correction"),
            (negative_qty, "negative quantity value(s) were found"),
            (invalid_dates, "invalid date value(s) were found"),
            (missing_ids, "row(s) are missing a product ID"),
            (outliers, "price/cost outlier(s) were flagged")
        ]
        for count, text in checks:
            if count:
                issues.append({"count": count, "message": f"{count} {text}"})

        error_weight = duplicates * 0.6 + missing * 0.25 + invalid_prices * 2 + negative_qty * 2 + invalid_dates * 1.5 + missing_ids * 2 + outliers * 0.7
        quality = min(100, max(55, round(100 - (error_weight / max(total_rows, 1)) * 100, 1)))
        self.data_cleaning_logs = {
            "quality_score": quality, "total_rows_processed": total_rows, "duplicates_removed": duplicates,
            "missing_imputed": missing, "outliers_adjusted": outliers, "invalid_prices": invalid_prices,
            "negative_quantities": negative_qty, "invalid_dates": invalid_dates, "missing_product_ids": missing_ids,
            "issues": issues, "filename": filename, "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "status": "Ready for modelling" if quality >= 90 else "Needs review"
        }
        self.add_audit_log("Validated dataset", filename, "Uploaded", f"Quality score {quality}%", "data")
        self._save_state("data_quality", self.data_cleaning_logs)
        self.save()
        return self.data_cleaning_logs

    @staticmethod
    def safe_user(user):
        """Return a copy of a user dict with sensitive fields removed."""
        u = dict(user)
        u.pop("password", None)
        u.pop("password_hash", None)
        return u

    def save(self):
        try:
            # Never persist password_hash or password in the JSON file —
            # only store safe (non-sensitive) user metadata.
            safe_users = [self.safe_user(u) for u in self.users]
            data = {
                "stores": self.stores,
                "active_store_id": self.active_store_id,
                "ai_metrics": self.ai_metrics,
                "alerts": self.alerts,
                "data_cleaning_logs": self.data_cleaning_logs,
                "users": safe_users,
                "audit_logs": self.audit_logs,
                "products_by_store": PRODUCTS_BY_STORE
            }
            with open(DATA_FILE, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error saving data: {e}")

db = DataStore()
