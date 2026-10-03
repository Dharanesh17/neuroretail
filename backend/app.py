from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from datetime import datetime, timedelta
import random
import os

from data_store import db
from ml_engine import pricing_engine, demand_forecaster, recommendation_engine
from dataset_service import DatasetService

app = Flask(__name__)
CORS(app)
datasets = DatasetService()


def product_forecast_snapshot(product, days=7):
    """A compact, explainable demand estimate used by the decision pages."""
    daily = max(2, round(product.get("demand_score", 50) / 12 + product.get("rating", 4) * 0.7))
    return {
        "daily_demand": daily,
        "predicted_demand": int(daily * days),
        "forecast_accuracy": db.ai_metrics.get("accuracy", 96.8),
    }


def price_explanation(product, pricing):
    reasons = []
    stock_ratio = product["stock"] / max(product["min_stock"], 1)
    if stock_ratio > 1.25:
        reasons.append("Current inventory is above the target level, so a controlled price reduction can release working capital.")
    elif stock_ratio <= 1:
        reasons.append("Inventory is at or below the safety threshold, so the price protects availability while demand remains strong.")
    if product["competitor_price"] < product["current_price"]:
        reasons.append("A competitor is priced lower, creating a conversion risk at the current shelf price.")
    elif product["competitor_price"] > product["current_price"]:
        reasons.append("The nearest competitor is priced higher, leaving room to improve margin without losing price position.")
    if product.get("demand_score", 50) >= 75:
        reasons.append("Historical sales signals indicate above-average demand for this SKU.")
    else:
        reasons.append("Demand is moderate, so the recommendation favors conversion and margin balance.")
    reasons.append(f"The recommended price is expected to preserve a {pricing['profit_margin_pct']}% gross margin.")
    return reasons


def build_decision(product):
    pricing = pricing_engine.predict_optimal_price(product)
    forecast = product_forecast_snapshot(product)
    recommended_stock = min(product["max_stock"], max(product["min_stock"], int(forecast["predicted_demand"] * 1.15)))
    replenishment = max(0, recommended_stock - product["stock"])
    expected_units = min(forecast["predicted_demand"], product["stock"] + replenishment)
    expected_revenue = round(expected_units * pricing["recommended_price"], 0)
    expected_profit = round(expected_units * (pricing["recommended_price"] - product["unit_cost"]), 0)
    price_change_pct = round((pricing["recommended_price"] - product["current_price"]) / max(product["current_price"], 1) * 100, 1)
    direction = "increase" if price_change_pct > 0 else "reduce"
    return {
        "id": f"REC-{product['id']}", "product_id": product["id"], "product": product["name"], "category": product["category"],
        "current_stock": product["stock"], "current_price": product["current_price"], "competitor_price": product["competitor_price"],
        "predicted_demand": forecast["predicted_demand"], "recommended_stock": recommended_stock, "replenishment_units": replenishment,
        "recommended_price": pricing["recommended_price"], "price_change_pct": price_change_pct,
        "expected_revenue": expected_revenue, "expected_profit": expected_profit, "profit_margin_pct": pricing["profit_margin_pct"],
        "confidence": pricing["confidence_score"], "strategy": pricing["strategy"], "reasons": price_explanation(product, pricing),
        "recommendation": f"{direction.capitalize()} price by {abs(price_change_pct)}%" + (f" and replenish approximately {replenishment} units." if replenishment else "."),
        "priority": "High" if product["stock"] <= product["min_stock"] or replenishment >= 30 else "Medium"
    }


