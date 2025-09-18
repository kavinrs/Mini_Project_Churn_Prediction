import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const AlertsDashboard = () => {
  const [alertsData, setAlertsData] = useState({
    activeAlerts: [],
    alertStats: {},
    alertHistory: [],
    alertsByType: [],
    alertsByPriority: []
  });
  
  const [filterStatus, setFilterStatus] = useState('active');
  const [filterPriority, setFilterPriority] = useState('all');

  // Sample alerts data
  const sampleAlerts = [
    {
      id: 1,
      customer: { name: 'John Doe', customer_id: 'CUST001', email: 'john@email.com' },
      alert_type: 'threshold_breach',
      priority: 'high',
      status: 'active',
      title: 'Churn Risk Threshold Breached - John Doe',
      message: 'Customer John Doe has crossed the churn risk threshold. Current risk: 85.0%, Threshold: 32.0%',
      churn_probability: 0.85,
      previous_probability: 0.28,
      probability_change: 0.57,
      segment_id: 1,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      email_sent: true,
      notification_sent_at: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 2,
      customer: { name: 'Sarah Chen', customer_id: 'CUST002', email: 'sarah@email.com' },
      alert_type: 'sudden_increase',
      priority: 'critical',
      status: 'active',
      title: 'Sudden Churn Risk Increase - Sarah Chen',
      message: 'Customer Sarah Chen shows a sudden increase in churn risk. Risk jumped from 45.0% to 72.0% (+27.0%)',
      churn_probability: 0.72,
      previous_probability: 0.45,
      probability_change: 0.27,
      segment_id: 1,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      email_sent: true,
      notification_sent_at: new Date(Date.now() - 4 * 60 * 60 * 1000)
    },
    {
      id: 3,
      customer: { name: 'Mike Johnson', customer_id: 'CUST003', email: 'mike@email.com' },
      alert_type: 'critical_customer',
      priority: 'critical',
      status: 'acknowledged',
      title: 'Critical Customer at Risk - Mike Johnson',
      message: 'High-value customer Mike Johnson is at critical churn risk. Immediate intervention required. Risk: 65.0%, Value Score: 18.5',
      churn_probability: 0.65,
      previous_probability: 0.58,
      probability_change: 0.07,
      segment_id: 1,
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      email_sent: true,
      notification_sent_at: new Date(Date.now() - 6 * 60 * 60 * 1000),
      acknowledged_at: new Date(Date.now() - 3 * 60 * 60 * 1000)
    },
    {
      id: 4,
      customer: { name: 'Lisa Wang', customer_id: 'CUST004', email: 'lisa@email.com' },
      alert_type: 'threshold_breach',
      priority: 'medium',
      status: 'resolved',
      title: 'Churn Risk Threshold Breached - Lisa Wang',
      message: 'Customer Lisa Wang has crossed the churn risk threshold. Current risk: 58.0%, Threshold: 32.0%',
      churn_probability: 0.58,
      previous_probability: 0.25,
      probability_change: 0.33,
      segment_id: 2,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      email_sent: true,
      notification_sent_at: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ];

  useEffect(() => {
    // Process alerts data
    const activeAlerts = sampleAlerts.filter(alert => alert.status === 'active');
    const alertsByType = [
      { type: 'Threshold Breach', count: sampleAlerts.filter(a => a.alert_type === 'threshold_breach').length, color: '#fd7e14' },
      { type: 'Sudden Increase', count: sampleAlerts.filter(a => a.alert_type === 'sudden_increase').length, color: '#dc3545' },
      { type: 'Critical Customer', count: sampleAlerts.filter(a => a.alert_type === 'critical_customer').length, color: '#6f42c1' }
    ];

    const alertsByPriority = [
      { priority: 'Critical', count: sampleAlerts.filter(a => a.priority === 'critical').length, color: '#dc3545' },
      { priority: 'High', count: sampleAlerts.filter(a => a.priority === 'high').length, color: '#fd7e14' },
      { priority: 'Medium', count: sampleAlerts.filter(a => a.priority === 'medium').length, color: '#ffc107' },
      { priority: 'Low', count: sampleAlerts.filter(a => a.priority === 'low').length, color: '#28a745' }
    ];

    const alertStats = {
      total: sampleAlerts.length,
      active: sampleAlerts.filter(a => a.status === 'active').length,
      acknowledged: sampleAlerts.filter(a => a.status === 'acknowledged').length,
      resolved: sampleAlerts.filter(a => a.status === 'resolved').length,
      critical: sampleAlerts.filter(a => a.priority === 'critical').length
    };

    setAlertsData({
      activeAlerts: sampleAlerts,
      alertStats,
      alertHistory: sampleAlerts.slice().reverse(),
      alertsByType,
      alertsByPriority
    });
  }, []);

  const getFilteredAlerts = () => {
    let filtered = alertsData.activeAlerts;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(alert => alert.status === filterStatus);
    }
    
    if (filterPriority !== 'all') {
      filtered = filtered.filter(alert => alert.priority === filterPriority);
    }
    
    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: '#dc3545',
      high: '#fd7e14', 
      medium: '#ffc107',
      low: '#28a745'
    };
    return colors[priority] || '#6c757d';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#dc3545',
      acknowledged: '#ffc107',
      resolved: '#28a745',
      dismissed: '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  const getAlertIcon = (alertType) => {
    const icons = {
      threshold_breach: '⚠️',
      sudden_increase: '📈',
      critical_customer: '🚨',
      segment_change: '🔄'
    };
    return icons[alertType] || '🔔';
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        🚨 Churn Alerts & Notifications
      </h1>

      {/* Alert Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{ 
          backgroundColor: '#fff5f5', 
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '2px solid #fed7d7'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#c53030' }}>Active Alerts</h3>
          <p style={{ fontSize: '2.5em', margin: '0', color: '#dc3545', fontWeight: 'bold' }}>
            {alertsData.alertStats.active || 0}
          </p>
        </div>

        <div style={{ 
          backgroundColor: '#fff5f0', 
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '2px solid #fbd38d'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#c05621' }}>Critical Priority</h3>
          <p style={{ fontSize: '2.5em', margin: '0', color: '#fd7e14', fontWeight: 'bold' }}>
            {alertsData.alertStats.critical || 0}
          </p>
        </div>

        <div style={{ 
          backgroundColor: '#fffbf0', 
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '2px solid #f6e05e'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#b7791f' }}>Acknowledged</h3>
          <p style={{ fontSize: '2.5em', margin: '0', color: '#ffc107', fontWeight: 'bold' }}>
            {alertsData.alertStats.acknowledged || 0}
          </p>
        </div>

        <div style={{ 
          backgroundColor: '#f0fff4', 
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '2px solid #c6f6d5'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#276749' }}>Resolved</h3>
          <p style={{ fontSize: '2.5em', margin: '0', color: '#28a745', fontWeight: 'bold' }}>
            {alertsData.alertStats.resolved || 0}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '30px', 
        marginBottom: '30px' 
      }}>
        {/* Alerts by Type */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>
            Alerts by Type
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={alertsData.alertsByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, count }) => `${type}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {alertsData.alertsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts by Priority */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>
            Alerts by Priority
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={alertsData.alertsByPriority}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" name="Count">
                {alertsData.alertsByPriority.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '15px', 
        borderRadius: '8px', 
        border: '1px solid #dee2e6',
        marginBottom: '20px',
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontWeight: 'bold', color: '#333' }}>Filters:</span>
        
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
        </select>

        <select 
          value={filterPriority} 
          onChange={(e) => setFilterPriority(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <span style={{ marginLeft: 'auto', color: '#666', fontSize: '0.9em' }}>
          Showing {getFilteredAlerts().length} alerts
        </span>
      </div>

      {/* Alerts List */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        border: '1px solid #dee2e6'
      }}>
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid #dee2e6',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px 8px 0 0'
        }}>
          <h3 style={{ margin: '0', color: '#333' }}>Alert Management</h3>
        </div>

        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {getFilteredAlerts().length === 0 ? (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              color: '#666' 
            }}>
              <p style={{ fontSize: '1.2em', margin: '0' }}>No alerts found matching your filters</p>
            </div>
          ) : (
            getFilteredAlerts().map((alert) => (
              <div
                key={alert.id}
                style={{
                  padding: '20px',
                  borderBottom: '1px solid #f0f0f0',
                  borderLeft: `4px solid ${getPriorityColor(alert.priority)}`,
                  backgroundColor: alert.status === 'active' ? '#fff5f5' : 'white'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                      <span style={{ fontSize: '1.2em', marginRight: '8px' }}>
                        {getAlertIcon(alert.alert_type)}
                      </span>
                      <h4 style={{ margin: '0', color: '#333', fontSize: '1.1em' }}>
                        {alert.title}
                      </h4>
                    </div>
                    
                    <p style={{ margin: '5px 0', color: '#666', fontSize: '0.95em' }}>
                      {alert.message}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '15px', fontSize: '0.85em', color: '#666', marginTop: '8px' }}>
                      <span><strong>Customer:</strong> {alert.customer.name}</span>
                      <span><strong>Risk:</strong> {(alert.churn_probability * 100).toFixed(1)}%</span>
                      <span><strong>Change:</strong> {alert.probability_change > 0 ? '+' : ''}{(alert.probability_change * 100).toFixed(1)}%</span>
                      <span><strong>Time:</strong> {formatTimeAgo(alert.created_at)}</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75em',
                      fontWeight: 'bold',
                      backgroundColor: getPriorityColor(alert.priority),
                      color: 'white'
                    }}>
                      {alert.priority.toUpperCase()}
                    </span>
                    
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75em',
                      fontWeight: 'bold',
                      backgroundColor: getStatusColor(alert.status),
                      color: 'white'
                    }}>
                      {alert.status.toUpperCase()}
                    </span>
                    
                    {alert.email_sent && (
                      <span style={{ fontSize: '0.75em', color: '#28a745' }}>
                        ✓ Email Sent
                      </span>
                    )}
                  </div>
                </div>
                
                {alert.status === 'active' && (
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                    <button style={{
                      padding: '6px 12px',
                      backgroundColor: '#ffc107',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.85em',
                      cursor: 'pointer'
                    }}>
                      Acknowledge
                    </button>
                    <button style={{
                      padding: '6px 12px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.85em',
                      cursor: 'pointer'
                    }}>
                      Resolve
                    </button>
                    <button style={{
                      padding: '6px 12px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.85em',
                      cursor: 'pointer'
                    }}>
                      Contact Customer
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsDashboard;
