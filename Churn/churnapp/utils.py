import joblib
import pandas as pd
import numpy as np
import shap
import os

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

# Load trained pipeline (RandomForest + ColumnTransformer)
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'Model', 'Ecommerce_Churn_Prediction_model_output.pkl')
model = joblib.load(MODEL_PATH)

# ✅ Custom threshold (find using F1/ROC optimization)
CUSTOM_THRESHOLD = 0.32   # <-- adjust after evaluating on test set

def preprocess_input(data: dict) -> pd.DataFrame:
    """Convert input dict into DataFrame with proper columns & types"""
    df = pd.DataFrame([data], columns=RAW_FEATURES)

    # Ensure all expected columns are present
    for col in RAW_FEATURES:
        if col not in df.columns:
            df[col] = np.nan  # Fill missing with NaN

    # Ensure categorical values stay as strings
    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = df[col].astype(str)

    return df

def calculate_customer_value(data: dict) -> dict:
    """
    Calculate customer value based on revenue and usage patterns
    
    Args:
        data: Customer data dictionary
    
    Returns:
        Dictionary containing value metrics and classification
    """
    try:
        # Extract relevant value indicators
        order_count = float(data.get('OrderCount', 0))
        cashback_amount = float(data.get('CashbackAmount', 0))
        order_hike = float(data.get('OrderAmountHikeFromlastYear', 0))
        tenure = float(data.get('Tenure', 0))
        coupon_used = float(data.get('CouponUsed', 0))
        
        # Calculate composite value score
        # Higher order count, cashback, and tenure indicate higher value
        value_score = (
            (order_count * 0.3) +           # Order frequency weight
            (cashback_amount * 0.002) +     # Revenue indicator weight  
            (order_hike * 0.01) +           # Growth indicator weight
            (tenure * 0.1) +                # Loyalty indicator weight
            (coupon_used * 0.05)            # Engagement indicator weight
        )
        
        # Classify customer value
        if value_score >= 15:
            value_tier = "High-Value"
            value_level = "high"
            color = "#28a745"  # Green
        elif value_score >= 8:
            value_tier = "Medium-Value"
            value_level = "medium"
            color = "#ffc107"  # Yellow
        else:
            value_tier = "Low-Value"
            value_level = "low"
            color = "#6c757d"  # Gray
            
        return {
            "value_score": round(value_score, 2),
            "value_tier": value_tier,
            "value_level": value_level,
            "color": color,
            "metrics": {
                "order_frequency": order_count,
                "revenue_indicator": cashback_amount,
                "growth_trend": order_hike,
                "loyalty_score": tenure,
                "engagement_level": coupon_used
            }
        }
    except (ValueError, TypeError):
        return {
            "value_score": 0,
            "value_tier": "Unknown",
            "value_level": "unknown",
            "color": "#6c757d",
            "metrics": {}
        }

def segment_customer(churn_probability: float, customer_value: dict, data: dict) -> dict:
    """
    Segment customer based on churn risk and value
    
    Args:
        churn_probability: Churn probability (0-1)
        customer_value: Customer value classification
        data: Original customer data
    
    Returns:
        Dictionary containing segment classification and strategy
    """
    is_high_risk = churn_probability >= CUSTOM_THRESHOLD
    value_level = customer_value.get('value_level', 'unknown')
    tenure = float(data.get('Tenure', 0))
    
    # Segment 1: High-risk + High-value (Top Priority)
    if is_high_risk and value_level == 'high':
        return {
            "segment_id": 1,
            "segment_name": "Critical - High Risk, High Value",
            "priority": "Critical",
            "color": "#dc3545",  # Red
            "icon": "🚨",
            "strategy": "Immediate intervention with premium retention offers",
            "recommended_actions": [
                "Personal call from account manager within 24 hours",
                "Offer premium loyalty benefits or exclusive discounts",
                "Conduct satisfaction survey and address concerns immediately",
                "Assign dedicated customer success representative"
            ],
            "budget_allocation": "High",
            "description": "High-value customers at risk of churning - maximum retention effort justified"
        }
    
    # Segment 2: High-risk + Low/Medium-value (Selective Retention)
    elif is_high_risk and value_level in ['low', 'medium']:
        return {
            "segment_id": 2,
            "segment_name": "Selective - High Risk, Lower Value",
            "priority": "Medium",
            "color": "#fd7e14",  # Orange
            "icon": "⚠️",
            "strategy": "Cost-effective retention with automated campaigns",
            "recommended_actions": [
                "Send automated email with discount offer",
                "Provide self-service resources for common issues",
                "Offer basic loyalty program enrollment",
                "Monitor for 30 days before escalation"
            ],
            "budget_allocation": "Low-Medium",
            "description": "At-risk customers with lower value - focus on cost-effective retention"
        }
    
    # Segment 3: Low-risk + Long-term/High-value (Loyalty Rewards)
    elif not is_high_risk and (tenure >= 12 or value_level == 'high'):
        return {
            "segment_id": 3,
            "segment_name": "Champions - Low Risk, High Loyalty",
            "priority": "Low",
            "color": "#28a745",  # Green
            "icon": "👑",
            "strategy": "Reward loyalty and encourage advocacy",
            "recommended_actions": [
                "Enroll in VIP loyalty program",
                "Offer referral bonuses and rewards",
                "Provide early access to new features/products",
                "Send appreciation messages and exclusive content"
            ],
            "budget_allocation": "Medium",
            "description": "Loyal, stable customers - focus on appreciation and advocacy"
        }
    
    # Segment 4: Low-risk + New/Medium-value (Growth Potential)
    else:
        return {
            "segment_id": 4,
            "segment_name": "Growth - Stable with Potential",
            "priority": "Low",
            "color": "#17a2b8",  # Blue
            "icon": "📈",
            "strategy": "Nurture growth and engagement",
            "recommended_actions": [
                "Send educational content and tips",
                "Offer usage-based incentives",
                "Provide product recommendations",
                "Monitor engagement trends"
            ],
            "budget_allocation": "Low",
            "description": "Stable customers with growth potential - focus on engagement"
        }

