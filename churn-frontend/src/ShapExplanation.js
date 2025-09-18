import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ShapExplanation = ({ explanations, shapValues }) => {
  if (!explanations || !shapValues) {
    return null;
  }

  // Prepare data for waterfall chart
  const chartData = explanations.feature_contributions
    .slice(0, 8) // Show top 8 features
    .map(([feature, value]) => ({
      feature: feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      value: parseFloat(value.toFixed(4)),
      impact: value > 0 ? 'Increases Risk' : 'Decreases Risk',
      color: value > 0 ? '#dc3545' : '#28a745'
    }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{label}</p>
          <p style={{ margin: '0', color: data.color }}>
            Impact: {data.value > 0 ? '+' : ''}{data.value}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#666' }}>
            {data.impact}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ 
      marginTop: '20px', 
      padding: '20px', 
      backgroundColor: '#f8f9fa', 
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }}>
      <h3 style={{ marginBottom: '15px', color: '#333' }}>
        🧠 AI Explanation: Why This Prediction?
      </h3>

      {/* Summary */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: 'white', 
        borderRadius: '5px',
        border: '1px solid #dee2e6'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>Summary</h4>
        <p style={{ margin: '0', fontSize: '1.1em', lineHeight: '1.5' }}>
          {explanations.summary}
        </p>
      </div>

      {/* Feature Contributions Chart */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: 'white', 
        borderRadius: '5px',
        border: '1px solid #dee2e6'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>
          Feature Impact Analysis
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="feature" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis 
              label={{ value: 'SHAP Value (Impact)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name="Impact">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#666', textAlign: 'center' }}>
          <span style={{ color: '#dc3545' }}>■</span> Increases Churn Risk &nbsp;&nbsp;
          <span style={{ color: '#28a745' }}>■</span> Decreases Churn Risk
        </div>
      </div>

      {/* Risk Factors and Protective Factors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Risk Factors */}
        {explanations.top_risk_factors && explanations.top_risk_factors.length > 0 && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#fff5f5', 
            borderRadius: '5px',
            border: '1px solid #fed7d7'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#c53030' }}>
              ⚠️ Risk Factors
            </h4>
            {explanations.top_risk_factors.map((factor, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                <div style={{ 
                  fontSize: '0.9em', 
                  fontWeight: 'bold', 
                  color: '#c53030',
                  marginBottom: '2px'
                }}>
                  {factor.feature.replace(/([A-Z])/g, ' $1')}
                </div>
                <div style={{ fontSize: '0.85em', color: '#666' }}>
                  {factor.description}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Protective Factors */}
        {explanations.protective_factors && explanations.protective_factors.length > 0 && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f0fff4', 
            borderRadius: '5px',
            border: '1px solid #c6f6d5'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#38a169' }}>
              ✅ Protective Factors
            </h4>
            {explanations.protective_factors.map((factor, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                <div style={{ 
                  fontSize: '0.9em', 
                  fontWeight: 'bold', 
                  color: '#38a169',
                  marginBottom: '2px'
                }}>
                  {factor.feature.replace(/([A-Z])/g, ' $1')}
                </div>
                <div style={{ fontSize: '0.85em', color: '#666' }}>
                  {factor.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Explanations */}
      {explanations.detailed_explanations && explanations.detailed_explanations.length > 0 && (
        <div style={{ 
          marginTop: '20px',
          padding: '15px', 
          backgroundColor: 'white', 
          borderRadius: '5px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>
            📋 Detailed Analysis
          </h4>
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            {explanations.detailed_explanations.map((explanation, index) => (
              <li key={index} style={{ 
                marginBottom: '5px', 
                fontSize: '0.95em', 
                lineHeight: '1.4' 
              }}>
                {explanation}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Technical Note */}
      <div style={{ 
        marginTop: '15px', 
        padding: '10px', 
        backgroundColor: '#e9ecef', 
        borderRadius: '5px',
        fontSize: '0.8em',
        color: '#6c757d'
      }}>
        <strong>How it works:</strong> This explanation uses SHAP (SHapley Additive exPlanations) to show 
        how each customer feature contributes to the churn prediction. Positive values push the prediction 
        toward "churn", while negative values push it toward "no churn".
      </div>
    </div>
  );
};

export default ShapExplanation;
