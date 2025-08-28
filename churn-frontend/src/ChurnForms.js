import React, { useState } from 'react';
import axios from 'axios';

const ChurnForm = () => {
  const [formData, setFormData] = useState({
    Tenure: '',
    PreferredLoginDevice: '',
    CityTier: '',
    WarehouseToHome: '',
    PreferredPaymentMode: '',
    Gender: '',
    HourSpendOnApp: '',
    NumberOfDeviceRegistered: '',
    PreferedOrderCat: '',
    SatisfactionScore: '',
    MaritalStatus: '',
    NumberOfAddress: '',
    Complain: '',
    OrderAmountHikeFromlastYear: '',
    CouponUsed: '',
    OrderCount: '',
    DaySinceLastOrder: '',
    CashbackAmount: ''
  });

  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/predict/', formData);
      const rawPrediction = response.data.prediction;
      const readablePrediction = rawPrediction === 1 ? 'Churn' : 'Not Churn';
      setPrediction(readablePrediction);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to get prediction. Please check your backend.');
      setPrediction(null);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto' }}>
      <h2>Customer Churn Predictor</h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map((key) => (
          <div key={key} style={{ marginBottom: '10px' }}>
            <label>{key}</label>
            <input
              type="text"
              name={key}
              value={formData[key]}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px' }}
              required
            />
          </div>
        ))}
        <button type="submit" style={{ padding: '10px 20px' }}>Predict Churn</button>
      </form>

      {prediction && (
        <div style={{ marginTop: '20px', color: prediction === 'Churn' ? 'red' : 'green' }}>
          <strong>Prediction:</strong> {prediction}
        </div>
      )}
      {error && (
        <div style={{ marginTop: '20px', color: 'red' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default ChurnForm;
