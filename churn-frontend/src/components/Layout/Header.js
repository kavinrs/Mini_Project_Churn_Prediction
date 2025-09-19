import React from 'react';
import { theme } from '../../theme';

const Header = () => {
  return (
    <header style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: theme.borderRadius['2xl'],
      padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
      marginBottom: theme.spacing.xl,
      boxShadow: theme.shadows.xl,
      border: '1px solid rgba(255, 255, 255, 0.2)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background gradient */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: theme.gradients.primary,
        opacity: 0.05,
        zIndex: 0,
      }} />
      
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: theme.spacing.md,
      }}>
        {/* Logo and Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.md,
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: theme.gradients.primary,
            borderRadius: theme.borderRadius.xl,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: theme.shadows.lg,
          }}>
            🚀
          </div>
          <div>
            <h1 style={{
              margin: 0,
              background: theme.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: theme.typography.fontSize['4xl'],
              fontWeight: theme.typography.fontWeight.extrabold,
              fontFamily: theme.typography.fontFamily.primary,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}>
              ChurnGuard AI
            </h1>
            <p style={{
              margin: 0,
              color: theme.colors.neutral[600],
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.medium,
              fontFamily: theme.typography.fontFamily.primary,
            }}>
              Advanced Customer Retention Intelligence Platform
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.md,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.xs,
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: theme.borderRadius.full,
            border: `1px solid ${theme.colors.success[200]}`,
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: theme.colors.success[500],
              animation: 'pulse 2s infinite',
            }} />
            <span style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.success[700],
            }}>
              AI Model Active
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.xs,
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: theme.borderRadius.full,
            border: `1px solid ${theme.colors.primary[200]}`,
          }}>
            <span style={{
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.primary[700],
            }}>
              Real-time Analytics
            </span>
          </div>
        </div>
      </div>

      {/* Add CSS animation */}
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
    </header>
  );
};

export default Header;
