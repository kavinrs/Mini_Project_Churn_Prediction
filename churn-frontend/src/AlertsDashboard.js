import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { theme } from './theme';
import Card from './components/UI/Card';
import Button from './components/UI/Button';
import MetricCard from './components/UI/MetricCard';
import LoadingSpinner from './components/UI/LoadingSpinner';

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
    <div style={{ padding: '0', fontFamily: theme.typography.fontFamily, background: 'transparent' }}>
      <Card variant="gradient" padding="large" style={{ textAlign: 'center', marginBottom: theme.spacing.xl }}>
        <h1 style={{ 
          margin: '0',
          fontSize: theme.typography.sizes.xxl,
          fontWeight: theme.typography.weights.bold,
          color: theme.colors.text.primary,
          textShadow: theme.effects.textShadow
        }}>
          🚨 Smart Alerts & Notifications
        </h1>
        <p style={{
          margin: `${theme.spacing.md} 0 0 0`,
          fontSize: theme.typography.sizes.lg,
          opacity: 0.9,
          fontWeight: theme.typography.weights.medium,
          color: theme.colors.text.secondary
        }}>
          Real-time churn risk monitoring and intelligent alerting system
        </p>
      </Card>

      {/* Alert Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: theme.spacing.xl, 
        marginBottom: theme.spacing.xl 
      }}>
        <MetricCard
          title="Active Alerts"
          value={alertsData.alertStats.active || 0}
          icon="🚨"
          trend={null}
          color={theme.colors.error[500]}
        />
        <MetricCard
          title="Critical"
          value={alertsData.alertStats.critical || 0}
          icon="⚠️"
          trend={null}
          color={theme.colors.warning[500]}
        />
        <MetricCard
          title="Acknowledged"
          value={alertsData.alertStats.acknowledged || 0}
          icon="✅"
          trend={null}
          color={theme.colors.info[500]}
        />
        <MetricCard
          title="Resolved"
          value={alertsData.alertStats.resolved || 0}
          icon="🎯"
          trend={null}
          color={theme.colors.success[500]}
        />
      </div>

      {/* Charts Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
        gap: theme.spacing.xl, 
        marginBottom: theme.spacing.xl 
      }}>
        {/* Alerts by Type */}
        <Card variant="glass" padding="large">
          <h3 style={{ 
            marginBottom: theme.spacing.lg, 
            color: theme.colors.text.primary, 
            textAlign: 'center', 
            fontSize: theme.typography.sizes.xl, 
            fontWeight: theme.typography.weights.bold 
          }}>
            📊 Alerts by Type
          </h3>
          <div style={{
            background: theme.colors.background.card,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.md,
            backdropFilter: 'blur(10px)'
          }}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={alertsData.alertsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, count }) => `${type}: ${count}`}
                  outerRadius={90}
                  innerRadius={30}
                  fill="#8884d8"
                  dataKey="count"
                  stroke={theme.colors.background.primary}
                  strokeWidth={3}
                >
                  {alertsData.alertsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Alerts by Priority */}
        <Card variant="glass" padding="large">
          <h3 style={{ 
            marginBottom: theme.spacing.lg, 
            color: theme.colors.text.primary, 
            textAlign: 'center', 
            fontSize: theme.typography.sizes.xl, 
            fontWeight: theme.typography.weights.bold 
          }}>
            🎯 Alerts by Priority
          </h3>
          <div style={{
            background: theme.colors.background.card,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.md,
            backdropFilter: 'blur(10px)'
          }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={alertsData.alertsByPriority}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.neutral[200]} />
                <XAxis dataKey="priority" stroke={theme.colors.text.secondary} />
                <YAxis stroke={theme.colors.text.secondary} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme.colors.background.card,
                    border: `1px solid ${theme.colors.neutral[200]}`,
                    borderRadius: theme.borderRadius.md
                  }}
                />
                <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}>
                  {alertsData.alertsByPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card variant="gradient" padding="medium" style={{ marginBottom: theme.spacing.xl }}>
        <div style={{
          display: 'flex',
          gap: theme.spacing.lg,
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <span style={{ 
            fontWeight: theme.typography.weights.bold, 
            color: theme.colors.text.primary, 
            fontSize: theme.typography.sizes.lg 
          }}>
            🔍 Filters:
          </span>
          
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ 
              ...theme.components.input.base,
              minWidth: '140px'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>

          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{ 
              ...theme.components.input.base,
              minWidth: '140px'
            }}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <span style={{ 
            marginLeft: 'auto', 
            color: theme.colors.text.secondary, 
            fontSize: theme.typography.sizes.base, 
            fontWeight: theme.typography.weights.medium 
          }}>
            Showing {getFilteredAlerts().length} alerts
          </span>
        </div>
      </Card>

      {/* Alerts List */}
      <Card variant="glass" padding="none">
        <div style={{ 
          padding: theme.spacing.xl, 
          borderBottom: `2px solid ${theme.colors.neutral[200]}`,
          background: theme.colors.gradients.primary,
          borderRadius: `${theme.borderRadius.xl} ${theme.borderRadius.xl} 0 0`,
          color: theme.colors.text.primary
        }}>
          <h3 style={{ 
            margin: '0', 
            fontSize: theme.typography.sizes.xl, 
            fontWeight: theme.typography.weights.bold 
          }}>
            📋 Alert Management Center
          </h3>
        </div>

        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {getFilteredAlerts().length === 0 ? (
            <div style={{ 
              padding: theme.spacing.xxl, 
              textAlign: 'center', 
              color: theme.colors.text.secondary,
              background: theme.colors.background.card,
              margin: theme.spacing.lg,
              borderRadius: theme.borderRadius.lg
            }}>
              <div style={{ fontSize: '3rem', marginBottom: theme.spacing.md }}>🔍</div>
              <p style={{ 
                fontSize: theme.typography.sizes.lg, 
                margin: '0', 
                fontWeight: theme.typography.weights.semibold 
              }}>
                No alerts found matching your filters
              </p>
            </div>
          ) : (
            getFilteredAlerts().map((alert) => (
              <div
                key={alert.id}
                style={{
                  padding: theme.spacing.lg,
                  margin: theme.spacing.md,
                  borderRadius: theme.borderRadius.lg,
                  background: alert.status === 'active' 
                    ? `linear-gradient(135deg, ${theme.colors.error[500]}15 0%, ${theme.colors.background.card} 100%)`
                    : theme.colors.background.card,
                  boxShadow: theme.effects.shadow.medium,
                  border: `3px solid ${getPriorityColor(alert.priority)}`,
                  transform: 'translateY(0)',
                  transition: theme.animation.transition
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = theme.effects.shadow.large;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = theme.effects.shadow.medium;
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start', 
                  marginBottom: theme.spacing.sm 
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: theme.spacing.xs 
                    }}>
                      <span style={{ 
                        fontSize: theme.typography.sizes.lg, 
                        marginRight: theme.spacing.xs 
                      }}>
                        {getAlertIcon(alert.alert_type)}
                      </span>
                      <h4 style={{ 
                        margin: '0', 
                        color: theme.colors.text.primary, 
                        fontSize: theme.typography.sizes.base,
                        fontWeight: theme.typography.weights.semibold
                      }}>
                        {alert.title}
                      </h4>
                    </div>
                    
                    <p style={{ 
                      margin: `${theme.spacing.xs} 0`, 
                      color: theme.colors.text.secondary, 
                      fontSize: theme.typography.sizes.sm 
                    }}>
                      {alert.message}
                    </p>
                    
                    <div style={{ 
                      display: 'flex', 
                      gap: theme.spacing.md, 
                      fontSize: theme.typography.sizes.xs, 
                      color: theme.colors.text.secondary, 
                      marginTop: theme.spacing.xs,
                      flexWrap: 'wrap'
                    }}>
                      <span><strong>Customer:</strong> {alert.customer.name}</span>
                      <span><strong>Risk:</strong> {(alert.churn_probability * 100).toFixed(1)}%</span>
                      <span><strong>Change:</strong> {alert.probability_change > 0 ? '+' : ''}{(alert.probability_change * 100).toFixed(1)}%</span>
                      <span><strong>Time:</strong> {formatTimeAgo(alert.created_at)}</span>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-end', 
                    gap: theme.spacing.xs 
                  }}>
                    <span style={{
                      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                      borderRadius: theme.borderRadius.full,
                      fontSize: theme.typography.sizes.xs,
                      fontWeight: theme.typography.weights.bold,
                      backgroundColor: getPriorityColor(alert.priority),
                      color: theme.colors.text.primary
                    }}>
                      {alert.priority.toUpperCase()}
                    </span>
                    
                    <span style={{
                      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                      borderRadius: theme.borderRadius.full,
                      fontSize: theme.typography.sizes.xs,
                      fontWeight: theme.typography.weights.bold,
                      backgroundColor: getStatusColor(alert.status),
                      color: theme.colors.text.primary
                    }}>
                      {alert.status.toUpperCase()}
                    </span>
                    
                    {alert.email_sent && (
                      <span style={{ 
                        fontSize: theme.typography.sizes.xs, 
                        color: theme.colors.success[500] 
                      }}>
                        ✓ Email Sent
                      </span>
                    )}
                  </div>
                </div>
                
                {alert.status === 'active' && (
                  <div style={{ 
                    marginTop: theme.spacing.md, 
                    display: 'flex', 
                    gap: theme.spacing.sm,
                    flexWrap: 'wrap'
                  }}>
                    <Button 
                      variant="warning" 
                      size="small"
                      onClick={() => console.log('Acknowledge alert', alert.id)}
                    >
                      ✅ Acknowledge
                    </Button>
                    <Button 
                      variant="success" 
                      size="small"
                      onClick={() => console.log('Resolve alert', alert.id)}
                    >
                      Resolve
                    </Button>
                    <Button 
                      variant="primary" 
                      size="small"
                      onClick={() => console.log('Contact customer', alert.customer.name)}
                    >
                      📞 Contact Customer
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default AlertsDashboard;
