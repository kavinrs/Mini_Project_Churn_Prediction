import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { theme } from './theme';
import Card from './components/UI/Card';
import Button from './components/UI/Button';
import MetricCard from './components/UI/MetricCard';
import LoadingSpinner from './components/UI/LoadingSpinner';

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
    <div style={{ padding: '0', fontFamily: theme.typography.fontFamily, background: 'transparent' }}>
      <Card variant="gradient" padding="large" style={{ textAlign: 'center', marginBottom: theme.spacing.xl }}>
        <h1 style={{ 
          margin: '0',
          fontSize: theme.typography.sizes.xxl,
          fontWeight: theme.typography.weights.bold,
          color: theme.colors.text.primary,
          textShadow: theme.effects.textShadow
        }}>
          🎮 Gamified Retention Hub
        </h1>
        <p style={{
          margin: `${theme.spacing.md} 0 0 0`,
          fontSize: theme.typography.sizes.lg,
          opacity: 0.9,
          fontWeight: theme.typography.weights.medium,
          color: theme.colors.text.secondary
        }}>
          Transform customer retention into an engaging game experience
        </p>
      </Card>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: theme.spacing.lg,
        marginBottom: theme.spacing.xl
      }}>
        <MetricCard
          title="Total Players"
          value={gamificationData.customers.length}
          icon="🎮"
          trend={null}
          color={theme.colors.primary[500]}
        />
        <MetricCard
          title="Total Badges Earned"
          value={gamificationData.customers.reduce((sum, customer) => sum + customer.badges.length, 0)}
          icon="🏅"
          trend={null}
          color={theme.colors.secondary[500]}
        />
        <MetricCard
          title="Average Retention Score"
          value={(gamificationData.customers.reduce((sum, customer) => sum + customer.retentionScore, 0) / 
            gamificationData.customers.length || 0).toFixed(1)}
          icon="📊"
          trend={null}
          color={theme.colors.accent[500]}
        />
        <MetricCard
          title="Elite Players"
          value={gamificationData.customers.filter(c => c.retentionScore >= 80).length}
          icon="🎆"
          trend={null}
          color={theme.colors.success[500]}
          subtitle="Score ≥ 80"
        />
      </div>

      {/* Charts Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
        gap: theme.spacing.xl,
        marginBottom: theme.spacing.xl
      }}>
        {/* Tier Distribution */}
        <Card variant="glass" padding="large">
          <h3 style={{ 
            marginBottom: theme.spacing.lg, 
            color: theme.colors.text.primary, 
            textAlign: 'center', 
            fontSize: theme.typography.sizes.xl, 
            fontWeight: theme.typography.weights.bold 
          }}>
            🏆 Tier Distribution
          </h3>
          <div style={{
            background: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.md,
            backdropFilter: 'blur(10px)'
          }}>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={gamificationData.tierDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  stroke={theme.colors.background.primary}
                  strokeWidth={3}
                >
                  {gamificationData.tierDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme.colors.background.secondary,
                    border: `1px solid ${theme.colors.neutral[200]}`,
                    borderRadius: theme.borderRadius.md
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Badge Statistics */}
        <Card variant="glass" padding="large">
          <h3 style={{ 
            marginBottom: theme.spacing.lg, 
            color: theme.colors.text.primary, 
            textAlign: 'center', 
            fontSize: theme.typography.sizes.xl, 
            fontWeight: theme.typography.weights.bold 
          }}>
            🏅 Badge Popularity
          </h3>
          <div style={{
            background: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.md,
            backdropFilter: 'blur(10px)'
          }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={gamificationData.badgeStats.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.neutral[200]} />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                  stroke={theme.colors.text.secondary}
                />
                <YAxis stroke={theme.colors.text.secondary} />
                <Tooltip 
                  formatter={(value, name) => [value, 'Players with badge']}
                  labelFormatter={(label) => `Badge: ${label}`}
                  contentStyle={{
                    backgroundColor: theme.colors.background.secondary,
                    border: `1px solid ${theme.colors.neutral[200]}`,
                    borderRadius: theme.borderRadius.md
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill={theme.colors.primary[500]} 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card variant="glass" padding="large" style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ 
          marginBottom: theme.spacing.xl, 
          color: theme.colors.text.primary, 
          textAlign: 'center', 
          fontSize: theme.typography.sizes.xxl, 
          fontWeight: theme.typography.weights.bold 
        }}>
          🏆 Customer Retention Champions
        </h2>
        <div style={{ 
          overflowX: 'auto',
          background: theme.colors.background.secondary,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: theme.colors.background.secondary }}>
                <th style={{ 
                  padding: theme.spacing.md, 
                  textAlign: 'center', 
                  borderBottom: `2px solid ${theme.colors.neutral[200]}`,
                  color: theme.colors.text.primary,
                  fontWeight: theme.typography.weights.bold
                }}>Rank</th>
                <th style={{ 
                  padding: theme.spacing.md, 
                  textAlign: 'left', 
                  borderBottom: `2px solid ${theme.colors.neutral[200]}`,
                  color: theme.colors.text.primary,
                  fontWeight: theme.typography.weights.bold
                }}>Player</th>
                <th style={{ 
                  padding: theme.spacing.md, 
                  textAlign: 'center', 
                  borderBottom: `2px solid ${theme.colors.neutral[200]}`,
                  color: theme.colors.text.primary,
                  fontWeight: theme.typography.weights.bold
                }}>Retention Score</th>
                <th style={{ 
                  padding: theme.spacing.md, 
                  textAlign: 'center', 
                  borderBottom: `2px solid ${theme.colors.neutral[200]}`,
                  color: theme.colors.text.primary,
                  fontWeight: theme.typography.weights.bold
                }}>Tier</th>
                <th style={{ 
                  padding: theme.spacing.md, 
                  textAlign: 'center', 
                  borderBottom: `2px solid ${theme.colors.neutral[200]}`,
                  color: theme.colors.text.primary,
                  fontWeight: theme.typography.weights.bold
                }}>Badges</th>
                <th style={{ 
                  padding: theme.spacing.md, 
                  textAlign: 'center', 
                  borderBottom: `2px solid ${theme.colors.neutral[200]}`,
                  color: theme.colors.text.primary,
                  fontWeight: theme.typography.weights.bold
                }}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {gamificationData.leaderboard.map((customer) => (
                <tr 
                  key={customer.id}
                  style={{ 
                    backgroundColor: customer.rank <= 3 ? `${theme.colors.warning[500]}20` : 'transparent',
                    borderLeft: customer.rank <= 3 ? `4px solid ${theme.colors.warning[500]}` : 'none',
                    transition: theme.animation.transition
                  }}
                >
                  <td style={{ 
                    padding: theme.spacing.md, 
                    textAlign: 'center', 
                    borderBottom: `1px solid ${theme.colors.neutral[200]}`,
                    fontSize: theme.typography.sizes.lg,
                    fontWeight: theme.typography.weights.bold,
                    color: theme.colors.text.primary
                  }}>
                    {getRankIcon(customer.rank)}
                  </td>
                  <td style={{ 
                    padding: theme.spacing.md, 
                    borderBottom: `1px solid ${theme.colors.neutral[200]}`, 
                    fontWeight: theme.typography.weights.semibold,
                    color: theme.colors.text.primary
                  }}>
                    {customer.name}
                  </td>
                  <td style={{ 
                    padding: theme.spacing.md, 
                    textAlign: 'center', 
                    borderBottom: `1px solid ${theme.colors.neutral[200]}`,
                    fontSize: theme.typography.sizes.lg,
                    fontWeight: theme.typography.weights.bold,
                    color: getProgressBarColor(customer.retentionScore)
                  }}>
                    {customer.retentionScore}
                  </td>
                  <td style={{ 
                    padding: theme.spacing.md, 
                    textAlign: 'center', 
                    borderBottom: `1px solid ${theme.colors.neutral[200]}` 
                  }}>
                    <span style={{
                      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                      borderRadius: theme.borderRadius.full,
                      fontSize: theme.typography.sizes.sm,
                      fontWeight: theme.typography.weights.bold,
                      backgroundColor: customer.tierColor,
                      color: customer.scoreTier === 'Platinum' || customer.scoreTier === 'Silver' ? theme.colors.text.primary : theme.colors.text.inverse,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: theme.spacing.xs
                    }}>
                      {customer.tierIcon} {customer.scoreTier}
                    </span>
                  </td>
                  <td style={{ 
                    padding: theme.spacing.md, 
                    textAlign: 'center', 
                    borderBottom: `1px solid ${theme.colors.neutral[200]}` 
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: theme.spacing.sm,
                      justifyContent: 'center',
                      flexWrap: 'wrap'
                    }}>
                      {customer.badges.slice(0, 4).map((badge, index) => (
                        <span
                          key={index}
                          style={{
                            fontSize: theme.typography.sizes.base,
                            padding: theme.spacing.xs,
                            borderRadius: theme.borderRadius.full,
                            backgroundColor: badge.color,
                            minWidth: '32px',
                            minHeight: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: theme.effects.shadow.small
                          }}
                          title={badge.name}
                        >
                          {badge.icon}
                        </span>
                      ))}
                      {customer.badges.length > 4 && (
                        <span style={{ fontSize: theme.typography.sizes.xl }}>{customer.tierIcon}</span>
                      )}
                    </div>
                    <div style={{ 
                      textAlign: 'center',
                      marginTop: theme.spacing.xs,
                      fontSize: theme.typography.sizes.xs,
                      color: theme.colors.text.secondary
                    }}>
                      {customer.badgeCount} total
                    </div>
                  </td>
                  <td style={{ 
                    padding: theme.spacing.md, 
                    borderBottom: `1px solid ${theme.colors.neutral[200]}` 
                  }}>
                    <div style={{ 
                      width: '100%', 
                      backgroundColor: theme.colors.background.secondary, 
                      borderRadius: theme.borderRadius.md, 
                      overflow: 'hidden' 
                    }}>
                      <div
                        style={{
                          width: `${customer.retentionScore}%`,
                          height: '24px',
                          backgroundColor: getProgressBarColor(customer.retentionScore),
                          transition: theme.animation.transition,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: theme.colors.text.inverse,
                          fontSize: theme.typography.sizes.xs,
                          fontWeight: theme.typography.weights.bold
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
      </Card>

      {/* Badge Gallery */}
      <Card variant="glass" padding="large">
        <h2 style={{ 
          marginBottom: theme.spacing.xl, 
          color: theme.colors.text.primary, 
          textAlign: 'center', 
          fontSize: theme.typography.sizes.xxl, 
          fontWeight: theme.typography.weights.bold 
        }}>
          🏅 Achievement Badge Gallery
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: theme.spacing.lg 
        }}>
          {gamificationData.badgeStats.map((badge, index) => (
            <div
              key={index}
              style={{
                padding: theme.spacing.lg,
                background: `linear-gradient(135deg, ${badge.color}15 0%, ${theme.colors.background.secondary} 100%)`,
                border: `3px solid ${badge.color}`,
                borderRadius: theme.borderRadius.lg,
                boxShadow: theme.effects.shadow.medium,
                transform: 'translateY(0)',
                transition: theme.animation.transition
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = theme.effects.shadow.large;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = theme.effects.shadow.medium;
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: theme.spacing.md 
              }}>
                <div style={{ fontSize: '3rem' }}>{badge.icon}</div>
                <div>
                  <h4 style={{ 
                    margin: '0', 
                    color: theme.colors.text.primary, 
                    fontSize: theme.typography.sizes.lg, 
                    fontWeight: theme.typography.weights.bold 
                  }}>
                    {badge.name}
                  </h4>
                  <p style={{ 
                    margin: `${theme.spacing.xs} 0 0 0`, 
                    fontSize: theme.typography.sizes.base, 
                    color: theme.colors.text.secondary, 
                    fontWeight: theme.typography.weights.medium 
                  }}>
                    {badge.tier} Badge • {badge.count} players earned
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default GamifiedRetention;
