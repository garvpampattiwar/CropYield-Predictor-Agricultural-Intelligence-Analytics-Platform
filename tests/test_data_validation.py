"""
Unit tests for Data Validation & Auditing Module.
"""

import pytest
import pandas as pd
import numpy as np
from src.data_validation import DataValidator


@pytest.fixture
def sample_agricultural_data():
    return pd.DataFrame({
        "Area": ["India", "India", "Albania", "Brazil", "India"],
        "Item": ["Wheat", "Wheat", "Maize", "Soybeans", "Wheat"], # includes duplicate row 0 and 1
        "Year": [2000, 2000, 1995, 2010, 2005],
        "hg/ha_yield": [30000, 30000, 45000, 28000, 32000],
        "average_rain_fall_mm_per_year": [800.0, 800.0, 1200.0, 1500.0, 850.0],
        "pesticides_tonnes": [1200.0, 1200.0, 300.0, 4500.0, 1300.0],
        "avg_temp": [24.0, 24.0, 16.5, 26.0, 25.0]
    })


def test_audit_dataset(sample_agricultural_data):
    validator = DataValidator()
    audit = validator.audit_dataset(sample_agricultural_data)
    assert audit["initial_shape"] == (5, 7)
    assert audit["duplicate_records"] == 1
    assert audit["total_missing_cells"] == 0
    assert "hg/ha_yield" in audit["outliers_iqr"]


def test_clean_dataset_removes_duplicates(sample_agricultural_data):
    validator = DataValidator()
    clean_df, summary = validator.clean_dataset(sample_agricultural_data, drop_duplicates=True)
    assert len(clean_df) == 4
    assert summary["duplicates_removed"] == 1
    assert clean_df.duplicated().sum() == 0


def test_physical_range_bounds():
    validator = DataValidator()
    # Bad year and negative rainfall
    bad_data = pd.DataFrame({
        "Area": ["India"],
        "Item": ["Wheat"],
        "Year": [1800], # below 1900
        "hg/ha_yield": [30000],
        "average_rain_fall_mm_per_year": [-50.0], # negative
        "pesticides_tonnes": [100.0],
        "avg_temp": [25.0]
    })
    clean_df, _ = validator.clean_dataset(bad_data)
    # Both rows violate domain ranges, so cleaned dataframe should be empty
    assert len(clean_df) == 0

