import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { theme } from './theme';
import Card from './components/UI/Card';
import Button from './components/UI/Button';
import MetricCard from './components/UI/MetricCard';
import LoadingSpinner from './components/UI/LoadingSpinner';
import './App.css';

const RealTimeWatchlist = () => {
  const [watchlistData, setWatchlistData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({
    totalWatched: 0,
    highRisk: 0,
    mediumRisk: 0,
    activeAlerts: 0
  });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  const watchlistWs = useRef(null);
  const alertsWs = useRef(null);

  useEffect(() => {
    // Initialize data and WebSocket connections
    fetchInitialData();
    connectWebSockets();
    
    return () => {
      // Cleanup WebSocket connections
      if (watchlistWs.current) {
        watchlistWs.current.close();
      }
      if (alertsWs.current) {
        alertsWs.current.close();
      }
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch watchlist data
      const watchlistResponse = await axios.get('http://localhost:8000/api/watchlist/');
      setWatchlistData(watchlistResponse.data.watchlist || []);
      
      // Fetch recent alerts
      const alertsResponse = await axios.get('http://localhost:8000/api/alerts/?hours=24');
      setAlerts(alertsResponse.data.alerts || []);
      
      // Calculate stats
      calculateStats(watchlistResponse.data.watchlist || [], alertsResponse.data.alerts || []);
      
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (watchlist, alertsList) => {
    const totalWatched = watchlist.length;
    const highRisk = watchlist.filter(item => item.risk_level === 'high').length;
    const mediumRisk = watchlist.filter(item => item.risk_level === 'medium').length;
    const activeAlerts = alertsList.filter(alert => !alert.is_resolved).length;
    
    setStats({ totalWatched, highRisk, mediumRisk, activeAlerts });
  };

  const connectWebSockets = () => {
    // Connect to watchlist WebSocket
    try {
      watchlistWs.current = new WebSocket('ws://localhost:8000/ws/watchlist/');
      
      watchlistWs.current.onopen = () => {
        console.log('Watchlist WebSocket connected');
        setIsConnected(true);
        watchlistWs.current.send(JSON.stringify({ type: 'subscribe_watchlist' }));
      };
      
      watchlistWs.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWatchlistUpdate(data);
      };
      
      watchlistWs.current.onclose = () => {
        console.log('Watchlist WebSocket disconnected');
        setIsConnected(false);
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSockets, 5000);
      };
      
      watchlistWs.current.onerror = (error) => {
        console.error('Watchlist WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error connecting to watchlist WebSocket:', error);
    }

    // Connect to alerts WebSocket
    try {
      alertsWs.current = new WebSocket('ws://localhost:8000/ws/alerts/');
      
      alertsWs.current.onopen = () => {
        console.log('Alerts WebSocket connected');
        alertsWs.current.send(JSON.stringify({ type: 'subscribe_alerts' }));
      };
      
      alertsWs.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleAlertUpdate(data);
      };
      
      alertsWs.current.onclose = () => {
        console.log('Alerts WebSocket disconnected');
      };
      
      alertsWs.current.onerror = (error) => {
        console.error('Alerts WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error connecting to alerts WebSocket:', error);
    }
  };

  const handleWatchlistUpdate = (data) => {
    if (data.type === 'watchlist_update') {
      const { action, customer_id, customer_name, churn_probability, risk_level } = data;
      
      if (action === 'added') {
        const newEntry = {
          customer_id,
          customer_name,
          churn_probability,
          risk_level,
          added_at: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          is_active: true
        };
        
        setWatchlistData(prev => {
          const updated = [newEntry, ...prev];
          calculateStats(updated, alerts);
          return updated;
        });
        
        // Show notification
        showNotification(`${customer_name} added to watchlist (${(churn_probability * 100).toFixed(1)}% churn risk)`, 'warning');
      } else if (action === 'removed') {
        setWatchlistData(prev => {
          const updated = prev.filter(item => item.customer_id !== customer_id);
          calculateStats(updated, alerts);
          return updated;
        });
      }
    }
  };

  const handleAlertUpdate = (data) => {
    if (data.type === 'anomaly_detected') {
      const newAlert = {
        id: Date.now(), // Temporary ID
        customer_id: data.customer_id,
        customer_name: data.customer_name,
        alert_type: 'anomaly_detected',
        severity: data.severity,
        description: `Anomaly detected (score: ${data.anomaly_score.toFixed(3)})`,
        anomaly_score: data.anomaly_score,
        detected_at: data.timestamp,
        is_resolved: false
      };
      
      setAlerts(prev => {
        const updated = [newAlert, ...prev];
        calculateStats(watchlistData, updated);
        return updated;
      });
      
      // Show notification
      showNotification(`🚨 Anomaly detected for ${data.customer_name}`, 'error');
    }
  };

  const showNotification = (message, type = 'info') => {
    // Simple notification system - could be enhanced with a proper toast library
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      background: ${type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'};
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 4000);
  };

  const removeFromWatchlist = async (customerId) => {
    try {
      if (watchlistWs.current && watchlistWs.current.readyState === WebSocket.OPEN) {
        watchlistWs.current.send(JSON.stringify({
          type: 'remove_from_watchlist',
          customer_id: customerId
        }));
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      await axios.post('http://localhost:8000/api/resolve-alert/', { alert_id: alertId });
      
      setAlerts(prev => {
        const updated = prev.map(alert => 
          alert.id === alertId ? { ...alert, is_resolved: true } : alert
        );
        calculateStats(watchlistData, updated);
        return updated;
      });
      
      showNotification('Alert resolved successfully', 'info');
    } catch (error) {
      console.error('Error resolving alert:', error);
      showNotification('Failed to resolve alert', 'error');
    }
  };

  const triggerAnomalyDetection = async (customerId) => {
    try {
      await axios.post('http://localhost:8000/api/trigger-anomaly/', { customer_id: customerId });
      showNotification('Anomaly detection triggered', 'info');
    } catch (error) {
      console.error('Error triggering anomaly detection:', error);
      showNotification('Failed to trigger anomaly detection', 'error');
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#20c997';
      default: return '#6c757d';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const filteredWatchlist = watchlistData.filter(item => {
    if (filter === 'all') return true;
    return item.risk_level === filter;
  });

  const filteredAlerts = alerts.filter(alert => !alert.is_resolved);

  if (loading) {
    return (
      <div style={{ 
        padding: theme.spacing.xl, 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: theme.spacing.lg
      }}>
        <LoadingSpinner size="large" />
        <div style={{ 
          fontSize: theme.typography.sizes.lg, 
          color: theme.colors.text.secondary 
        }}>
          Loading real-time data...
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '0', 
      fontFamily: theme.typography.fontFamily, 
      background: 'transparent' 
    }}>
      {/* Header */}
      <Card style={{
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
        padding: theme.spacing.xl,
        background: theme.colors.gradients.primary,
        color: 'white'
      }}>
        <h1 style={{ 
          margin: `0 0 ${theme.spacing.md} 0`,
          fontSize: theme.typography.sizes['3xl'],
          fontWeight: theme.typography.weights.bold,
          textShadow: theme.effects.textShadow,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.lg
        }}>
          🔍 Real-Time Watchlist Monitor
          <span style={{
            padding: `${theme.spacing.xs} ${theme.spacing.md}`,
            borderRadius: theme.borderRadius.lg,
            fontSize: theme.typography.sizes.base,
            fontWeight: theme.typography.weights.semibold,
            background: isConnected 
              ? theme.colors.gradients.success
              : theme.colors.gradients.danger,
            color: 'white',
            boxShadow: theme.effects.shadow.lg
          }}>
            {isConnected ? '🟢 LIVE' : '🔴 OFFLINE'}
          </span>
        </h1>
        <p style={{
          margin: '0',
          fontSize: theme.typography.sizes.lg,
          opacity: '0.9',
          fontWeight: theme.typography.weights.normal
        }}>
          Live monitoring of high-risk customers with instant alerts
        </p>
      </Card>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: theme.spacing.lg, 
        marginBottom: theme.spacing.xl 
      }}>
        <MetricCard
          icon="👥"
          value={stats.totalWatched}
          title="Total Watched"
          color="primary"
        />
        <MetricCard
          icon="🚨"
          value={stats.highRisk}
          title="High Risk"
          color="error"
        />
        <MetricCard
          icon="⚠️"
          value={stats.mediumRisk}
          title="Medium Risk"
          color="warning"
        />
        <MetricCard
          icon="🔔"
          value={stats.activeAlerts}
          title="Active Alerts"
          color="info"
        />
      </div>

      {/* Filter Controls */}
      <div style={{ 
        marginBottom: theme.spacing.lg, 
        display: 'flex', 
        gap: theme.spacing.sm, 
        alignItems: 'center' 
      }}>
        <span style={{ 
          fontWeight: theme.typography.weights.semibold, 
          color: theme.colors.text.primary 
        }}>
          Filter by Risk:
        </span>
        {['all', 'high', 'medium', 'low'].map(level => (
          <Button
            key={level}
            onClick={() => setFilter(level)}
            variant={filter === level ? 'primary' : 'secondary'}
            size="sm"
            style={{
              textTransform: 'capitalize'
            }}
          >
            {level}
          </Button>
        ))}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 400px', 
        gap: theme.spacing.xl 
      }}>
        {/* Watchlist */}
        <div>
          <h2 style={{ 
            color: theme.colors.text.primary, 
            marginBottom: theme.spacing.lg,
            fontSize: theme.typography.sizes.xl,
            fontWeight: theme.typography.weights.semibold
          }}>
            👥 Customer Watchlist ({filteredWatchlist.length})
          </h2>
          
          {filteredWatchlist.length === 0 ? (
            <Card style={{ 
              textAlign: 'center', 
              padding: theme.spacing.xl,
              background: theme.colors.background.secondary,
              color: theme.colors.text.secondary
            }}>
              <div style={{ fontSize: '48px', marginBottom: theme.spacing.sm }}>🎯</div>
              <div style={{ fontSize: theme.typography.sizes.base }}>No customers in watchlist</div>
              <div style={{ 
                fontSize: theme.typography.sizes.sm, 
                marginTop: theme.spacing.xs 
              }}>
                Customers will appear here when anomalies are detected
              </div>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              {filteredWatchlist.map((item, index) => (
                <Card key={index} hover style={{
                  border: `2px solid ${getRiskColor(item.risk_level)}`,
                  padding: theme.spacing.lg
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    marginBottom: theme.spacing.md 
                  }}>
                    <div>
                      <h3 style={{ 
                        margin: `0 0 ${theme.spacing.xs} 0`, 
                        color: theme.colors.text.primary,
                        fontSize: theme.typography.sizes.lg,
                        fontWeight: theme.typography.weights.semibold
                      }}>
                        {item.customer_name}
                      </h3>
                      <div style={{ 
                        fontSize: theme.typography.sizes.sm, 
                        color: theme.colors.text.secondary 
                      }}>
                        ID: {item.customer_id}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        borderRadius: theme.borderRadius.full,
                        background: getRiskColor(item.risk_level),
                        color: 'white',
                        fontSize: theme.typography.sizes.xs,
                        fontWeight: theme.typography.weights.bold,
                        textTransform: 'uppercase',
                        marginBottom: theme.spacing.xs
                      }}>
                        {item.risk_level} RISK
                      </div>
                      <div style={{ 
                        fontSize: theme.typography.sizes.xs, 
                        color: theme.colors.text.secondary 
                      }}>
                        {getTimeAgo(item.last_updated)}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: theme.spacing.md }}>
                    <div style={{ 
                      fontSize: theme.typography.sizes.sm, 
                      color: theme.colors.text.secondary, 
                      marginBottom: theme.spacing.xs 
                    }}>
                      Churn Probability
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                      <div style={{
                        flex: 1,
                        height: '8px',
                        background: theme.colors.background.secondary,
                        borderRadius: theme.borderRadius.sm,
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${item.churn_probability * 100}%`,
                          height: '100%',
                          background: getRiskColor(item.risk_level),
                          transition: theme.effects.transition.default
                        }} />
                      </div>
                      <span style={{ 
                        fontWeight: theme.typography.weights.bold, 
                        color: getRiskColor(item.risk_level) 
                      }}>
                        {(item.churn_probability * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                    <Button
                      onClick={() => triggerAnomalyDetection(item.customer_id)}
                      variant="info"
                      size="sm"
                      title="Run anomaly detection scan for this customer"
                    >
                      🔍 Anomaly Scan
                    </Button>
                    <Button
                      onClick={() => removeFromWatchlist(item.customer_id)}
                      variant="danger"
                      size="sm"
                      title="Remove customer from watchlist"
                    >
                      ❌ Remove from List
                    </Button>
                    <Button
                      onClick={() => window.open(`/customer/${item.customer_id}`, '_blank')}
                      variant="success"
                      size="sm"
                      title="View detailed customer profile"
                    >
                      👤 View Profile
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Live Alerts */}
        <div>
          <h2 style={{ 
            color: theme.colors.text.primary, 
            marginBottom: theme.spacing.lg,
            fontSize: theme.typography.sizes.xl,
            fontWeight: theme.typography.weights.semibold
          }}>
            🚨 Live Alerts ({filteredAlerts.length})
          </h2>
          
          <Card style={{ 
            maxHeight: '600px', 
            overflowY: 'auto',
            background: theme.colors.background.secondary,
            padding: theme.spacing.md
          }}>
            {filteredAlerts.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: theme.spacing.xl, 
                color: theme.colors.text.secondary 
              }}>
                <div style={{ 
                  fontSize: '48px', 
                  marginBottom: theme.spacing.sm 
                }}>✅</div>
                <div style={{ fontSize: theme.typography.sizes.base }}>No active alerts</div>
                <div style={{ 
                  fontSize: theme.typography.sizes.sm, 
                  marginTop: theme.spacing.xs 
                }}>
                  All systems running smoothly
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
                {filteredAlerts.map((alert, index) => (
                  <Card key={index} style={{
                    borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
                    padding: theme.spacing.md
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      marginBottom: theme.spacing.sm 
                    }}>
                      <div>
                        <div style={{ 
                          fontWeight: theme.typography.weights.semibold, 
                          color: theme.colors.text.primary, 
                          marginBottom: theme.spacing.xs,
                          fontSize: theme.typography.sizes.base
                        }}>
                          {alert.customer_name}
                        </div>
                        <div style={{ 
                          fontSize: theme.typography.sizes.xs, 
                          color: theme.colors.text.secondary 
                        }}>
                          {getTimeAgo(alert.detected_at)}
                        </div>
                      </div>
                      <div style={{
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        borderRadius: theme.borderRadius.lg,
                        background: getSeverityColor(alert.severity),
                        color: 'white',
                        fontSize: theme.typography.sizes.xs,
                        fontWeight: theme.typography.weights.bold,
                        textTransform: 'uppercase'
                      }}>
                        {alert.severity}
                      </div>
                    </div>
                    
                    <div style={{ 
                      fontSize: theme.typography.sizes.sm, 
                      color: theme.colors.text.primary, 
                      marginBottom: theme.spacing.sm 
                    }}>
                      {alert.description}
                    </div>
                    
                    <Button
                      onClick={() => resolveAlert(alert.id)}
                      variant="success"
                      size="sm"
                    >
                      ✓ Resolve
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default RealTimeWatchlist;
