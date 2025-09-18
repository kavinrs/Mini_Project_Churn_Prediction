import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

const CustomerSegmentation = () => {
  const [segmentData, setSegmentData] = useState({
    segments: [],
    segmentDistribution: [],
    customersBySegment: {},
    totalCustomers: 0
  });
  
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [filterCriteria, setFilterCriteria] = useState('all');

  // Enhanced sample data with segmentation
  const sampleCustomersWithSegments = [
    // Segment 1: Critical - High Risk, High Value
    { id: 1, name: 'John Doe', churnProbability: 0.85, valueScore: 18.5, segment: 1, tenure: 24, orderCount: 45, cashbackAmount: 2500 },
    { id: 2, name: 'Sarah Chen', churnProbability: 0.72, valueScore: 16.2, segment: 1, tenure: 18, orderCount: 38, cashbackAmount: 2200 },
    
    // Segment 2: Selective - High Risk, Lower Value
    { id: 3, name: 'Mike Johnson', churnProbability: 0.65, valueScore: 6.8, segment: 2, tenure: 8, orderCount: 12, cashbackAmount: 450 },
    { id: 4, name: 'Lisa Wang', churnProbability: 0.58, valueScore: 7.2, segment: 2, tenure: 6, orderCount: 15, cashbackAmount: 380 },
    { id: 5, name: 'David Brown', churnProbability: 0.45, valueScore: 5.1, segment: 2, tenure: 4, orderCount: 8, cashbackAmount: 220 },
    
    // Segment 3: Champions - Low Risk, High Loyalty
    { id: 6, name: 'Emma Taylor', churnProbability: 0.15, valueScore: 19.8, segment: 3, tenure: 36, orderCount: 52, cashbackAmount: 3200 },
    { id: 7, name: 'Robert Kim', churnProbability: 0.08, valueScore: 17.4, segment: 3, tenure: 28, orderCount: 41, cashbackAmount: 2800 },
    { id: 8, name: 'Maria Garcia', churnProbability: 0.22, valueScore: 15.6, segment: 3, tenure: 22, orderCount: 35, cashbackAmount: 2100 },
    
    // Segment 4: Growth - Stable with Potential
    { id: 9, name: 'Chris Martinez', churnProbability: 0.18, valueScore: 8.9, segment: 4, tenure: 10, orderCount: 18, cashbackAmount: 650 },
    { id: 10, name: 'Amy Wilson', churnProbability: 0.12, valueScore: 9.2, segment: 4, tenure: 12, orderCount: 22, cashbackAmount: 720 },
    { id: 11, name: 'Tom Anderson', churnProbability: 0.25, valueScore: 7.8, segment: 4, tenure: 8, orderCount: 16, cashbackAmount: 580 },
    { id: 12, name: 'Jane Smith', churnProbability: 0.20, valueScore: 8.5, segment: 4, tenure: 14, orderCount: 20, cashbackAmount: 690 }
  ];

  const segmentDefinitions = {
    1: {
      name: "Critical - High Risk, High Value",
      icon: "🚨",
      color: "#dc3545",
      priority: "Critical",
      strategy: "Immediate intervention with premium retention offers",
      budgetAllocation: "High"
    },
    2: {
      name: "Selective - High Risk, Lower Value", 
      icon: "⚠️",
      color: "#fd7e14",
      priority: "Medium",
      strategy: "Cost-effective retention with automated campaigns",
      budgetAllocation: "Low-Medium"
    },
    3: {
      name: "Champions - Low Risk, High Loyalty",
      icon: "👑", 
      color: "#28a745",
      priority: "Low",
      strategy: "Reward loyalty and encourage advocacy",
      budgetAllocation: "Medium"
    },
    4: {
      name: "Growth - Stable with Potential",
      icon: "📈",
      color: "#17a2b8", 
      priority: "Low",
      strategy: "Nurture growth and engagement",
      budgetAllocation: "Low"
    }
  };

  useEffect(() => {
    // Process segmentation data
    const segmentCounts = {};
    const customersBySegment = {};
    
    sampleCustomersWithSegments.forEach(customer => {
      const segmentId = customer.segment;
      segmentCounts[segmentId] = (segmentCounts[segmentId] || 0) + 1;
      
      if (!customersBySegment[segmentId]) {
        customersBySegment[segmentId] = [];
      }
      customersBySegment[segmentId].push(customer);
    });

    const segmentDistribution = Object.keys(segmentDefinitions).map(segmentId => ({
      segment: segmentDefinitions[segmentId].name,
      count: segmentCounts[segmentId] || 0,
      color: segmentDefinitions[segmentId].color,
      icon: segmentDefinitions[segmentId].icon
    }));

    setSegmentData({
      segments: Object.keys(segmentDefinitions).map(id => ({
        id: parseInt(id),
        ...segmentDefinitions[id],
        count: segmentCounts[id] || 0
      })),
      segmentDistribution,
      customersBySegment,
      totalCustomers: sampleCustomersWithSegments.length
    });
  }, []);

  const getFilteredCustomers = () => {
    let customers = sampleCustomersWithSegments;
    
    if (selectedSegment !== 'all') {
      customers = customers.filter(c => c.segment === parseInt(selectedSegment));
    }
    
    if (filterCriteria === 'high-risk') {
      customers = customers.filter(c => c.churnProbability >= 0.32);
    } else if (filterCriteria === 'high-value') {
      customers = customers.filter(c => c.valueScore >= 15);
    } else if (filterCriteria === 'critical') {
      customers = customers.filter(c => c.segment === 1);
    }
    
    return customers;
  };

  const scatterData = sampleCustomersWithSegments.map(customer => ({
    x: customer.churnProbability * 100,
    y: customer.valueScore,
    segment: customer.segment,
    name: customer.name,
    color: segmentDefinitions[customer.segment].color
  }));

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        Customer Segmentation & Clustering
      </h1>

      {/* Segment Overview Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        {segmentData.segments.map(segment => (
          <div key={segment.id} style={{ 
            backgroundColor: 'white',
            padding: '20px', 
            borderRadius: '8px', 
            border: `3px solid ${segment.color}`,
            cursor: 'pointer',
            transition: 'transform 0.2s',
            boxShadow: selectedSegment === segment.id.toString() ? `0 4px 12px ${segment.color}40` : '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onClick={() => setSelectedSegment(selectedSegment === segment.id.toString() ? 'all' : segment.id.toString())}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '2em', marginRight: '10px' }}>{segment.icon}</span>
              <div>
                <h3 style={{ margin: '0', color: segment.color, fontSize: '1.1em' }}>
                  {segment.name}
                </h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#666' }}>
                  {segment.count} customers
                </p>
              </div>
            </div>
            
            <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '10px' }}>
              <strong>Strategy:</strong> {segment.strategy}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8em' }}>
              <span style={{ 
                padding: '4px 8px', 
                backgroundColor: segment.color, 
                color: 'white', 
                borderRadius: '12px',
                fontWeight: 'bold'
              }}>
                {segment.priority} Priority
              </span>
              <span style={{ color: '#666' }}>
                Budget: {segment.budgetAllocation}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '30px', 
        marginBottom: '30px' 
      }}>
        {/* Segment Distribution Pie Chart */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>
            Customer Segment Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={segmentData.segmentDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ segment, count, percent }) => `${count} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {segmentData.segmentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [
                `${value} customers`, 
                `${props.payload.icon} ${props.payload.segment}`
              ]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Risk vs Value Scatter Plot */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>
            Risk vs Value Matrix
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Churn Risk" 
                unit="%" 
                domain={[0, 100]}
                label={{ value: 'Churn Probability (%)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Value Score" 
                domain={[0, 25]}
                label={{ value: 'Customer Value Score', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value, name) => [
                  name === 'Churn Risk' ? `${value}%` : value,
                  name === 'Churn Risk' ? 'Churn Probability' : 'Value Score'
                ]}
                labelFormatter={(label, payload) => 
                  payload && payload[0] ? `Customer: ${payload[0].payload.name}` : ''
                }
              />
              <Scatter data={scatterData} fill="#8884d8">
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '10px', fontSize: '0.8em', color: '#666', textAlign: 'center' }}>
            Threshold line at 32% churn probability
          </div>
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
          value={selectedSegment} 
          onChange={(e) => setSelectedSegment(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="all">All Segments</option>
          {segmentData.segments.map(segment => (
            <option key={segment.id} value={segment.id}>
              {segment.icon} {segment.name}
            </option>
          ))}
        </select>

        <select 
          value={filterCriteria} 
          onChange={(e) => setFilterCriteria(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="all">All Customers</option>
          <option value="high-risk">High Risk Only</option>
          <option value="high-value">High Value Only</option>
          <option value="critical">Critical Segment Only</option>
        </select>

        <span style={{ marginLeft: 'auto', color: '#666', fontSize: '0.9em' }}>
          Showing {getFilteredCustomers().length} of {segmentData.totalCustomers} customers
        </span>
      </div>

      {/* Customer Table */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        border: '1px solid #dee2e6'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#333' }}>
          Customer Segmentation Details
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                  Customer
                </th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>
                  Segment
                </th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>
                  Churn Risk
                </th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>
                  Value Score
                </th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>
                  Tenure
                </th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>
                  Strategy
                </th>
              </tr>
            </thead>
            <tbody>
              {getFilteredCustomers()
                .sort((a, b) => a.segment - b.segment || b.churnProbability - a.churnProbability)
                .map((customer) => {
                  const segment = segmentDefinitions[customer.segment];
                  return (
                    <tr 
                      key={customer.id}
                      style={{ 
                        backgroundColor: `${segment.color}10`,
                        borderLeft: `4px solid ${segment.color}`
                      }}
                    >
                      <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                        <strong>{customer.name}</strong>
                        <div style={{ fontSize: '0.8em', color: '#666' }}>
                          ID: {customer.id}
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.8em',
                          fontWeight: 'bold',
                          backgroundColor: segment.color,
                          color: 'white'
                        }}>
                          {segment.icon} Segment {customer.segment}
                        </span>
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
                      <td style={{ 
                        padding: '12px', 
                        textAlign: 'center', 
                        borderBottom: '1px solid #dee2e6',
                        fontWeight: 'bold'
                      }}>
                        {customer.valueScore.toFixed(1)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                        {customer.tenure} months
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                        <div style={{ fontSize: '0.85em', color: '#666' }}>
                          {segment.strategy}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerSegmentation;
