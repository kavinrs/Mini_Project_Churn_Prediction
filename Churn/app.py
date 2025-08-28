import streamlit as st
import requests
st.write("Welcome to the churn predictor!")

st.title("🧠 Churn Prediction Demo")

# Collect input
input_data = {
    "Tenure": st.number_input("Tenure", value=12),
    "PreferredLoginDevice": st.selectbox("Login Device", ["Mobile", "Computer"]),
    "CityTier": st.selectbox("City Tier", [1, 2, 3]),
    "WarehouseToHome": st.number_input("Warehouse to Home (km)", value=5.4),
    "PreferredPaymentMode": st.selectbox("Payment Mode", ["Credit Card", "Debit Card", "UPI"]),
    "Gender": st.selectbox("Gender", ["Male", "Female"]),
    "HourSpendOnApp": st.number_input("Hours on App", value=2.5),
    "NumberOfDeviceRegistered": st.number_input("Devices Registered", value=3),
    "PreferedOrderCat": st.selectbox("Order Category", ["Laptop & Accessory", "Mobile", "Fashion"]),
    "SatisfactionScore": st.slider("Satisfaction Score", 1, 5, value=4),
    "MaritalStatus": st.selectbox("Marital Status", ["Single", "Married"]),
    "NumberOfAddress": st.number_input("Number of Addresses", value=2),
    "Complain": st.selectbox("Complaint Filed", [0, 1]),
    "OrderAmountHikeFromlastYear": st.number_input("Order Hike %", value=15.0),
    "CouponUsed": st.selectbox("Coupon Used", [0, 1]),
    "OrderCount": st.number_input("Order Count", value=10),
    "DaySinceLastOrder": st.number_input("Days Since Last Order", value=30),
    "CashbackAmount": st.number_input("Cashback Amount", value=20.0)
}

if st.button("Predict Churn"):
    response = requests.post("http://localhost:8000/api/predict/", json=input_data)
    if response.status_code == 200:
        result = response.json()
        st.success(f"Prediction: {'Churn' if result['prediction'] == 1 else 'No Churn'}")
        st.write(f"Churn Probability: {result['churn_probability']}")
        st.subheader("Top Feature Importances:")
        sorted_features = sorted(result["feature_importance"].items(), key=lambda x: x[1], reverse=True)
        for feature, score in sorted_features[:5]:
            st.write(f"- {feature}: {round(score, 4)}")
    else:
        st.error("Prediction failed. Check backend logs.")