def categorize_customer_risk(churn_probability: float) -> dict:
    """
    Categorize customer based on churn probability threshold
    
    Args:
        churn_probability: The predicted churn probability (0-1)
    
    Returns:
        Dictionary containing risk category and details
    """
    if churn_probability >= CUSTOM_THRESHOLD:
        return {
            "risk_category": "High Risk",
            "risk_level": "high",
            "color": "#dc3545",  # Red
            "description": f"Churn probability ({churn_probability:.2%}) exceeds threshold ({CUSTOM_THRESHOLD:.2%})"
        }
    else:
        return {
            "risk_category": "Low Risk", 
            "risk_level": "low",
            "color": "#28a745",  # Green
            "description": f"Churn probability ({churn_probability:.2%}) below threshold ({CUSTOM_THRESHOLD:.2%})"
        }

def get_action_suggestion(churn_probability: float, customer_data: dict = None) -> dict:
    """
    Generate personalized action suggestions based on churn probability tiers
    
    Args:
        churn_probability: The predicted churn probability (0-1)
        customer_data: Optional customer data for more personalized suggestions
    
    Returns:
        Dictionary containing action details
    """
    if churn_probability >= 0.80:
        return {
            "priority": "High",
            "action": "Call customer support immediately",
            "description": "Customer has very high churn risk. Immediate personal intervention required.",
            "urgency": "Critical",
            "suggested_timeline": "Within 24 hours",
            "action_type": "direct_contact"
        }
    elif 0.50 <= churn_probability < 0.80:
        return {
            "priority": "Medium",
            "action": "Offer 10% discount or loyalty reward",
            "description": "Customer shows moderate churn risk. Provide incentives to retain.",
            "urgency": "High",
            "suggested_timeline": "Within 3 days",
            "action_type": "incentive"
        }
    elif 0.32 <= churn_probability < 0.50:
        return {
            "priority": "Low",
            "action": "Send personalized email with new features",
            "description": "Customer shows early churn signals. Proactive engagement recommended.",
            "urgency": "Medium",
            "suggested_timeline": "Within 1 week",
            "action_type": "engagement"
        }
    else:
        return {
            "priority": "Monitor",
            "action": "Continue regular engagement",
            "description": "Customer shows low churn risk. Maintain standard service level.",
            "urgency": "Low",
            "suggested_timeline": "Regular schedule",
            "action_type": "maintenance"
        }

