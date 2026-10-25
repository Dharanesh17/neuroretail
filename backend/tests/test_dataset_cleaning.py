import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from data_store import db


def test_clean_uploaded_dataset_empty():
    """Empty content should return baseline 100 quality score with 0 rows processed."""
    res = db.clean_uploaded_dataset("", "empty.csv")
    assert res["quality_score"] == 100
    assert res["total_rows_processed"] == 0
    assert res["status"] == "Ready for modelling"


def test_clean_uploaded_dataset_valid_csv():
    """Valid CSV content should report high quality score with parsed rows."""
    csv_content = """Date,Product_ID,Product_Name,Category,Units_Sold,Price_Charged_INR,Unit_Cost_INR
2025-01-01,PROD-01,Smart Watch,Electronics,15,19999,12000
2025-01-02,PROD-01,Smart Watch,Electronics,18,19999,12000
2025-01-03,PROD-02,Earphones,Audio,30,4999,2500
2025-01-04,PROD-02,Earphones,Audio,25,4999,2500
"""
    res = db.clean_uploaded_dataset(csv_content, "valid_sales.csv")
    assert res["total_rows_processed"] == 4
    assert res["quality_score"] >= 90
    assert res["duplicates_removed"] == 0
    assert res["negative_quantities"] == 0


def test_clean_uploaded_dataset_with_anomalies():
    """CSV with duplicate rows, negative quantities and currency symbols should be caught."""
    csv_content = """Date,Product_ID,Product_Name,Category,Units_Sold,Price_Charged_INR
2025-01-01,P1,Item A,Gadgets,10,₹1000
2025-01-01,P1,Item A,Gadgets,10,₹1000
2025-01-02,P1,Item A,Gadgets,-5,₹1000
invalid-date,P2,Item B,Gadgets,12,-500
"""
    res = db.clean_uploaded_dataset(csv_content, "dirty_sales.csv")
    assert res["total_rows_processed"] == 4
    assert res["duplicates_removed"] >= 1
    assert res["negative_quantities"] >= 1
    assert res["invalid_prices"] >= 1
    assert res["invalid_dates"] >= 1
    assert res["quality_score"] < 100
