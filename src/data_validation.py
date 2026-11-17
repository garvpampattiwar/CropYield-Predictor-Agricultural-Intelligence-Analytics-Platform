"""
CropYield Predictor — Data Validation & Cleaning Module
Performs comprehensive data auditing, missing value treatment, duplicate removal,
IQR outlier diagnostics, physical range validation, and exports clean datasets.
"""

import json
from pathlib import Path
from typing import Dict, Any, Tuple, List
import pandas as pd
import numpy as np


class DataValidator:
    """
    Validates, audits, and cleans agricultural datasets according to domain standards.
    """

    PHYSICAL_RANGES = {
        "Year": (1900, 2030),
        "hg/ha_yield": (1.0, 1000000.0),  # Up to 100 t/ha (tubers/potatoes can reach ~50-60 t/ha = 500,000-600,000 hg/ha)
        "average_rain_fall_mm_per_year": (0.0, 12000.0), # Cherrapunji / Mawsynram world peak ~11,872 mm
        "pesticides_tonnes": (0.0, 1000000.0),
        "avg_temp": (-15.0, 55.0),
        "N": (0.0, 500.0),
        "P": (0.0, 300.0),
        "K": (0.0, 500.0),
        "pH": (3.0, 10.0),
        "humidity": (0.0, 100.0)
    }

    def __init__(self, processed_dir: str = "data/processed"):
        self.processed_dir = Path(processed_dir)
        self.processed_dir.mkdir(parents=True, exist_ok=True)
        self.audit_report: Dict[str, Any] = {}

    def audit_dataset(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Runs full diagnostic inspection without mutating the dataset.
        """
        initial_rows = len(df)
        initial_cols = len(df.columns)

        # Duplicate check
        duplicate_count = int(df.duplicated().sum())

        # Missing values check
        missing_dict = {col: int(df[col].isnull().sum()) for col in df.columns}
        total_missing = sum(missing_dict.values())

        # Categorical vs Numerical identification
        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()

        # Outlier diagnostics using IQR
        outlier_summary = {}
        for col in num_cols:
            series = df[col].dropna()
            q25 = float(series.quantile(0.25))
            q75 = float(series.quantile(0.75))
            iqr = q75 - q25
            lower_bound = q25 - 1.5 * iqr
            upper_bound = q75 + 1.5 * iqr
            outlier_mask = (series < lower_bound) | (series > upper_bound)
            outlier_count = int(outlier_mask.sum())
            outlier_summary[col] = {
                "q25": round(q25, 2),
                "q75": round(q75, 2),
                "iqr": round(iqr, 2),
                "lower_bound": round(lower_bound, 2),
                "upper_bound": round(upper_bound, 2),
                "outlier_count": outlier_count,
                "outlier_pct": round(outlier_count / len(series) * 100, 2)
            }

        # Range violation check
        range_violations = {}
        for col, (min_val, max_val) in self.PHYSICAL_RANGES.items():
            if col in df.columns:
                series = df[col].dropna()
                below = int((series < min_val).sum())
                above = int((series > max_val).sum())
                if below > 0 or above > 0:
                    range_violations[col] = {
                        "allowed_range": [min_val, max_val],
                        "violations_below": below,
                        "violations_above": above
                    }

        report = {
            "initial_shape": (initial_rows, initial_cols),
            "duplicate_records": duplicate_count,
            "total_missing_cells": total_missing,
            "missing_per_column": missing_dict,
            "numerical_columns": num_cols,
            "categorical_columns": cat_cols,
            "outliers_iqr": outlier_summary,
            "range_violations": range_violations
        }
        self.audit_report = report
        return report

    def clean_dataset(self, df: pd.DataFrame, drop_duplicates: bool = True) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Cleans the dataset:
        - Removes exact duplicates
        - Handles missing values
        - Enforces data types
        - Validates physical domain ranges
        """
        audit_pre = self.audit_dataset(df)
        cleaned = df.copy()

        # 1. Drop duplicates
        initial_count = len(cleaned)
        if drop_duplicates:
            cleaned = cleaned.drop_duplicates().reset_index(drop=True)
        dropped_dups = initial_count - len(cleaned)

        # 2. Enforce data types & handle missing values
        for col in cleaned.select_dtypes(include=[np.number]).columns:
            if cleaned[col].isnull().sum() > 0:
                # Target column missing -> drop; Feature missing -> impute with median
                if col in ["hg/ha_yield", "yield"]:
                    cleaned = cleaned.dropna(subset=[col])
                else:
                    median_val = cleaned[col].median()
                    cleaned[col] = cleaned[col].fillna(median_val)

        for col in cleaned.select_dtypes(include=["object"]).columns:
            cleaned[col] = cleaned[col].astype(str).str.strip()
            if cleaned[col].isnull().sum() > 0:
                cleaned[col] = cleaned[col].fillna("Unknown")

        # 3. Domain Range Checks (preserve valid agricultural extremes like high potato yields)
        for col, (min_val, max_val) in self.PHYSICAL_RANGES.items():
            if col in cleaned.columns:
                cleaned = cleaned[(cleaned[col] >= min_val) & (cleaned[col] <= max_val)]

        final_rows = len(cleaned)
        summary = {
            "initial_rows": initial_count,
            "final_rows": final_rows,
            "duplicates_removed": dropped_dups,
            "retained_percentage": round(final_rows / initial_count * 100, 2),
            "numerical_columns": cleaned.select_dtypes(include=[np.number]).columns.tolist(),
            "categorical_columns": cleaned.select_dtypes(include=["object"]).columns.tolist()
        }
        return cleaned, summary

    def validate_and_export(
        self,
        df: pd.DataFrame,
        output_path: str = "data/processed/clean_crop_yield.csv",
        report_path: str = "reports/validation_summary.json"
    ) -> pd.DataFrame:
        """
        Executes audit, cleaning, saves clean CSV, and writes validation report.
        """
        cleaned_df, clean_summary = self.clean_dataset(df)
        
        # Export clean CSV
        out_file = Path(output_path)
        out_file.parent.mkdir(parents=True, exist_ok=True)
        cleaned_df.to_csv(out_file, index=False)

        # Export audit report
        combined_report = {
            "pre_cleaning_audit": self.audit_report,
            "cleaning_summary": clean_summary
        }
        rep_file = Path(report_path)
        rep_file.parent.mkdir(parents=True, exist_ok=True)
        with open(rep_file, "w") as f:
            json.dump(combined_report, f, indent=4)

        return cleaned_df


if __name__ == "__main__":
    from src.data_loader import DataLoader
    loader = DataLoader()
    raw_df, meta = loader.load_data()
    validator = DataValidator()
    clean_df = validator.validate_and_export(raw_df)
    print("=== Data Validation & Cleaning Complete ===")
    print(f"Original shape: {raw_df.shape} -> Clean shape: {clean_df.shape}")
    print(f"Exported to: data/processed/clean_crop_yield.csv")
    print(f"Validation report saved to: reports/validation_summary.json")
