import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/', // Adjust the base URL as needed
    headers: {
        'Content-Type': 'application/json',
    },
});

// Function to get customer data
export const getCustomers = async () => {
    try {
        const response = await api.get('customers/');
        return response.data;
    } catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
    }
};

// Function to get churn predictions
export const getChurnPrediction = async (customerData) => {
    try {
        const response = await api.post('predict/', customerData);
        return response.data;
    } catch (error) {
        console.error('Error fetching churn prediction:', error);
        throw error;
    }
};

// Function to get churn risk distribution
export const getChurnRiskDistribution = async () => {
    try {
        const response = await api.get('churn-risk/');
        return response.data;
    } catch (error) {
        console.error('Error fetching churn risk distribution:', error);
        throw error;
    }
};