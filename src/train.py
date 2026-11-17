"""
CropYield Predictor — Model Training & Cross-Validation Pipeline
Trains, cross-validates (5-Fold), and compares 5 distinct regression architectures:
1. Linear Regression
2. Ridge Regression
3. Random Forest Regressor
4. Gradient Boosting Regressor
5. XGBoost Regressor
Logs experiments with MLflow, evaluates MAE/RMSE/R2, and persists the champion model.
"""

import os
import json
import time
from pathlib import Path
from typing import Dict, Any, Tuple
import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split, KFold, cross_validate
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from xgboost import XGBRegressor
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

from src.preprocessing import build_preprocessor

# Optional MLflow integration
try:
    import mlflow
    import mlflow.sklearn
    MLFLOW_AVAILABLE = True
except Exception:
    MLFLOW_AVAILABLE = False


def train_and_compare_models(
    clean_csv_path: str = "data/processed/clean_crop_yield.csv",
    models_dir: str = "models",
    reports_dir: str = "reports"
) -> Tuple[pd.DataFrame, Any, Dict[str, Any]]:
    """
    Executes full training pipeline across 5 architectures with 5-fold cross validation.
    """
    models_path = Path(models_dir)
    reports_path = Path(reports_dir)
    models_path.mkdir(parents=True, exist_ok=True)
    reports_path.mkdir(parents=True, exist_ok=True)

    # 1. Load data
    df = pd.read_csv(clean_csv_path)
    X = df.drop(columns=["hg/ha_yield"])
    y = df["hg/ha_yield"]

    # 2. Train/Test Split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # 3. Define 5 Architectures
    model_definitions = {
        "Linear Regression": LinearRegression(),
        "Ridge Regression": Ridge(alpha=10.0, random_state=42),
        "Random Forest": RandomForestRegressor(
            n_estimators=70, max_depth=22, min_samples_split=4, random_state=42, n_jobs=1
        ),
        "Gradient Boosting": GradientBoostingRegressor(
            n_estimators=80, max_depth=6, learning_rate=0.15, random_state=42
        ),
        "XGBoost": XGBRegressor(
            n_estimators=120, max_depth=7, learning_rate=0.12, tree_method="hist",
            subsample=0.85, colsample_bytree=0.85, random_state=42, n_jobs=1
        )
    }

    # Setup MLflow if available
    if MLFLOW_AVAILABLE:
        try:
            mlflow.set_tracking_uri("file:./mlruns")
            mlflow.set_experiment("CropYield_Predictor_Benchmarking")
        except Exception as e:
            print(f"[Notice] MLflow local tracking initialization notice: {e}")

    results = []
    trained_pipelines = {}
    cv = KFold(n_splits=5, shuffle=True, random_state=42)

    print("==================================================")
    print("Beginning 5-Fold Cross-Validation & Model Training")
    print(f"Dataset: {len(X_train):,} train samples, {len(X_test):,} test samples")
    print("==================================================")

    for name, regressor in model_definitions.items():
        print(f"\nEvaluating: {name}...")
        start_time = time.time()

        # Build end-to-end pipeline: Feature Engineering + Scaling/Encoding + Model
        pipe = Pipeline([
            ("preprocessor", build_preprocessor(X_train)),
            ("regressor", regressor)
        ])

        # 5-Fold Cross Validation on Train Set
        scoring = {
            "r2": "r2",
            "neg_mae": "neg_mean_absolute_error",
            "neg_rmse": "neg_root_mean_squared_error"
        }
        cv_scores = cross_validate(pipe, X_train, y_train, cv=cv, scoring=scoring, n_jobs=1)
        cv_r2_mean = float(np.mean(cv_scores["test_r2"]))
        cv_r2_std = float(np.std(cv_scores["test_r2"]))
        cv_mae_mean = float(-np.mean(cv_scores["test_neg_mae"]))
        cv_rmse_mean = float(-np.mean(cv_scores["test_neg_rmse"]))

        # Fit on full train set
        pipe.fit(X_train, y_train)
        fit_duration = round(time.time() - start_time, 2)

        # Test Set Evaluation
        y_pred = pipe.predict(X_test)
        test_r2 = float(r2_score(y_test, y_pred))
        test_mae = float(mean_absolute_error(y_test, y_pred))
        test_rmse = float(root_mean_squared_error(y_test, y_pred))

        trained_pipelines[name] = pipe

        result_row = {
            "Model": name,
            "CV R2 (Mean)": round(cv_r2_mean, 4),
            "CV R2 (Std)": round(cv_r2_std, 4),
            "CV MAE": round(cv_mae_mean, 2),
            "CV RMSE": round(cv_rmse_mean, 2),
            "Test R2": round(test_r2, 4),
            "Test MAE": round(test_mae, 2),
            "Test RMSE": round(test_rmse, 2),
            "Training Time (s)": fit_duration
        }
        results.append(result_row)
        print(f"  -> CV R²: {cv_r2_mean:.4f} ± {cv_r2_std:.4f} | Test R²: {test_r2:.4f} | Test RMSE: {test_rmse:,.0f} hg/ha")

        # MLflow Logging
        if MLFLOW_AVAILABLE:
            try:
                with mlflow.start_run(run_name=name):
                    mlflow.log_param("model_name", name)
                    mlflow.log_params(regressor.get_params())
                    mlflow.log_metric("cv_r2_mean", cv_r2_mean)
                    mlflow.log_metric("cv_r2_std", cv_r2_std)
                    mlflow.log_metric("cv_mae", cv_mae_mean)
                    mlflow.log_metric("cv_rmse", cv_rmse_mean)
                    mlflow.log_metric("test_r2", test_r2)
                    mlflow.log_metric("test_mae", test_mae)
                    mlflow.log_metric("test_rmse", test_rmse)
                    mlflow.log_metric("training_duration_s", fit_duration)
            except Exception as ml_err:
                print(f"[Notice] MLflow run logging bypassed: {ml_err}")

    # Build comparison DataFrame
    comparison_df = pd.DataFrame(results).sort_values(by="Test R2", ascending=False).reset_index(drop=True)
    comparison_csv_path = reports_path / "model_comparison.csv"
    comparison_df.to_csv(comparison_csv_path, index=False)
    print(f"\nModel comparison saved to: {comparison_csv_path}")

    # Select Champion Model (highest Test R2 & CV R2)
    best_row = comparison_df.iloc[0]
    best_name = best_row["Model"]
    best_pipe = trained_pipelines[best_name]

    print("\n==================================================")
    print(f"Champion Model Selected: {best_name}")
    print(f"Cross-Validation R²: {best_row['CV R2 (Mean)']} | Test R²: {best_row['Test R2']}")
    print(f"Test MAE: {best_row['Test MAE']:,} hg/ha ({best_row['Test MAE']/10000:.2f} t/ha)")
    print(f"Test RMSE: {best_row['Test RMSE']:,} hg/ha ({best_row['Test RMSE']/10000:.2f} t/ha)")
    print("==================================================")

    # Persist Champion Model
    best_model_path = models_path / "best_model.joblib"
    joblib.dump(best_pipe, best_model_path)
    print(f"Exported champion model to: {best_model_path}")

    # Persist Model Metadata
    metadata = {
        "champion_model_name": best_name,
        "export_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "metrics": {
            "cv_r2_mean": float(best_row["CV R2 (Mean)"]),
            "cv_r2_std": float(best_row["CV R2 (Std)"]),
            "cv_mae": float(best_row["CV MAE"]),
            "cv_rmse": float(best_row["CV RMSE"]),
            "test_r2": float(best_row["Test R2"]),
            "test_mae": float(best_row["Test MAE"]),
            "test_rmse": float(best_row["Test RMSE"])
        },
        "target_variable": "hg/ha_yield",
        "target_unit": "hg/ha (10,000 hg/ha = 1 metric ton/ha)",
        "features_in": list(X.columns),
        "total_training_records": len(X_train),
        "total_test_records": len(X_test),
        "hyperparameters": best_pipe.named_steps["regressor"].get_params(),
        "all_models_ranked": comparison_df.to_dict(orient="records")
    }
    metadata_path = models_path / "model_metadata.json"
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=4)
    print(f"Exported model metadata to: {metadata_path}")

    # Save test dataset for evaluation module
    test_eval_df = X_test.copy()
    test_eval_df["y_true"] = y_test
    test_eval_df["y_pred"] = best_pipe.predict(X_test)
    test_eval_df.to_csv("data/processed/test_predictions.csv", index=False)

    return comparison_df, best_pipe, metadata


if __name__ == "__main__":
    comparison_df, best_model, meta = train_and_compare_models()
    print("\nFinal Model Comparison Table:")
    print(comparison_df.to_string(index=False))
