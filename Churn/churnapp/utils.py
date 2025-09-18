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

# Handle scikit-learn version compatibility issues
import warnings
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

try:
    model = joblib.load(MODEL_PATH)
except (AttributeError, ImportError) as e:
    print(f"Warning: Model loading failed due to scikit-learn version compatibility: {e}")
    print("Creating a mock model for development purposes...")
    
    # Create a mock model for development/testing
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.compose import ColumnTransformer
    from sklearn.preprocessing import StandardScaler, OneHotEncoder
    from sklearn.pipeline import Pipeline
    
    # Mock pipeline structure
    categorical_features = ['PreferredLoginDevice', 'PreferredPaymentMode', 'Gender', 'PreferedOrderCat', 'MaritalStatus']
    numerical_features = [f for f in RAW_FEATURES if f not in categorical_features]
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_features),
            ('cat', OneHotEncoder(drop='first', handle_unknown='ignore'), categorical_features)
        ])
    
    model = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    
    # Create mock training data for fitting
    mock_data = pd.DataFrame({
        'Tenure': [12, 24, 6, 18],
        'PreferredLoginDevice': ['Mobile Phone', 'Computer', 'Mobile Phone', 'Phone'],
        'CityTier': [1, 2, 3, 1],
        'WarehouseToHome': [10, 15, 8, 12],
        'PreferredPaymentMode': ['Debit Card', 'Credit Card', 'UPI', 'Cash on Delivery'],
        'Gender': ['Male', 'Female', 'Male', 'Female'],
        'HourSpendOnApp': [2, 3, 1, 4],
        'NumberOfDeviceRegistered': [3, 4, 2, 5],
        'PreferedOrderCat': ['Laptop & Accessory', 'Mobile Phone', 'Fashion', 'Grocery'],
        'SatisfactionScore': [3, 4, 2, 5],
        'MaritalStatus': ['Single', 'Married', 'Single', 'Divorced'],
        'NumberOfAddress': [2, 3, 1, 4],
        'Complain': [0, 1, 0, 0],
        'OrderAmountHikeFromlastYear': [15, 20, 10, 25],
        'CouponUsed': [5, 8, 3, 12],
        'OrderCount': [10, 15, 5, 20],
        'DaySinceLastOrder': [3, 7, 2, 5],
        'CashbackAmount': [100, 200, 50, 300]
    })
    mock_labels = [0, 1, 0, 1]
    
    try:
        model.fit(mock_data, mock_labels)
        print("Mock model fitted successfully for development.")
    except Exception as fit_error:
        print(f"Mock model fitting failed: {fit_error}")
        model = None

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

def calculate_retention_score(churn_probability: float) -> dict:
    """
    Calculate gamified retention score based on churn probability
    
    Args:
        churn_probability: The predicted churn probability (0-1)
    
    Returns:
        Dictionary containing retention score and gamification data
    """
    # Retention Score = (1 - churn_probability) * 100
    retention_score = round((1 - churn_probability) * 100, 1)
    
    # Determine score tier and color
    if retention_score >= 90:
        tier = "Platinum"
        tier_color = "#e5e4e2"  # Platinum
        tier_icon = "💎"
    elif retention_score >= 80:
        tier = "Gold"
        tier_color = "#ffd700"  # Gold
        tier_icon = "🥇"
    elif retention_score >= 68:
        tier = "Silver"
        tier_color = "#c0c0c0"  # Silver
        tier_icon = "🥈"
    elif retention_score >= 50:
        tier = "Bronze"
        tier_color = "#cd7f32"  # Bronze
        tier_icon = "🥉"
    else:
        tier = "At Risk"
        tier_color = "#dc3545"  # Red
        tier_icon = "⚠️"
    
    return {
        "retention_score": retention_score,
        "score_tier": tier,
        "tier_color": tier_color,
        "tier_icon": tier_icon,
        "score_percentage": retention_score,
        "churn_risk_level": "Low" if retention_score >= 68 else "High"
    }

