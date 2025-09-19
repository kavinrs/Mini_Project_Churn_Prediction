import React from 'react';
import { theme, getMetricCardStyle } from '../../theme';
import Card from './Card';

const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'primary',
  trend = null,
  loading = false 
}) => {
  const getTrendColor = (trend) => {
    if (!trend) return theme.colors.neutral[500];
    return trend > 0 ? theme.colors.success[500] : theme.colors.error[500];
  };

  const getTrendIcon = (trend) => {
    if (!trend) return '';
    return trend > 0 ? '↗️' : '↘️';
  };

  return (
    <Card variant="glass" hover style={getMetricCardStyle(color)}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
      }}>
        <div style={{
          fontSize: theme.typography.fontSize['3xl'],
          opacity: 0.8,
        }}>
          {icon}
        </div>
        {trend !== null && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.xs,
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            borderRadius: theme.borderRadius.full,
            background: `${getTrendColor(trend)}20`,
            color: getTrendColor(trend),
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.semibold,
          }}>
            <span>{getTrendIcon(trend)}</span>
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      <div style={{
        textAlign: 'left',
      }}>
        <h3 style={{
          margin: 0,
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.neutral[600],
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: theme.spacing.xs,
        }}>
          {title}
        </h3>

        <div style={{
          fontSize: theme.typography.fontSize['3xl'],
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.neutral[900],
          marginBottom: theme.spacing.xs,
          fontFamily: theme.typography.fontFamily.mono,
        }}>
          {loading ? (
            <div style={{
              width: '60px',
              height: '20px',
              background: theme.colors.neutral[200],
              borderRadius: theme.borderRadius.sm,
              animation: 'pulse 2s infinite',
            }} />
          ) : (
            value
          )}
        </div>

        {subtitle && (
          <p style={{
            margin: 0,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.neutral[500],
            fontWeight: theme.typography.fontWeight.normal,
          }}>
            {subtitle}
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </Card>
  );
};

export default MetricCard;
