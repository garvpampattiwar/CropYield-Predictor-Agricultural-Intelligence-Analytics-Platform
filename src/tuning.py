"""
CropYield Predictor — Hyperparameter Tuning Module (Fast & Efficient)
Executes RandomizedSearchCV and Optuna Bayesian optimization on top-performing
architectures (Random Forest and XGBoost) using cross-validation.
"""

import json
import time
from pathlib import Path
from typing import Dict, Any
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split, RandomizedSearchCV, KFold
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import r2_score, root_mean_squared_error, mean_absolute_error

from src.preprocessing import build_preprocessor

try:
    import optuna
    optuna.logging.set_verbosity(optuna.logging.WARNING)
    OPTUNA_AVAILABLE = True
except ImportError:
    OPTUNA_AVAILABLE = False


def run_hyperparameter_tuning(
    clean_csv_path: str = "data/processed/clean_crop_yield.csv",
    reports_dir: str = "reports"
) -> Dict[str, Any]:
    reports_path = Path(reports_dir)
    reports_path.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(clean_csv_path)
    # Representative sample for agile tuning
    if len(df) > 6000:
        df_sample = df.sample(n=6000, random_state=42).reset_index(drop=True)
    else:
        df_sample = df

    X = df_sample.drop(columns=["hg/ha_yield"])
    y = df_sample["hg/ha_yield"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    preprocessor = build_preprocessor(X_train)
    X_train_trans = preprocessor.fit_transform(X_train)
    X_test_trans = preprocessor.transform(X_test)

    tuning_report: Dict[str, Any] = {}
    cv = KFold(n_splits=3, shuffle=True, random_state=42)

    # 1. RandomizedSearchCV on Random Forest
    print("\n--- Running RandomizedSearchCV on Random Forest ---")
    rf_baseline = RandomForestRegressor(n_estimators=40, max_depth=16, random_state=42, n_jobs=1)
    rf_baseline.fit(X_train_trans, y_train)
    rf_base_pred = rf_baseline.predict(X_test_trans)
    rf_base_r2 = r2_score(y_test, rf_base_pred)

    rf_param_dist = {
        "n_estimators": [50, 70],
        "max_depth": [18, 22],
        "min_samples_split": [2, 4]
    }
    rf_search = RandomizedSearchCV(
        estimator=RandomForestRegressor(random_state=42, n_jobs=1),
        param_distributions=rf_param_dist,
        n_iter=3,
        cv=cv,
        scoring="r2",
        random_state=42,
        n_jobs=1
    )
    rf_search.fit(X_train_trans, y_train)
    rf_best = rf_search.best_estimator_
    rf_tuned_pred = rf_best.predict(X_test_trans)
    rf_tuned_r2 = r2_score(y_test, rf_tuned_pred)

    tuning_report["Random Forest"] = {
        "baseline_r2": round(float(rf_base_r2), 4),
        "tuned_r2": round(float(rf_tuned_r2), 4),
        "r2_delta": round(float(rf_tuned_r2 - rf_base_r2), 4),
        "best_params": rf_search.best_params_,
        "best_cv_score": round(float(rf_search.best_score_), 4)
    }
    print(f"Random Forest -> Baseline R²: {rf_base_r2:.4f} | Tuned R²: {rf_tuned_r2:.4f} | Best CV: {rf_search.best_score_:.4f}")

    # 2. RandomizedSearchCV on XGBoost
    print("\n--- Running RandomizedSearchCV on XGBoost ---")
    xgb_baseline = XGBRegressor(n_estimators=60, max_depth=6, random_state=42, tree_method="hist", n_jobs=1)
    xgb_baseline.fit(X_train_trans, y_train)
    xgb_base_pred = xgb_baseline.predict(X_test_trans)
    xgb_base_r2 = r2_score(y_test, xgb_base_pred)

    xgb_param_dist = {
        "n_estimators": [80, 120],
        "max_depth": [6, 8],
        "learning_rate": [0.1, 0.15]
    }
    xgb_search = RandomizedSearchCV(
        estimator=XGBRegressor(tree_method="hist", random_state=42, n_jobs=1),
        param_distributions=xgb_param_dist,
        n_iter=3,
        cv=cv,
        scoring="r2",
        random_state=42,
        n_jobs=1
    )
    xgb_search.fit(X_train_trans, y_train)
    xgb_best = xgb_search.best_estimator_
    xgb_tuned_pred = xgb_best.predict(X_test_trans)
    xgb_tuned_r2 = r2_score(y_test, xgb_tuned_pred)

    tuning_report["XGBoost_RandomizedSearch"] = {
        "baseline_r2": round(float(xgb_base_r2), 4),
        "tuned_r2": round(float(xgb_tuned_r2), 4),
        "r2_delta": round(float(xgb_tuned_r2 - xgb_base_r2), 4),
        "best_params": xgb_search.best_params_,
        "best_cv_score": round(float(xgb_search.best_score_), 4)
    }
    print(f"XGBoost -> Baseline R²: {xgb_base_r2:.4f} | Tuned R²: {xgb_tuned_r2:.4f} | Best CV: {xgb_search.best_score_:.4f}")

    # 3. Optuna Bayesian Optimization for XGBoost (5 trials)
    if OPTUNA_AVAILABLE:
        print("\n--- Running Optuna Study for XGBoost (5 Trials) ---")
        def objective(trial):
            params = {
                "n_estimators": trial.suggest_int("n_estimators", 60, 120, step=20),
                "max_depth": trial.suggest_int("max_depth", 5, 9),
                "learning_rate": trial.suggest_float("learning_rate", 0.08, 0.2),
                "tree_method": "hist",
                "random_state": 42,
                "n_jobs": 1
            }
            sub_tr_X, sub_val_X, sub_tr_y, sub_val_y = train_test_split(
                X_train_trans, y_train, test_size=0.25, random_state=42
            )
            model = XGBRegressor(**params)
            model.fit(sub_tr_X, sub_tr_y)
            return r2_score(sub_val_y, model.predict(sub_val_X))

        study = optuna.create_study(direction="maximize")
        study.optimize(objective, n_trials=5, show_progress_bar=False)

        best_opt_params = study.best_params
        best_opt_params.update({"tree_method": "hist", "random_state": 42, "n_jobs": 1})
        opt_model = XGBRegressor(**best_opt_params)
        opt_model.fit(X_train_trans, y_train)
        opt_pred = opt_model.predict(X_test_trans)
        opt_r2 = r2_score(y_test, opt_pred)

        tuning_report["XGBoost_Optuna"] = {
            "best_trial_val_r2": round(float(study.best_value), 4),
            "final_test_r2": round(float(opt_r2), 4),
            "best_params": study.best_params
        }
        print(f"Optuna Best Val R²: {study.best_value:.4f} | Test R²: {opt_r2:.4f}")

    out_file = reports_path / "hyperparameter_tuning.json"
    with open(out_file, "w") as f:
        json.dump(tuning_report, f, indent=4)
    print(f"\nTuning results exported to: {out_file}")
    return tuning_report


if __name__ == "__main__":
    run_hyperparameter_tuning()