def award_badges(churn_probability: float, customer_data: dict, retention_score_data: dict) -> list:
    """
    Award badges based on retention score and customer history
    
    Args:
        churn_probability: The predicted churn probability (0-1)
        customer_data: Customer data dictionary
        retention_score_data: Retention score calculation results
    
    Returns:
        List of earned badges
    """
    badges = []
    retention_score = retention_score_data["retention_score"]
    
    # Core retention badges based on score thresholds
    if retention_score > 68:  # < 0.32 probability
        badges.append({
            "id": "loyalty_shield",
            "name": "Loyalty Shield",
            "description": "Retention score above 68 - Low churn risk customer",
            "icon": "🛡️",
            "color": "#28a745",
            "tier": "Core",
            "earned_date": "current",
            "criteria": "Retention Score > 68"
        })
    
    if retention_score > 80:  # < 0.20 probability
        badges.append({
            "id": "engagement_ace",
            "name": "Engagement Ace",
            "description": "Retention score above 80 - Highly engaged customer",
            "icon": "🎯",
            "color": "#007bff",
            "tier": "Premium",
            "earned_date": "current",
            "criteria": "Retention Score > 80"
        })
    
    # Additional achievement badges based on customer behavior
    try:
        tenure = float(customer_data.get('Tenure', 0))
        order_count = float(customer_data.get('OrderCount', 0))
        satisfaction_score = float(customer_data.get('SatisfactionScore', 0))
        cashback_amount = float(customer_data.get('CashbackAmount', 0))
        complain = int(customer_data.get('Complain', 0))
        coupon_used = float(customer_data.get('CouponUsed', 0))
        
        # Tenure-based badges
        if tenure >= 24:
            badges.append({
                "id": "veteran_customer",
                "name": "Veteran Customer",
                "description": "2+ years of loyalty with the platform",
                "icon": "🏆",
                "color": "#ffc107",
                "tier": "Achievement",
                "earned_date": "current",
                "criteria": "Tenure ≥ 24 months"
            })
        elif tenure >= 12:
            badges.append({
                "id": "loyal_member",
                "name": "Loyal Member",
                "description": "1+ year of consistent engagement",
                "icon": "⭐",
                "color": "#17a2b8",
                "tier": "Achievement",
                "earned_date": "current",
                "criteria": "Tenure ≥ 12 months"
            })
        
        # Order activity badges
        if order_count >= 20:
            badges.append({
                "id": "frequent_shopper",
                "name": "Frequent Shopper",
                "description": "High order frequency demonstrates strong engagement",
                "icon": "🛒",
                "color": "#6f42c1",
                "tier": "Activity",
                "earned_date": "current",
                "criteria": "Order Count ≥ 20"
            })
        
        # Satisfaction badges
        if satisfaction_score >= 4:
            badges.append({
                "id": "satisfied_customer",
                "name": "Satisfied Customer",
                "description": "High satisfaction score indicates positive experience",
                "icon": "😊",
                "color": "#28a745",
                "tier": "Experience",
                "earned_date": "current",
                "criteria": "Satisfaction Score ≥ 4"
            })
        
        # Value badges
        if cashback_amount >= 200:
            badges.append({
                "id": "high_value_customer",
                "name": "High Value Customer",
                "description": "Significant cashback earnings indicate high value",
                "icon": "💰",
                "color": "#fd7e14",
                "tier": "Value",
                "earned_date": "current",
                "criteria": "Cashback Amount ≥ $200"
            })
        
        # Perfect customer badge (no complaints + high satisfaction)
        if complain == 0 and satisfaction_score >= 4 and retention_score > 75:
            badges.append({
                "id": "perfect_customer",
                "name": "Perfect Customer",
                "description": "No complaints, high satisfaction, and excellent retention",
                "icon": "🌟",
                "color": "#e83e8c",
                "tier": "Elite",
                "earned_date": "current",
                "criteria": "No complaints + High satisfaction + Retention > 75"
            })
        
        # Coupon optimizer badge
        if coupon_used >= 5:
            badges.append({
                "id": "smart_saver",
                "name": "Smart Saver",
                "description": "Excellent use of promotional offers and coupons",
                "icon": "🎫",
                "color": "#20c997",
                "tier": "Engagement",
                "earned_date": "current",
                "criteria": "Coupon Usage ≥ 5"
            })
            
    except (ValueError, TypeError):
        pass  # Skip additional badges if data is invalid
    
    return badges

def predict_with_explainability(data: dict):
    """Make prediction + explainability with SHAP + personalized action suggestions + gamification"""
    input_df = preprocess_input(data)

    # Prediction with custom threshold
    probability = model.predict_proba(input_df)[0][1]  # churn probability
    prediction = 1 if probability >= CUSTOM_THRESHOLD else 0

    # Get personalized action suggestion
    action_suggestion = get_action_suggestion(probability, data)

    # Calculate gamified retention score and badges
    retention_score_data = calculate_retention_score(probability)
    earned_badges = award_badges(probability, data, retention_score_data)

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
        "customer_segment": customer_segment,
        "retention_score": retention_score_data,
        "earned_badges": earned_badges,
        "gamification": {
            "total_badges": len(earned_badges),
            "badge_categories": list(set([badge["tier"] for badge in earned_badges])),
            "achievement_level": retention_score_data["score_tier"],
            "next_milestone": 80 if retention_score_data["retention_score"] < 80 else 90 if retention_score_data["retention_score"] < 90 else "Max Level"
        }
    }
