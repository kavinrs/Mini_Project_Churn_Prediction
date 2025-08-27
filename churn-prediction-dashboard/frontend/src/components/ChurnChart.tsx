import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

const ChurnChart = () => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Churn Risk Distribution',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    });

    useEffect(() => {
        const fetchChurnData = async () => {
            try {
                const response = await axios.get('/api/churn/risk-distribution');
                const data = response.data;

                setChartData({
                    labels: data.labels,
                    datasets: [
                        {
                            label: 'Churn Risk Distribution',
                            data: data.values,
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        },
                    ],
                });
            } catch (error) {
                console.error('Error fetching churn data:', error);
            }
        };

        fetchChurnData();
    }, []);

    return (
        <div>
            <h2>Churn Risk Distribution</h2>
            <Bar data={chartData} />
        </div>
    );
};

export default ChurnChart;