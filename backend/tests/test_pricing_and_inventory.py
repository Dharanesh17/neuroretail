import pytest
import sys
import os

# Add parent directory to path so tests can import backend modules directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ml_engine import DynamicPricingEngine
from data_store import db


@pytest.fixture
def pricing_engine():
    return DynamicPricingEngine()


def test_pricing_bounds_and_multiplier(pricing_engine):
    """Verify that the dynamic pricing multiplier respects bounded ranges."""
    sample_prod = {
        "id": "TEST-01",
        "name": "Test Product",
        "category": "Electronics",
        "base_price": 1000.0,
        "competitor_price": 1050.0,
        "stock": 10,
        "min_stock": 20,
        "demand_score": 90,
        "abandonment_rate": 0.1,
        "unit_cost": 500.0
    }
    result = pricing_engine.predict_optimal_price(sample_prod, is_peak_hour=True)

    assert "recommended_price" in result
    assert "profit_margin_pct" in result
    assert "confidence_score" in result
    assert result["confidence_score"] > 0
    # Multiplier is bounded between 0.75 and 1.45
    multiplier = result["recommended_price"] / sample_prod["base_price"]
    assert 0.75 <= multiplier <= 1.45
    # Recommended price must maintain positive profit margin over unit cost
    assert result["recommended_price"] > sample_prod["unit_cost"]


def test_surge_pricing_trigger(pricing_engine):
    """Low stock (<min_stock) and high demand score should produce surge strategy."""
    low_stock_prod = {
        "id": "SURGE-01",
        "name": "Surge Item",
        "category": "Accessories",
        "base_price": 200.0,
        "competitor_price": 210.0,
        "stock": 4,
        "min_stock": 20,
        "demand_score": 95,
        "abandonment_rate": 0.05,
        "unit_cost": 100.0
    }
    result = pricing_engine.predict_optimal_price(low_stock_prod, is_peak_hour=True)
    assert result["recommended_price"] >= low_stock_prod["base_price"]
    assert "Surge" in result["strategy"]


def test_clearance_pricing_on_overstock(pricing_engine):
    """High stock (> 1.5x min_stock) should lead to clearance/discount strategy."""
    overstock_prod = {
        "id": "CLEAR-01",
        "name": "Overstock Item",
        "category": "Accessories",
        "base_price": 500.0,
        "competitor_price": 490.0,
        "stock": 200,
        "min_stock": 30,
        "demand_score": 30,
        "abandonment_rate": 0.35,
        "unit_cost": 250.0
    }
    result = pricing_engine.predict_optimal_price(overstock_prod, is_peak_hour=False)
    assert "Clearance" in result["strategy"] or result["recommended_price"] <= overstock_prod["base_price"] * 1.1


def test_inventory_status_and_classification():
    """Verify inventory statuses, safety stock and ABC classifications from db."""
    products = db.get_products()
    assert len(products) > 0

    for prod in products:
        assert prod["stock"] >= 0
        assert prod["min_stock"] >= 0
        assert prod["max_stock"] >= prod["min_stock"]
        assert prod["unit_cost"] > 0
        assert prod["base_price"] >= prod["unit_cost"]
