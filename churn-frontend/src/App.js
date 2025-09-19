// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from './theme';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import ToastContainer from './components/UI/Toast';
import ChurnForm from './ChurnForms';
import Dashboard from './Dashboard';
import CustomerSegmentation from './CustomerSegmentation';
import AlertsDashboard from './AlertsDashboard';
import GamifiedRetention from './GamifiedRetention';
import RealTimeWatchlist from './RealTimeWatchlist';

function App() {
  const [activeTab, setActiveTab] = useState('predictor');

  return (
    <div style={{ 
      fontFamily: theme.typography.fontFamily.primary,
      background: `
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%),
        linear-gradient(135deg, #667eea 0%, #764ba2 100%)
      `,
      minHeight: '100vh',
      padding: theme.spacing.lg,
    }}>
      {/* Professional Header */}
      <Header />
      
      {/* Modern Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Content Area with Glass Morphism and Animation */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ 
          minHeight: '600px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: theme.borderRadius['2xl'],
          padding: theme.spacing.xl,
          boxShadow: theme.shadows['2xl'],
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}>
        {/* Subtle background pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.02,
          backgroundImage: `
            radial-gradient(circle at 25px 25px, ${theme.colors.primary[500]} 2px, transparent 0),
            radial-gradient(circle at 75px 75px, ${theme.colors.secondary[500]} 1px, transparent 0)
          `,
          backgroundSize: '100px 100px',
          pointerEvents: 'none',
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {activeTab === 'predictor' && <ChurnForm />}
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'segmentation' && <CustomerSegmentation />}
              {activeTab === 'alerts' && <AlertsDashboard />}
              {activeTab === 'gamified' && <GamifiedRetention />}
              {activeTab === 'watchlist' && <RealTimeWatchlist />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Professional Footer with Animation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{
          marginTop: theme.spacing.xl,
          textAlign: 'center',
          padding: theme.spacing.lg,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: theme.borderRadius.xl,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
        <p style={{
          margin: 0,
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium,
        }}>
          © 2024 ChurnGuard AI - Advanced Customer Retention Intelligence Platform
        </p>
        <p style={{
          margin: `${theme.spacing.xs} 0 0 0`,
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: theme.typography.fontSize.xs,
        }}>
          Powered by Machine Learning & Real-time Analytics
        </p>
      </motion.div>
      
      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default App;

