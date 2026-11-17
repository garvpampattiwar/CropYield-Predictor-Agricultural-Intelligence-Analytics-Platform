"""
CropYield Predictor — Preprocessing Pipeline Module
Constructs reproducible Scikit-Learn ColumnTransformer and Pipeline objects
integrating feature engineering, scaling, and categorical encoding.
"""

from pathlib import Path
from typing import Tuple, List, Optional
import pandas as pd
import numpy as np
import joblib
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

from src.feature_engineering import AgriculturalFeatureEngineer


def build_preprocessor(sample_df: pd.DataFrame) -> Pipeline:
    """
    Builds a flexible preprocessing pipeline that:
    1. Engineers agricultural domain features (hydrothermal index, GDD, pesticide ratio, etc.)
    2. Dynamically isolates numeric and categorical columns
    3. Standardizes numeric features via StandardScaler
    4. Encodes categorical variables via OneHotEncoder
    """
    fe = AgriculturalFeatureEngineer()
    # Dry run on sample to inspect transformed columns
    transformed_sample = fe.fit_transform(sample_df)

    cat_cols = transformed_sample.select_dtypes(include=["object", "category"]).columns.tolist()
    num_cols = transformed_sample.select_dtypes(include=[np.number]).columns.tolist()

    preprocessor_transformer = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), num_cols),
            ("cat", OneHotEncoder(drop="first", sparse_output=False, handle_unknown="ignore"), cat_cols)
        ],
        remainder="drop"
    )

    full_pipeline = Pipeline([
        ("feature_engineer", AgriculturalFeatureEngineer()),
        ("encoder_scaler", preprocessor_transformer)
    ])

    return full_pipeline


def save_preprocessor(pipeline: Pipeline, path: str = "models/preprocessing_pipeline.joblib") -> str:
    """Saves the fitted preprocessing pipeline."""
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, p)
    return str(p.resolve())


def load_preprocessor(path: str = "models/preprocessing_pipeline.joblib") -> Pipeline:
    """Loads a serialized preprocessing pipeline."""
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"Preprocessing pipeline artifact not found at {path}")
    return joblib.load(p)


if __name__ == "__main__":
    from src.data_validation import DataValidator
    from src.data_loader import DataLoader

    loader = DataLoader()
    raw_df, _ = loader.load_data()
    validator = DataValidator()
    clean_df, _ = validator.clean_dataset(raw_df)

    X = clean_df.drop(columns=["hg/ha_yield"])
    pipeline = build_preprocessor(X)
    pipeline.fit(X)
    save_path = save_preprocessor(pipeline)
    print("=== Preprocessor Pipeline Fitted and Saved ===")
    print(f"Artifact location: {save_path}")
    transformed_X = pipeline.transform(X[:5])
    print(f"Transformed matrix shape for 5 records: {transformed_X.shape}")
