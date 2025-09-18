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

          {/* Gamified Retention Section */}
          {predictionData && predictionData.retention_score && (
            <div style={{ 
              marginTop: '20px', 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{ 
                color: '#333', 
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                🎮 Gamified Retention Score
              </h3>
              
              {/* Retention Score Display */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div style={{ 
                  fontSize: '3em',
                  fontWeight: 'bold',
                  color: predictionData.retention_score.tier_color,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {predictionData.retention_score.retention_score}
                </div>
                <div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '5px'
                  }}>
                    <span style={{ fontSize: '1.5em' }}>
                      {predictionData.retention_score.tier_icon}
                    </span>
                    <span style={{ 
                      fontSize: '1.2em',
                      fontWeight: 'bold',
                      color: predictionData.retention_score.tier_color
                    }}>
                      {predictionData.retention_score.score_tier} Tier
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    Risk Level: {predictionData.retention_score.churn_risk_level}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '5px',
                  fontSize: '0.9em',
                  color: '#666'
                }}>
                  <span>Retention Progress</span>
                  <span>{predictionData.retention_score.retention_score}%</span>
                </div>
                <div style={{ 
                  width: '100%', 
                  backgroundColor: '#e9ecef', 
                  borderRadius: '10px', 
                  overflow: 'hidden',
                  height: '20px'
                }}>
                  <div
                    style={{
                      width: `${predictionData.retention_score.retention_score}%`,
                      height: '100%',
                      backgroundColor: predictionData.retention_score.tier_color,
                      transition: 'width 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.8em',
                      fontWeight: 'bold'
                    }}
                  >
                    {predictionData.retention_score.retention_score >= 20 && `${predictionData.retention_score.retention_score}%`}
                  </div>
                </div>
              </div>

              {/* Earned Badges */}
              {predictionData.earned_badges && predictionData.earned_badges.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#333', marginBottom: '10px' }}>
                    🏅 Earned Badges ({predictionData.earned_badges.length})
                  </h4>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '10px' 
                  }}>
                    {predictionData.earned_badges.map((badge, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          backgroundColor: `${badge.color}20`,
                          border: `2px solid ${badge.color}`,
                          borderRadius: '20px',
                          fontSize: '0.9em',
                          fontWeight: 'bold'
                        }}
                        title={badge.description}
                      >
                        <span style={{ fontSize: '1.2em' }}>{badge.icon}</span>
                        <span>{badge.name}</span>
                        <span style={{ 
                          fontSize: '0.8em', 
                          color: badge.color,
                          backgroundColor: 'white',
                          padding: '2px 6px',
                          borderRadius: '10px'
                        }}>
                          {badge.tier}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievement Summary */}
              {predictionData.gamification && (
                <div style={{ 
                  padding: '15px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6'
                }}>
                  <h4 style={{ color: '#333', marginBottom: '10px' }}>
                    📊 Achievement Summary
                  </h4>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: '15px' 
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#007bff' }}>
                        {predictionData.gamification.total_badges}
                      </div>
                      <div style={{ fontSize: '0.9em', color: '#666' }}>Total Badges</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#28a745' }}>
                        {predictionData.gamification.achievement_level}
                      </div>
                      <div style={{ fontSize: '0.9em', color: '#666' }}>Current Level</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#ffc107' }}>
                        {predictionData.gamification.next_milestone === 'Max Level' ? '🏆' : predictionData.gamification.next_milestone}
                      </div>
                      <div style={{ fontSize: '0.9em', color: '#666' }}>Next Milestone</div>
                    </div>
                  </div>
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
