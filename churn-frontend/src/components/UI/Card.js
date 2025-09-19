import React from 'react';
import { theme, getCardStyle } from '../../theme';

const Card = ({ 
  children, 
  variant = 'default', 
  padding = 'lg', 
  hover = false,
  className = '',
  style = {},
  ...props 
}) => {
  const paddingValues = {
    sm: theme.spacing.sm,
    md: theme.spacing.md,
    lg: theme.spacing.lg,
    xl: theme.spacing.xl,
  };

  const cardStyle = {
    ...getCardStyle(variant),
    padding: paddingValues[padding],
    ...(hover && {
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows['2xl'],
      }
    }),
    ...style,
  };

  return (
    <div 
      style={cardStyle}
      className={className}
      onMouseEnter={hover ? (e) => {
        e.target.style.transform = 'translateY(-4px)';
        e.target.style.boxShadow = theme.shadows['2xl'];
      } : undefined}
      onMouseLeave={hover ? (e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = theme.shadows.xl;
      } : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
