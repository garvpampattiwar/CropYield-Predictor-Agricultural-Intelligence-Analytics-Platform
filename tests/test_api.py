"""
Unit tests for CropYield FastAPI Backend endpoints
"""

import pytest
from server import app, PredictRequest, predict_yield, get_model_benchmarks, get_dataset_summary


def test_predict_yield_function():
    req = PredictRequest(
        crop="Wheat",
        area="India",
        year=2024,
        rainfall_mm=1000.0,
        temp_c=23.0,
        pesticides_t=12000.0
    )
    res = predict_yield(req)
    assert res.yield_t_ha > 0
    assert res.yield_hg_ha > 0
    assert res.ci_low <= res.yield_t_ha <= res.ci_high
    assert len(res.feature_contributions) == 5
    assert res.model_name == "Random Forest"


def test_model_benchmarks_metrics():
    metrics = get_model_benchmarks()
    assert "models" in metrics
    assert len(metrics["models"]) >= 5
    assert metrics["test_r2"] > 0.95
    assert metrics["champion_model"] == "Random Forest"


def test_dataset_summary():
    summary = get_dataset_summary()
    assert summary["total_records"] == 25932
    assert summary["total_countries"] == 101
    assert summary["total_crops"] == 10
    assert len(summary["top_crops"]) > 0
    assert len(summary["top_areas"]) > 0


def test_dataset_trends_and_scatter():
    from server import get_dataset_trends, get_dataset_scatter, download_pdf_report
    trends = get_dataset_trends(crop="Wheat", area="India")
    assert "datapoints" in trends
    assert len(trends["datapoints"]) > 0

    scatter = get_dataset_scatter(sample_size=20)
    assert len(scatter) == 20
    assert "yield_t_ha" in scatter[0]

    pdf = download_pdf_report()
    assert pdf.status_code == 200

    from server import get_live_telemetry
    telemetry = get_live_telemetry()
    assert "soil_moisture_pct" in telemetry
    assert "soil_ph" in telemetry
    assert telemetry["is_demo_data"] is True