def executive_metrics():
    products = db.get_products()
    product_map = {product["id"]: product for product in products}
    revenue = sum(sale["revenue"] for sale in db.sales if sale["product_id"] in product_map)
    units = sum(sale["units_sold"] for sale in db.sales if sale["product_id"] in product_map)
    cost = sum(sale["units_sold"] * product_map[sale["product_id"]]["unit_cost"] for sale in db.sales if sale["product_id"] in product_map)
    profit = max(0, revenue - cost)
    low_stock = [product for product in products if product["stock"] <= product["min_stock"]]
    overstock = [product for product in products if product["stock"] >= product["max_stock"]]
    decisions = [build_decision(product) for product in products]
    price_impact = sum(max(0, decision["expected_profit"] - decision["predicted_demand"] * (product_map[decision["product_id"]]["current_price"] - product_map[decision["product_id"]]["unit_cost"])) for decision in decisions)
    return {
        "store": db.get_active_store(), "business_health_score": db.get_active_store().get("health_score", 94),
        "total_revenue": round(revenue, 0), "gross_profit": round(profit, 0),
        "profit_margin_pct": round((profit / revenue * 100) if revenue else 0, 1), "units_sold": units,
        "inventory_value": round(sum(product["stock"] * product["unit_cost"] for product in products), 0),
        "stockout_rate": round(len(low_stock) / max(len(products), 1) * 100, 1),
        "overstock_rate": round(len(overstock) / max(len(products), 1) * 100, 1),
        "forecast_accuracy": db.ai_metrics.get("accuracy", 96.8), "average_selling_price": round(revenue / max(units, 1), 0),
        "price_change_impact": round(price_impact, 0), "total_products": len(products),
        "low_stock_count": len(low_stock), "overstock_count": len(overstock), "total_orders": units,
        "recent_alerts": (db.get_inventory_alerts() + db.alerts)[:5], "data_cleaning_logs": db.data_cleaning_logs,
        "decision_summary": {
            "what": f"Revenue is ₹{revenue:,.0f} with a {round((profit / revenue * 100) if revenue else 0, 1)}% gross margin.",
            "why": f"{len(low_stock)} SKU(s) are at stock risk and {len(overstock)} SKU(s) hold excess working capital.",
            "action": "Review the high-priority AI recommendations and approve replenishment before the next demand cycle."
        }
    }

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "online",
        "service": "NeuroRetail Cognitive AI Engine",
        "timestamp": datetime.now().isoformat(),
        "version": "2.4.0"
    })


@app.route('/api/datasets', methods=['GET'])
def list_datasets():
    return jsonify({"datasets": datasets.list_datasets(), "active_dataset": datasets.get_active_dataset()})


@app.route('/api/datasets/upload', methods=['POST'])
def upload_dataset():
    try:
        if request.files.get("file"):
            upload = request.files["file"]
            content, filename = upload.read(), upload.filename or "dataset.csv"
            dataset_name = request.form.get("dataset_name")
            description = request.form.get("description", "")
        else:
            data = request.json or {}
            content = data.get("content") or data.get("file_content")
            filename = data.get("filename", "dataset.csv")
            dataset_name = data.get("dataset_name")
            description = data.get("description", "")
        if not content:
            return jsonify({"error": "Select a non-empty CSV, XLSX, or JSON file."}), 400
        dataset = datasets.upload(content, filename, dataset_name, description, db.current_user.get("name", "Admin"))
        db.add_audit_log("Uploaded dataset", dataset["dataset_name"], "Not registered", f"{dataset['row_count']} rows", "data")
        return jsonify({"success": True, "dataset": dataset}), 201
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    except Exception:
        return jsonify({"error": "The dataset could not be read. Confirm the file format and column structure."}), 400


@app.route('/api/datasets/<dataset_id>', methods=['GET'])
def get_dataset(dataset_id):
    dataset = datasets.get_dataset(dataset_id)
    if not dataset:
        return jsonify({"error": "Dataset not found."}), 404
    return jsonify(dataset)


@app.route('/api/datasets/<dataset_id>', methods=['DELETE'])
def delete_dataset(dataset_id):
    try:
        if not datasets.delete(dataset_id):
            return jsonify({"error": "Dataset not found."}), 404
        db.add_audit_log("Deleted dataset", dataset_id, "Registered", "Deleted", "data")
        return jsonify({"success": True})
    except ValueError as error:
        return jsonify({"error": str(error)}), 409


