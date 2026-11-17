"""
Unit tests for Domain-Specific Agricultural Feature Engineering.
"""

import pytest
import pandas as pd
import numpy as np
from src.feature_engineering import AgriculturalFeatureEngineer


@pytest.fixture
def base_features():
    return pd.DataFrame({
        "Area": ["India", "United States", "France"],
        "Item": ["Wheat", "Maize", "Potatoes"],
        "Year": [1990, 2005, 2012],
        "average_rain_fall_mm_per_year": [0.0, 850.0, 1600.0], # tests 0 rainfall
        "pesticides_tonnes": [1500.0, 32000.0, 12000.0],
        "avg_temp": [0.0, 18.5, 14.0] # tests cold 0 degree temp
    })


def test_feature_engineer_transformation(base_features):
    fe = AgriculturalFeatureEngineer()
    transformed = fe.fit_transform(base_features)

    assert "hydrothermal_index" in transformed.columns
    assert "pesticide_to_rain_ratio" in transformed.columns
    assert "rainfall_category" in transformed.columns
    assert "tech_trend" in transformed.columns
    assert "gdd" in transformed.columns
    assert "temp_stress" in transformed.columns
    assert "drought_risk" in transformed.columns

    # Verify tech_trend baseline 1990
    assert transformed.loc[0, "tech_trend"] == 0
    assert transformed.loc[1, "tech_trend"] == 15
    assert transformed.loc[2, "tech_trend"] == 22


def test_no_division_by_zero(base_features):
    fe = AgriculturalFeatureEngineer()
    transformed = fe.fit_transform(base_features)

    # Check finite numbers
    assert np.isfinite(transformed["hydrothermal_index"]).all()
    assert np.isfinite(transformed["pesticide_to_rain_ratio"]).all()
    assert not transformed["hydrothermal_index"].isna().any()


def test_optional_npk_features():
    df_npk = pd.DataFrame({
        "Area": ["India"],
        "Item": ["Rice"],
        "Year": [2020],
        "average_rain_fall_mm_per_year": [1100.0],
        "pesticides_tonnes": [5000.0],
        "avg_temp": [27.0],
        "N": [80.0],
        "P": [40.0],
        "K": [40.0]
    })
    fe = AgriculturalFeatureEngineer()
    transformed = fe.fit_transform(df_npk)
    assert "np_ratio" in transformed.columns
    assert "nk_ratio" in transformed.columns
    assert "pk_ratio" in transformed.columns
    assert "npk_sum" in transformed.columns
    assert transformed.loc[0, "np_ratio"] == pytest.approx(2.0, rel=1e-3)
    assert transformed.loc[0, "npk_sum"] == pytest.approx(160.0, rel=1e-3)

