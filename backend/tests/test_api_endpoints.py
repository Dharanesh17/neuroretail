import pytest
import sys
import os
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_health_check(client):
    """GET /api/health returns online status."""
    rv = client.get('/api/health')
    assert rv.status_code == 200
    data = json.loads(rv.data)
    assert data["status"] == "online"


def test_stores_endpoint(client):
    """GET /api/stores returns store list and active store."""
    rv = client.get('/api/stores')
    assert rv.status_code == 200
    data = json.loads(rv.data)
    assert "stores" in data
    assert "active_store" in data
    assert len(data["stores"]) >= 1


def test_dashboard_summary(client):
    """GET /api/dashboard/summary returns executive business metrics."""
    rv = client.get('/api/dashboard/summary')
    assert rv.status_code == 200
    data = json.loads(rv.data)
    assert "total_revenue" in data
    assert "total_products" in data or "total_units" in data or "available" in data


def test_products_catalog(client):
    """GET /api/products returns products catalog."""
    rv = client.get('/api/products')
    assert rv.status_code == 200
    data = json.loads(rv.data)
    assert isinstance(data, list)
    assert len(data) > 0
    assert "id" in data[0]
    assert "name" in data[0]
    assert "current_price" in data[0] or "selling_price" in data[0] or "base_price" in data[0]


def test_dynamic_pricing_calculate(client):
    """POST /api/pricing/dynamic-calculate returns recommendation."""
    # Test batch calculation
    rv_batch = client.post('/api/pricing/dynamic-calculate', json={"is_peak_hour": False})
    assert rv_batch.status_code == 200
    data_batch = json.loads(rv_batch.data)
    assert isinstance(data_batch, list)
    assert len(data_batch) > 0
    assert "recommended_price" in data_batch[0]

    # Test single product calculation
    rv_single = client.post('/api/pricing/dynamic-calculate', json={"product_id": "PROD-101", "is_peak_hour": True})
    assert rv_single.status_code == 200
    data_single = json.loads(rv_single.data)
    assert "recommended_price" in data_single
    assert "confidence_score" in data_single


def test_inventory_status(client):
    """GET /api/inventory/status returns inventory stock levels."""
    rv = client.get('/api/inventory/status')
    assert rv.status_code == 200
    data = json.loads(rv.data)
    assert isinstance(data, list)
    assert len(data) > 0
    assert "name" in data[0]
    assert "stock" in data[0] or "min_stock" in data[0]


def test_ml_algorithm_comparison(client):
    """GET /api/ml/compare returns algorithm comparison matrix."""
    rv = client.get('/api/ml/compare')
    assert rv.status_code == 200
    data = json.loads(rv.data)
    assert "best_model" in data
    assert "algorithms" in data
    assert len(data["algorithms"]) >= 2


def test_operational_alerts(client):
    """GET /api/alerts returns alerts list."""
    rv = client.get('/api/alerts')
    assert rv.status_code == 200
    data = json.loads(rv.data)
    assert isinstance(data, (list, dict))


def test_role_switch(client):
    """POST /api/auth/switch-role updates user persona."""
    rv = client.post('/api/auth/switch-role', json={"role": "Store Manager"})
    assert rv.status_code == 200
    data = json.loads(rv.data)
    assert data["success"] is True
    assert data["current_user"]["role"] == "Store Manager"


def test_ai_chat_query(client):
    """POST /api/chat provides contextual answers."""
    rv = client.post('/api/chat', json={"query": "What is our current revenue?"})
    assert rv.status_code == 200
    data = json.loads(rv.data)
    assert "response" in data
    assert len(data["response"]) > 0
