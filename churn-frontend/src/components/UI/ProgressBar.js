import React from 'react';
import { motion } from 'framer-motion';
import { theme } from '../../theme';

const ProgressBar = ({ 
  value = 0, 
  max = 100, 
  color = 'primary', 
  size = 'md',
  showLabel = false,
  label = '',
  animated = true,
  style = {},
  className = ''
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizes = {
    sm: { height: '4px', fontSize: theme.typography.sizes.xs },
    md: { height: '8px', fontSize: theme.typography.sizes.sm },
    lg: { height: '12px', fontSize: theme.typography.sizes.base },
  };

  const colors = {
    primary: theme.colors.gradients.primary,
    secondary: theme.colors.gradients.secondary,
    success: theme.colors.gradients.success,
    warning: theme.colors.gradients.warning,
    danger: theme.colors.gradients.danger,
    info: theme.colors.gradients.info,
  };

  const progressVariants = {
    initial: { width: 0 },
    animate: { 
      width: `${percentage}%`,
      transition: {
        duration: 1.2,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <div style={{ width: '100%', ...style }} className={className}>
      {showLabel && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.xs,
          fontSize: sizes[size].fontSize,
          fontWeight: theme.typography.weights.medium,
          color: theme.colors.text.primary
        }}>
          <span>{label}</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
      )}
      
      <div style={{
        width: '100%',
        height: sizes[size].height,
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.full,
        overflow: 'hidden',
        position: 'relative'
      }}>
        <motion.div
          variants={progressVariants}
          initial={animated ? "initial" : false}
          animate={animated ? "animate" : false}
          style={{
            height: '100%',
            background: colors[color] || colors.primary,
            borderRadius: theme.borderRadius.full,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Animated shimmer effect */}
          <motion.div
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              width: '50%',
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressBar;
