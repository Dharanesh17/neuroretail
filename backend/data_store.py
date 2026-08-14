import json
import os
import random
import csv
import io
import sqlite3
from datetime import datetime, timedelta

DATA_FILE = os.path.join(os.path.dirname(__file__), 'neuroretail_db.json')
SQLITE_FILE = os.path.join(os.path.dirname(__file__), 'neuroretail.db')

STORES = [
    {
        "id": "STORE-01",
        "name": "ABC Supermarket",
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
        "name": "XYZ Fashion Outlet",
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
    "STORE-01": [
        { "id": "PROD-101", "name": "NeuroPulse SmartWatch Pro", "category": "Wearables", "base_price": 19999.00, "current_price": 21499.00, "competitor_price": 20999.00, "stock": 18, "min_stock": 25, "max_stock": 150, "unit_cost": 11500.00, "demand_score": 88, "rating": 4.8, "return_rate": 0.02, "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60" },
        { "id": "PROD-102", "name": "AcousticSense ANC Headphones", "category": "Audio", "base_price": 14999.00, "current_price": 13999.00, "competitor_price": 14499.00, "stock": 62, "min_stock": 20, "max_stock": 120, "unit_cost": 7500.00, "demand_score": 74, "rating": 4.7, "return_rate": 0.04, "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60" },
        { "id": "PROD-103", "name": "CogniHome Smart Hub", "category": "Smart Home", "base_price": 9999.00, "current_price": 10499.00, "competitor_price": 10299.00, "stock": 12, "min_stock": 15, "max_stock": 80, "unit_cost": 5200.00, "demand_score": 92, "rating": 4.5, "return_rate": 0.01, "image_url": "https://images.unsplash.com/photo-1558002038-1055907df827?w=500&auto=format&fit=crop&q=60" },
        { "id": "PROD-104", "name": "OptiVision 4K Drone Cam", "category": "Electronics", "base_price": 39999.00, "current_price": 37999.00, "competitor_price": 38999.00, "stock": 9, "min_stock": 10, "max_stock": 40, "unit_cost": 22000.00, "demand_score": 81, "rating": 4.9, "return_rate": 0.05, "image_url": "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=500&auto=format&fit=crop&q=60" },
        { "id": "PROD-105", "name": "BioGrid Ergonomic Desk Lamp", "category": "Smart Home", "base_price": 5999.00, "current_price": 5499.00, "competitor_price": 5799.00, "stock": 95, "min_stock": 15, "max_stock": 60, "unit_cost": 2600.00, "demand_score": 45, "rating": 4.4, "return_rate": 0.03, "image_url": "https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=500&auto=format&fit=crop&q=60" },
        { "id": "PROD-106", "name": "HyperCharge MagSafe PowerBank", "category": "Accessories", "base_price": 3499.00, "current_price": 3799.00, "competitor_price": 3699.00, "stock": 110, "min_stock": 30, "max_stock": 200, "unit_cost": 1500.00, "demand_score": 95, "rating": 4.6, "return_rate": 0.01, "image_url": "https://images.unsplash.com/photo-1609592424009-41130e9d6d53?w=500&auto=format&fit=crop&q=60" }
    ],
    "STORE-02": [
        { "id": "FASH-201", "name": "Organic Denim Jacket", "category": "Apparel", "base_price": 4999.00, "current_price": 5499.00, "competitor_price": 5299.00, "stock": 45, "min_stock": 15, "max_stock": 100, "unit_cost": 2100.00, "demand_score": 86, "rating": 4.6, "return_rate": 0.08, "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60" },
        { "id": "FASH-202", "name": "Urban Leather Boots", "category": "Footwear", "base_price": 7999.00, "current_price": 8499.00, "competitor_price": 8299.00, "stock": 14, "min_stock": 20, "max_stock": 60, "unit_cost": 4100.00, "demand_score": 94, "rating": 4.9, "return_rate": 0.05, "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60" }
    ],
    "STORE-03": [
        { "id": "GROC-301", "name": "Organic Cold-Pressed Almond Milk", "category": "Dairy & Beverage", "base_price": 299.00, "current_price": 349.00, "competitor_price": 329.00, "stock": 80, "min_stock": 25, "max_stock": 200, "unit_cost": 160.00, "demand_score": 97, "rating": 4.7, "return_rate": 0.01, "image_url": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60" }
    ]
}

INITIAL_PRODUCTS = [
    { "id": "PROD-101", "name": "NeuroPulse SmartWatch Pro", "category": "Wearables", "base_price": 19999.00, "current_price": 21499.00, "competitor_price": 20999.00, "stock": 18, "min_stock": 25, "max_stock": 150, "unit_cost": 11500.00, "demand_score": 88, "rating": 4.8, "return_rate": 0.02, "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60" },
    { "id": "PROD-102", "name": "AcousticSense ANC Headphones", "category": "Audio", "base_price": 14999.00, "current_price": 13999.00, "competitor_price": 14499.00, "stock": 62, "min_stock": 20, "max_stock": 120, "unit_cost": 7500.00, "demand_score": 74, "rating": 4.7, "return_rate": 0.04, "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60" }
]

class DataStore:
    def __init__(self):
        self.stores = STORES
        self.active_store_id = "STORE-01"
        self.user_role = "Admin"
        self.current_user = {
            "id": "USR-001",
            "name": "Ananya Iyer",
            "email": "ananya.iyer@neuroretail.demo",
            "role": "Admin",
            "last_login": datetime.now().strftime("%Y-%m-%d %H:%M")
        }
        self.users = [
            self.current_user,
            {"id": "USR-002", "name": "Karthik Rao", "email": "karthik.rao@neuroretail.demo", "role": "Store Manager", "last_login": "2026-08-12 09:42"},
            {"id": "USR-003", "name": "Meera Shah", "email": "meera.shah@neuroretail.demo", "role": "Analyst", "last_login": "2026-08-12 10:18"},
            {"id": "USR-004", "name": "Vikram Supply Co.", "email": "orders@vikramsupply.demo", "role": "Supplier", "last_login": "2026-08-11 16:07"}
        ]
        self.audit_logs = [
            {"id": "AUD-1004", "timestamp": "2026-08-12 10:18", "user": "Meera Shah", "role": "Analyst", "action": "Validated sales dataset", "product": "sales_july.csv", "previous_value": "Pending", "new_value": "Quality score 96%", "type": "data"},
            {"id": "AUD-1003", "timestamp": "2026-08-12 09:42", "user": "Karthik Rao", "role": "Store Manager", "action": "Approved replenishment", "product": "CogniHome Smart Hub", "previous_value": "12 units", "new_value": "80 units on order", "type": "inventory"},
            {"id": "AUD-1002", "timestamp": "2026-08-12 09:24", "user": "Ananya Iyer", "role": "Admin", "action": "Updated price", "product": "AcousticSense ANC Headphones", "previous_value": "₹13,999", "new_value": "₹14,299", "type": "pricing"},
            {"id": "AUD-1001", "timestamp": "2026-08-12 08:55", "user": "Ananya Iyer", "role": "Admin", "action": "Retrained forecast model", "product": "Demand Forecasting", "previous_value": "v2.3", "new_value": "v2.4", "type": "model"}
        ]
        self.alerts = [
            { "id": "ALT-1", "timestamp": "18:40:12", "type": "STOCK_CRITICAL", "title": "Critical Stock: SmartWatch Pro", "message": "Current stock (18) is below safety threshold (25). Auto PO suggested.", "severity": "high" },
            { "id": "ALT-2", "timestamp": "18:25:00", "type": "PRICE_SURGE", "title": "Dynamic Price Lift Recommended", "message": "High demand velocity (+14%) detected. Suggested price lift to ₹22,399.", "severity": "info" }
        ]
        self.data_cleaning_logs = {
            "quality_score": 98,
            "total_rows_processed": 1420,
            "duplicates_removed": 14,
            "missing_imputed": 6,
            "outliers_adjusted": 3,
            "invalid_prices": 0,
            "negative_quantities": 0,
            "invalid_dates": 0,
            "missing_product_ids": 0,
            "issues": [],
            "status": "Cleaned & Normalized"
        }
        self.ai_metrics = {
            "accuracy": 96.8,
            "mae": 0.85,
            "retrain_count": 13,
            "last_retrained": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        self.shelves = [
            { "shelf_id": "SH-101", "product_id": "PROD-101", "product_name": "NeuroPulse SmartWatch Pro", "current_weight_grams": 2160, "current_units": 18, "capacity_units": 60, "status": "LOW_STOCK" },
            { "shelf_id": "SH-102", "product_id": "PROD-102", "product_name": "AcousticSense ANC Headphones", "current_weight_grams": 7440, "current_units": 62, "capacity_units": 90, "status": "OPTIMAL" },
            { "shelf_id": "SH-103", "product_id": "PROD-103", "product_name": "CogniHome Smart Hub", "current_weight_grams": 3600, "current_units": 12, "capacity_units": 45, "status": "CRITICAL_LOW" }
        ]
        self.customers = [
            { "id": "CUST-001", "name": "Rahul Sharma", "segment": "Tech Enthusiast", "purchases_count": 14, "total_spent": 142500.00, "clv": 210000.00, "cart_abandonments": 2, "viewed_product_ids": ["PROD-101", "PROD-102"] },
            { "id": "CUST-002", "name": "Priya Patel", "segment": "Smart Home Pioneer", "purchases_count": 8, "total_spent": 84500.00, "clv": 135000.00, "cart_abandonments": 4, "viewed_product_ids": ["PROD-103", "PROD-105"] }
        ]
        today = datetime.now()
        self.sales = [
            { "date": (today - timedelta(days=i)).strftime("%Y-%m-%d"), "product_id": "PROD-101", "units_sold": random.randint(15, 45), "revenue": random.randint(15, 45) * 21499.00 }
            for i in range(30, 0, -1)
        ] + [
            { "date": (today - timedelta(days=i)).strftime("%Y-%m-%d"), "product_id": "PROD-102", "units_sold": random.randint(10, 30), "revenue": random.randint(10, 30) * 13999.00 }
            for i in range(30, 0, -1)
        ]
        self._initialize_sqlite()

    def _connect(self):
        connection = sqlite3.connect(SQLITE_FILE)
        connection.row_factory = sqlite3.Row
        return connection

    def _initialize_sqlite(self):
        """Use SQLite for demo persistence without adding deployment dependencies."""
        with self._connect() as connection:
            connection.executescript("""
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
            product_count = connection.execute("SELECT COUNT(*) FROM products").fetchone()[0]
            if product_count == 0:
                for store_id, products in PRODUCTS_BY_STORE.items():
                    for product in products:
                        connection.execute(
                            "INSERT INTO products (store_id, product_id, product_json) VALUES (?, ?, ?)",
                            (store_id, product["id"], json.dumps(product))
                        )
            audit_count = connection.execute("SELECT COUNT(*) FROM audit_logs").fetchone()[0]
            if audit_count == 0:
                for log in self.audit_logs:
                    self._insert_audit_log(connection, log)
            else:
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
        actor = user or self.current_user
        entry = {
            "id": f"AUD-{1000 + len(self.audit_logs) + 1}",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "user": actor.get("name", "System"),
            "role": actor.get("role", "System"),
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
        raw_rows = list(csv.DictReader(io.StringIO(file_content.strip()))) if file_content.strip() else []
        total_rows = len(raw_rows)
        seen, duplicates, missing, invalid_prices, negative_qty, invalid_dates, missing_ids = set(), 0, 0, 0, 0, 0, 0
        numerical_values = []
        for row in raw_rows:
            signature = tuple(sorted((key, (value or "").strip()) for key, value in row.items()))
            if signature in seen:
                duplicates += 1
            seen.add(signature)
            values = {str(key).lower().replace(" ", "_"): (value or "").strip() for key, value in row.items()}
            missing += sum(1 for value in values.values() if value == "")
            if not any(values.get(key) for key in ("product_id", "productid", "sku", "product")):
                missing_ids += 1
            for key, value in values.items():
                if any(token in key for token in ("price", "revenue", "cost")) and value:
                    try:
                        number = float(value.replace("₹", "").replace(",", ""))
                        numerical_values.append(number)
                        if number < 0:
                            invalid_prices += 1
                    except ValueError:
                        invalid_prices += 1
                if any(token in key for token in ("qty", "quantity", "units", "stock")) and value:
                    try:
                        if float(value) < 0:
                            negative_qty += 1
                    except ValueError:
                        negative_qty += 1
                if "date" in key and value:
                    try:
                        datetime.fromisoformat(value.replace("Z", "+00:00"))
                    except ValueError:
                        invalid_dates += 1
        outliers = 0
        if len(numerical_values) >= 4:
            ordered = sorted(numerical_values)
            q1, q3 = ordered[len(ordered) // 4], ordered[(len(ordered) * 3) // 4]
            iqr = q3 - q1
            if iqr:
                outliers = sum(value < q1 - 1.5 * iqr or value > q3 + 1.5 * iqr for value in numerical_values)
        issues = []
        checks = [
            (duplicates, "duplicate record(s) were detected"), (missing, "missing field value(s) require imputation"),
            (invalid_prices, "invalid price or cost value(s) require correction"), (negative_qty, "negative quantity value(s) were found"),
            (invalid_dates, "invalid date value(s) were found"), (missing_ids, "row(s) are missing a product ID"),
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

    def save(self):
        try:
            data = {
                "stores": self.stores,
                "active_store_id": self.active_store_id,
                "ai_metrics": self.ai_metrics,
                "alerts": self.alerts,
                "data_cleaning_logs": self.data_cleaning_logs,
                "users": self.users,
                "audit_logs": self.audit_logs,
                "products_by_store": PRODUCTS_BY_STORE
            }
            with open(DATA_FILE, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error saving data: {e}")

db = DataStore()
