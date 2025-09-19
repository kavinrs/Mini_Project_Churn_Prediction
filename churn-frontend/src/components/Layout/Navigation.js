import React, { useState, useEffect } from 'react';
import { theme } from '../../theme';
import MobileMenu from './MobileMenu';

const Navigation = ({ activeTab, setActiveTab }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const navigationItems = [
    {
      id: 'predictor',
      label: 'AI Predictor',
      icon: '🔮',
      description: 'Predict customer churn with AI',
      gradient: theme.gradients.primary,
    },
    {
      id: 'dashboard',
      label: 'Risk Analytics',
      icon: '📊',
      description: 'Real-time risk dashboard',
      gradient: theme.gradients.secondary,
    },
    {
      id: 'segmentation',
      label: 'Smart Segments',
      icon: '🎯',
      description: 'Customer segmentation insights',
      gradient: theme.gradients.success,
    },
    {
      id: 'alerts',
      label: 'Alert Center',
      icon: '🚨',
      description: 'Intelligent notifications',
      gradient: theme.gradients.warning,
    },
    {
      id: 'gamified',
      label: 'Retention Game',
      icon: '🎮',
      description: 'Gamified retention insights',
      gradient: theme.gradients.error,
    },
    {
      id: 'watchlist',
      label: 'Live Monitor',
      icon: '🔍',
      description: 'Real-time customer monitoring',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
  ];

  const getTabStyle = (item, isActive) => ({
    position: 'relative',
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    margin: `0 ${theme.spacing.xs}`,
    border: 'none',
    borderRadius: theme.borderRadius.xl,
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    fontFamily: theme.typography.fontFamily.primary,
    transition: `all ${theme.animation.duration.normal} ${theme.animation.easing.default}`,
    background: isActive ? item.gradient : 'rgba(255, 255, 255, 0.8)',
    color: isActive ? 'white' : theme.colors.neutral[700],
    boxShadow: isActive ? theme.shadows.lg : theme.shadows.sm,
    transform: isActive ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing.xs,
    minWidth: '140px',
    textAlign: 'center',
    overflow: 'hidden',
  });

  const handleTabHover = (e, isActive) => {
    if (!isActive) {
      e.target.style.transform = 'translateY(-4px) scale(1.05)';
      e.target.style.boxShadow = theme.shadows.xl;
    }
  };

  const handleTabLeave = (e, isActive) => {
    if (!isActive) {
      e.target.style.transform = 'translateY(0) scale(1)';
      e.target.style.boxShadow = theme.shadows.sm;
    }
  };

  if (isMobile) {
    return (
      <>
        <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.xl,
          padding: `0 ${theme.spacing.lg}`,
        }}>
          <button
            onClick={() => setMobileMenuOpen(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.md,
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
            }}
          >
            ☰ Menu
          </button>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: theme.borderRadius.lg,
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            color: 'white',
            fontSize: theme.typography.sizes.sm,
            fontWeight: theme.typography.weights.medium,
          }}>
            {navigationItems.find(item => item.id === activeTab)?.label || 'ChurnGuard AI'}
          </div>
        </nav>
        
        <MobileMenu 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={mobileMenuOpen}
          setIsOpen={setMobileMenuOpen}
        />
      </>
    );
  }

  return (
    <nav style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: theme.borderRadius['2xl'],
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      boxShadow: theme.shadows.xl,
      border: '1px solid rgba(255, 255, 255, 0.2)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
      }}>
        {navigationItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              style={getTabStyle(item, isActive)}
              onClick={() => setActiveTab(item.id)}
              onMouseEnter={(e) => handleTabHover(e, isActive)}
              onMouseLeave={(e) => handleTabLeave(e, isActive)}
            >
              {/* Icon */}
              <div style={{
                fontSize: theme.typography.fontSize['2xl'],
                marginBottom: theme.spacing.xs,
              }}>
                {item.icon}
              </div>
              
              {/* Label */}
              <div style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.bold,
                marginBottom: '2px',
              }}>
                {item.label}
              </div>
              
              {/* Description */}
              <div style={{
                fontSize: theme.typography.fontSize.xs,
                opacity: isActive ? 0.9 : 0.7,
                fontWeight: theme.typography.fontWeight.normal,
              }}>
                {item.description}
              </div>

              {/* Active indicator */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60%',
                  height: '3px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: theme.borderRadius.full,
                }} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
