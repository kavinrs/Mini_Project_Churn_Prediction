import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import GaugeChart from 'react-gauge-chart';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalCustomers: 0,
    highRiskCustomers: 0,
    lowRiskCustomers: 0,
    riskDistribution: [],
    customerList: []
  });

  useEffect(() => {
    // Sample customer data for demonstration
    const sampleCustomers = [
      { id: 1, name: 'John Doe', churnProbability: 0.85, riskLevel: 'high' },
      { id: 2, name: 'Jane Smith', churnProbability: 0.25, riskLevel: 'low' },
      { id: 3, name: 'Mike Johnson', churnProbability: 0.65, riskLevel: 'high' },
      { id: 4, name: 'Sarah Wilson', churnProbability: 0.15, riskLevel: 'low' },
      { id: 5, name: 'David Brown', churnProbability: 0.45, riskLevel: 'high' },
      { id: 6, name: 'Lisa Davis', churnProbability: 0.20, riskLevel: 'low' },
      { id: 7, name: 'Tom Anderson', churnProbability: 0.75, riskLevel: 'high' },
      { id: 8, name: 'Emma Taylor', churnProbability: 0.10, riskLevel: 'low' },
      { id: 9, name: 'Chris Martinez', churnProbability: 0.55, riskLevel: 'high' },
      { id: 10, name: 'Amy Garcia', churnProbability: 0.30, riskLevel: 'low' }
    ];

    // Simulate data processing
    const threshold = 0.32;
    const highRisk = sampleCustomers.filter(customer => customer.churnProbability >= threshold);
    const lowRisk = sampleCustomers.filter(customer => customer.churnProbability < threshold);

    const riskDistribution = [
      { name: 'High Risk', value: highRisk.length, color: '#dc3545' },
      { name: 'Low Risk', value: lowRisk.length, color: '#28a745' }
    ];

    setDashboardData({
      totalCustomers: sampleCustomers.length,
      highRiskCustomers: highRisk.length,
      lowRiskCustomers: lowRisk.length,
      riskDistribution,
      customerList: sampleCustomers
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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        Churn Risk Dashboard
      </h1>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>Total Customers</h3>
          <p style={{ fontSize: '2em', margin: '0', color: '#007bff', fontWeight: 'bold' }}>
            {dashboardData.totalCustomers}
          </p>
        </div>

        <div style={{ 
          backgroundColor: '#f8d7da', 
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '1px solid #f5c6cb'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#721c24' }}>High Risk</h3>
          <p style={{ fontSize: '2em', margin: '0', color: '#dc3545', fontWeight: 'bold' }}>
            {dashboardData.highRiskCustomers}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#721c24' }}>
            ≥ 32% churn probability
          </p>
        </div>

        <div style={{ 
          backgroundColor: '#d4edda', 
          padding: '20px', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '1px solid #c3e6cb'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#155724' }}>Low Risk</h3>
          <p style={{ fontSize: '2em', margin: '0', color: '#28a745', fontWeight: 'bold' }}>
            {dashboardData.lowRiskCustomers}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#155724' }}>
            &lt; 32% churn probability
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
        {/* Gauge Chart */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #dee2e6',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>Risk Distribution Gauge</h3>
          <GaugeChart 
            id="risk-gauge"
            nrOfLevels={3}
            colors={['#28a745', '#ffc107', '#dc3545']}
            arcWidth={0.3}
            percent={gaugePercent}
            textColor="#333"
            formatTextValue={() => `${(gaugePercent * 100).toFixed(1)}% High Risk`}
          />
        </div>

        {/* Pie Chart */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>Risk Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dashboardData.riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer Heatmap */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        border: '1px solid #dee2e6',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#333' }}>Customer Risk Heatmap</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
          gap: '5px' 
        }}>
          {dashboardData.customerList.map((customer) => (
            <div
              key={customer.id}
              style={{
                backgroundColor: getRiskColor(customer.churnProbability),
                opacity: getRiskIntensity(customer.churnProbability),
                padding: '10px',
                borderRadius: '4px',
                textAlign: 'center',
                color: 'white',
                fontSize: '0.8em',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              title={`${customer.name}: ${(customer.churnProbability * 100).toFixed(1)}% churn risk`}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              {customer.name.split(' ').map(n => n[0]).join('')}
            </div>
          ))}
        </div>
        <div style={{ marginTop: '15px', fontSize: '0.9em', color: '#666' }}>
          <strong>Legend:</strong> Darker red = Higher churn risk | Green = Low risk | Hover for details
        </div>
      </div>

      {/* Customer Table */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#333' }}>Customer Risk Table</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                  Customer Name
                </th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>
                  Churn Probability
                </th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>
                  Risk Level
                </th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>
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
                    backgroundColor: customer.churnProbability >= 0.32 ? '#fff5f5' : '#f0fff4',
                    borderLeft: `4px solid ${customer.churnProbability >= 0.32 ? '#dc3545' : '#28a745'}`
                  }}
                >
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    {customer.name}
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    fontWeight: 'bold',
                    color: customer.churnProbability >= 0.32 ? '#dc3545' : '#28a745'
                  }}>
                    {(customer.churnProbability * 100).toFixed(1)}%
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8em',
                      fontWeight: 'bold',
                      backgroundColor: customer.churnProbability >= 0.32 ? '#dc3545' : '#28a745',
                      color: 'white'
                    }}>
                      {customer.churnProbability >= 0.32 ? 'HIGH RISK' : 'LOW RISK'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                    {customer.churnProbability >= 0.8 ? '🚨 Critical' :
                     customer.churnProbability >= 0.5 ? '⚠️ Monitor' :
                     customer.churnProbability >= 0.32 ? '📧 Engage' : '✅ Stable'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