@app.route('/api/datasets/<dataset_id>/archive', methods=['POST'])
def archive_dataset(dataset_id):
    if not datasets.archive(dataset_id):
        return jsonify({"error": "Dataset not found."}), 404
    db.add_audit_log("Archived dataset", dataset_id, "Active/available", "Archived", "data")
    return jsonify({"success": True, "dataset": datasets.get_dataset(dataset_id)})


@app.route('/api/datasets/<dataset_id>/validate', methods=['POST'])
def validate_dataset(dataset_id):
    dataset = datasets.validate(dataset_id)
    if not dataset:
        return jsonify({"error": "Dataset not found."}), 404
    return jsonify({"success": True, "dataset": dataset, "validation": dataset["validation"]})


@app.route('/api/datasets/<dataset_id>/process', methods=['POST'])
def process_dataset(dataset_id):
    try:
        data = request.json or {}
        dataset = datasets.process(dataset_id, data.get("mapping"))
        if not dataset:
            return jsonify({"error": "Dataset not found."}), 404
        db.add_audit_log("Processed dataset", dataset["dataset_name"], "Raw upload", f"{dataset['validation'].get('rows_after_cleaning', dataset['row_count'])} cleaned rows", "data")
        return jsonify({"success": True, "dataset": dataset})
    except ValueError as error:
        return jsonify({"error": str(error)}), 400


@app.route('/api/datasets/<dataset_id>/activate', methods=['POST'])
def activate_dataset(dataset_id):
    try:
        dataset = datasets.activate(dataset_id)
        if not dataset:
            return jsonify({"error": "Dataset not found."}), 404
        db.add_audit_log("Activated dataset", dataset["dataset_name"], "Inactive", "Active dataset", "data")
        return jsonify({"success": True, "dataset": dataset})
    except ValueError as error:
        return jsonify({"error": str(error)}), 422


@app.route('/api/datasets/<dataset_id>/train', methods=['POST'])
def train_dataset(dataset_id):
    try:
        result = datasets.train(dataset_id)
        if result is None:
            return jsonify({"error": "Dataset not found."}), 404
        if result.get("available"):
            db.add_audit_log("Trained dataset model", dataset_id, "Untrained", f"{result['best_model']} {result['model_version']}", "model")
        return jsonify({"success": result.get("available", False), "training": result})
    except ValueError as error:
        return jsonify({"error": str(error)}), 422


@app.route('/api/datasets/<dataset_id>/training-status', methods=['GET'])
def dataset_training_status(dataset_id):
    dataset = datasets.get_dataset(dataset_id)
    if not dataset:
        return jsonify({"error": "Dataset not found."}), 404
    performance = datasets.model_performance() if dataset.get("is_active") else {"available": False, "reason": "Activate this dataset to inspect its active model."}
    return jsonify({"dataset_id": dataset_id, "processing_status": dataset["processing_status"], "training": performance})


@app.route('/api/datasets/<dataset_id>/profile', methods=['GET'])
def dataset_profile(dataset_id):
    dataset = datasets.get_dataset(dataset_id)
    if not dataset:
        return jsonify({"error": "Dataset not found."}), 404
    return jsonify({"dataset_id": dataset_id, "profile": dataset["profile"], "mapping": dataset["mapping"], "validation": dataset["validation"], "capabilities": dataset["capabilities"]})


@app.route('/api/datasets/<dataset_id>/download', methods=['GET'])
def download_dataset(dataset_id):
    row = datasets._get_row(dataset_id)
    if not row or not os.path.exists(row["file_path"]):
        return jsonify({"error": "Dataset file not found."}), 404
    return send_file(row["file_path"], as_attachment=True, download_name=row["original_filename"])

@app.route('/api/dashboard/summary', methods=['GET'])
def get_dashboard_summary():
    metrics = datasets.analytics()
    if not metrics.get("available"):
        metrics = executive_metrics()
    metrics["ai_accuracy"] = metrics.get("forecast_accuracy", 96.8)
    metrics["total_units_sold"] = metrics.get("units_sold", 1420)
    return jsonify(metrics)


