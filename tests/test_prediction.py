"""
Unit tests for Crop Yield Real-Time Inference Module.
"""

import pytest
import pandas as pd
from src.predict import CropYieldPredictor


@pytest.fixture
def predictor():
    return CropYieldPredictor()


def test_prediction_output_format(predictor):
    sample = {
        "Area": "India",
        "Item": "Wheat",
        "Year": 2024,
        "average_rain_fall_mm_per_year": 950.0,
        "pesticides_tonnes": 15000.0,
        "avg_temp": 24.0
    }
    res = predictor.predict(sample)

    assert res["status"] == "success"
    assert "predicted_yield_hg_ha" in res
    assert "predicted_yield_t_ha" in res
    assert "predicted_yield_kg_ha" in res
    assert "confidence_interval_95_t_ha" in res
    assert len(res["confidence_interval_95_t_ha"]) == 2

    # Plausible Indian wheat yield check (between 1.0 and 6.0 t/ha)
    assert 1.0 <= res["predicted_yield_t_ha"] <= 6.0


def test_dataframe_batch_prediction(predictor):
    batch = pd.DataFrame([
        {
            "Area": "India", "Item": "Wheat", "Year": 2024,
            "average_rain_fall_mm_per_year": 900.0, "pesticides_tonnes": 12000.0, "avg_temp": 24.0
        },
        {
            "Area": "Brazil", "Item": "Soybeans", "Year": 2024,
            "average_rain_fall_mm_per_year": 1600.0, "pesticides_tonnes": 45000.0, "avg_temp": 26.0
        }
    ])
    res = predictor.predict(batch)
    assert res["status"] == "success"
    assert res["predicted_yield_t_ha"] > 0


def test_invalid_input_rejection(predictor):
    # Year outside realistic bounds
    with pytest.raises(ValueError, match="agricultural forecast bounds"):
        predictor.predict({
            "Area": "India", "Item": "Wheat", "Year": 2200,
            "average_rain_fall_mm_per_year": 900.0, "pesticides_tonnes": 12000.0, "avg_temp": 24.0
        })

    # Negative rainfall
    with pytest.raises(ValueError, match="terrestrial bounds"):
        predictor.predict({
            "Area": "India", "Item": "Wheat", "Year": 2024,
            "average_rain_fall_mm_per_year": -100.0, "pesticides_tonnes": 12000.0, "avg_temp": 24.0
        })

