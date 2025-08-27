import React, { useState } from 'react';
import axios from 'axios';

const PredictionForm: React.FC = () => {
    const [inputData, setInputData] = useState({
        feature1: '',
        feature2: '',
        feature3: '',
        // Add more features as needed
    });
    const [prediction, setPrediction] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputData({ ...inputData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/predict', inputData);
            setPrediction(response.data.prediction);
        } catch (err) {
            setError('Error fetching prediction. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Churn Prediction Form</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="feature1"
                    value={inputData.feature1}
                    onChange={handleChange}
                    placeholder="Feature 1"
                    required
                />
                <input
                    type="text"
                    name="feature2"
                    value={inputData.feature2}
                    onChange={handleChange}
                    placeholder="Feature 2"
                    required
                />
                <input
                    type="text"
                    name="feature3"
                    value={inputData.feature3}
                    onChange={handleChange}
                    placeholder="Feature 3"
                    required
                />
                {/* Add more input fields as needed */}
                <button type="submit" disabled={loading}>
                    {loading ? 'Loading...' : 'Predict'}
                </button>
            </form>
            {prediction && <h3>Prediction: {prediction}</h3>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default PredictionForm;