import React, { useEffect, useState } from 'react';
import { fetchKPIData, fetchAlerts } from '../services/api';
import ChurnChart from './ChurnChart';
import CustomerTable from './CustomerTable';

const Dashboard: React.FC = () => {
    const [kpiData, setKpiData] = useState<any>(null);
    const [alerts, setAlerts] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const kpiResponse = await fetchKPIData();
                setKpiData(kpiResponse.data);
                
                const alertsResponse = await fetchAlerts();
                setAlerts(alertsResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        loadData();
    }, []);

    return (
        <div className="dashboard">
            <h1>Churn Prediction Dashboard</h1>
            {kpiData && (
                <div className="kpi-section">
                    <h2>Key Performance Indicators</h2>
                    <p>Total Customers: {kpiData.totalCustomers}</p>
                    <p>Churn Rate: {kpiData.churnRate}%</p>
                    <p>Predicted Churn: {kpiData.predictedChurn}</p>
                </div>
            )}
            <ChurnChart />
            <h2>Alerts</h2>
            <ul>
                {alerts.map((alert, index) => (
                    <li key={index}>{alert.message}</li>
                ))}
            </ul>
            <CustomerTable />
        </div>
    );
};

export default Dashboard;