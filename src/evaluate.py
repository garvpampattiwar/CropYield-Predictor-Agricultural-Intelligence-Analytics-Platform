"""
CropYield Predictor — Model Evaluation & Diagnostics Module
Generates comprehensive diagnostic charts including Actual vs Predicted,
Residual Analysis, Homoscedasticity inspection, and Feature Importance.
"""

import json
from pathlib import Path
from typing import Dict, Any, List
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
from scipy import stats

plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")


class ModelEvaluator:
    """
    Evaluates trained crop yield models, generates diagnostic plots, and produces
    detailed residual diagnostics and agronomic interpretability reports.
    """

    def __init__(
        self,
        model_path: str = "models/best_model.joblib",
        metadata_path: str = "models/model_metadata.json",
        figures_dir: str = "reports/figures"
    ):
        self.model_path = Path(model_path)
        self.metadata_path = Path(metadata_path)
        self.figures_dir = Path(figures_dir)
        self.figures_dir.mkdir(parents=True, exist_ok=True)

        self.model = joblib.load(self.model_path)
        with open(self.metadata_path, "r") as f:
            self.metadata = json.load(f)

    def evaluate_test_predictions(
        self,
        test_pred_path: str = "data/processed/test_predictions.csv"
    ) -> Dict[str, Any]:
        """
        Loads test predictions and creates all evaluation figures and diagnostic metrics.
        """
        df = pd.read_csv(test_pred_path)
        y_true = df["y_true"]
        y_pred = df["y_pred"]
        residuals = y_true - y_pred

        # Convert to metric tonnes/ha for intuitive agronomic interpretation
        y_true_tha = y_true / 10000.0
        y_pred_tha = y_pred / 10000.0
        residuals_tha = residuals / 10000.0

        # 1. Actual vs Predicted Plot
        fig, ax = plt.subplots(figsize=(8, 6))
        ax.scatter(y_true_tha, y_pred_tha, alpha=0.35, color="#166534", edgecolors="none", s=25)
        min_val = min(y_true_tha.min(), y_pred_tha.min())
        max_val = max(y_true_tha.max(), y_pred_tha.max())
        ax.plot([min_val, max_val], [min_val, max_val], color="#dc2626", linestyle="--", linewidth=2, label="1:1 Perfect Prediction Line")
        r2 = self.metadata["metrics"]["test_r2"]
        rmse = self.metadata["metrics"]["test_rmse"] / 10000.0
        ax.set_title(f"Actual vs Predicted Yield ({self.metadata['champion_model_name']})\nR² = {r2:.4f} | RMSE = {rmse:.2f} t/ha", fontsize=12, fontweight="bold")
        ax.set_xlabel("Actual Harvested Yield (t/ha)")
        ax.set_ylabel("Model Predicted Yield (t/ha)")
        ax.legend(loc="upper left")
        fig.tight_layout()
        fig.savefig(self.figures_dir / "eval_actual_vs_pred.png", dpi=300)
        plt.close(fig)

        # 2. Residual Distribution Plot
        fig, ax = plt.subplots(figsize=(8, 5))
        sns.histplot(residuals_tha, bins=45, kde=True, color="#0284c7", ax=ax)
        mean_res = float(np.mean(residuals_tha))
        std_res = float(np.std(residuals_tha))
        ax.axvline(0, color="red", linestyle="--", linewidth=1.5, label=f"Zero Error Baseline (Mean: {mean_res:.3f} t/ha)")
        ax.set_title("Residual Distribution (Error Analysis)", fontsize=12, fontweight="bold")
        ax.set_xlabel("Prediction Error / Residual (t/ha)")
        ax.set_ylabel("Observation Frequency")
        ax.legend()
        fig.tight_layout()
        fig.savefig(self.figures_dir / "eval_residual_dist.png", dpi=300)
        plt.close(fig)

        # 3. Residual vs Predicted Plot (Homoscedasticity)
        fig, ax = plt.subplots(figsize=(8, 5))
        ax.scatter(y_pred_tha, residuals_tha, alpha=0.35, color="#7c3aed", edgecolors="none", s=25)
        ax.axhline(0, color="#dc2626", linestyle="--", linewidth=1.5)
        ax.set_title("Residuals vs Predicted Values (Homoscedasticity Check)", fontsize=12, fontweight="bold")
        ax.set_xlabel("Fitted / Predicted Yield (t/ha)")
        ax.set_ylabel("Residual (Actual - Predicted, t/ha)")
        fig.tight_layout()
        fig.savefig(self.figures_dir / "eval_residual_vs_pred.png", dpi=300)
        plt.close(fig)

        # 4. Feature Importance Plot
        # Extract regressor and feature names
        regressor = self.model.named_steps["regressor"]
        preprocessor = self.model.named_steps["preprocessor"]

        importances = None
        if hasattr(regressor, "feature_importances_"):
            importances = regressor.feature_importances_
        elif hasattr(regressor, "coef_"):
            importances = np.abs(regressor.coef_)

        feat_imp_records = []
        if importances is not None:
            # Extract transformed feature names
            cat_names = preprocessor.named_steps["encoder_scaler"].named_transformers_["cat"].get_feature_names_out()
            num_names = preprocessor.named_steps["encoder_scaler"].named_transformers_["num"].get_feature_names_out()
            all_feat_names = list(num_names) + list(cat_names)
            
            # Map clean names
            clean_feat_names = []
            for n in all_feat_names:
                clean_name = n.replace("cat__Item_", "Crop: ").replace("cat__Area_", "Region: ")
                clean_name = clean_name.replace("num__", "").replace("cat__rainfall_category_", "Rain Category: ")
                clean_feat_names.append(clean_name)

            imp_series = pd.Series(importances[:len(clean_feat_names)], index=clean_feat_names[:len(importances)]).sort_values(ascending=False)
            top_feats = imp_series.head(15)

            fig, ax = plt.subplots(figsize=(10, 6))
            sns.barplot(x=top_feats.values, y=top_feats.index, palette="Greens_r", ax=ax)
            ax.set_title("Top 15 Most Predictive Agricultural Features", fontsize=12, fontweight="bold")
            ax.set_xlabel("Relative Feature Importance (MDI / Gini Reduction)")
            ax.set_ylabel("Agricultural Covariate")
            fig.tight_layout()
            fig.savefig(self.figures_dir / "eval_feature_importance.png", dpi=300)
            plt.close(fig)

            feat_imp_records = top_feats.reset_index().rename(columns={"index": "feature", 0: "importance"}).to_dict(orient="records")

        # 5. Model Comparison Chart
        comp_df = pd.DataFrame(self.metadata["all_models_ranked"])
        fig, ax1 = plt.subplots(figsize=(9, 5))
        sns.barplot(data=comp_df, x="Model", y="Test R2", palette="viridis", ax=ax1)
        ax1.set_ylim(0, 1.05)
        ax1.set_title("Multi-Architecture Cross-Validation Performance Comparison", fontsize=12, fontweight="bold")
        ax1.set_ylabel("Test R² Score (Variance Explained)")
        ax1.set_xlabel("Model Architecture")
        for p in ax1.patches:
            height = p.get_height()
            ax1.annotate(f"{height:.3f}", (p.get_x() + p.get_width() / 2., height / 2),
                         ha='center', va='center', xytext=(0, 0), textcoords='offset points', color='white', fontweight='bold')
        fig.tight_layout()
        fig.savefig(self.figures_dir / "eval_model_comparison.png", dpi=300)
        plt.close(fig)

        # Residual statistical diagnostics
        skewness = float(stats.skew(residuals))
        kurt = float(stats.kurtosis(residuals))

        report = {
            "model_evaluated": self.metadata["champion_model_name"],
            "test_r2": self.metadata["metrics"]["test_r2"],
            "test_mae_hg_ha": self.metadata["metrics"]["test_mae"],
            "test_mae_t_ha": round(self.metadata["metrics"]["test_mae"] / 10000.0, 3),
            "test_rmse_hg_ha": self.metadata["metrics"]["test_rmse"],
            "test_rmse_t_ha": round(self.metadata["metrics"]["test_rmse"] / 10000.0, 3),
            "residual_mean_tha": round(mean_res, 4),
            "residual_std_tha": round(std_res, 4),
            "residual_skewness": round(skewness, 3),
            "residual_kurtosis": round(kurt, 3),
            "top_features": feat_imp_records,
            "limitations_and_error_sources": [
                "Macro-level regional rainfall averages do not capture localized field microclimates or drip irrigation scheduling.",
                "Pesticide figures represent gross national active ingredients rather than parcel-specific application timing.",
                "Extreme weather shock events (e.g. unseasonal hailstorms, sudden late heatwaves) are unmeasured in seasonal means.",
                "Soil physicochemical characteristics (organic carbon, soil texture) vary sub-regionally and further explain local yield variance."
            ]
        }

        with open("reports/evaluation_report.json", "w") as f:
            json.dump(report, f, indent=4)

        return report


if __name__ == "__main__":
    evaluator = ModelEvaluator()
    report = evaluator.evaluate_test_predictions()
    print("=== Model Evaluation Complete ===")
    print(f"Model: {report['model_evaluated']}")
    print(f"Test R²: {report['test_r2']:.4f}")
    print(f"Test RMSE: {report['test_rmse_t_ha']} t/ha")
    print(f"Residual Skewness: {report['residual_skewness']} | Kurtosis: {report['residual_kurtosis']}")
    print("Evaluation report saved to reports/evaluation_report.json")
