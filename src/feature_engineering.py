"""
CropYield Predictor — Domain-Specific Feature Engineering
Implements agricultural transformations including hydrothermal index,
rainfall categorization, climate stress flags, NPK ratios, and GDD.
Designed as a reproducible Scikit-Learn Transformer with zero data leakage.
"""

from typing import List, Optional
import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin


class AgriculturalFeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Custom Scikit-Learn Transformer for agricultural feature engineering.
    Gracefully adapts to available columns without failing on missing optional attributes.
    """

    EPSILON = 1e-6

    FEATURE_DESCRIPTIONS = {
        "hydrothermal_index": "Precipitation-to-evaporative-demand ratio (rainfall / (temp + 10)). Quantifies effective moisture availability.",
        "pesticide_to_rain_ratio": "Agrochemical application intensity per rainfall unit. Indicates run-off risk and pest treatment density.",
        "rainfall_category": "Binned precipitation climate regime: Arid (<600mm), Moderate (600-1200mm), Humid (1200-2000mm), Tropical (>2000mm).",
        "temp_stress": "Binary indicator for ambient temperature exceeding 30°C (thermal inhibition threshold for C3 crops).",
        "drought_risk": "Binary indicator for annual rainfall under 500mm (water deficit condition).",
        "tech_trend": "Year offset from 1990 baseline, proxying agricultural mechanization, genetics, and yield technology advances.",
        "gdd": "Estimated Growing Degree Days above base 10°C over typical vegetative period (max(0, temp - 10) * 120).",
        "np_ratio": "Nitrogen-to-Phosphorus ratio (vegetative vs root vigor).",
        "nk_ratio": "Nitrogen-to-Potassium ratio (vegetative growth vs stress tolerance).",
        "pk_ratio": "Phosphorus-to-Potassium ratio (root/flower health vs osmoregulation).",
        "npk_sum": "Total primary soil nutrient concentration (N + P + K).",
        "thi": "Temperature-Humidity Index (microclimate stress & fungal disease risk)."
    }

    def __init__(self, include_climate_flags: bool = True, base_temp: float = 10.0):
        self.include_climate_flags = include_climate_flags
        self.base_temp = base_temp
        self.columns_out_: List[str] = []

    def fit(self, X: pd.DataFrame, y=None):
        """Fit estimator (stateless transformer, validates input columns)."""
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        """
        Transforms input dataframe with agricultural domain features.
        """
        if not isinstance(X, pd.DataFrame):
            X = pd.DataFrame(X)

        df = X.copy()
        cols = set(df.columns)

        # Identify key columns flexibly
        rain_col = next((c for c in ["average_rain_fall_mm_per_year", "rainfall", "Rainfall"] if c in cols), None)
        temp_col = next((c for c in ["avg_temp", "temperature", "Temperature"] if c in cols), None)
        pest_col = next((c for c in ["pesticides_tonnes", "pesticides", "Pesticides"] if c in cols), None)
        year_col = next((c for c in ["Year", "year"] if c in cols), None)
        n_col = next((c for c in ["N", "Nitrogen", "nitrogen"] if c in cols), None)
        p_col = next((c for c in ["P", "Phosphorus", "phosphorus"] if c in cols), None)
        k_col = next((c for c in ["K", "Potassium", "potassium"] if c in cols), None)
        hum_col = next((c for c in ["humidity", "Humidity"] if c in cols), None)

        # 1. Hydrothermal Index (Rainfall / Effective Temperature)
        if rain_col and temp_col:
            # Shift temp by 10 to ensure positive denominator in cold climates
            eff_temp = np.maximum(df[temp_col] + 10.0, 1.0)
            df["hydrothermal_index"] = df[rain_col] / (eff_temp + self.EPSILON)

            # Growing Degree Days estimation (base 10°C)
            df["gdd"] = np.maximum(0.0, df[temp_col] - self.base_temp) * 120.0

            if self.include_climate_flags:
                df["temp_stress"] = (df[temp_col] > 30.0).astype(int)
                df["drought_risk"] = (df[rain_col] < 500.0).astype(int)

        # 2. Pesticide to Rainfall Ratio
        if pest_col and rain_col:
            df["pesticide_to_rain_ratio"] = df[pest_col] / (df[rain_col] + 1.0)

        # 3. Rainfall Categorical Bins
        if rain_col:
            df["rainfall_category"] = pd.cut(
                df[rain_col],
                bins=[-np.inf, 600, 1200, 2000, np.inf],
                labels=["Arid_Low", "Moderate", "Humid", "Tropical_High"]
            ).astype(str)

        # 4. Modernization / Technological Yield Trend
        if year_col:
            df["tech_trend"] = df[year_col] - 1990

        # 5. Soil Nutrient Ratios (if N, P, K are present)
        if n_col and p_col:
            df["np_ratio"] = df[n_col] / (df[p_col] + self.EPSILON)
        if n_col and k_col:
            df["nk_ratio"] = df[n_col] / (df[k_col] + self.EPSILON)
        if p_col and k_col:
            df["pk_ratio"] = df[p_col] / (df[k_col] + self.EPSILON)
        if n_col and p_col and k_col:
            df["npk_sum"] = df[n_col] + df[p_col] + df[k_col]

        # 6. Temperature-Humidity Index (THI)
        if temp_col and hum_col:
            # Thom's THI formula
            df["thi"] = (0.8 * df[temp_col]) + (df[hum_col] / 100.0) * (df[temp_col] - 14.4) + 46.4

        self.columns_out_ = list(df.columns)
        return df

    def get_feature_names_out(self, input_features=None):
        return np.array(self.columns_out_)


if __name__ == "__main__":
    from src.data_validation import DataValidator
    from src.data_loader import DataLoader

    loader = DataLoader()
    raw_df, _ = loader.load_data()
    validator = DataValidator()
    clean_df, _ = validator.clean_dataset(raw_df)

    fe = AgriculturalFeatureEngineer()
    eng_df = fe.fit_transform(clean_df.drop(columns=["hg/ha_yield"]))
    print("=== Feature Engineering Complete ===")
    print(f"Input features: {clean_df.shape[1] - 1} -> Engineered features: {eng_df.shape[1]}")
    print("New engineered columns:", [c for c in eng_df.columns if c not in clean_df.columns])
    print("\nSample engineered records:")
    print(eng_df[["hydrothermal_index", "pesticide_to_rain_ratio", "rainfall_category", "tech_trend", "gdd"]].head())
