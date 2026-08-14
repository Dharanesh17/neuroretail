"""Dynamic retail dataset lifecycle and active-dataset analytics for NeuroRetail."""
from __future__ import annotations

import base64
import hashlib
import io
import json
import os
import sqlite3
import uuid
from datetime import datetime, timedelta

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split


ROOT = os.path.dirname(__file__)
SQLITE_FILE = os.path.join(ROOT, "neuroretail.db")
UPLOAD_DIR = os.path.join(ROOT, "uploads")
MODEL_DIR = os.path.join(ROOT, "models")

STANDARD_FIELDS = [
    "date", "product_id", "product_name", "category", "subcategory", "units_sold",
    "selling_price", "unit_cost", "revenue", "inventory", "discount", "promotion",
    "competitor_price", "store_id"
]

FIELD_LABELS = {
    "date": "Date", "product_id": "Product ID", "product_name": "Product", "category": "Category",
    "subcategory": "Subcategory", "units_sold": "Units Sold", "selling_price": "Selling Price",
    "unit_cost": "Unit Cost", "revenue": "Revenue", "inventory": "Inventory", "discount": "Discount",
    "promotion": "Promotion", "competitor_price": "Competitor Price", "store_id": "Store ID"
}

SYNONYMS = {
    "date": ["date", "sale date", "sales date", "order date", "transaction date", "transaction_date", "order_date", "sale_date", "datetime"],
    "product_id": ["product id", "product_id", "sku", "item id", "item_id", "product code", "item code"],
    "product_name": ["product", "product name", "product_name", "item", "item name", "item_name", "product description", "name"],
    "category": ["category", "product category", "product_category", "department"],
    "subcategory": ["subcategory", "sub category", "sub_category"],
    "units_sold": ["qty", "quantity", "units", "units sold", "units_sold", "quantity sold", "sales quantity", "volume"],
    "selling_price": ["price", "selling price", "selling_price", "unit price", "unit_price", "sale price", "retail price", "mrp"],
    "unit_cost": ["cost", "unit cost", "unit_cost", "cost price", "purchase price", "cogs"],
    "revenue": ["sales", "revenue", "total sales", "total_sales", "sales amount", "amount", "total revenue"],
    "inventory": ["stock", "inventory", "stock level", "stock_level", "inventory level", "on hand", "on_hand", "quantity in stock"],
    "discount": ["discount", "discount percent", "discount_pct", "discount percentage"],
    "promotion": ["promotion", "promo", "campaign", "is promotion"],
    "competitor_price": ["competitor price", "competitor_price", "market price", "rival price"],
    "store_id": ["store", "store id", "store_id", "branch", "branch id"]
}


def _json(value):
    return json.dumps(value, default=str)


def _normalise(text):
    return " ".join(str(text).replace("_", " ").replace("-", " ").lower().split())


def _safe_float(value):
    try:
        if pd.isna(value):
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