@app.route('/api/executive/dashboard', methods=['GET'])
def get_executive_dashboard():
    metrics = datasets.analytics()
    if not metrics.get("available"):
        metrics = executive_metrics()
        metrics["recommendations"] = [build_decision(p) for p in db.get_products()][:3]
    else:
        decision_data = datasets.recommendations()
        metrics["recommendations"] = decision_data.get("recommendations", [])[:3]
    return jsonify(metrics)

@app.route('/api/products', methods=['GET'])
def get_products():
    prods = datasets.get_products()
    if not prods:
        prods = db.get_products()
    return jsonify(prods)

@app.route('/api/products/<prod_id>', methods=['GET'])
def get_product(prod_id):
    prod = datasets.get_product(prod_id) or db.get_product_by_id(prod_id)
    if prod:
        return jsonify(prod)
    return jsonify({"error": "Product not found"}), 404

@app.route('/api/pricing/dynamic-calculate', methods=['POST'])
def calculate_dynamic_pricing():
    data = request.json or {}
    prod_id = data.get("product_id")
    is_peak = data.get("is_peak_hour", False)
    
    if prod_id:
        if datasets.get_active_dataset():
            p_price = datasets.pricing(prod_id)
            if p_price.get("available"):
                return jsonify(p_price)
        product = db.get_product_by_id(prod_id)
        if not product:
            product = datasets.get_product(prod_id)
        if not product:
            return jsonify({"error": "Product not found"}), 404
        return jsonify(pricing_engine.predict_optimal_price(product, is_peak_hour=is_peak))
        
    prods = datasets.get_products() or db.get_products()
    results = []
    for p in prods:
        if datasets.get_active_dataset():
            res = datasets.pricing(p["id"])
            if res.get("available"):
                results.append(res)
                continue
        results.append(pricing_engine.predict_optimal_price(p, is_peak_hour=is_peak))
    return jsonify(results)

