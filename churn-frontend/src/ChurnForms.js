import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { theme } from './theme';
import Card from './components/UI/Card';
// import { Button } from './components/UI';/Button';
import LoadingSpinner from './components/UI/LoadingSpinner';
import AnimatedCard from './components/UI/AnimatedCard';
import AnimatedButton from './components/UI/AnimatedButton';
import ProgressBar from './components/UI/ProgressBar';
import { showToast } from './components/UI/Toast';
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
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPredictionResult(null);
    
    const loadingToast = showToast.loading('Analyzing customer data...');
    
    try {
      const response = await axios.post('http://localhost:8000/api/predict/', formData);
      setPredictionResult(response.data);
      showToast.success('Prediction completed successfully!');
    } catch (error) {
      console.error('Error making prediction:', error);
      showToast.error('Error making prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    { name: 'Tenure', label: 'Customer Tenure (months)', type: 'number', placeholder: 'e.g., 12' },
    { name: 'PreferredLoginDevice', label: 'Preferred Login Device', type: 'select', options: ['Mobile Phone', 'Computer', 'Phone'] },
    { name: 'CityTier', label: 'City Tier', type: 'select', options: ['1', '2', '3'] },
    { name: 'WarehouseToHome', label: 'Warehouse to Home Distance (km)', type: 'number', placeholder: 'e.g., 15.5' },
    { name: 'PreferredPaymentMode', label: 'Preferred Payment Mode', type: 'select', options: ['Debit Card', 'Credit Card', 'UPI', 'COD', 'E wallet'] },
    { name: 'Gender', label: 'Gender', type: 'select', options: ['Male', 'Female'] },
    { name: 'HourSpendOnApp', label: 'Hours Spent on App', type: 'number', placeholder: 'e.g., 3.5' },
    { name: 'NumberOfDeviceRegistered', label: 'Number of Devices Registered', type: 'number', placeholder: 'e.g., 2' },
    { name: 'PreferedOrderCat', label: 'Preferred Order Category', type: 'select', options: ['Laptop & Accessory', 'Mobile Phone', 'Others', 'Fashion', 'Grocery'] },
    { name: 'SatisfactionScore', label: 'Satisfaction Score (1-5)', type: 'number', placeholder: 'e.g., 4' },
    { name: 'MaritalStatus', label: 'Marital Status', type: 'select', options: ['Single', 'Married', 'Divorced'] },
    { name: 'NumberOfAddress', label: 'Number of Addresses', type: 'number', placeholder: 'e.g., 2' },
    { name: 'Complain', label: 'Has Complaints', type: 'select', options: ['0', '1'] },
    { name: 'OrderAmountHikeFromlastYear', label: 'Order Amount Hike (%)', type: 'number', placeholder: 'e.g., 15.2' },
    { name: 'CouponUsed', label: 'Coupons Used', type: 'number', placeholder: 'e.g., 5' },
    { name: 'OrderCount', label: 'Order Count', type: 'number', placeholder: 'e.g., 8' },
    { name: 'DaySinceLastOrder', label: 'Days Since Last Order', type: 'number', placeholder: 'e.g., 7' },
    { name: 'CashbackAmount', label: 'Cashback Amount', type: 'number', placeholder: 'e.g., 150.75' },
  ];

  return (
    <div style={{ 
      fontFamily: theme.typography.fontFamily, 
      color: theme.colors.text.primary 
    }}>
      {/* Header */}
      <AnimatedCard 
        delay={0.1}
        style={{
          textAlign: 'center',
          marginBottom: theme.spacing.xl,
          padding: theme.spacing.xl,
          background: theme.colors.gradients.primary,
          color: 'white'
        }}
        hover={false}
      >
        <h2 style={{
          margin: 0,
          fontSize: theme.typography.fontSize['3xl'],
          fontWeight: theme.typography.fontWeight.bold,
          background: theme.gradients.primary,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: theme.spacing.sm,
        }}>
          AI-Powered Churn Prediction
        </h2>
        <p style={{
          margin: 0,
          fontSize: theme.typography.fontSize.lg,
          color: theme.colors.neutral[600],
          fontWeight: theme.typography.fontWeight.medium,
        }}>
          Enter customer details to predict churn probability with advanced machine learning
        </p>
      </AnimatedCard>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ 
          display: 'grid', 
          gridTemplateColumns: predictionResult ? '1fr 1fr' : '1fr', 
          gap: theme.spacing.xl 
        }}
      >
        {/* Prediction Form */}
        <AnimatedCard delay={0.2} style={{ padding: theme.spacing.xl }}>
          <h3 style={{ 
            margin: `0 0 ${theme.spacing.lg} 0`,
            fontSize: theme.typography.sizes.xl,
            fontWeight: theme.typography.weights.semibold,
            color: theme.colors.text.primary
          }}>
            Customer Information
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: theme.spacing.lg,
              marginBottom: theme.spacing.xl,
            }}>
              {formFields.map((field) => (
                <div key={field.name} style={{ 
                  marginBottom: theme.spacing.md,
                  minHeight: '80px',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <label style={{
                    display: 'block',
                    marginBottom: theme.spacing.sm,
                    fontSize: theme.typography.sizes.sm,
                    fontWeight: theme.typography.weights.semibold,
                    color: theme.colors.text.secondary,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {field.label}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        minHeight: '44px',
                        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                        border: `2px solid ${theme.colors.neutral[200]}`,
                        borderRadius: theme.borderRadius.lg,
                        fontSize: theme.typography.sizes.base,
                        fontFamily: theme.typography.fontFamily,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem',
                        boxSizing: 'border-box',
                        flex: '1'
                      }}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required
                      style={{
                        width: '100%',
                        minHeight: '44px',
                        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                        border: `2px solid ${theme.colors.neutral[200]}`,
                        borderRadius: theme.borderRadius.lg,
                        fontSize: theme.typography.sizes.base,
                        fontFamily: theme.typography.fontFamily,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        boxSizing: 'border-box',
                        flex: '1'
                      }}
                      step={field.type === 'number' ? 'any' : undefined}
                    />
                  )}
                </div>
              ))}
            </div>

            <AnimatedButton
              type="submit"
              disabled={loading}
              loading={loading}
              variant="primary"
              size="lg"
              style={{
                width: '100%',
                marginTop: theme.spacing.lg
              }}
            >
              {loading ? 'Analyzing...' : 'Predict Churn Risk'}
            </AnimatedButton>
          </form>
        </AnimatedCard>

        {/* Results Section */}
        <div style={{ position: 'sticky', top: theme.spacing.lg }}>
          {loading && (
            <Card variant="glass" padding="xl" style={{ textAlign: 'center' }}>
              <LoadingSpinner size="lg" color="primary" />
              <h3 style={{
                margin: `${theme.spacing.md} 0 ${theme.spacing.sm} 0`,
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.neutral[700],
              }}>
                Processing Customer Data
              </h3>
              <p style={{
                margin: 0,
                color: theme.colors.neutral[500],
                fontSize: theme.typography.fontSize.base,
              }}>
                Our AI model is analyzing the customer profile...
              </p>
            </Card>
          )}

          {error && (
            <Card variant="glass" padding="xl" style={{
              border: `2px solid ${theme.colors.error[300]}`,
              background: `${theme.colors.error[50]}95`,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
                marginBottom: theme.spacing.sm,
              }}>
                <span style={{ fontSize: theme.typography.fontSize['2xl'] }}>⚠️</span>
                <h3 style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.error[700],
                }}>
                  Prediction Error
                </h3>
              </div>
              <p style={{
                margin: 0,
                color: theme.colors.error[600],
                fontSize: theme.typography.fontSize.base,
              }}>
                {error}
              </p>
            </Card>
          )}

          {predictionResult && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
              {/* Main Prediction Card */}
              <Card variant="glass" padding="xl" style={{
                border: `2px solid ${predictionResult.churn_probability >= 0.32 ? theme.colors.error[300] : theme.colors.success[300]}`,
                background: `${predictionResult.churn_probability >= 0.32 ? theme.colors.error[50] : theme.colors.success[50]}95`,
              }}>
                <div style={{
                  textAlign: 'center',
                  marginBottom: theme.spacing.lg,
                }}>
                  <div style={{
                    fontSize: '4rem',
                    marginBottom: theme.spacing.sm,
                  }}>
                    {predictionResult.churn_probability >= 0.32 ? '🚨' : '✅'}
                  </div>
                  <h3 style={{
                    margin: 0,
                    fontSize: theme.typography.fontSize['2xl'],
                    fontWeight: theme.typography.fontWeight.bold,
                    color: predictionResult.churn_probability >= 0.32 ? theme.colors.error[700] : theme.colors.success[700],
                    marginBottom: theme.spacing.xs,
                  }}>
                    {predictionResult.churn_probability >= 0.32 ? 'High Churn Risk' : 'Low Churn Risk'}
                  </h3>
                  <p style={{
                    margin: 0,
                    fontSize: theme.typography.fontSize.lg,
                    color: theme.colors.neutral[600],
                  }}>
                    Churn Probability: {(predictionResult.churn_probability * 100).toFixed(1)}%
                  </p>
                </div>

                {/* Churn Probability */}
                <div style={{ marginBottom: theme.spacing.lg }}>
                  <h3 style={{ 
                    margin: `0 0 ${theme.spacing.md} 0`,
                    fontSize: theme.typography.sizes.lg,
                    fontWeight: theme.typography.weights.semibold
                  }}>
                    Churn Probability
                  </h3>
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    style={{
                      fontSize: theme.typography.sizes['3xl'],
                      fontWeight: theme.typography.weights.bold,
                      color: predictionResult.churn_probability >= 0.32 
                        ? theme.colors.error[500] 
                        : theme.colors.success[500],
                      textAlign: 'center',
                      padding: theme.spacing.lg,
                      background: predictionResult.churn_probability >= 0.32 
                        ? `${theme.colors.error[50]}` 
                        : `${theme.colors.success[50]}`,
                      borderRadius: theme.borderRadius.lg,
                      border: `2px solid ${predictionResult.churn_probability >= 0.32 
                        ? theme.colors.error[200] 
                        : theme.colors.success[200]}`
                    }}
                  >
                    {(predictionResult.churn_probability * 100).toFixed(1)}%
                  </motion.div>
                  
                  <ProgressBar
                    value={predictionResult.churn_probability * 100}
                    max={100}
                    color={predictionResult.churn_probability >= 0.32 ? 'danger' : 'success'}
                    size="lg"
                    showLabel={true}
                    label="Risk Level"
                    style={{ marginTop: theme.spacing.md }}
                  />
                </div>

                {/* Additional Prediction Data */}
                {predictionResult.customer_segment && (
                  <div style={{
                    padding: theme.spacing.md,
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: theme.borderRadius.lg,
                    marginBottom: theme.spacing.md,
                  }}>
                    <h4 style={{
                      margin: `0 0 ${theme.spacing.xs} 0`,
                      fontSize: theme.typography.fontSize.base,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.neutral[700],
                    }}>
                      Customer Segment: {predictionResult.customer_segment.segment_name || predictionResult.customer_segment}
                    </h4>
                    <p style={{
                      margin: 0,
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.neutral[600],
                    }}>
                      Value Score: {predictionResult.customer_value?.value_score || predictionResult.customer_value || 'N/A'}
                    </p>
                  </div>
                )}

                {predictionResult.suggested_action && (
                  <div style={{
                    padding: theme.spacing.md,
                    background: `${theme.colors.primary[100]}80`,
                    borderRadius: theme.borderRadius.lg,
                    border: `1px solid ${theme.colors.primary[200]}`,
                  }}>
                    <h4 style={{
                      margin: `0 0 ${theme.spacing.xs} 0`,
                      fontSize: theme.typography.fontSize.base,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.primary[700],
                    }}>
                      🎯 Recommended Action
                    </h4>
                    <p style={{
                      margin: `0 0 ${theme.spacing.xs} 0`,
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.primary[600],
                      fontWeight: theme.typography.fontWeight.medium,
                    }}>
                      {predictionResult.suggested_action.action}
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.neutral[500],
                    }}>
                      Priority: {predictionResult.suggested_action.priority} | Timeline: {predictionResult.suggested_action.timeline}
                    </p>
                  </div>
                )}
              </Card>

              {/* SHAP Explanation */}
              {predictionResult.shap_explanation && (
                <ShapExplanation shapData={predictionResult.shap_explanation} />
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ChurnForm;
