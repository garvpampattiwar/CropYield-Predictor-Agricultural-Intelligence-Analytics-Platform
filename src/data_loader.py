"""
CropYield Predictor — Data Loader Module
Handles discovery, schema detection, ingestion, and data dictionary generation
for agricultural crop yield datasets.
"""

import os
import glob
from pathlib import Path
from typing import Optional, Dict, Tuple, Any
import pandas as pd
import numpy as np


class DataLoader:
    """
    Robust data ingestion engine that auto-detects agricultural datasets,
    infers schemas, validates types, and builds a comprehensive data dictionary.
    """

    KNOWN_TARGET_COLUMNS = [
        "hg/ha_yield", "yield", "yield_hg_ha", "yield_t_ha", "crop_yield", "Production"
    ]

    SCHEMA_MAPPINGS = {
        "area": ["Area", "area", "State", "state", "Country", "country", "Region", "region"],
        "crop": ["Item", "item", "Crop", "crop", "Crop_Type", "crop_type"],
        "year": ["Year", "year", "Crop_Year", "crop_year"],
        "rainfall": ["average_rain_fall_mm_per_year", "rainfall", "Rainfall", "annual_rainfall"],
        "pesticides": ["pesticides_tonnes", "pesticides", "Pesticides", "pesticide_tonnes"],
        "temperature": ["avg_temp", "temperature", "Temperature", "temp_celsius"],
        "humidity": ["humidity", "Humidity", "relative_humidity"],
        "nitrogen": ["N", "Nitrogen", "nitrogen"],
        "phosphorus": ["P", "Phosphorus", "phosphorus"],
        "potassium": ["K", "Potassium", "potassium"],
        "soil_ph": ["ph", "pH", "Soil_pH"],
        "season": ["Season", "season"],
    }

    def __init__(self, raw_dir: str = "data/raw"):
        self.raw_dir = Path(raw_dir)
        self.raw_dir.mkdir(parents=True, exist_ok=True)

    def find_raw_dataset(self) -> Path:
        """
        Locates the primary raw dataset in the data/raw directory.
        Prioritizes yield_df.csv (primary Kaggle dataset) or any valid CSV.
        """
        preferred = self.raw_dir / "yield_df.csv"
        if preferred.exists() and preferred.stat().st_size > 0:
            return preferred

        csv_files = list(self.raw_dir.glob("*.csv"))
        if csv_files:
            # Sort by file size descending
            csv_files.sort(key=lambda p: p.stat().st_size, reverse=True)
            return csv_files[0]

        error_msg = (
            f"No agricultural dataset found in {self.raw_dir.resolve()}.\n"
            "Please download the dataset from Kaggle:\n"
            "https://www.kaggle.com/datasets/patelris/crop-yield-prediction-dataset\n"
            f"and place 'yield_df.csv' into: {self.raw_dir.resolve()}"
        )
        raise FileNotFoundError(error_msg)

    def detect_schema(self, df: pd.DataFrame) -> Dict[str, Optional[str]]:
        """
        Maps raw dataset columns to standard conceptual agricultural features.
        """
        schema_map = {}
        cols_lower = {col.lower(): col for col in df.columns}

        # Find target column
        target_col = None
        for cand in self.KNOWN_TARGET_COLUMNS:
            for col in df.columns:
                if cand.lower() == col.lower() or cand.lower() in col.lower():
                    target_col = col
                    break
            if target_col:
                break
        schema_map["target"] = target_col

        # Find predictor columns
        for concept, aliases in self.SCHEMA_MAPPINGS.items():
            matched = None
            for alias in aliases:
                for col in df.columns:
                    if alias.lower() == col.lower():
                        matched = col
                        break
                if matched:
                    break
            schema_map[concept] = matched

        return schema_map

    def load_data(self, filepath: Optional[str] = None) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Loads CSV dataset, removes stray index columns, enforces numeric conversions,
        and returns the dataframe along with schema metadata.
        """
        if filepath is None:
            dataset_path = self.find_raw_dataset()
        else:
            dataset_path = Path(filepath)

        if not dataset_path.exists():
            raise FileNotFoundError(f"Dataset path {dataset_path} does not exist.")

        df = pd.read_csv(dataset_path)

        # Drop unnamed index columns
        unnamed_cols = [c for c in df.columns if "unnamed" in c.lower()]
        if unnamed_cols:
            df = df.drop(columns=unnamed_cols)

        # Clean string numbers if rainfall was loaded as object
        for col in df.columns:
            if df[col].dtype == object:
                # Check if it is a numeric column with spaces or quotes
                sample_clean = df[col].dropna().astype(str).str.strip()
                if sample_clean.str.replace(".", "", regex=False).str.isdigit().mean() > 0.95:
                    df[col] = pd.to_numeric(sample_clean, errors="coerce")

        schema_info = self.detect_schema(df)

        metadata = {
            "source_path": str(dataset_path.resolve()),
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "columns": list(df.columns),
            "schema_mapping": schema_info,
            "target_column": schema_info.get("target"),
            "memory_usage_mb": round(df.memory_usage(deep=True).sum() / (1024 * 1024), 2)
        }

        return df, metadata

    def generate_data_dictionary(self, df: pd.DataFrame, output_path: str = "reports/data_dictionary.csv") -> pd.DataFrame:
        """
        Creates and exports a comprehensive data dictionary for the dataset.
        """
        dictionary_records = []
        schema_info = self.detect_schema(df)
        inverted_schema = {v: k for k, v in schema_info.items() if v is not None}

        col_descriptions = {
            "Area": "Geographic territory, country, or administrative state where crops were harvested",
            "Item": "Agricultural commodity or crop type (e.g. Maize, Potatoes, Wheat, Rice)",
            "Year": "Harvest calendar year for the observed agricultural season",
            "hg/ha_yield": "Crop yield measured in hectograms per hectare (1 hg = 100g, 10,000 hg/ha = 1 metric ton/ha)",
            "average_rain_fall_mm_per_year": "Annual cumulative precipitation in millimeters (mm)",
            "pesticides_tonnes": "Total quantity of formulated pesticide active ingredients applied in metric tonnes",
            "avg_temp": "Mean ambient air temperature recorded over the crop vegetative cycle in degrees Celsius (°C)",
            "Season": "Agricultural cultivation season (e.g., Kharif, Rabi, Zaid, Whole Year)",
            "N": "Soil Nitrogen content (ratio or kg/ha), crucial for vegetative leafy growth and chlorophyll",
            "P": "Soil Phosphorus content (ratio or kg/ha), essential for root establishment and flowering",
            "K": "Soil Potassium content (ratio or kg/ha), vital for disease resistance and osmoregulation",
            "pH": "Soil acidity/alkalinity scale (0-14), governing nutrient bioavailability"
        }

        col_units = {
            "Area": "Categorical (ISO/Name)",
            "Item": "Categorical (Crop Name)",
            "Year": "Years (AD)",
            "hg/ha_yield": "hg/ha (10,000 hg/ha = 1 t/ha)",
            "average_rain_fall_mm_per_year": "mm / year",
            "pesticides_tonnes": "Metric Tonnes",
            "avg_temp": "Degrees Celsius (°C)",
            "Season": "Categorical",
            "N": "kg/ha or index",
            "P": "kg/ha or index",
            "K": "kg/ha or index",
            "pH": "pH units (0-14)"
        }

        for col in df.columns:
            dtype = str(df[col].dtype)
            null_count = int(df[col].isnull().sum())
            null_pct = round(null_count / len(df) * 100, 2)
            n_unique = int(df[col].nunique())
            
            sample_vals = df[col].dropna().unique()
            if len(sample_vals) > 3:
                sample_str = ", ".join(map(str, sample_vals[:3])) + "..."
            else:
                sample_str = ", ".join(map(str, sample_vals))

            concept = inverted_schema.get(col, "feature")
            desc = col_descriptions.get(col, f"Agricultural feature measuring {col.replace('_', ' ')}")
            unit = col_units.get(col, "Numeric / Dimensionless" if "int" in dtype or "float" in dtype else "Categorical")

            dictionary_records.append({
                "Column Name": col,
                "Standard Concept": concept,
                "Data Type": dtype,
                "Non-Null Count": len(df) - null_count,
                "Null Count": null_count,
                "Null Percentage (%)": null_pct,
                "Unique Values": n_unique,
                "Sample Values": sample_str,
                "Unit / Metric": unit,
                "Description": desc
            })

        dict_df = pd.DataFrame(dictionary_records)
        out_p = Path(output_path)
        out_p.parent.mkdir(parents=True, exist_ok=True)
        dict_df.to_csv(out_p, index=False)
        return dict_df


if __name__ == "__main__":
    loader = DataLoader()
    df, meta = loader.load_data()
    print("=== Data Ingestion Report ===")
    print(f"Source: {meta['source_path']}")
    print(f"Records: {meta['total_rows']:,} rows, {meta['total_columns']} columns")
    print(f"Target Column: {meta['target_column']}")
    print("Schema Mapping:", meta['schema_mapping'])
    
    dict_df = loader.generate_data_dictionary(df)
    print("\nData Dictionary saved to reports/data_dictionary.csv")
    print(dict_df[["Column Name", "Standard Concept", "Data Type", "Null Count", "Unit / Metric"]])
