import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading real-time data...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#333', marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
          🔍 Real-Time Watchlist
          <span style={{
            marginLeft: '15px',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'normal',
            background: isConnected ? '#28a745' : '#dc3545',
            color: 'white'
          }}>
            {isConnected ? '🟢 LIVE' : '🔴 OFFLINE'}
          </span>
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          Monitor customers with real-time anomaly detection and churn prediction alerts
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', borderRadius: '12px', color: 'white' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>{stats.totalWatched}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Watched</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '20px', borderRadius: '12px', color: 'white' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>{stats.highRisk}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>High Risk</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '20px', borderRadius: '12px', color: 'white' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>{stats.mediumRisk}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Medium Risk</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', padding: '20px', borderRadius: '12px', color: 'white' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>{stats.activeAlerts}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Active Alerts</div>
        </div>
      </div>

      {/* Filter Controls */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold', color: '#333' }}>Filter by Risk:</span>
        {['all', 'high', 'medium', 'low'].map(level => (
          <button
            key={level}
            onClick={() => setFilter(level)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '20px',
              background: filter === level ? '#007bff' : '#f8f9fa',
              color: filter === level ? 'white' : '#333',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}
          >
            {level}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
        {/* Watchlist */}
        <div>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>👥 Customer Watchlist ({filteredWatchlist.length})</h2>
          
          {filteredWatchlist.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              background: '#f8f9fa', 
              borderRadius: '12px',
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎯</div>
              <div>No customers in watchlist</div>
              <div style={{ fontSize: '14px', marginTop: '5px' }}>
                Customers will appear here when anomalies are detected
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {filteredWatchlist.map((item, index) => (
                <div key={index} style={{
                  background: 'white',
                  border: `2px solid ${getRiskColor(item.risk_level)}`,
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{item.customer_name}</h3>
                      <div style={{ fontSize: '14px', color: '#666' }}>ID: {item.customer_id}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        background: getRiskColor(item.risk_level),
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        marginBottom: '5px'
                      }}>
                        {item.risk_level} RISK
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {getTimeAgo(item.last_updated)}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Churn Probability</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        flex: 1,
                        height: '8px',
                        background: '#e9ecef',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${item.churn_probability * 100}%`,
                          height: '100%',
                          background: getRiskColor(item.risk_level),
                          transition: 'width 0.3s'
                        }} />
                      </div>
                      <span style={{ fontWeight: 'bold', color: getRiskColor(item.risk_level) }}>
                        {(item.churn_probability * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => triggerAnomalyDetection(item.customer_id)}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '6px',
                        background: '#17a2b8',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#138496'}
                      onMouseLeave={(e) => e.target.style.background = '#17a2b8'}
                    >
                      🔍 Scan Now
                    </button>
                    <button
                      onClick={() => removeFromWatchlist(item.customer_id)}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '6px',
                        background: '#dc3545',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#c82333'}
                      onMouseLeave={(e) => e.target.style.background = '#dc3545'}
                    >
                      ❌ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Alerts */}
        <div>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>🚨 Live Alerts ({filteredAlerts.length})</h2>
          
          <div style={{ 
            maxHeight: '600px', 
            overflowY: 'auto',
            background: '#f8f9fa',
            borderRadius: '12px',
            padding: '15px'
          }}>
            {filteredAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
                <div>No active alerts</div>
                <div style={{ fontSize: '14px', marginTop: '5px' }}>
                  All systems running smoothly
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredAlerts.map((alert, index) => (
                  <div key={index} style={{
                    background: 'white',
                    borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
                    borderRadius: '8px',
                    padding: '15px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '2px' }}>
                          {alert.customer_name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {getTimeAgo(alert.detected_at)}
                        </div>
                      </div>
                      <div style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: getSeverityColor(alert.severity),
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {alert.severity}
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '14px', color: '#555', marginBottom: '10px' }}>
                      {alert.description}
                    </div>
                    
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      style={{
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '4px',
                        background: '#28a745',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#218838'}
                      onMouseLeave={(e) => e.target.style.background = '#28a745'}
                    >
                      ✓ Resolve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
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