def generate_shap_explanation(shap_values_dict: dict, prediction: int, probability: float) -> dict:
    """
    Generate human-readable explanations from SHAP values
    
    Args:
        shap_values_dict: Dictionary of feature names to SHAP values
        prediction: Model prediction (0 or 1)
        probability: Churn probability
    
    Returns:
        Dictionary containing structured explanations
    """
    # Sort features by absolute SHAP value (most important first)
    sorted_features = sorted(
        [(k, v) for k, v in shap_values_dict.items() if v is not None], 
        key=lambda x: abs(x[1]), 
        reverse=True
    )
    
    # Get top contributing features
    top_positive = [(k, v) for k, v in sorted_features if v > 0][:3]
    top_negative = [(k, v) for k, v in sorted_features if v < 0][:3]
    
    # Generate human-readable explanations
    explanations = []
    
    # Positive contributors (increase churn risk)
    for feature, value in top_positive:
        if feature == "Complain" and value > 0:
            explanations.append(f"Customer complaints significantly increase churn risk")
        elif feature == "DaySinceLastOrder" and value > 0:
            explanations.append(f"Long time since last order increases churn likelihood")
        elif feature == "SatisfactionScore" and value > 0:
            explanations.append(f"Low satisfaction score contributes to churn risk")
        elif feature == "Tenure" and value > 0:
            explanations.append(f"Customer tenure pattern affects churn probability")
        elif feature == "OrderCount" and value > 0:
            explanations.append(f"Order frequency pattern influences churn risk")
        else:
            explanations.append(f"{feature.replace('_', ' ')} increases churn risk")
    
    # Negative contributors (decrease churn risk)
    for feature, value in top_negative:
        if feature == "CashbackAmount" and value < 0:
            explanations.append(f"Higher cashback amount reduces churn risk")
        elif feature == "OrderCount" and value < 0:
            explanations.append(f"Regular ordering pattern reduces churn likelihood")
        elif feature == "SatisfactionScore" and value < 0:
            explanations.append(f"Good satisfaction score helps retain customer")
        elif feature == "CouponUsed" and value < 0:
            explanations.append(f"Coupon usage indicates engagement, reducing churn risk")
        else:
            explanations.append(f"{feature.replace('_', ' ')} helps reduce churn risk")
    
    # Generate overall summary
    if prediction == 1:
        summary = f"This customer has a {probability:.1%} chance of churning. "
        if top_positive:
            summary += f"Key risk factors include {', '.join([exp.lower() for exp in explanations[:2]])}."
    else:
        summary = f"This customer has a low churn risk ({probability:.1%}). "
        if top_negative:
            summary += f"Protective factors include {', '.join([exp.lower() for exp in explanations[:2]])}."
    
    return {
        "summary": summary,
        "detailed_explanations": explanations,
        "top_risk_factors": [{"feature": k, "impact": v, "description": exp} 
                           for (k, v), exp in zip(top_positive, explanations[:len(top_positive)])],
        "protective_factors": [{"feature": k, "impact": v, "description": exp} 
                             for (k, v), exp in zip(top_negative, explanations[len(top_positive):])],
        "feature_contributions": sorted_features
    }

def predict_with_explainability(data: dict):
    """Make prediction + explainability with SHAP + personalized action suggestions"""
    input_df = preprocess_input(data)

    # Prediction with custom threshold
    probability = model.predict_proba(input_df)[0][1]  # churn probability
    prediction = 1 if probability >= CUSTOM_THRESHOLD else 0

    # Get personalized action suggestion
    action_suggestion = get_action_suggestion(probability, data)

    # SHAP explainability
    try:
        explainer = shap.TreeExplainer(model.named_steps["classifier"])
        transformed = model.named_steps["preprocessor"].transform(input_df)
        shap_values = explainer.shap_values(transformed)

        # ✅ Handle binary classification SHAP output
        if isinstance(shap_values, list) and len(shap_values) > 1:
            shap_vals = shap_values[1][0].flatten()
        else:
            shap_vals = shap_values[0].flatten()

        # Create structured SHAP data
        shap_dict = dict(zip(RAW_FEATURES, shap_vals.tolist()))
        importance = dict(zip(RAW_FEATURES, np.abs(shap_vals).tolist()))
        
        # Generate human-readable explanations
        explanations = generate_shap_explanation(shap_dict, prediction, probability)
        
    except Exception as e:
        importance = {feature: None for feature in RAW_FEATURES}  # fallback
        shap_dict = {feature: None for feature in RAW_FEATURES}
        explanations = {
            "summary": f"Prediction: {'Churn' if prediction else 'No Churn'} ({probability:.1%} probability)",
            "detailed_explanations": ["SHAP analysis unavailable"],
            "top_risk_factors": [],
            "protective_factors": [],
            "feature_contributions": []
        }

    # Get risk categorization
    risk_category = categorize_customer_risk(probability)
    
    # Calculate customer value and segmentation
    customer_value = calculate_customer_value(data)
    customer_segment = segment_customer(probability, customer_value, data)

    return {
        "prediction": int(prediction),
        "churn_probability": round(float(probability), 4),
        "threshold": CUSTOM_THRESHOLD,
        "feature_importance": importance,
        "shap_values": shap_dict,
        "explanations": explanations,
        "suggested_action": action_suggestion,
        "risk_category": risk_category,
        "customer_value": customer_value,
        "customer_segment": customer_segment
    }
