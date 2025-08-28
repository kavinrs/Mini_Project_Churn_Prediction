import joblib
import pandas as pd
import numpy as np
import shap
import os

# ✅ Exact training features (18)
RAW_FEATURES = [
    "Tenure",
    "PreferredLoginDevice",
    "CityTier",
    "WarehouseToHome",
    "PreferredPaymentMode",
    "Gender",
    "HourSpendOnApp",
    "NumberOfDeviceRegistered",
    "PreferedOrderCat",
    "SatisfactionScore",
    "MaritalStatus",
    "NumberOfAddress",
    "Complain",
    "OrderAmountHikeFromlastYear",
    "CouponUsed",
    "OrderCount",
    "DaySinceLastOrder",
    "CashbackAmount"
]

# Load your trained pipeline (RandomForest + ColumnTransformer)
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'Model', 'Ecommerce_Churn_Prediction_model.pkl')
model = joblib.load(MODEL_PATH)


def preprocess_input(data: dict) -> pd.DataFrame:
    """Convert input dict into DataFrame with proper columns & types"""
    df = pd.DataFrame([data], columns=RAW_FEATURES)

    # Ensure categorical values stay as strings
    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = df[col].astype(str)

    return df


def predict_with_explainability(data: dict):
    """Make prediction + explainability with SHAP"""
    input_df = preprocess_input(data)

    # Prediction
    prediction = model.predict(input_df)[0]
    probability = model.predict_proba(input_df)[0][1]  # churn probability

    # Explainability with SHAP
    explainer = shap.TreeExplainer(model.named_steps["classifier"])
    transformed = model.named_steps["preprocessor"].transform(input_df)
    shap_values = explainer.shap_values(transformed)

    # ✅ Only take SHAP values for churn class (class 1) and flatten to 1D
    if isinstance(shap_values, list):
        shap_vals = shap_values[1][0].flatten()
    else:
        shap_vals = shap_values[0].flatten()

    # Feature importance dict (absolute values = magnitude of impact)
    importance = dict(zip(RAW_FEATURES, np.abs(shap_vals).tolist()))

    return {
        "prediction": int(prediction),
        "churn_probability": float(probability),
        "feature_importance": importance
    }
