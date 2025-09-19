import React from 'react';
import { motion } from 'framer-motion';
import { theme } from '../../theme';

const ResponsiveGrid = ({ 
  children, 
  columns = { xs: 1, sm: 1, md: 2, lg: 3, xl: 4 },
  gap = theme.spacing.lg,
  minItemWidth = '280px',
  style = {},
  className = '',
  animated = true,
  ...props 
}) => {
  // Generate responsive grid template columns
  const getGridColumns = () => {
    if (minItemWidth) {
      return `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`;
    }
    
    // Fallback to responsive columns
    return {
      [`@media (max-width: ${theme.breakpoints.sm})`]: `repeat(${columns.xs}, 1fr)`,
      [`@media (min-width: ${theme.breakpoints.sm}) and (max-width: ${theme.breakpoints.md})`]: `repeat(${columns.sm}, 1fr)`,
      [`@media (min-width: ${theme.breakpoints.md}) and (max-width: ${theme.breakpoints.lg})`]: `repeat(${columns.md}, 1fr)`,
      [`@media (min-width: ${theme.breakpoints.lg}) and (max-width: ${theme.breakpoints.xl})`]: `repeat(${columns.lg}, 1fr)`,
      [`@media (min-width: ${theme.breakpoints.xl})`]: `repeat(${columns.xl}, 1fr)`,
    };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: getGridColumns(),
    gap: gap,
    width: '100%',
    ...style,
  };

  if (animated) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={gridStyle}
        className={className}
        {...props}
      >
        {React.Children.map(children, (child, index) => (
          <motion.div key={index} variants={itemVariants}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <div style={gridStyle} className={className} {...props}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;
