"""
Unit tests for Preprocessing Pipeline Module.
"""

import pytest
import pandas as pd
import numpy as np
from src.preprocessing import build_preprocessor, save_preprocessor, load_preprocessor


@pytest.fixture
def mock_dataset():
    return pd.DataFrame({
        "Area": ["India", "Albania", "Canada", "India"],
        "Item": ["Wheat", "Maize", "Wheat", "Potatoes"],
        "Year": [2000, 2005, 2010, 2012],
        "average_rain_fall_mm_per_year": [900.0, 1100.0, 600.0, 950.0],
        "pesticides_tonnes": [12000.0, 250.0, 18000.0, 14000.0],
        "avg_temp": [24.0, 16.0, 7.5, 25.5]
    })


def test_preprocessing_pipeline_fit_transform(mock_dataset):
    pipe = build_preprocessor(mock_dataset)
    transformed = pipe.fit_transform(mock_dataset)

    assert isinstance(transformed, np.ndarray)
    assert transformed.shape[0] == len(mock_dataset)
    assert transformed.shape[1] > len(mock_dataset.columns)
    assert not np.isnan(transformed).any()


def test_preprocessor_serialization(mock_dataset, tmp_path):
    pipe = build_preprocessor(mock_dataset)
    pipe.fit(mock_dataset)

    save_target = tmp_path / "test_preprocessor.joblib"
    save_preprocessor(pipe, str(save_target))
    assert save_target.exists()

    reloaded = load_preprocessor(str(save_target))
    orig_trans = pipe.transform(mock_dataset[:2])
    reloaded_trans = reloaded.transform(mock_dataset[:2])

    np.testing.assert_array_almost_equal(orig_trans, reloaded_trans)

