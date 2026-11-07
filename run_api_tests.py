import urllib.request
import urllib.error
import json
import time

BASE_URL = "http://127.0.0.1:5000/api"

tests = [
    ("Health Check", "GET", "/health", None),
    ("Executive Dashboard", "GET", "/executive/dashboard", None),
    ("Dashboard Summary", "GET", "/dashboard/summary", None),
    ("Product Catalog", "GET", "/products", None),
    ("Product PROD-101 Detail", "GET", "/products/PROD-101", None),
    ("Dynamic Pricing Engine", "POST", "/pricing/dynamic-calculate", {"is_peak_hour": False}),
    ("Peak Surge Pricing", "POST", "/pricing/dynamic-calculate", {"product_id": "PROD-101", "is_peak_hour": True}),
    ("Demand Forecast (30d)", "GET", "/forecast/PROD-101?days=30", None),
    ("Inventory Status & EOQ", "GET", "/inventory/status", None),
    ("Auto-PO Generation", "POST", "/inventory/reorder", {"product_id": "PROD-101", "quantity": 25}),
    ("What-if Simulator", "POST", "/scenario/simulate", {"product_id": "PROD-101", "price": 20999, "promotion_pct": 5, "inventory": 30}),
    ("Decision Recommendations", "GET", "/decision/recommendations", None),
    ("Model Performance", "GET", "/model-performance", None),
    ("ML Algorithm Comparison", "GET", "/ml/compare", None),
    ("Data Quality Monitor", "GET", "/data-quality", None),
    ("Data Cleaning Pipeline", "POST", "/upload/clean", {"filename": "test.csv", "content": "Date,Product_ID,Product_Name,Category,Units_Sold,Price_Charged_INR\n2025-01-01,P1,Item,Cat,10,100"}),
    ("Operational Alerts", "GET", "/alerts", None),
    ("Activity Trail / Audit", "GET", "/audit-logs", None),
    ("Users & Roles (RBAC)", "GET", "/users", None),
    ("Role Switching", "POST", "/auth/switch-role", {"role": "Store Manager"}),
    ("Authentication Login", "POST", "/auth/login", {"email": "dharanesh@neuroretail.demo", "password": "password123", "role": "Admin"}),
    ("Authentication Session Check", "GET", "/auth/me", None),
    ("Authentication Logout", "POST", "/auth/logout", None),
    ("Multi-Store Config", "GET", "/stores", None),
    ("Executive Reports", "GET", "/reports", None),
    ("AI Retail Assistant Chat", "POST", "/chat", {"query": "What is our store revenue?"}),
]

print("\n" + "=" * 76)
print("  NEURORETAIL AI PLATFORM - COMPREHENSIVE LIVE API TEST SUITE")
print(f"  Target: {BASE_URL}")
print("=" * 76)
print(f"{'#':<3} | {'Test Name':<28} | {'Method':<6} | {'Status':<8} | {'Time (ms)':<9} | {'Result'}")
print("-" * 76)

passed = 0
failed = 0
total_time = 0

for i, (name, method, endpoint, payload) in enumerate(tests, 1):
    url = BASE_URL + endpoint
    data = json.dumps(payload).encode('utf-8') if payload else None
    headers = {"Content-Type": "application/json"} if payload else {}
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            t1 = time.time()
            elapsed_ms = round((t1 - t0) * 1000, 1)
            total_time += elapsed_ms
            status = response.status
            if status in (200, 201):
                passed += 1
                result = "PASS [OK]"
            else:
                failed += 1
                result = f"WARN [{status}]"
            print(f"{i:<3} | {name:<28} | {method:<6} | {status:<8} | {elapsed_ms:<9} | {result}")
    except urllib.error.HTTPError as e:
        elapsed_ms = round((time.time() - t0) * 1000, 1)
        failed += 1
        print(f"{i:<3} | {name:<28} | {method:<6} | {e.code:<8} | {elapsed_ms:<9} | FAIL")
    except Exception as e:
        elapsed_ms = round((time.time() - t0) * 1000, 1)
        failed += 1
        print(f"{i:<3} | {name:<28} | {method:<6} | {'ERR':<8} | {elapsed_ms:<9} | FAIL ({e})")

print("=" * 76)
print(f"SUMMARY: {passed}/{len(tests)} Tests Passed ({passed/len(tests)*100:.1f}%) | Total Time: {total_time:.1f} ms")
print("=" * 76 + "\n")