class DatasetService:
    def __init__(self):
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        os.makedirs(MODEL_DIR, exist_ok=True)
        self._initialise_database()

    def _connect(self):
        connection = sqlite3.connect(SQLITE_FILE)
        connection.row_factory = sqlite3.Row
        return connection

    def _initialise_database(self):
        with self._connect() as connection:
            connection.executescript("""
                CREATE TABLE IF NOT EXISTS datasets (
                    dataset_id TEXT PRIMARY KEY,
                    dataset_name TEXT NOT NULL,
                    description TEXT,
                    original_filename TEXT NOT NULL,
                    file_path TEXT NOT NULL,
                    uploaded_at TEXT NOT NULL,
                    row_count INTEGER NOT NULL,
                    column_count INTEGER NOT NULL,
                    columns_json TEXT NOT NULL,
                    mapping_json TEXT NOT NULL,
                    validation_json TEXT NOT NULL,
                    profile_json TEXT NOT NULL,
                    processed_records_json TEXT,
                    capabilities_json TEXT,
                    status TEXT NOT NULL,
                    processing_status TEXT NOT NULL,
                    is_active INTEGER NOT NULL DEFAULT 0,
                    created_by TEXT NOT NULL DEFAULT 'Admin'
                );
                CREATE TABLE IF NOT EXISTS model_versions (
                    model_id TEXT PRIMARY KEY,
                    dataset_id TEXT NOT NULL,
                    model_name TEXT NOT NULL,
                    model_version TEXT NOT NULL,
                    training_date TEXT NOT NULL,
                    training_rows INTEGER NOT NULL,
                    features_json TEXT NOT NULL,
                    mae REAL,
                    rmse REAL,
                    mape REAL,
                    r2 REAL,
                    status TEXT NOT NULL,
                    model_path TEXT,
                    FOREIGN KEY(dataset_id) REFERENCES datasets(dataset_id)
                );
            """)

    # ---------- Dataset registry ----------

    def _read_bytes(self, content, filename):
        if isinstance(content, str):
            try:
                return base64.b64decode(content, validate=True)
            except Exception:
                return content.encode("utf-8")
        return content

    def _read_frame(self, content, filename):
        raw = self._read_bytes(content, filename)
        extension = os.path.splitext(filename.lower())[1]
        if not raw:
            raise ValueError("The uploaded file is empty.")
        if extension == ".csv":
            return pd.read_csv(io.BytesIO(raw))
        if extension in (".xlsx", ".xls"):
            return pd.read_excel(io.BytesIO(raw))
        if extension == ".json":
            return pd.read_json(io.BytesIO(raw))
        raise ValueError("Only CSV, XLSX, XLS, and JSON retail datasets are supported.")

    def upload(self, content, filename, dataset_name=None, description="", created_by="Admin"):
        frame = self._read_frame(content, filename)
        if frame.empty:
            raise ValueError("The uploaded file contains no data rows.")
        dataset_id = f"DS-{uuid.uuid4().hex[:10].upper()}"
        dataset_name = (dataset_name or os.path.splitext(os.path.basename(filename))[0]).strip()[:120]
        raw = self._read_bytes(content, filename)
        stored_filename = f"{dataset_id}_{os.path.basename(filename)}"
        file_path = os.path.join(UPLOAD_DIR, stored_filename)
        with open(file_path, "wb") as file_handle:
            file_handle.write(raw)
        mapping = self.detect_mapping(frame)
        validation = self.validate_frame(frame, mapping)
        profile = self.profile_frame(frame, mapping, validation)
        with self._connect() as connection:
            connection.execute(
                """INSERT INTO datasets (dataset_id, dataset_name, description, original_filename, file_path, uploaded_at, row_count, column_count, columns_json, mapping_json, validation_json, profile_json, status, processing_status, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Uploaded', 'Awaiting column confirmation', ?)""",
                (dataset_id, dataset_name, description, filename, file_path, datetime.now().isoformat(timespec="seconds"), len(frame), len(frame.columns), _json(list(frame.columns)), _json(mapping), _json(validation), _json(profile), created_by)
            )
        return self.get_dataset(dataset_id)

    def list_datasets(self):
        with self._connect() as connection:
            rows = connection.execute("SELECT * FROM datasets ORDER BY is_active DESC, uploaded_at DESC").fetchall()
        return [self._record_metadata(row) for row in rows]

    def get_dataset(self, dataset_id):
        with self._connect() as connection:
            row = connection.execute("SELECT * FROM datasets WHERE dataset_id = ?", (dataset_id,)).fetchone()
        if not row:
            return None
        return self._record_metadata(row, include_records=False)

    def _get_row(self, dataset_id=None):
        with self._connect() as connection:
            if dataset_id:
                return connection.execute("SELECT * FROM datasets WHERE dataset_id = ?", (dataset_id,)).fetchone()
            return connection.execute("SELECT * FROM datasets WHERE is_active = 1 LIMIT 1").fetchone()

    def _record_metadata(self, row, include_records=False):
        response = {
            "dataset_id": row["dataset_id"], "dataset_name": row["dataset_name"], "description": row["description"] or "",
            "original_filename": row["original_filename"], "upload_date": row["uploaded_at"], "row_count": row["row_count"],
            "column_count": row["column_count"], "columns": json.loads(row["columns_json"]), "mapping": json.loads(row["mapping_json"]),
            "validation": json.loads(row["validation_json"]), "profile": json.loads(row["profile_json"]),
            "capabilities": json.loads(row["capabilities_json"] or "{}"), "status": row["status"],
            "processing_status": row["processing_status"], "is_active": bool(row["is_active"]), "created_by": row["created_by"]
        }
        if include_records:
            response["records"] = json.loads(row["processed_records_json"] or "[]")
        return response

    def get_active_dataset(self):
        row = self._get_row()
        return self._record_metadata(row) if row else None

    def archive(self, dataset_id):
        with self._connect() as connection:
            row = connection.execute("SELECT is_active FROM datasets WHERE dataset_id = ?", (dataset_id,)).fetchone()
            if not row:
                return False
            connection.execute("UPDATE datasets SET status = 'Archived', is_active = 0 WHERE dataset_id = ?", (dataset_id,))
        return True

    def delete(self, dataset_id):
        row = self._get_row(dataset_id)
        if not row:
            return False
        if row["is_active"]:
            raise ValueError("Deactivate this dataset before deleting it.")
        with self._connect() as connection:
            connection.execute("DELETE FROM model_versions WHERE dataset_id = ?", (dataset_id,))
            connection.execute("DELETE FROM datasets WHERE dataset_id = ?", (dataset_id,))
        if os.path.exists(row["file_path"]):
            os.remove(row["file_path"])
        return True

    # ---------- Mapping, validation, processing ----------

    def detect_mapping(self, frame):
        mappings = []
        for column in frame.columns:
            normal = _normalise(column)
            sample = frame[column].dropna().head(25)
            sample_text = " ".join(sample.astype(str).tolist())
            date_ratio = pd.to_datetime(sample, errors="coerce").notna().mean() if len(sample) else 0
            numeric_ratio = pd.to_numeric(sample.astype(str).str.replace(r"[₹,$,]", "", regex=True), errors="coerce").notna().mean() if len(sample) else 0
            candidates = []
            for field, terms in SYNONYMS.items():
                exact = normal in terms
                contains = any(term in normal or normal in term for term in terms)
                score = 0.99 if exact else 0.84 if contains else 0
                if field == "date" and date_ratio >= 0.8:
                    score = max(score, 0.78)
                if field in {"units_sold", "selling_price", "unit_cost", "revenue", "inventory", "discount", "competitor_price"} and numeric_ratio >= 0.85:
                    score = max(score, 0.42)
                if field == "product_name" and numeric_ratio < 0.25 and len(sample_text) > 0:
                    score = max(score, 0.34)
                if score:
                    candidates.append((field, score))
            if candidates:
                field, score = max(candidates, key=lambda candidate: candidate[1])
                mappings.append({"source": str(column), "target": field, "target_label": FIELD_LABELS[field], "confidence": round(score * 100), "detected": True})
            else:
                mappings.append({"source": str(column), "target": None, "target_label": "Unmapped", "confidence": 0, "detected": True})
        # Keep a one-to-one automatic mapping: high-confidence source wins each target.
        selected = {}
        for mapping in sorted([item for item in mappings if item["target"]], key=lambda item: item["confidence"], reverse=True):
            if mapping["target"] in selected:
                mapping["target"] = None
                mapping["target_label"] = "Unmapped"
                mapping["confidence"] = 0
            else:
                selected[mapping["target"]] = mapping["source"]
        return mappings

    def _mapping_dict(self, mapping):
        # Client submits source->target mapping; accept internal target->source too.
        resolved = {}
        if isinstance(mapping, dict):
            for key, value in mapping.items():
                if key in STANDARD_FIELDS:
                    resolved[key] = value
                elif value in STANDARD_FIELDS:
                    resolved[value] = key
        else:
            for item in mapping or []:
                if item.get("target") in STANDARD_FIELDS:
                    resolved[item["target"]] = item["source"]
        return resolved

    def validate_frame(self, frame, mapping):
        mapped = self._mapping_dict(mapping)
        total = max(len(frame), 1)
        missing = int(frame.isna().sum().sum())
        duplicates = int(frame.duplicated().sum())
        invalid_dates = invalid_prices = invalid_qty = negative_qty = negative_sales = outliers = 0
        if mapped.get("date") in frame:
            invalid_dates = int(pd.to_datetime(frame[mapped["date"]], errors="coerce").isna().sum())
        for field in ("selling_price", "unit_cost", "revenue", "competitor_price"):
            source = mapped.get(field)
            if source in frame:
                numeric = pd.to_numeric(frame[source].astype(str).str.replace(r"[₹,$,]", "", regex=True), errors="coerce")
                invalid_prices += int(numeric.isna().sum())
                negative_sales += int((numeric < 0).sum())
        for field in ("units_sold", "inventory"):
            source = mapped.get(field)
            if source in frame:
                numeric = pd.to_numeric(frame[source].astype(str).str.replace(r"[₹,$,]", "", regex=True), errors="coerce")
                invalid_qty += int(numeric.isna().sum())
                negative_qty += int((numeric < 0).sum())
        for source in mapped.values():
            if source in frame:
                numeric = pd.to_numeric(frame[source].astype(str).str.replace(r"[₹,$,]", "", regex=True), errors="coerce")
                values = numeric.dropna()
                if len(values) >= 4:
                    q1, q3 = values.quantile(0.25), values.quantile(0.75)
                    iqr = q3 - q1
                    if iqr > 0:
                        outliers += int(((values < q1 - 1.5 * iqr) | (values > q3 + 1.5 * iqr)).sum())
        problems = duplicates + missing / max(len(frame.columns), 1) + invalid_dates + invalid_prices + invalid_qty + negative_qty + negative_sales + outliers * 0.5
        score = max(0, round(100 - problems / total * 100, 1))
        warnings = []
        for count, text in [(missing, "missing value(s)"), (duplicates, "duplicate record(s)"), (invalid_dates, "invalid date(s)"), (invalid_prices, "invalid price/cost value(s)"), (invalid_qty, "invalid quantity value(s)"), (negative_qty, "negative quantity value(s)"), (negative_sales, "negative sales value(s)"), (outliers, "numeric outlier(s)")]:
            if count:
                warnings.append(f"{count} {text}")
        essentials = [field for field in ("date", "product_name", "product_id", "units_sold", "selling_price", "inventory") if field not in mapped]
        return {"quality_score": score, "total_rows": len(frame), "total_columns": len(frame.columns), "missing_values": missing, "duplicate_records": duplicates, "invalid_dates": invalid_dates, "invalid_prices": invalid_prices, "invalid_quantities": invalid_qty, "negative_quantities": negative_qty, "negative_sales": negative_sales, "outliers": outliers, "missing_standard_fields": essentials, "warnings": warnings, "valid": score >= 55}

    def profile_frame(self, frame, mapping, validation):
        mapped = self._mapping_dict(mapping)
        dates = pd.to_datetime(frame[mapped["date"]], errors="coerce") if mapped.get("date") in frame else pd.Series(dtype="datetime64[ns]")
        product_source = mapped.get("product_name") or mapped.get("product_id")
        category_source = mapped.get("category")
        return {"rows": len(frame), "columns": len(frame.columns), "products": int(frame[product_source].nunique(dropna=True)) if product_source in frame else 0, "categories": int(frame[category_source].nunique(dropna=True)) if category_source in frame else 0, "date_range": {"start": dates.min().strftime("%Y-%m-%d") if not dates.empty and pd.notna(dates.min()) else None, "end": dates.max().strftime("%Y-%m-%d") if not dates.empty and pd.notna(dates.max()) else None}, "sample_rows": frame.head(5).replace({np.nan: None}).to_dict(orient="records"), "quality_score": validation["quality_score"]}

    def validate(self, dataset_id):
        row = self._get_row(dataset_id)
        if not row:
            return None
        frame = self._read_frame(open(row["file_path"], "rb").read(), row["original_filename"])
        mapping = json.loads(row["mapping_json"])
        validation = self.validate_frame(frame, mapping)
        profile = self.profile_frame(frame, mapping, validation)
        with self._connect() as connection:
            connection.execute("UPDATE datasets SET validation_json = ?, profile_json = ?, processing_status = ? WHERE dataset_id = ?", (_json(validation), _json(profile), "Validated", dataset_id))
        return self.get_dataset(dataset_id)

    def process(self, dataset_id, mapping=None):
        row = self._get_row(dataset_id)
        if not row:
            return None
        frame = self._read_frame(open(row["file_path"], "rb").read(), row["original_filename"])
        raw_mapping = mapping or json.loads(row["mapping_json"])
        resolved = self._mapping_dict(raw_mapping)
        display_mapping = [{"source": source, "target": target, "target_label": FIELD_LABELS[target], "confidence": next((item.get("confidence", 100) for item in raw_mapping if item.get("source") == source and item.get("target") == target), 100), "detected": True} for target, source in resolved.items()]
        clean = pd.DataFrame()
        for target, source in resolved.items():
            if source in frame:
                clean[target] = frame[source]
        if clean.empty:
            raise ValueError("Map at least one recognised retail column before processing.")
        before_rows = len(clean)
        clean = clean.drop_duplicates().copy()
        for field in ["date"]:
            if field in clean:
                clean[field] = pd.to_datetime(clean[field], errors="coerce")
        for field in ["units_sold", "selling_price", "unit_cost", "revenue", "inventory", "discount", "competitor_price"]:
            if field in clean:
                clean[field] = pd.to_numeric(clean[field].astype(str).str.replace(r"[₹,$,]", "", regex=True), errors="coerce")
        for field in ["product_id", "product_name", "category", "subcategory", "store_id", "promotion"]:
            if field in clean:
                clean[field] = clean[field].astype("string").str.strip().replace({"": pd.NA, "nan": pd.NA})
        if "product_id" not in clean and "product_name" in clean:
            clean["product_id"] = clean["product_name"].fillna("Unknown product").map(lambda value: f"SKU-{hashlib.sha1(str(value).encode()).hexdigest()[:8].upper()}")
        if "product_name" not in clean and "product_id" in clean:
            clean["product_name"] = clean["product_id"]
        derived_fields = []
        if "revenue" not in clean and {"units_sold", "selling_price"}.issubset(clean.columns):
            clean["revenue"] = clean["units_sold"] * clean["selling_price"]
            derived_fields.append("revenue")
        if "date" in clean:
            clean = clean.sort_values("date")
        if "units_sold" in clean:
            clean.loc[clean["units_sold"] < 0, "units_sold"] = np.nan
        for field in ["selling_price", "unit_cost", "revenue", "inventory", "competitor_price"]:
            if field in clean:
                clean.loc[clean[field] < 0, field] = np.nan
        capabilities = self._capabilities(clean)
        serialised = clean.replace({pd.NA: None, np.nan: None}).copy()
        if "date" in serialised:
            serialised["date"] = serialised["date"].map(lambda value: value.strftime("%Y-%m-%d") if pd.notna(value) else None)
        records = serialised.to_dict(orient="records")
        validation = self.validate_frame(frame, display_mapping)
        validation["rows_after_cleaning"] = len(clean)
        validation["duplicates_removed"] = before_rows - len(clean)
        validation["derived_fields"] = derived_fields
        profile = self.profile_frame(frame, display_mapping, validation)
        with self._connect() as connection:
            connection.execute("""UPDATE datasets SET mapping_json = ?, validation_json = ?, profile_json = ?, processed_records_json = ?, capabilities_json = ?, status = 'Processed', processing_status = 'Ready for activation' WHERE dataset_id = ?""", (_json(display_mapping), _json(validation), _json(profile), _json(records), _json(capabilities), dataset_id))
        return self.get_dataset(dataset_id)

    def _capabilities(self, frame):
        fields = set(frame.columns)
        forecast_available = {"date", "product_name", "units_sold"}.issubset(fields) and frame["date"].notna().any() and frame["units_sold"].notna().any()
        pricing_available = {"product_name", "units_sold", "selling_price"}.issubset(fields) and frame["selling_price"].notna().sum() >= 2
        inventory_available = {"product_name", "inventory"}.issubset(fields) and frame["inventory"].notna().any()
        analytics_available = "revenue" in fields and frame["revenue"].notna().any()
        return {
            "forecasting": {"available": bool(forecast_available), "reason": None if forecast_available else "Demand forecasting needs mapped date, product, and units sold columns."},
            "pricing": {"available": bool(pricing_available), "reason": None if pricing_available else "Dynamic pricing needs historical product, units sold, and selling price data."},
            "inventory": {"available": bool(inventory_available), "reason": None if inventory_available else "Inventory optimization is unavailable because no inventory/stock column was detected."},
            "analytics": {"available": bool(analytics_available), "reason": None if analytics_available else "Revenue analytics needs revenue or both units sold and selling price."}
        }

    def activate(self, dataset_id):
        row = self._get_row(dataset_id)
        if not row:
            return None
        if row["status"] != "Processed":
            raise ValueError("Process the dataset before activating it.")
        with self._connect() as connection:
            connection.execute("UPDATE datasets SET is_active = 0 WHERE is_active = 1")
            connection.execute("UPDATE datasets SET is_active = 1, status = 'Active', processing_status = 'Active dataset' WHERE dataset_id = ?", (dataset_id,))
        return self.get_dataset(dataset_id)

    # ---------- Active-dataset reads ----------

    def active_records(self):
        row = self._get_row()
        if not row or not row["processed_records_json"]:
            return pd.DataFrame()
        frame = pd.DataFrame(json.loads(row["processed_records_json"]))
        if "date" in frame:
            frame["date"] = pd.to_datetime(frame["date"], errors="coerce")
        return frame

    def active_capabilities(self):
        active = self.get_active_dataset()
        return active.get("capabilities", {}) if active else {}

    def get_products(self):
        frame = self.active_records()
        if frame.empty or "product_name" not in frame:
            return []
        if "date" in frame:
            frame = frame.sort_values("date")
        products = []
        group_column = "product_id" if "product_id" in frame else "product_name"
        demand_base = frame.groupby(group_column)["units_sold"].mean() if "units_sold" in frame else pd.Series(dtype=float)
        max_demand = demand_base.max() if not demand_base.empty else 0
        for key, group in frame.groupby(group_column, dropna=False):
            latest = group.iloc[-1]
            name = latest.get("product_name") or str(key)
            units = _safe_float(latest.get("units_sold"))
            avg_units = _safe_float(demand_base.get(key)) if key in demand_base.index else None
            inventory = _safe_float(latest.get("inventory")) if "inventory" in group else None
            price = _safe_float(latest.get("selling_price")) if "selling_price" in group else None
            cost = _safe_float(latest.get("unit_cost")) if "unit_cost" in group else None
            competitor = _safe_float(latest.get("competitor_price")) if "competitor_price" in group else None
            products.append({
                "id": str(latest.get("product_id") or f"SKU-{hashlib.sha1(str(name).encode()).hexdigest()[:8].upper()}"),
                "name": str(name), "category": str(latest.get("category") or "Uncategorized"), "subcategory": latest.get("subcategory"),
                "current_price": price, "base_price": price, "unit_cost": cost, "competitor_price": competitor,
                "stock": inventory, "latest_units_sold": units, "average_units_sold": avg_units,
                "demand_score": round(float(avg_units / max_demand * 100), 1) if avg_units is not None and max_demand else 0,
                "data_fields": [field for field in ("selling_price", "unit_cost", "competitor_price", "inventory") if field in group and group[field].notna().any()]
            })
        return products

    def get_product(self, product_id):
        return next((product for product in self.get_products() if product["id"] == product_id), None)

    def _product_frame(self, product_id):
        frame = self.active_records()
        if frame.empty:
            return frame
        if "product_id" in frame:
            return frame[frame["product_id"].astype(str) == str(product_id)].copy()
        product = self.get_product(product_id)
        return frame[frame["product_name"] == product["name"]].copy() if product else pd.DataFrame()

    def forecast(self, product_id, days=30):
        capability = self.active_capabilities().get("forecasting", {})
        if not capability.get("available"):
            return {"available": False, "reason": capability.get("reason", "No active dataset is available."), "historical_data": [], "forecast_data": []}
        frame = self._product_frame(product_id).dropna(subset=["date", "units_sold"]).sort_values("date")
        if len(frame) < 2:
            return {"available": False, "reason": "This product needs at least two valid dated sales records for forecasting.", "historical_data": [], "forecast_data": []}
        frame["day_index"] = (frame["date"] - frame["date"].min()).dt.days
        frame["day_of_week"] = frame["date"].dt.dayofweek
        from sklearn.linear_model import Ridge
        model = Ridge(alpha=0.5).fit(frame[["day_index", "day_of_week"]], frame["units_sold"])
        std_dev = max(float(frame["units_sold"].std() or 0), 0)
        last_date = frame["date"].max()
        last_index = frame["day_index"].max()
        forecast_rows = []
        for increment in range(1, max(1, min(int(days), 180)) + 1):
            date = last_date + timedelta(days=increment)
            predicted = max(0, float(model.predict([[last_index + increment, date.dayofweek]])[0]))
            forecast_rows.append({"date": date.strftime("%Y-%m-%d"), "forecast": round(predicted, 2), "lower_bound": round(max(0, predicted - 1.2 * std_dev), 2), "upper_bound": round(predicted + 1.2 * std_dev, 2), "actual": None})
        history = [{"date": row.date.strftime("%Y-%m-%d"), "actual": round(float(row.units_sold), 2), "forecast": round(float(model.predict([[row.day_index, row.day_of_week]])[0]), 2)} for row in frame.tail(30).itertuples()]
        return {"available": True, "product_id": product_id, "forecast_days": len(forecast_rows), "total_predicted_demand": round(sum(item["forecast"] for item in forecast_rows), 2), "average_daily_demand": round(np.mean([item["forecast"] for item in forecast_rows]), 2), "historical_data": history, "forecast_data": forecast_rows, "model_r2_score": round(float(model.score(frame[["day_index", "day_of_week"]], frame["units_sold"])), 3)}

    def pricing(self, product_id):
        capability = self.active_capabilities().get("pricing", {})
        if not capability.get("available"):
            return {"available": False, "reason": capability.get("reason", "No active dataset is available.")}
        frame = self._product_frame(product_id).dropna(subset=["selling_price", "units_sold"])
        if len(frame) < 2 or frame["selling_price"].nunique() < 2:
            return {"available": False, "reason": "This product needs sales at two or more historical prices before a recommendation can be calculated."}
        frame["observed_revenue"] = frame["revenue"] if "revenue" in frame else frame["selling_price"] * frame["units_sold"]
        best = frame.loc[frame["observed_revenue"].idxmax()]
        latest = frame.sort_values("date").iloc[-1] if "date" in frame else frame.iloc[-1]
        current_price, recommended_price = float(latest["selling_price"]), float(best["selling_price"])
        expected_demand = float(frame.loc[frame["selling_price"] == recommended_price, "units_sold"].mean())
        expected_revenue = recommended_price * expected_demand
        cost = _safe_float(latest.get("unit_cost"))
        expected_profit = (recommended_price - cost) * expected_demand if cost is not None else None
        reasons = ["Recommendation uses the observed historical price point with the strongest recorded revenue for this product.", f"Historical sales at the recommended price averaged {expected_demand:.1f} units."]
        competitor = _safe_float(latest.get("competitor_price"))
        if competitor is not None:
            reasons.append("Competitor price is included because it was present in the active dataset.")
        return {"available": True, "product_id": product_id, "base_price": current_price, "current_price": current_price, "competitor_price": competitor, "recommended_price": recommended_price, "price_delta": round(recommended_price - current_price, 2), "multiplier": round(recommended_price / current_price, 3) if current_price else None, "expected_demand": round(expected_demand, 2), "expected_revenue": round(expected_revenue, 2), "expected_profit": round(expected_profit, 2) if expected_profit is not None else None, "profit_margin_pct": round((recommended_price - cost) / recommended_price * 100, 1) if cost is not None and recommended_price else None, "strategy": "Best observed revenue price", "confidence_score": min(95, 55 + len(frame) * 2), "stock_ratio": None, "reasons": reasons}

    def inventory(self):
        capability = self.active_capabilities().get("inventory", {})
        if not capability.get("available"):
            return {"available": False, "reason": capability.get("reason", "No active dataset is available."), "items": []}
        items = []
        for product in self.get_products():
            frame = self._product_frame(product["id"])
            current_stock = product["stock"]
            if current_stock is None:
                continue
            if {"date", "units_sold"}.issubset(frame.columns):
                daily = frame.dropna(subset=["units_sold"])["units_sold"].mean()
                deviation = frame.dropna(subset=["units_sold"])["units_sold"].std() or 0
                safety = float(1.65 * deviation * np.sqrt(7))
                reorder_point = float(daily * 7 + safety)
                target = float(daily * 21 + safety)
            else:
                daily = safety = reorder_point = target = None
            if reorder_point is None:
                status, suggested = "DATA_LIMITED", 0
            elif current_stock <= reorder_point:
                status, suggested = "LOW_STOCK", max(0, int(np.ceil(target - current_stock)))
            elif current_stock >= target * 1.5:
                status, suggested = "OVERSTOCK", 0
            else:
                status, suggested = "OPTIMAL", 0
            items.append({"product_id": product["id"], "name": product["name"], "category": product["category"], "stock": current_stock, "min_stock": round(reorder_point, 1) if reorder_point is not None else None, "max_stock": round(target, 1) if target is not None else None, "status": status, "suggested_reorder_qty": suggested, "recommended_stock": round(target, 1) if target is not None else None, "safety_stock": round(safety, 1) if safety is not None else None, "days_of_cover": round(current_stock / daily, 1) if daily else None, "unit_cost": product["unit_cost"]})
        return {"available": True, "items": items}

    def analytics(self):
        frame = self.active_records()
        active = self.get_active_dataset()
        if not active:
            return self._empty_metrics("No active dataset. Upload, process, and activate a retail dataset to populate the dashboard.")
        capability = active["capabilities"].get("analytics", {})
        revenue = float(frame["revenue"].sum()) if "revenue" in frame and frame["revenue"].notna().any() else None
        units = float(frame["units_sold"].sum()) if "units_sold" in frame and frame["units_sold"].notna().any() else None
        profit = None
        if {"revenue", "unit_cost", "units_sold"}.issubset(frame.columns):
            profit = float((frame["revenue"] - frame["unit_cost"] * frame["units_sold"]).sum())
        inventory_value = None
        products = self.get_products()
        if all(product["stock"] is not None and product["unit_cost"] is not None for product in products) and products:
            inventory_value = float(sum(product["stock"] * product["unit_cost"] for product in products))
        inventory_data = self.inventory()
        inventory_items = inventory_data["items"] if inventory_data.get("available") else []
        stockout_rate = round(sum(item["status"] == "LOW_STOCK" for item in inventory_items) / len(inventory_items) * 100, 1) if inventory_items else None
        overstock_rate = round(sum(item["status"] == "OVERSTOCK" for item in inventory_items) / len(inventory_items) * 100, 1) if inventory_items else None
        trend = []
        if "date" in frame and "revenue" in frame:
            for date, group in frame.dropna(subset=["date", "revenue"]).groupby(frame.dropna(subset=["date", "revenue"])["date"].dt.strftime("%Y-%m-%d")):
                trend.append({"period": date, "revenue": round(float(group["revenue"].sum()), 2)})
        return {"available": True, "active_dataset": active, "total_revenue": round(revenue, 2) if revenue is not None else None, "gross_profit": round(profit, 2) if profit is not None else None, "profit_margin_pct": round(profit / revenue * 100, 1) if profit is not None and revenue else None, "units_sold": round(units, 2) if units is not None else None, "inventory_value": round(inventory_value, 2) if inventory_value is not None else None, "stockout_rate": stockout_rate, "overstock_rate": overstock_rate, "forecast_accuracy": self._active_model_metric("mape", as_accuracy=True), "average_selling_price": round(revenue / units, 2) if revenue is not None and units else None, "price_change_impact": None, "total_products": len(products), "low_stock_count": sum(item["status"] == "LOW_STOCK" for item in inventory_items), "overstock_count": sum(item["status"] == "OVERSTOCK" for item in inventory_items), "total_orders": round(units, 2) if units else None, "recent_alerts": self.alerts(), "revenue_trend": trend[-30:], "capabilities": active["capabilities"], "decision_summary": self._decision_summary(products, inventory_items, revenue, profit)}

    def _empty_metrics(self, reason):
        return {"available": False, "reason": reason, "active_dataset": None, "total_revenue": None, "gross_profit": None, "profit_margin_pct": None, "units_sold": None, "inventory_value": None, "stockout_rate": None, "overstock_rate": None, "forecast_accuracy": None, "average_selling_price": None, "price_change_impact": None, "total_products": 0, "low_stock_count": 0, "overstock_count": 0, "total_orders": None, "recent_alerts": [], "revenue_trend": [], "capabilities": {}, "decision_summary": {"what": reason, "why": "No business metrics are calculated until an active dataset is available.", "action": "Open Dataset Management to upload a compatible CSV, XLSX, or JSON file."}}

    def _decision_summary(self, products, inventory_items, revenue, profit):
        low = [item for item in inventory_items if item["status"] == "LOW_STOCK"]
        return {"what": f"The active dataset contains {len(products)} product(s) and {len(self.active_records())} processed record(s)." + (f" Calculated revenue is ₹{revenue:,.0f}." if revenue is not None else " Revenue is unavailable because sales/price data is missing."), "why": f"{len(low)} product(s) have inventory below their data-derived reorder point." if inventory_items else "Inventory risk cannot be assessed because the active dataset has no inventory column.", "action": "Review the available recommendations and train the AI model once the dataset is active." if products else "Upload a dataset to start."}

    # ---------- Alerts, decisions and training ----------

    def alerts(self):
        result = self.inventory()
        if not result.get("available"):
            return []
        alerts = []
        for item in result["items"]:
            if item["status"] == "LOW_STOCK":
                alerts.append({"id": f"INV-{item['product_id']}", "type": "LOW_STOCK", "severity": "high", "status": "Low", "title": f"Low stock: {item['name']}", "message": f"Current inventory is {item['stock']} units, below the data-derived reorder point of {item['min_stock']} units. Reorder {item['suggested_reorder_qty']} units."})
            elif item["status"] == "OVERSTOCK":
                alerts.append({"id": f"INV-{item['product_id']}", "type": "OVERSTOCK", "severity": "medium", "status": "Overstock", "title": f"Overstock: {item['name']}", "message": f"Current inventory is above the demand-derived target of {item['max_stock']} units. Consider a promotion after pricing review."})
            elif item["status"] == "OPTIMAL":
                alerts.append({"id": f"INV-{item['product_id']}", "type": "HEALTHY_INVENTORY", "severity": "healthy", "status": "Healthy", "title": f"Healthy inventory: {item['name']}", "message": "Current stock is within the demand-derived operating range."})
        return alerts

    def recommendations(self):
        active = self.get_active_dataset()
        if not active:
            return {"available": False, "reason": "No active dataset is available.", "recommendations": []}
        inventory = {item["product_id"]: item for item in self.inventory().get("items", [])}
        recommendations = []
        for product in self.get_products():
            forecast = self.forecast(product["id"], 7)
            pricing = self.pricing(product["id"])
            stock = inventory.get(product["id"])
            if not forecast.get("available") and not pricing.get("available") and not stock:
                continue
            reasons, actions = [], []
            predicted = forecast.get("total_predicted_demand") if forecast.get("available") else None
            recommended_price = pricing.get("recommended_price") if pricing.get("available") else None
            if pricing.get("available"):
                reasons.extend(pricing["reasons"])
                actions.append(f"set price to ₹{recommended_price:,.2f}")
            if stock and stock["suggested_reorder_qty"] > 0:
                reasons.append("Current inventory is below the reorder point calculated from the product's observed sales rate and variability.")
                actions.append(f"replenish {stock['suggested_reorder_qty']} units")
            if not actions:
                continue
            expected_revenue = pricing.get("expected_revenue") if pricing.get("available") else None
            recommendations.append({"id": f"REC-{product['id']}", "product_id": product["id"], "product": product["name"], "category": product["category"], "current_stock": product["stock"], "current_price": product["current_price"], "competitor_price": product["competitor_price"], "predicted_demand": predicted, "recommended_stock": stock.get("recommended_stock") if stock else None, "replenishment_units": stock.get("suggested_reorder_qty", 0) if stock else 0, "recommended_price": recommended_price, "price_change_pct": round((recommended_price - product["current_price"]) / product["current_price"] * 100, 1) if recommended_price is not None and product["current_price"] else None, "expected_revenue": expected_revenue, "expected_profit": pricing.get("expected_profit") if pricing.get("available") else None, "profit_margin_pct": pricing.get("profit_margin_pct") if pricing.get("available") else None, "confidence": pricing.get("confidence_score") if pricing.get("available") else 70, "strategy": pricing.get("strategy") if pricing.get("available") else "Inventory optimisation", "reasons": reasons, "recommendation": " and ".join(actions).capitalize() + ".", "priority": "High" if stock and stock["status"] == "LOW_STOCK" else "Medium", "available_actions": {"pricing": pricing.get("available", False), "inventory": bool(stock and stock["suggested_reorder_qty"] > 0)}})
        return {"available": True, "generated_at": datetime.now().isoformat(), "recommendations": recommendations}

    def train(self, dataset_id):
        row = self._get_row(dataset_id)
        if not row:
            return None
        if not row["processed_records_json"]:
            raise ValueError("Process the dataset before training models.")
        frame = pd.DataFrame(json.loads(row["processed_records_json"]))
        if not {"date", "units_sold"}.issubset(frame.columns):
            return self._save_unavailable_model(dataset_id, len(frame), "Training unavailable: mapped date and units sold columns are required.")
        frame["date"] = pd.to_datetime(frame["date"], errors="coerce")
        frame["units_sold"] = pd.to_numeric(frame["units_sold"], errors="coerce")
        frame = frame.dropna(subset=["date", "units_sold"]).copy()
        if len(frame) < 12:
            return self._save_unavailable_model(dataset_id, len(frame), "Training unavailable: at least 12 valid dated sales records are required for evaluation.")
        frame["day_index"] = (frame["date"] - frame["date"].min()).dt.days
        frame["day_of_week"] = frame["date"].dt.dayofweek
        frame["month"] = frame["date"].dt.month
        features = ["day_index", "day_of_week", "month"]
        if "selling_price" in frame and frame["selling_price"].notna().sum() >= 8:
            frame["selling_price"] = pd.to_numeric(frame["selling_price"], errors="coerce").fillna(frame["selling_price"].median())
            features.append("selling_price")
        if "product_id" in frame:
            frame["product_code"] = pd.factorize(frame["product_id"])[0]
            features.append("product_code")
        x_train, x_test, y_train, y_test = train_test_split(frame[features], frame["units_sold"], test_size=max(0.2, 3 / len(frame)), random_state=42)
        models = {"Random Forest": RandomForestRegressor(n_estimators=120, random_state=42, min_samples_leaf=2), "Gradient Boosting": GradientBoostingRegressor(random_state=42, n_estimators=100, max_depth=2, loss="huber")}
        results = []
        for name, model in models.items():
            model.fit(x_train, y_train)
            prediction = model.predict(x_test)
            mae = float(mean_absolute_error(y_test, prediction))
            rmse = float(np.sqrt(mean_squared_error(y_test, prediction)))
            nonzero = y_test != 0
            mape = float(np.mean(np.abs((y_test[nonzero] - prediction[nonzero]) / y_test[nonzero])) * 100) if nonzero.any() else None
            r2 = float(r2_score(y_test, prediction)) if len(y_test) >= 2 else None
            results.append({"name": name, "model": model, "mae": mae, "rmse": rmse, "mape": mape, "r2": r2})
        best = min(results, key=lambda item: item["mape"] if item["mape"] is not None else item["mae"])
        existing = self._model_versions(dataset_id)
        version = f"v{len(existing) + 1}"
        model_id = f"MOD-{uuid.uuid4().hex[:10].upper()}"
        model_path = os.path.join(MODEL_DIR, f"{model_id}.joblib")
        joblib.dump({"model": best["model"], "features": features}, model_path)
        with self._connect() as connection:
            connection.execute("UPDATE model_versions SET status = 'Archived' WHERE dataset_id = ? AND status = 'Active'", (dataset_id,))
            for result in results:
                current_id = model_id if result is best else f"MOD-{uuid.uuid4().hex[:10].upper()}"
                connection.execute("INSERT INTO model_versions (model_id, dataset_id, model_name, model_version, training_date, training_rows, features_json, mae, rmse, mape, r2, status, model_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", (current_id, dataset_id, result["name"], version if result is best else f"{version}-candidate", datetime.now().isoformat(timespec="seconds"), len(frame), _json(features), result["mae"], result["rmse"], result["mape"], result["r2"], "Active" if result is best else "Candidate", model_path if result is best else None))
            connection.execute("UPDATE datasets SET processing_status = 'Active model trained' WHERE dataset_id = ?", (dataset_id,))
        return {"available": True, "best_model": best["name"], "model_version": version, "dataset_id": dataset_id, "training_rows": len(frame), "features_used": features, "mae": round(best["mae"], 3), "rmse": round(best["rmse"], 3), "mape": round(best["mape"], 2) if best["mape"] is not None else None, "r2": round(best["r2"], 3) if best["r2"] is not None else None, "status": "Active"}

    def _save_unavailable_model(self, dataset_id, rows, message):
        model_id = f"MOD-{uuid.uuid4().hex[:10].upper()}"
        with self._connect() as connection:
            connection.execute("INSERT INTO model_versions (model_id, dataset_id, model_name, model_version, training_date, training_rows, features_json, status) VALUES (?, ?, 'Unavailable', '—', ?, ?, '[]', 'Unavailable')", (model_id, dataset_id, datetime.now().isoformat(timespec="seconds"), rows))
        return {"available": False, "status": "Unavailable", "reason": message, "dataset_id": dataset_id, "training_rows": rows}

    def _model_versions(self, dataset_id):
        with self._connect() as connection:
            rows = connection.execute("SELECT * FROM model_versions WHERE dataset_id = ? ORDER BY training_date DESC", (dataset_id,)).fetchall()
        return [dict(row) for row in rows]

    def _active_model_metric(self, metric, as_accuracy=False):
        active = self.get_active_dataset()
        if not active:
            return None
        with self._connect() as connection:
            row = connection.execute("SELECT * FROM model_versions WHERE dataset_id = ? AND status = 'Active' ORDER BY training_date DESC LIMIT 1", (active["dataset_id"],)).fetchone()
        if not row or row[metric] is None:
            return None
        return round(100 - row[metric], 1) if as_accuracy else row[metric]

    def model_performance(self):
        active = self.get_active_dataset()
        if not active:
            return {"available": False, "reason": "No active dataset is available.", "algorithms": [], "forecast_vs_actual": []}
        rows = self._model_versions(active["dataset_id"])
        if not rows:
            return {"available": False, "reason": "Train the active dataset to generate model performance metrics.", "dataset_size": active["row_count"], "algorithms": [], "forecast_vs_actual": []}
        algorithms = [{"name": row["model_name"], "type": "Ensemble", "mape": round(row["mape"], 2) if row["mape"] is not None else None, "rmse": round(row["rmse"], 3) if row["rmse"] is not None else None, "mae": round(row["mae"], 3) if row["mae"] is not None else None, "r2_score": round(row["r2"], 3) if row["r2"] is not None else None, "status": row["status"], "version": row["model_version"]} for row in rows]
        active_model = next((row for row in rows if row["status"] == "Active"), rows[0])
        frame = self.active_records()
        chart = []
        if {"date", "units_sold"}.issubset(frame.columns):
            weekly = frame.dropna(subset=["date", "units_sold"]).set_index("date")["units_sold"].resample("W").sum().tail(8)
            chart = [{"period": index.strftime("%d %b"), "actual": round(float(value), 2), "forecast": None} for index, value in weekly.items()]
        return {"available": active_model["status"] == "Active", "best_model": active_model["model_name"], "last_trained": active_model["training_date"], "dataset_size": active_model["training_rows"], "model_version": active_model["model_version"], "algorithms": algorithms, "forecast_vs_actual": chart}

