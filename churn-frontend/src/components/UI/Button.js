import React from 'react';
import { theme, getButtonStyle } from '../../theme';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  icon = null,
  onClick,
  style = {},
  ...props 
}) => {
  const buttonStyle = {
    ...getButtonStyle(variant, size),
    opacity: disabled || loading ? 0.6 : 1,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    ...style,
  };

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  const handleMouseEnter = (e) => {
    if (!disabled && !loading) {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = theme.shadows.xl;
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled && !loading) {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = theme.shadows.md;
    }
  };

  return (
    <button
      style={buttonStyle}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div style={{
          width: '16px',
          height: '16px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderTop: '2px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      )}
      {icon && !loading && (
        <span style={{ fontSize: '18px' }}>{icon}</span>
      )}
      {children}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default Button;
