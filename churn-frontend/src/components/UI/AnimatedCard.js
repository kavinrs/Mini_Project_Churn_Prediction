import React from 'react';
import { motion } from 'framer-motion';
import { theme } from '../../theme';

const AnimatedCard = ({ 
  children, 
  delay = 0, 
  duration = 0.5, 
  hover = true, 
  style = {}, 
  className = '',
  ...props 
}) => {
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const hoverVariants = hover ? {
    hover: { 
      y: -5,
      scale: 1.02,
      boxShadow: theme.effects.shadow['2xl'],
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  } : {};

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={hover ? "hover" : undefined}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
        boxShadow: theme.effects.shadow.lg,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        cursor: hover ? 'pointer' : 'default',
        ...style
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
