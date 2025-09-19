import React from 'react';
import { motion } from 'framer-motion';
import { theme } from '../../theme';

const AnimatedButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  icon = null,
  onClick,
  style = {},
  className = '',
  ...props 
}) => {
  const buttonVariants = {
    idle: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1, ease: [0.4, 0, 0.2, 1] }
    }
  };

  const sizes = {
    sm: {
      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
      fontSize: theme.typography.sizes.sm,
      height: '32px',
    },
    md: {
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      fontSize: theme.typography.sizes.base,
      height: '40px',
    },
    lg: {
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      fontSize: theme.typography.sizes.lg,
      height: '48px',
    },
  };

  const variants = {
    primary: {
      background: theme.colors.gradients.primary,
      color: 'white',
      border: 'none',
    },
    secondary: {
      background: theme.colors.gradients.secondary,
      color: 'white',
      border: 'none',
    },
    success: {
      background: theme.colors.gradients.success,
      color: 'white',
      border: 'none',
    },
    warning: {
      background: theme.colors.gradients.warning,
      color: 'white',
      border: 'none',
    },
    danger: {
      background: theme.colors.gradients.danger,
      color: 'white',
      border: 'none',
    },
    info: {
      background: theme.colors.gradients.info,
      color: 'white',
      border: 'none',
    },
    outline: {
      background: 'transparent',
      color: theme.colors.primary[600],
      border: `2px solid ${theme.colors.primary[600]}`,
    },
    ghost: {
      background: 'transparent',
      color: theme.colors.primary[600],
      border: 'none',
    },
  };

  const baseStyle = {
    borderRadius: theme.borderRadius.lg,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.weights.semibold,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    boxShadow: theme.effects.shadow.md,
    transition: theme.effects.transition.default,
    opacity: disabled ? 0.6 : 1,
    ...sizes[size],
    ...variants[variant],
    ...style
  };

  return (
    <motion.button
      variants={buttonVariants}
      initial="idle"
      whileHover={!disabled ? "hover" : "idle"}
      whileTap={!disabled ? "tap" : "idle"}
      style={baseStyle}
      className={className}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid transparent',
            borderTop: '2px solid currentColor',
            borderRadius: '50%',
          }}
        />
      )}
      {icon && !loading && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {icon}
        </span>
      )}
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
