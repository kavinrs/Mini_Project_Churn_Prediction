import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Area, AreaChart } from 'recharts';
import GaugeChart from 'react-gauge-chart';
import { theme } from './theme';
import Card from './components/UI/Card';
import MetricCard from './components/UI/MetricCard';
import Button from './components/UI/Button';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalCustomers: 0,
    highRiskCustomers: 0,
    lowRiskCustomers: 0,
    riskDistribution: [],
    customerList: []
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [viewMode, setViewMode] = useState('overview');

  useEffect(() => {
    // Enhanced sample customer data for demonstration
    const sampleCustomers = [
      { id: 1, name: 'John Doe', churnProbability: 0.85, riskLevel: 'critical', segment: 'High Value', lastActivity: '2 days ago', revenue: 15420 },
      { id: 2, name: 'Jane Smith', churnProbability: 0.25, riskLevel: 'low', segment: 'Loyal', lastActivity: '1 hour ago', revenue: 8750 },
      { id: 3, name: 'Mike Johnson', churnProbability: 0.65, riskLevel: 'high', segment: 'At Risk', lastActivity: '5 days ago', revenue: 12300 },
      { id: 4, name: 'Sarah Wilson', churnProbability: 0.15, riskLevel: 'low', segment: 'Champion', lastActivity: '30 min ago', revenue: 22100 },
      { id: 5, name: 'David Brown', churnProbability: 0.45, riskLevel: 'medium', segment: 'Potential', lastActivity: '3 days ago', revenue: 6800 },
      { id: 6, name: 'Lisa Davis', churnProbability: 0.20, riskLevel: 'low', segment: 'Loyal', lastActivity: '2 hours ago', revenue: 9500 },
      { id: 7, name: 'Tom Anderson', churnProbability: 0.75, riskLevel: 'high', segment: 'Critical', lastActivity: '1 week ago', revenue: 18900 },
      { id: 8, name: 'Emma Taylor', churnProbability: 0.10, riskLevel: 'low', segment: 'Champion', lastActivity: '15 min ago', revenue: 31200 },
      { id: 9, name: 'Chris Martinez', churnProbability: 0.55, riskLevel: 'medium', segment: 'At Risk', lastActivity: '4 days ago', revenue: 7600 },
      { id: 10, name: 'Amy Garcia', churnProbability: 0.30, riskLevel: 'low', segment: 'Stable', lastActivity: '1 day ago', revenue: 11400 },
      { id: 11, name: 'Robert Chen', churnProbability: 0.92, riskLevel: 'critical', segment: 'Critical', lastActivity: '2 weeks ago', revenue: 25600 },
      { id: 12, name: 'Maria Rodriguez', churnProbability: 0.18, riskLevel: 'low', segment: 'Champion', lastActivity: '45 min ago', revenue: 19800 }
    ];

    // Enhanced data processing
    const threshold = 0.32;
    const criticalRisk = sampleCustomers.filter(customer => customer.churnProbability >= 0.7);
    const highRisk = sampleCustomers.filter(customer => customer.churnProbability >= threshold && customer.churnProbability < 0.7);
    const mediumRisk = sampleCustomers.filter(customer => customer.churnProbability >= 0.2 && customer.churnProbability < threshold);
    const lowRisk = sampleCustomers.filter(customer => customer.churnProbability < 0.2);

    const riskDistribution = [
      { name: 'Critical Risk', value: criticalRisk.length, color: theme.colors.error[600], percentage: (criticalRisk.length / sampleCustomers.length * 100).toFixed(1) },
      { name: 'High Risk', value: highRisk.length, color: theme.colors.warning[500], percentage: (highRisk.length / sampleCustomers.length * 100).toFixed(1) },
      { name: 'Medium Risk', value: mediumRisk.length, color: theme.colors.primary[400], percentage: (mediumRisk.length / sampleCustomers.length * 100).toFixed(1) },
      { name: 'Low Risk', value: lowRisk.length, color: theme.colors.success[500], percentage: (lowRisk.length / sampleCustomers.length * 100).toFixed(1) }
    ];

    // Trend data for charts
    const trendData = [
      { period: 'Week 1', highRisk: 8, mediumRisk: 12, lowRisk: 25, revenue: 145000 },
      { period: 'Week 2', highRisk: 6, mediumRisk: 15, lowRisk: 28, revenue: 152000 },
      { period: 'Week 3', highRisk: 9, mediumRisk: 11, lowRisk: 22, revenue: 138000 },
      { period: 'Week 4', highRisk: 7, mediumRisk: 13, lowRisk: 30, revenue: 168000 },
    ];

    const segmentData = [
      { segment: 'Champions', count: 4, avgRevenue: 23575, churnRate: 12 },
      { segment: 'Loyal', count: 2, avgRevenue: 9125, churnRate: 22 },
      { segment: 'At Risk', count: 2, avgRevenue: 9950, churnRate: 60 },
      { segment: 'Critical', count: 2, avgRevenue: 22250, churnRate: 83 },
      { segment: 'Potential', count: 1, avgRevenue: 6800, churnRate: 45 },
      { segment: 'Stable', count: 1, avgRevenue: 11400, churnRate: 30 }
    ];

    setDashboardData({
      totalCustomers: sampleCustomers.length,
      criticalRiskCustomers: criticalRisk.length,
      highRiskCustomers: highRisk.length + criticalRisk.length,
      mediumRiskCustomers: mediumRisk.length,
      lowRiskCustomers: lowRisk.length,
      riskDistribution,
      customerList: sampleCustomers,
      trendData,
      segmentData,
      totalRevenue: sampleCustomers.reduce((sum, customer) => sum + customer.revenue, 0),
      avgChurnRate: (sampleCustomers.reduce((sum, customer) => sum + customer.churnProbability, 0) / sampleCustomers.length * 100).toFixed(1)
    });
  }, []);

  const getRiskColor = (probability) => {
    if (probability >= 0.8) return '#8B0000'; // Dark red
    if (probability >= 0.6) return '#DC143C'; // Crimson
    if (probability >= 0.4) return '#FF6347'; // Tomato
    if (probability >= 0.32) return '#FFA500'; // Orange
    return '#32CD32'; // Lime green
  };

  const getRiskIntensity = (probability) => {
    return Math.min(probability * 1.2, 1); // Scale for better visual effect
  };

  const gaugePercent = dashboardData.totalCustomers > 0 
    ? dashboardData.highRiskCustomers / dashboardData.totalCustomers 
    : 0;

  return (
    <div style={{ maxWidth: '1400px', margin: 'auto' }}>
      {/* Header Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
      }}>
        <h2 style={{
          margin: 0,
          fontSize: theme.typography.fontSize['3xl'],
          fontWeight: theme.typography.fontWeight.bold,
          background: theme.gradients.secondary,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: theme.spacing.sm,
        }}>
          📊 Risk Intelligence Dashboard
        </h2>
        <p style={{
          margin: 0,
          fontSize: theme.typography.fontSize.lg,
          color: theme.colors.neutral[600],
          fontWeight: theme.typography.fontWeight.medium,
        }}>
          Real-time customer churn risk analytics and predictive insights
        </p>
      </div>

      {/* Control Panel */}
      <Card variant="glass" padding="md" style={{ marginBottom: theme.spacing.xl }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: theme.spacing.md,
        }}>
          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            <Button
              variant={viewMode === 'overview' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('overview')}
            >
              📈 Overview
            </Button>
            <Button
              variant={viewMode === 'trends' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('trends')}
            >
              📊 Trends
            </Button>
            <Button
              variant={viewMode === 'segments' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('segments')}
            >
              🎯 Segments
            </Button>
          </div>
          
          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            {['7d', '30d', '90d'].map((period) => (
              <Button
                key={period}
                variant={selectedTimeframe === period ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTimeframe(period)}
              >
                {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
      }}>
        <MetricCard
          title="Total Customers"
          value={dashboardData.totalCustomers}
          subtitle="Active customer base"
          icon="👥"
          color="primary"
          trend={5.2}
        />
        <MetricCard
          title="High Risk Customers"
          value={dashboardData.highRiskCustomers}
          subtitle={`${dashboardData.totalCustomers > 0 ? ((dashboardData.highRiskCustomers / dashboardData.totalCustomers) * 100).toFixed(1) : 0}% of total`}
          icon="🚨"
          color="error"
          trend={-2.1}
        />
        <MetricCard
          title="Average Churn Rate"
          value={`${dashboardData.avgChurnRate}%`}
          subtitle="Across all segments"
          icon="📈"
          color="warning"
          trend={-1.8}
        />
        <MetricCard
          title="Total Revenue"
          value={`$${dashboardData.totalRevenue ? (dashboardData.totalRevenue / 1000).toFixed(0) : 0}K`}
          subtitle="Customer lifetime value"
          icon="💰"
          color="success"
          trend={8.4}
        />
      </div>

      {viewMode === 'overview' && (
        <>
          {/* Charts Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: theme.spacing.xl,
            marginBottom: theme.spacing.xl,
          }}>
            {/* Risk Distribution Pie Chart */}
            <Card variant="glass" padding="xl">
              <h3 style={{
                margin: `0 0 ${theme.spacing.lg} 0`,
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.neutral[800],
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
              }}>
                🎯 Risk Distribution
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={dashboardData.riskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={120}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="none"
                  >
                    {dashboardData.riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} customers`, name]}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: theme.borderRadius.lg,
                      boxShadow: theme.shadows.lg,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Gauge Chart */}
            <Card variant="glass" padding="xl">
              <h3 style={{
                margin: `0 0 ${theme.spacing.lg} 0`,
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.neutral[800],
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
              }}>
                ⚡ Risk Intensity Gauge
              </h3>
              <div style={{ textAlign: 'center' }}>
                <GaugeChart 
                  id="risk-gauge"
                  nrOfLevels={4}
                  colors={[theme.colors.success[400], theme.colors.primary[400], theme.colors.warning[400], theme.colors.error[500]]}
                  arcWidth={0.3}
                  percent={gaugePercent}
                  textColor={theme.colors.neutral[700]}
                  formatTextValue={() => `${(gaugePercent * 100).toFixed(1)}%`}
                  needleColor={theme.colors.neutral[600]}
                  needleBaseColor={theme.colors.neutral[500]}
                />
                <p style={{
                  margin: `${theme.spacing.md} 0 0 0`,
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.neutral[600],
                  fontWeight: theme.typography.fontWeight.medium,
                }}>
                  High Risk Customer Percentage
                </p>
              </div>
            </Card>
          </div>

          {/* Customer Risk Heatmap */}
          <Card variant="glass" padding="xl" style={{ marginBottom: theme.spacing.xl }}>
            <h3 style={{
              margin: `0 0 ${theme.spacing.lg} 0`,
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.neutral[800],
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
            }}>
              🔥 Customer Risk Heatmap
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: theme.spacing.sm,
              marginBottom: theme.spacing.lg,
            }}>
              {dashboardData.customerList.map((customer) => (
                <div
                  key={customer.id}
                  style={{
                    backgroundColor: getRiskColor(customer.churnProbability),
                    opacity: getRiskIntensity(customer.churnProbability),
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.md,
                    textAlign: 'center',
                    color: 'white',
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    cursor: 'pointer',
                    transition: `transform ${theme.animation.duration.normal} ${theme.animation.easing.default}`,
                    boxShadow: theme.shadows.sm,
                  }}
                  title={`${customer.name}: ${(customer.churnProbability * 100).toFixed(1)}% churn risk`}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = theme.shadows.lg;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = theme.shadows.sm;
                  }}
                >
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </div>
              ))}
            </div>
            <div style={{
              padding: theme.spacing.md,
              background: `${theme.colors.neutral[100]}80`,
              borderRadius: theme.borderRadius.lg,
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.neutral[600],
              textAlign: 'center',
            }}>
              <strong>Legend:</strong> Darker red = Higher churn risk | Green = Low risk | Hover for details
            </div>
          </Card>
        </>
      )}

      {viewMode === 'trends' && (
        <Card variant="glass" padding="xl" style={{ marginBottom: theme.spacing.xl }}>
          <h3 style={{
            margin: `0 0 ${theme.spacing.lg} 0`,
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.neutral[800],
          }}>
            📈 Risk Trends Over Time
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={dashboardData.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.neutral[200]} />
              <XAxis 
                dataKey="period" 
                stroke={theme.colors.neutral[600]}
                fontSize={12}
              />
              <YAxis 
                stroke={theme.colors.neutral[600]}
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: theme.borderRadius.lg,
                  boxShadow: theme.shadows.lg,
                }}
              />
              <Area 
                type="monotone" 
                dataKey="highRisk" 
                stackId="1"
                stroke={theme.colors.error[500]} 
                fill={theme.colors.error[400]}
                name="High Risk"
              />
              <Area 
                type="monotone" 
                dataKey="mediumRisk" 
                stackId="1"
                stroke={theme.colors.warning[500]} 
                fill={theme.colors.warning[400]}
                name="Medium Risk"
              />
              <Area 
                type="monotone" 
                dataKey="lowRisk" 
                stackId="1"
                stroke={theme.colors.success[500]} 
                fill={theme.colors.success[400]}
                name="Low Risk"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {viewMode === 'segments' && (
        <Card variant="glass" padding="xl" style={{ marginBottom: theme.spacing.xl }}>
          <h3 style={{
            margin: `0 0 ${theme.spacing.lg} 0`,
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.neutral[800],
          }}>
            🎯 Customer Segment Analysis
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dashboardData.segmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.neutral[200]} />
              <XAxis 
                dataKey="segment" 
                stroke={theme.colors.neutral[600]}
                fontSize={12}
              />
              <YAxis 
                stroke={theme.colors.neutral[600]}
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: theme.borderRadius.lg,
                  boxShadow: theme.shadows.lg,
                }}
              />
              <Bar 
                dataKey="churnRate" 
                fill={theme.colors.primary[500]}
                name="Churn Rate (%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Enhanced Customer Table */}
      <Card variant="glass" padding="xl">
        <h3 style={{
          margin: `0 0 ${theme.spacing.lg} 0`,
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.neutral[800],
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm,
        }}>
          📋 Customer Risk Analysis
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'separate', 
            borderSpacing: `0 ${theme.spacing.xs}`,
          }}>
            <thead>
              <tr>
                <th style={{
                  padding: theme.spacing.md,
                  textAlign: 'left',
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.neutral[700],
                  borderBottom: `2px solid ${theme.colors.neutral[200]}`,
                }}>
                  Customer
                </th>
                <th style={{
                  padding: theme.spacing.md,
                  textAlign: 'center',
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.neutral[700],
                  borderBottom: `2px solid ${theme.colors.neutral[200]}`,
                }}>
                  Churn Risk
                </th>
                <th style={{
                  padding: theme.spacing.md,
                  textAlign: 'center',
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.neutral[700],
                  borderBottom: `2px solid ${theme.colors.neutral[200]}`,
                }}>
                  Segment
                </th>
                <th style={{
                  padding: theme.spacing.md,
                  textAlign: 'center',
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.neutral[700],
                  borderBottom: `2px solid ${theme.colors.neutral[200]}`,
                }}>
                  Revenue
                </th>
                <th style={{
                  padding: theme.spacing.md,
                  textAlign: 'center',
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.neutral[700],
                  borderBottom: `2px solid ${theme.colors.neutral[200]}`,
                }}>
                  Last Activity
                </th>
                <th style={{
                  padding: theme.spacing.md,
                  textAlign: 'center',
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.neutral[700],
                  borderBottom: `2px solid ${theme.colors.neutral[200]}`,
                }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.customerList
                .sort((a, b) => b.churnProbability - a.churnProbability)
                .map((customer) => (
                <tr 
                  key={customer.id}
                  style={{
                    backgroundColor: customer.churnProbability >= 0.7 ? `${theme.colors.error[50]}95` :
                                   customer.churnProbability >= 0.32 ? `${theme.colors.warning[50]}95` :
                                   `${theme.colors.success[50]}95`,
                    borderLeft: `4px solid ${
                      customer.churnProbability >= 0.7 ? theme.colors.error[500] :
                      customer.churnProbability >= 0.32 ? theme.colors.warning[500] :
                      theme.colors.success[500]
                    }`,
                    transition: `all ${theme.animation.duration.normal} ${theme.animation.easing.default}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = customer.churnProbability >= 0.7 ? `${theme.colors.error[100]}95` :
                                                         customer.churnProbability >= 0.32 ? `${theme.colors.warning[100]}95` :
                                                         `${theme.colors.success[100]}95`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = customer.churnProbability >= 0.7 ? `${theme.colors.error[50]}95` :
                                                         customer.churnProbability >= 0.32 ? `${theme.colors.warning[50]}95` :
                                                         `${theme.colors.success[50]}95`;
                  }}
                >
                  <td style={{
                    padding: theme.spacing.md,
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.neutral[800],
                  }}>
                    {customer.name}
                  </td>
                  <td style={{
                    padding: theme.spacing.md,
                    textAlign: 'center',
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: customer.churnProbability >= 0.7 ? theme.colors.error[700] :
                           customer.churnProbability >= 0.32 ? theme.colors.warning[700] :
                           theme.colors.success[700],
                  }}>
                    {(customer.churnProbability * 100).toFixed(1)}%
                  </td>
                  <td style={{
                    padding: theme.spacing.md,
                    textAlign: 'center',
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.neutral[600],
                  }}>
                    <span style={{
                      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                      borderRadius: theme.borderRadius.full,
                      fontSize: theme.typography.fontSize.xs,
                      fontWeight: theme.typography.fontWeight.semibold,
                      backgroundColor: `${theme.colors.primary[100]}80`,
                      color: theme.colors.primary[700],
                    }}>
                      {customer.segment}
                    </span>
                  </td>
                  <td style={{
                    padding: theme.spacing.md,
                    textAlign: 'center',
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.neutral[700],
                    fontFamily: theme.typography.fontFamily.mono,
                  }}>
                    ${customer.revenue.toLocaleString()}
                  </td>
                  <td style={{
                    padding: theme.spacing.md,
                    textAlign: 'center',
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.neutral[600],
                  }}>
                    {customer.lastActivity}
                  </td>
                  <td style={{
                    padding: theme.spacing.md,
                    textAlign: 'center',
                    fontSize: theme.typography.fontSize.sm,
                  }}>
                    {customer.churnProbability >= 0.8 ? '🚨 Critical' :
                     customer.churnProbability >= 0.5 ? '⚠️ Monitor' :
                     customer.churnProbability >= 0.32 ? '📧 Engage' : '✅ Stable'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
