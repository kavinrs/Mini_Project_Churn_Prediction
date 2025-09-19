import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../../theme';

const MobileMenu = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'predictor', label: '🎯 Churn Predictor', icon: '🎯' },
    { id: 'dashboard', label: '📊 Risk Dashboard', icon: '📊' },
    { id: 'segmentation', label: '🎯 Customer Segments', icon: '🎯' },
    { id: 'alerts', label: '🚨 Alerts & Notifications', icon: '🚨' },
    { id: 'gamified', label: '🎮 Gamified Retention', icon: '🎮' },
    { id: 'watchlist', label: '🔍 Real-Time Monitor', icon: '🔍' },
  ];

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const menuVariants = {
    hidden: { 
      x: '-100%',
      transition: {
        type: 'tween',
        duration: 0.3,
      },
    },
    visible: { 
      x: 0,
      transition: {
        type: 'tween',
        duration: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      },
    }),
  };

  const handleItemClick = (tabId) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 998,
              backdropFilter: 'blur(4px)',
            }}
          />
          
          {/* Menu */}
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: '280px',
              maxWidth: '80vw',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRight: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: theme.effects.shadow['2xl'],
              zIndex: 999,
              padding: theme.spacing.lg,
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing.xl,
              paddingBottom: theme.spacing.lg,
              borderBottom: `1px solid ${theme.colors.neutral[200]}`,
            }}>
              <h2 style={{
                margin: 0,
                fontSize: theme.typography.sizes.lg,
                fontWeight: theme.typography.weights.bold,
                color: theme.colors.text.primary,
              }}>
                ChurnGuard AI
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: theme.spacing.xs,
                  borderRadius: theme.borderRadius.md,
                  color: theme.colors.text.secondary,
                }}
              >
                ✕
              </button>
            </div>

            {/* Menu Items */}
            <nav>
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  custom={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => handleItemClick(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.md,
                    padding: theme.spacing.md,
                    marginBottom: theme.spacing.sm,
                    border: 'none',
                    borderRadius: theme.borderRadius.lg,
                    background: activeTab === item.id 
                      ? theme.colors.gradients.primary 
                      : 'transparent',
                    color: activeTab === item.id 
                      ? 'white' 
                      : theme.colors.text.primary,
                    fontSize: theme.typography.sizes.base,
                    fontWeight: theme.typography.weights.medium,
                    cursor: 'pointer',
                    transition: theme.effects.transition.default,
                    textAlign: 'left',
                  }}
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: activeTab === item.id 
                      ? undefined 
                      : theme.colors.background.secondary,
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  <span>{item.label.replace(/^[^\s]+ /, '')}</span>
                </motion.button>
              ))}
            </nav>

            {/* Footer */}
            <div style={{
              marginTop: 'auto',
              paddingTop: theme.spacing.xl,
              borderTop: `1px solid ${theme.colors.neutral[200]}`,
              textAlign: 'center',
            }}>
              <p style={{
                margin: 0,
                fontSize: theme.typography.sizes.sm,
                color: theme.colors.text.secondary,
              }}>
                © 2024 ChurnGuard AI
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
