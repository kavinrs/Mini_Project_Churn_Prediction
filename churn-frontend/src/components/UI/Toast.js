import React from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { theme } from '../../theme';

// Custom toast configurations
export const showToast = {
  success: (message) => toast.success(message, {
    duration: 4000,
    style: {
      background: theme.colors.success[500],
      color: 'white',
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.medium,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.effects.shadow.lg,
    },
    iconTheme: {
      primary: 'white',
      secondary: theme.colors.success[500],
    },
  }),
  
  error: (message) => toast.error(message, {
    duration: 5000,
    style: {
      background: theme.colors.error[500],
      color: 'white',
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.medium,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.effects.shadow.lg,
    },
    iconTheme: {
      primary: 'white',
      secondary: theme.colors.error[500],
    },
  }),
  
  warning: (message) => toast(message, {
    duration: 4000,
    icon: '⚠️',
    style: {
      background: theme.colors.warning[500],
      color: 'white',
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.medium,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.effects.shadow.lg,
    },
  }),
  
  info: (message) => toast(message, {
    duration: 3000,
    icon: 'ℹ️',
    style: {
      background: theme.colors.primary[500],
      color: 'white',
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.medium,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.effects.shadow.lg,
    },
  }),
  
  loading: (message) => toast.loading(message, {
    style: {
      background: theme.colors.neutral[800],
      color: 'white',
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.sizes.sm,
      fontWeight: theme.typography.weights.medium,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.effects.shadow.lg,
    },
  }),
};

// Toast container component
const ToastContainer = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{
        top: 20,
        right: 20,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          color: theme.colors.text.primary,
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.sizes.sm,
          fontWeight: theme.typography.weights.medium,
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.effects.shadow.xl,
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        success: {
          iconTheme: {
            primary: theme.colors.success[500],
            secondary: 'white',
          },
        },
        error: {
          iconTheme: {
            primary: theme.colors.error[500],
            secondary: 'white',
          },
        },
      }}
    />
  );
};

export default ToastContainer;
