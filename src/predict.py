"""
CropYield Predictor — Real-Time Inference Module
Loads serialized champion pipeline and metadata, validates inputs,
and delivers reliable predictions with agronomic unit conversions.
"""

import sys
import json
import argparse
from pathlib import Path
from typing import Dict, Any, Union, List
import pandas as pd
import numpy as np
import joblib


class CropYieldPredictor:
    """
    Production-grade inference interface for agricultural yield prediction.
    """

    def __init__(
        self,
        model_path: str = "models/best_model.joblib",
        metadata_path: str = "models/model_metadata.json"
    ):
        self.model_path = Path(model_path)
        self.metadata_path = Path(metadata_path)

        if not self.model_path.exists():
            raise FileNotFoundError(f"Model artifact not found at {self.model_path}. Please run train.py first.")
        
        self.pipeline = joblib.load(self.model_path)

        if self.metadata_path.exists():
            with open(self.metadata_path, "r") as f:
                self.metadata = json.load(f)
        else:
            self.metadata = {}

        self.rmse_t_ha = self.metadata.get("metrics", {}).get("test_rmse", 12000.0) / 10000.0

    def validate_inputs(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validates agricultural inputs against realistic physical constraints."""
        val_data = data.copy()

        # Enforce numeric types
        year = int(val_data.get("Year", 2024))
        if not (1900 <= year <= 2050):
            raise ValueError(f"Year {year} is out of realistic agricultural forecast bounds (1900-2050).")

        rain = float(val_data.get("average_rain_fall_mm_per_year", 1000.0))
        if not (0.0 <= rain <= 12000.0):
            raise ValueError(f"Rainfall {rain} mm is out of global terrestrial bounds (0-12000 mm).")

        temp = float(val_data.get("avg_temp", 22.0))
        if not (-15.0 <= temp <= 55.0):
            raise ValueError(f"Temperature {temp}°C is out of vegetative crop physiological bounds (-15°C to 55°C).")

        pesticides = float(val_data.get("pesticides_tonnes", 1000.0))
        if pesticides < 0:
            raise ValueError(f"Pesticides quantity cannot be negative ({pesticides}).")

        crop = str(val_data.get("Item", "Wheat")).strip()
        area = str(val_data.get("Area", "India")).strip()

        return {
            "Area": area,
            "Item": crop,
            "Year": year,
            "average_rain_fall_mm_per_year": rain,
            "pesticides_tonnes": pesticides,
            "avg_temp": temp
        }

    def predict(self, input_features: Union[Dict[str, Any], pd.DataFrame]) -> Dict[str, Any]:
        """
        Generates crop yield prediction with uncertainty bounds.
        """
        if isinstance(input_features, dict):
            validated_dict = self.validate_inputs(input_features)
            df_in = pd.DataFrame([validated_dict])
        elif isinstance(input_features, pd.DataFrame):
            df_in = input_features.copy()
        else:
            raise TypeError("input_features must be a dictionary or pandas DataFrame")

        raw_pred_hg_ha = float(self.pipeline.predict(df_in)[0])
        raw_pred_hg_ha = max(100.0, raw_pred_hg_ha)  # crop yield floor
        pred_t_ha = raw_pred_hg_ha / 10000.0

        # Confidence interval approximation (95% prediction interval ~ 1.96 * RMSE)
        lower_bound_tha = max(0.1, round(pred_t_ha - 1.96 * self.rmse_t_ha, 2))
        upper_bound_tha = round(pred_t_ha + 1.96 * self.rmse_t_ha, 2)

        return {
            "status": "success",
            "model_used": self.metadata.get("champion_model_name", "Random Forest Regressor"),
            "predicted_yield_hg_ha": round(raw_pred_hg_ha, 2),
            "predicted_yield_t_ha": round(pred_t_ha, 2),
            "predicted_yield_kg_ha": round(raw_pred_hg_ha * 0.1, 2),
            "confidence_interval_95_t_ha": [lower_bound_tha, upper_bound_tha],
            "units": {
                "hg_ha": "hectograms per hectare",
                "t_ha": "metric tonnes per hectare",
                "kg_ha": "kilograms per hectare"
            },
            "input_parameters": df_in.iloc[0].to_dict()
        }


def main():
    parser = argparse.ArgumentParser(description="CropYield Predictor CLI Inference Tool")
    parser.add_argument("--crop", type=str, default="Wheat", help="Crop type (e.g., Wheat, Maize, Potatoes, Rice, paddy)")
    parser.add_argument("--area", type=str, default="India", help="Country or geographical region")
    parser.add_argument("--year", type=int, default=2024, help="Harvest year")
    parser.add_argument("--rain", type=float, default=950.0, help="Annual rainfall in mm")
    parser.add_argument("--temp", type=float, default=24.5, help="Average temperature in Celsius")
    parser.add_argument("--pesticides", type=float, default=15000.0, help="Pesticides applied in metric tonnes")

    args = parser.parse_args()
    predictor = CropYieldPredictor()
    result = predictor.predict({
        "Area": args.area,
        "Item": args.crop,
        "Year": args.year,
        "average_rain_fall_mm_per_year": args.rain,
        "pesticides_tonnes": args.pesticides,
        "avg_temp": args.temp
    })

    print("\n=== Agricultural Yield Prediction Result ===")
    print(f"Crop: {result['input_parameters']['Item']} | Region: {result['input_parameters']['Area']} ({result['input_parameters']['Year']})")
    print(f"Predicted Yield: {result['predicted_yield_t_ha']} t/ha ({result['predicted_yield_hg_ha']:,} hg/ha)")
    print(f"95% Prediction Interval: [{result['confidence_interval_95_t_ha'][0]} - {result['confidence_interval_95_t_ha'][1]}] t/ha")
    print(f"Model: {result['model_used']}")


if __name__ == "__main__":
    main()

