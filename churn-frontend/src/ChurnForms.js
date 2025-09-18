import React, { useState } from 'react';
import axios from 'axios';
import ShapExplanation from './ShapExplanation';

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
  const [predictionData, setPredictionData] = useState(null);
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
      setPredictionData(response.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to get prediction. Please check your backend.');
      setPrediction(null);
      setPredictionData(null);
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

      {prediction && predictionData && (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <div style={{ color: prediction === 'Churn' ? 'red' : 'green', marginBottom: '15px' }}>
            <strong>Prediction:</strong> {prediction}
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Churn Probability:</strong> {(predictionData.churn_probability * 100).toFixed(2)}%
          </div>

          {predictionData.suggested_action && (
            <div style={{ 
              marginTop: '15px', 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '5px',
              border: `2px solid ${
                predictionData.suggested_action.priority === 'High' ? '#dc3545' :
                predictionData.suggested_action.priority === 'Medium' ? '#fd7e14' :
                predictionData.suggested_action.priority === 'Low' ? '#ffc107' : '#28a745'
              }`
            }}>
              <h3 style={{ 
                margin: '0 0 10px 0', 
                color: predictionData.suggested_action.priority === 'High' ? '#dc3545' :
                       predictionData.suggested_action.priority === 'Medium' ? '#fd7e14' :
                       predictionData.suggested_action.priority === 'Low' ? '#e68900' : '#28a745'
              }}>
                Recommended Action ({predictionData.suggested_action.priority} Priority)
              </h3>
              
              <div style={{ marginBottom: '8px' }}>
                <strong>Action:</strong> {predictionData.suggested_action.action}
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <strong>Description:</strong> {predictionData.suggested_action.description}
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <strong>Urgency:</strong> {predictionData.suggested_action.urgency}
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <strong>Timeline:</strong> {predictionData.suggested_action.suggested_timeline}
              </div>
              
              <div style={{ 
                marginTop: '10px', 
                padding: '8px', 
                backgroundColor: '#e9ecef', 
                borderRadius: '3px',
                fontSize: '0.9em'
              }}>
                <strong>Action Type:</strong> {predictionData.suggested_action.action_type.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          )}

          {/* Customer Segmentation Info */}
          {predictionData && predictionData.customer_segment && (
            <div style={{ 
              marginTop: '15px', 
              padding: '15px', 
              backgroundColor: predictionData.customer_segment.color + '15', 
              borderRadius: '5px',
              border: `2px solid ${predictionData.customer_segment.color}`
            }}>
              <h3 style={{ 
                margin: '0 0 10px 0', 
                color: predictionData.customer_segment.color
              }}>
                {predictionData.customer_segment.icon} Customer Segment: {predictionData.customer_segment.segment_name}
              </h3>
              
              <div style={{ marginBottom: '8px' }}>
                <strong>Strategy:</strong> {predictionData.customer_segment.strategy}
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <strong>Priority:</strong> {predictionData.customer_segment.priority}
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Budget Allocation:</strong> {predictionData.customer_segment.budget_allocation}
              </div>

              {predictionData.customer_value && (
                <div style={{ 
                  marginTop: '10px', 
                  padding: '8px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '3px'
                }}>
                  <strong>Customer Value Score:</strong> {predictionData.customer_value.value_score} 
                  ({predictionData.customer_value.value_tier})
                </div>
              )}
            </div>
          )}

          {/* SHAP Explanation Section */}
          {predictionData && predictionData.explanations && (
            <ShapExplanation 
              explanations={predictionData.explanations}
              shapValues={predictionData.shap_values}
            />
          )}
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
