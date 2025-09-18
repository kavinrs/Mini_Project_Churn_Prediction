import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const GamifiedRetention = () => {
  const [gamificationData, setGamificationData] = useState({
    customers: [],
    leaderboard: [],
    badgeStats: [],
    tierDistribution: []
  });

  useEffect(() => {
    // Sample gamified customer data
    const sampleCustomers = [
      {
        id: 1,
        name: 'John Doe',
        churnProbability: 0.15,
        retentionScore: 85.0,
        scoreTier: 'Gold',
        tierColor: '#ffd700',
        tierIcon: '🥇',
        badges: [
          { name: 'Loyalty Shield', icon: '🛡️', color: '#28a745', tier: 'Core' },
          { name: 'Engagement Ace', icon: '🎯', color: '#007bff', tier: 'Premium' },
          { name: 'Loyal Member', icon: '⭐', color: '#17a2b8', tier: 'Achievement' }
        ]
      },
      {
        id: 2,
        name: 'Jane Smith',
        churnProbability: 0.25,
        retentionScore: 75.0,
        scoreTier: 'Silver',
        tierColor: '#c0c0c0',
        tierIcon: '🥈',
        badges: [
          { name: 'Loyalty Shield', icon: '🛡️', color: '#28a745', tier: 'Core' },
          { name: 'Satisfied Customer', icon: '😊', color: '#28a745', tier: 'Experience' }
        ]
      },
      {
        id: 3,
        name: 'Mike Johnson',
        churnProbability: 0.05,
        retentionScore: 95.0,
        scoreTier: 'Platinum',
        tierColor: '#e5e4e2',
        tierIcon: '💎',
        badges: [
          { name: 'Loyalty Shield', icon: '🛡️', color: '#28a745', tier: 'Core' },
          { name: 'Engagement Ace', icon: '🎯', color: '#007bff', tier: 'Premium' },
          { name: 'Perfect Customer', icon: '🌟', color: '#e83e8c', tier: 'Elite' },
          { name: 'Veteran Customer', icon: '🏆', color: '#ffc107', tier: 'Achievement' },
          { name: 'High Value Customer', icon: '💰', color: '#fd7e14', tier: 'Value' }
        ]
      },
      {
        id: 4,
        name: 'Sarah Wilson',
        churnProbability: 0.30,
        retentionScore: 70.0,
        scoreTier: 'Silver',
        tierColor: '#c0c0c0',
        tierIcon: '🥈',
        badges: [
          { name: 'Loyalty Shield', icon: '🛡️', color: '#28a745', tier: 'Core' },
          { name: 'Smart Saver', icon: '🎫', color: '#20c997', tier: 'Engagement' }
        ]
      },
      {
        id: 5,
        name: 'David Brown',
        churnProbability: 0.45,
        retentionScore: 55.0,
        scoreTier: 'Bronze',
        tierColor: '#cd7f32',
        tierIcon: '🥉',
        badges: [
          { name: 'Frequent Shopper', icon: '🛒', color: '#6f42c1', tier: 'Activity' }
        ]
      },
      {
        id: 6,
        name: 'Lisa Davis',
        churnProbability: 0.10,
        retentionScore: 90.0,
        scoreTier: 'Gold',
        tierColor: '#ffd700',
        tierIcon: '🥇',
        badges: [
          { name: 'Loyalty Shield', icon: '🛡️', color: '#28a745', tier: 'Core' },
          { name: 'Engagement Ace', icon: '🎯', color: '#007bff', tier: 'Premium' },
          { name: 'Satisfied Customer', icon: '😊', color: '#28a745', tier: 'Experience' },
          { name: 'High Value Customer', icon: '💰', color: '#fd7e14', tier: 'Value' }
        ]
      },
      {
        id: 7,
        name: 'Tom Anderson',
        churnProbability: 0.65,
        retentionScore: 35.0,
        scoreTier: 'At Risk',
        tierColor: '#dc3545',
        tierIcon: '⚠️',
        badges: []
      },
      {
        id: 8,
        name: 'Emma Taylor',
        churnProbability: 0.20,
        retentionScore: 80.0,
        scoreTier: 'Gold',
        tierColor: '#ffd700',
        tierIcon: '🥇',
        badges: [
          { name: 'Loyalty Shield', icon: '🛡️', color: '#28a745', tier: 'Core' },
          { name: 'Engagement Ace', icon: '🎯', color: '#007bff', tier: 'Premium' },
          { name: 'Loyal Member', icon: '⭐', color: '#17a2b8', tier: 'Achievement' }
        ]
      }
    ];

    // Create leaderboard (sorted by retention score)
    const leaderboard = [...sampleCustomers]
      .sort((a, b) => b.retentionScore - a.retentionScore)
      .map((customer, index) => ({
        ...customer,
        rank: index + 1,
        badgeCount: customer.badges.length
      }));

    // Calculate badge statistics
    const allBadges = sampleCustomers.flatMap(customer => customer.badges);
    const badgeStats = {};
    allBadges.forEach(badge => {
      if (badgeStats[badge.name]) {
        badgeStats[badge.name].count++;
      } else {
        badgeStats[badge.name] = {
          name: badge.name,
          icon: badge.icon,
          color: badge.color,
          tier: badge.tier,
          count: 1
        };
      }
    });

    // Calculate tier distribution
    const tierCounts = {};
    sampleCustomers.forEach(customer => {
      tierCounts[customer.scoreTier] = (tierCounts[customer.scoreTier] || 0) + 1;
    });

    const tierDistribution = Object.entries(tierCounts).map(([tier, count]) => ({
      name: tier,
      value: count,
      color: sampleCustomers.find(c => c.scoreTier === tier)?.tierColor || '#6c757d'
    }));

    setGamificationData({
      customers: sampleCustomers,
      leaderboard,
      badgeStats: Object.values(badgeStats).sort((a, b) => b.count - a.count),
      tierDistribution
    });
  }, []);

  const getProgressBarColor = (score) => {
    if (score >= 90) return '#e5e4e2'; // Platinum
    if (score >= 80) return '#ffd700'; // Gold
    if (score >= 68) return '#c0c0c0'; // Silver
    if (score >= 50) return '#cd7f32'; // Bronze
    return '#dc3545'; // At Risk
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333', fontSize: '2.5em' }}>
        🎮 Gamified Retention Insights
      </h1>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '25px', 
          borderRadius: '15px', 
          textAlign: 'center',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1em' }}>Total Players</h3>
          <p style={{ fontSize: '2.5em', margin: '0', fontWeight: 'bold' }}>
            {gamificationData.customers.length}
          </p>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: '25px', 
          borderRadius: '15px', 
          textAlign: 'center',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1em' }}>Total Badges Earned</h3>
          <p style={{ fontSize: '2.5em', margin: '0', fontWeight: 'bold' }}>
            {gamificationData.customers.reduce((sum, customer) => sum + customer.badges.length, 0)}
          </p>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          padding: '25px', 
          borderRadius: '15px', 
          textAlign: 'center',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1em' }}>Average Retention Score</h3>
          <p style={{ fontSize: '2.5em', margin: '0', fontWeight: 'bold' }}>
            {(gamificationData.customers.reduce((sum, customer) => sum + customer.retentionScore, 0) / 
              gamificationData.customers.length || 0).toFixed(1)}
          </p>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          color: 'white',
          padding: '25px', 
          borderRadius: '15px', 
          textAlign: 'center',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1em' }}>Elite Players</h3>
          <p style={{ fontSize: '2.5em', margin: '0', fontWeight: 'bold' }}>
            {gamificationData.customers.filter(c => c.retentionScore >= 80).length}
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', opacity: 0.9 }}>
            Score ≥ 80
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
        {/* Tier Distribution */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '25px', 
          borderRadius: '15px', 
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>🏆 Tier Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={gamificationData.tierDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {gamificationData.tierDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Badge Statistics */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '25px', 
          borderRadius: '15px', 
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>🏅 Badge Popularity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gamificationData.badgeStats.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, 'Players with badge']}
                labelFormatter={(label) => `Badge: ${label}`}
              />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboard */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '15px', 
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginBottom: '25px', color: '#333', textAlign: 'center', fontSize: '1.8em' }}>
          🏆 Retention Leaderboard
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Rank</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Player</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Retention Score</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Tier</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Badges</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {gamificationData.leaderboard.map((customer) => (
                <tr 
                  key={customer.id}
                  style={{ 
                    backgroundColor: customer.rank <= 3 ? '#fff3cd' : 'transparent',
                    borderLeft: customer.rank <= 3 ? '4px solid #ffc107' : 'none'
                  }}
                >
                  <td style={{ 
                    padding: '15px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    fontSize: '1.2em',
                    fontWeight: 'bold'
                  }}>
                    {getRankIcon(customer.rank)}
                  </td>
                  <td style={{ padding: '15px', borderBottom: '1px solid #dee2e6', fontWeight: 'bold' }}>
                    {customer.name}
                  </td>
                  <td style={{ 
                    padding: '15px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #dee2e6',
                    fontSize: '1.3em',
                    fontWeight: 'bold',
                    color: getProgressBarColor(customer.retentionScore)
                  }}>
                    {customer.retentionScore}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                    <span style={{
                      padding: '8px 12px',
                      borderRadius: '20px',
                      fontSize: '0.9em',
                      fontWeight: 'bold',
                      backgroundColor: customer.tierColor,
                      color: customer.scoreTier === 'Platinum' || customer.scoreTier === 'Silver' ? '#333' : 'white',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      {customer.tierIcon} {customer.scoreTier}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', flexWrap: 'wrap' }}>
                      {customer.badges.slice(0, 4).map((badge, index) => (
                        <span
                          key={index}
                          style={{
                            fontSize: '1.2em',
                            padding: '4px',
                            borderRadius: '50%',
                            backgroundColor: badge.color,
                            minWidth: '30px',
                            minHeight: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title={badge.name}
                        >
                          {badge.icon}
                        </span>
                      ))}
                      {customer.badges.length > 4 && (
                        <span style={{ fontSize: '0.8em', color: '#666', alignSelf: 'center' }}>
                          +{customer.badges.length - 4}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
                      {customer.badgeCount} total
                    </div>
                  </td>
                  <td style={{ padding: '15px', borderBottom: '1px solid #dee2e6' }}>
                    <div style={{ width: '100%', backgroundColor: '#e9ecef', borderRadius: '10px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${customer.retentionScore}%`,
                          height: '20px',
                          backgroundColor: getProgressBarColor(customer.retentionScore),
                          transition: 'width 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.8em',
                          fontWeight: 'bold'
                        }}
                      >
                        {customer.retentionScore}%
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Badge Gallery */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '15px', 
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '25px', color: '#333', textAlign: 'center', fontSize: '1.8em' }}>
          🏅 Badge Gallery
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '20px' 
        }}>
          {gamificationData.badgeStats.map((badge, index) => (
            <div
              key={index}
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: `2px solid ${badge.color}`,
                textAlign: 'center',
                backgroundColor: `${badge.color}10`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '3em', marginBottom: '10px' }}>{badge.icon}</div>
              <h4 style={{ margin: '0 0 8px 0', color: badge.color, fontSize: '1.1em' }}>{badge.name}</h4>
              <p style={{ margin: '0 0 10px 0', fontSize: '0.9em', color: '#666' }}>
                {badge.tier} Badge
              </p>
              <div style={{
                backgroundColor: badge.color,
                color: 'white',
                padding: '5px 10px',
                borderRadius: '15px',
                fontSize: '0.9em',
                fontWeight: 'bold'
              }}>
                {badge.count} players earned
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GamifiedRetention;