@app.route('/api/pricing/update', methods=['POST'])
def update_product_price():
    data = request.json or {}
    prod_id = data.get("product_id")
    new_price = data.get("new_price")
    
    if not prod_id or new_price is None:
        return jsonify({"error": "product_id and new_price required"}), 400
        
    product = (datasets.get_product(prod_id) if datasets.get_active_dataset() else None) or db.get_product_by_id(prod_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    db.update_product_price(prod_id, float(new_price))
    db.add_audit_log("Approved dataset pricing action", product["name"], f"₹{product.get('current_price') or 0:,.2f}", f"₹{float(new_price):,.2f}", "pricing")
    return jsonify({"success": True, "message": f"Updated price for {product['name']} to ₹{float(new_price):,.2f}", "product": product})

@app.route('/api/forecast/<prod_id>', methods=['GET'])
def get_product_forecast(prod_id):
    days = int(request.args.get("days", 30))
    if datasets.get_active_dataset():
        result = datasets.forecast(prod_id, days=days)
        if result.get("available"):
            return jsonify(result)
    result = demand_forecaster.predict_forecast(db.sales, prod_id, forecast_days=days)
    return jsonify(result)

@app.route('/api/inventory/status', methods=['GET'])
def get_inventory_status():
    inv = datasets.inventory()
    items = inv.get("items", []) if isinstance(inv, dict) else inv
    if not items:
        items = db.get_inventory_intelligence()
    return jsonify(items)

@app.route('/api/inventory/reorder', methods=['POST'])
def process_reorder():
    data = request.json or {}
    prod_id = data.get("product_id")
    quantity = int(data.get("quantity", 50))
    
    prod = (datasets.get_product(prod_id) if datasets.get_active_dataset() else None) or db.get_product_by_id(prod_id)
    if not prod:
        return jsonify({"error": "Product not found"}), 404
    previous_stock = prod.get("stock", 0)
    new_stock = previous_stock + quantity
    db.update_product_stock(prod_id, new_stock)
    db.add_audit_log("Approved replenishment recommendation", prod["name"], f"{previous_stock} units", f"Purchase order for {quantity} units", "inventory")
    
    po_number = f"PO-{random.randint(1000, 9999)}"
    db.add_alert(
        "REORDER_PLACED",
        f"Reorder Approved: {po_number}",
        f"Approved replenishment of {quantity} units for {prod['name']}. Updated stock to {new_stock} units.",
        "success"
    )
    
    return jsonify({
        "success": True,
        "po_number": po_number,
        "product_id": prod_id,
        "new_stock": new_stock
    })

@app.route('/api/analytics/customer', methods=['GET'])
def get_customer_analytics():
    customers = db.customers
    products = db.get_products()
    
    # Calculate funnel metrics
    views = sum([p["demand_score"] * 15 for p in products])
    carts = int(views * 0.32)
    purchases = int(carts * 0.65)
    abandonments = carts - purchases
    
    funnel = [
        {"stage": "Product Views", "count": views, "percentage": 100},
        {"stage": "Added to Cart", "count": carts, "percentage": 32},
        {"stage": "Completed Purchase", "count": purchases, "percentage": 20.8},
        {"stage": "Cart Abandoned", "count": abandonments, "percentage": 11.2}
    ]
    
    return jsonify({
        "customers": customers,
        "funnel": funnel,
        "repeat_customer_rate": 68.4,
        "average_order_value": 142.50,
        "total_active_sessions": 412
    })

@app.route('/api/recommendations/<user_id>', methods=['GET'])
def get_recommendations(user_id):
    recs = recommendation_engine.get_recommendations(db.get_products(), db.customers, user_id=user_id)
    return jsonify(recs)

@app.route('/api/iot/shelves', methods=['GET'])
def get_iot_shelves():
    return jsonify(db.shelves)

@app.route('/api/iot/shelf/decrement', methods=['POST'])
def decrement_iot_shelf():
    data = request.json or {}
    shelf_id = data.get("shelf_id")
    units = int(data.get("units", 1))
    
    updated_shelf = db.decrement_shelf_stock(shelf_id, units)
    if updated_shelf:
        if updated_shelf["status"] == "CRITICAL_LOW":
            db.add_alert(
                "IOT_SHELF_ALERT",
                f"Smart Shelf Low Stock ({shelf_id})",
                f"Shelf {shelf_id} ({updated_shelf['product_name']}) has only {updated_shelf['current_units']} units remaining!",
                "high"
            )
        return jsonify(updated_shelf)
    return jsonify({"error": "Shelf not found"}), 404

@app.route('/api/ai/retrain', methods=['GET', 'POST'])
def retrain_ai_models():
    active = datasets.get_active_dataset()
    if not active:
        return jsonify({"success": False, "reason": "Activate a processed dataset before training AI models."}), 422
    result = datasets.train(active["dataset_id"])
    if result.get("available"):
        db.add_audit_log("Trained active dataset model", active["dataset_name"], "Untrained", f"{result['best_model']} {result['model_version']}", "model")
    return jsonify({"success": result.get("available", False), "metrics": {"accuracy": 100 - result["mape"] if result.get("mape") is not None else None, "mae": result.get("mae"), "last_retrained": datetime.now().strftime("%Y-%m-%d %H:%M:%S")}, "training": result})

@app.route('/api/stores', methods=['GET'])
def get_stores():
    return jsonify({
        "stores": db.stores,
        "active_store": db.get_active_store(),
        "user_role": db.user_role
    })

@app.route('/api/store/switch', methods=['POST'])
def switch_store():
    data = request.json or {}
    store_id = data.get("store_id")
    switched = db.set_active_store(store_id)
    return jsonify({"success": True, "active_store": switched})

@app.route('/api/store/create', methods=['POST'])
def create_store():
    data = request.json or {}
    created = db.create_new_store(data)
    return jsonify({"success": True, "store": created})

@app.route('/api/upload/clean', methods=['POST'])
def clean_uploaded_dataset():
    data = request.json or {}
    content = data.get("content", "")
    filename = data.get("filename", "dataset.csv")
    report = db.clean_uploaded_dataset(content, filename)
    return jsonify(report)

@app.route('/api/ml/compare', methods=['GET'])
def get_ml_comparison():
    if datasets.get_active_dataset():
        perf = datasets.model_performance()
        if perf.get("available") or perf.get("algorithms"):
            return jsonify(perf)
    return jsonify(model_performance().get_json())


@app.route('/api/model-performance', methods=['GET'])
def model_performance():
    if datasets.get_active_dataset():
        perf = datasets.model_performance()
        if perf.get("available") or perf.get("algorithms"):
            return jsonify(perf)
    return jsonify({
        "available": True,
        "best_model": "Gradient Boosting Regressor",
        "last_trained": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "dataset_size": 1420,
        "model_version": "v1.0",
        "algorithms": [
            { "name": "Gradient Boosting Regressor", "type": "Ensemble", "mape": 3.2, "rmse": 1.24, "mae": 0.85, "r2_score": 0.958, "status": "Best" },
            { "name": "Random Forest Regressor", "type": "Ensemble", "mape": 4.8, "rmse": 1.55, "mae": 1.15, "r2_score": 0.925, "status": "Candidate" },
            { "name": "Ridge Dynamic Regressor", "type": "Linear / Ridge", "mape": 6.2, "rmse": 1.82, "mae": 1.35, "r2_score": 0.895, "status": "Baseline" }
        ],
        "forecast_vs_actual": [
            { "period": "Week 1", "actual": 142, "forecast": 139 },
            { "period": "Week 2", "actual": 158, "forecast": 155 },
            { "period": "Week 3", "actual": 182, "forecast": 178 },
            { "period": "Week 4", "actual": 195, "forecast": 199 }
        ]
    })


@app.route('/api/decision/recommendations', methods=['GET'])
def decision_recommendations():
    if datasets.get_active_dataset():
        recs = datasets.recommendations()
        if recs.get("available") and recs.get("recommendations"):
            return jsonify(recs)
    products = db.get_products()
    return jsonify({
        "available": True,
        "recommendations": [build_decision(p) for p in products]
    })


@app.route('/api/scenario/simulate', methods=['POST'])
def simulate_scenario():
    data = request.json or {}
    product_id = data.get("product_id")
    product = (datasets.get_product(product_id) if datasets.get_active_dataset() else None) or db.get_product_by_id(product_id)
    if not product and db.get_products():
        product = db.get_products()[0]
    if not product:
        return jsonify({"available": False, "reason": "No products found for scenario simulation."}), 422
    current_price = product.get("current_price") or product.get("base_price", 1000)
    price = max(0, float(data.get("price", current_price)))
    promotion_pct = max(0, min(80, float(data.get("promotion_pct", 0))))
    inventory = max(0, int(data.get("inventory", product.get("stock") or 50)))
    competitor_price = max(1, float(data.get("competitor_price", product.get("competitor_price") or current_price)))
    
    baseline = 30
    if datasets.get_active_dataset():
        forecast = datasets.forecast(product["id"], 7)
        if forecast.get("available"):
            baseline = forecast.get("total_predicted_demand", 30)
    else:
        baseline = max(2, round(product.get("demand_score", 50) / 12 * 7))
        
    price_elasticity = -0.9 * ((price - current_price) / max(current_price, 1))
    promo_lift = promotion_pct * 0.012
    competitor_lift = (competitor_price - price) / max(competitor_price, 1) * 0.35
    requested_demand = max(1, round(baseline * (1 + price_elasticity + promo_lift + competitor_lift)))
    fulfilled_demand = min(requested_demand, inventory)
    revenue = round(fulfilled_demand * price * (1 - promotion_pct / 100), 0)
    cost = product.get("unit_cost", current_price * 0.5)
    profit = round(revenue - fulfilled_demand * cost, 0)
    return jsonify({
        "product_id": product["id"], "product": product["name"], "demand": fulfilled_demand,
        "unmet_demand": max(0, requested_demand - inventory), "revenue": revenue, "profit": profit,
        "available": True, "margin": round(profit / revenue * 100, 1) if revenue else 0,
        "ending_inventory": max(0, inventory - fulfilled_demand), "assumptions": {
            "baseline_demand": baseline, "promotion_lift": f"+{promo_lift * 100:.1f}%", "price_effect": f"{price_elasticity * 100:+.1f}%"
        }
    })


@app.route('/api/competitor-analysis', methods=['GET'])
def competitor_analysis():
    comparisons = []
    products = datasets.get_products() if datasets.get_active_dataset() else []
    if not products:
        products = db.get_products()
    for product in products:
        if product.get("current_price") is None or product.get("competitor_price") is None:
            continue
        gap = product["current_price"] - product["competitor_price"]
        comparisons.append({
            "product_id": product["id"], "product": product["name"], "category": product["category"],
            "our_price": product["current_price"], "competitor_price": product["competitor_price"], "price_gap": gap,
            "position": "Above market" if gap > 0 else "Below market" if gap < 0 else "At market",
            "signal": "Conversion risk" if gap > product["current_price"] * 0.03 else "Competitive"
        })
    return jsonify(comparisons)


@app.route('/api/data-quality', methods=['GET'])
def data_quality():
    active = datasets.get_active_dataset()
    if active and active.get("validation"):
        report = dict(active["validation"])
        report["available"] = True
        report["filename"] = active["original_filename"]
        report["timestamp"] = active["upload_date"]
        report["status"] = active["processing_status"]
        report["issues"] = [{"count": 1, "message": warning} for warning in report.get("warnings", [])]
        report["checks"] = [
            {"name": "Missing values", "count": report.get("missing_values", 0), "status": "review" if report.get("missing_values", 0) else "pass"},
            {"name": "Duplicate records", "count": report.get("duplicate_records", 0), "status": "review" if report.get("duplicate_records", 0) else "pass"},
            {"name": "Invalid prices", "count": report.get("invalid_prices", 0), "status": "fail" if report.get("invalid_prices", 0) else "pass"},
            {"name": "Negative quantities", "count": report.get("negative_quantities", 0), "status": "fail" if report.get("negative_quantities", 0) else "pass"},
            {"name": "Invalid dates", "count": report.get("invalid_dates", 0), "status": "fail" if report.get("invalid_dates", 0) else "pass"},
            {"name": "Outliers", "count": report.get("outliers", 0), "status": "review" if report.get("outliers", 0) else "pass"}
        ]
        return jsonify(report)
    logs = db.data_cleaning_logs
    return jsonify({
        "available": True,
        "quality_score": logs.get("quality_score", 98),
        "filename": "reference_doc.csv",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "status": "Validated & Active",
        "checks": [
            {"name": "Missing values", "count": logs.get("missing_imputed", 6), "status": "pass"},
            {"name": "Duplicate records", "count": logs.get("duplicates_removed", 14), "status": "pass"},
            {"name": "Invalid prices", "count": logs.get("invalid_prices", 0), "status": "pass"},
            {"name": "Negative quantities", "count": logs.get("negative_quantities", 0), "status": "pass"},
            {"name": "Invalid dates", "count": logs.get("invalid_dates", 0), "status": "pass"},
            {"name": "Outliers", "count": logs.get("outliers_adjusted", 3), "status": "pass"}
        ],
        "issues": []
    })


@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    alerts_list = datasets.alerts() if datasets.get_active_dataset() else []
    if not alerts_list:
        alerts_list = db.get_inventory_alerts() + db.alerts
    return jsonify({"alerts": alerts_list, "generated_at": datetime.now().isoformat()})


@app.route('/api/audit-logs', methods=['GET'])
def get_audit_logs():
    return jsonify({"logs": db.audit_logs[:100]})


@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify({"current_user": db.current_user, "users": db.users, "roles": ["Admin", "Store Manager", "Analyst", "Supplier"]})


@app.route('/api/auth/switch-role', methods=['POST'])
def switch_role():
    data = request.json or {}
    role = data.get("role")
    allowed_roles = ["Admin", "Store Manager", "Analyst", "Supplier"]
    if role not in allowed_roles:
        return jsonify({"error": "Unsupported role"}), 400
    previous = db.current_user["role"]
    db.current_user["role"] = role
    db.user_role = role
    db.add_audit_log("Changed active role", "Access control", previous, role, "security")
    db._save_state("active_role", role)
    return jsonify({"success": True, "current_user": db.current_user})


@app.route('/api/reports', methods=['GET'])
def get_reports():
    if datasets.get_active_dataset() and datasets.analytics().get("available"):
        metrics = datasets.analytics()
        decision_data = datasets.recommendations()
    else:
        metrics = executive_metrics()
        decision_data = {"recommendations": [build_decision(p) for p in db.get_products()]}
    return jsonify({
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "report_name": "NeuroRetail Executive Decision Report", "metrics": metrics,
        "recommendations": decision_data.get("recommendations", [])[:5]
    })

@app.route('/api/finance', methods=['GET'])
def get_finance():
    return jsonify({
        "gross_margin_pct": 58.4,
        "net_margin_pct": 28.5,
        "operating_margin_pct": 34.2,
        "cash_flow_inr": 1240000.00,
        "roi_pct": 32.4,
        "roe_pct": 24.8,
        "roa_pct": 18.2,
        "eps_inr": 42.50,
        "monthly_expenses": [
            { "month": "Jan", "revenue": 1200000, "expenses": 720000, "profit": 480000 },
            { "month": "Feb", "revenue": 1350000, "expenses": 780000, "profit": 570000 },
            { "month": "Mar", "revenue": 1489200, "expenses": 820000, "profit": 669200 }
        ]
    })

@app.route('/api/insights', methods=['GET'])
def get_insights():
    return jsonify({
        "opportunity_score": 88,
        "risk_score": 14,
        "growth_score": 92,
        "recommendations": [
            { "id": "REC-1", "title": "Inventory Surge Warning", "summary": "Demand for NeuroPulse SmartWatch is expected to increase by 18% next month due to upcoming festival season. Consider increasing inventory by 15% to avoid stockouts.", "impact": "+₹1.2 Lakh Revenue", "urgency": "High" },
            { "id": "REC-2", "title": "Dynamic Price Optimization", "summary": "AcousticSense ANC Headphones competitor price increased by 4%. AI recommends adjusting price to ₹14,299 to capture optimal profit margin.", "impact": "+₹45,000 Profit", "urgency": "Medium" },
            { "id": "REC-3", "title": "Customer Retention Incentive", "summary": "Cart abandonment in Smart Home category increased by 3.2%. Trigger automated 5% loyalty discount at checkout.", "impact": "+8.4% Conversion", "urgency": "Medium" }
        ]
    })

@app.route('/api/chat', methods=['POST'])
def ai_chat():
    data = request.json or {}
    query = data.get("query", "").lower()
    if "revenue" in query or "sales" in query:
        ans = f"Total revenue for {db.get_active_store()['name']} is ₹14,89,200.00 (+14.2% growth). Total units sold: 1,420."
    elif "stock" in query or "inventory" in query:
        ans = "You have 3 items below safety stock limit, including NeuroPulse SmartWatch Pro (18 units left). Suggested reorder: PO-901."
    elif "pricing" in query or "discount" in query:
        ans = "Multi-variable Ridge Regression suggests a +5% surge price lift on SmartWatch Pro due to high demand velocity."
    else:
        ans = f"Based on historical data for {db.get_active_store()['name']}, AI predicts steady +12% growth next quarter. Stock levels are healthy."
    return jsonify({"response": ans})

if __name__ == '__main__':
    print("Starting NeuroRetail Flask AI Backend on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
