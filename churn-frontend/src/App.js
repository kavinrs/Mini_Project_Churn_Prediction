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
import ChurnForm from './ChurnForms';
import Dashboard from './Dashboard';
import CustomerSegmentation from './CustomerSegmentation';

function App() {
  const [activeTab, setActiveTab] = useState('predictor');

  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    margin: '0 5px',
    backgroundColor: isActive ? '#007bff' : '#f8f9fa',
    color: isActive ? 'white' : '#333',
    border: '1px solid #dee2e6',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.3s ease'
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
        Customer Churn Management System
      </h1>
      
      {/* Navigation Tabs */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        borderBottom: '2px solid #dee2e6',
        paddingBottom: '15px'
      }}>
        <button
          style={tabStyle(activeTab === 'predictor')}
          onClick={() => setActiveTab('predictor')}
          onMouseOver={(e) => {
            if (activeTab !== 'predictor') {
              e.target.style.backgroundColor = '#e9ecef';
            }
          }}
          onMouseOut={(e) => {
            if (activeTab !== 'predictor') {
              e.target.style.backgroundColor = '#f8f9fa';
            }
          }}
        >
          🔮 Churn Predictor
        </button>
        
        <button
          style={tabStyle(activeTab === 'dashboard')}
          onClick={() => setActiveTab('dashboard')}
          onMouseOver={(e) => {
            if (activeTab !== 'dashboard') {
              e.target.style.backgroundColor = '#e9ecef';
            }
          }}
          onMouseOut={(e) => {
            if (activeTab !== 'dashboard') {
              e.target.style.backgroundColor = '#f8f9fa';
            }
          }}
        >
          📊 Risk Dashboard
        </button>
        
        <button
          style={tabStyle(activeTab === 'segmentation')}
          onClick={() => setActiveTab('segmentation')}
          onMouseOver={(e) => {
            if (activeTab !== 'segmentation') {
              e.target.style.backgroundColor = '#e9ecef';
            }
          }}
          onMouseOut={(e) => {
            if (activeTab !== 'segmentation') {
              e.target.style.backgroundColor = '#f8f9fa';
            }
          }}
        >
          🎯 Customer Segments
        </button>
      </div>

      {/* Content Area */}
      <div style={{ minHeight: '500px' }}>
        {activeTab === 'predictor' && <ChurnForm />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'segmentation' && <CustomerSegmentation />}
      </div>
    </div>
  );
}

export default App;

