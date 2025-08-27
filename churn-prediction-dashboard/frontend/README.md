# Churn Prediction Dashboard

This project is a Churn Prediction Dashboard built using Django for the backend and React for the frontend. The dashboard provides insights into customer churn, allowing businesses to visualize churn risk and simulate potential outcomes based on different scenarios.

## Features

- **Dashboard**: Displays key performance indicators (KPIs) and alerts related to customer churn.
- **Churn Risk Visualization**: A chart that visualizes the distribution of churn risk among customers.
- **Customer Table**: A table displaying customer data, including churn risk and other relevant metrics.
- **What-If Simulator**: A form that allows users to simulate different scenarios and see potential impacts on churn risk.

## Project Structure

```
churn-prediction-dashboard
├── backend
│   ├── ChurnDjango
│   ├── churn
│   └── manage.py
├── frontend
│   ├── public
│   ├── src
│   ├── package.json
│   └── tsconfig.json
├── README.md
└── hackathon_instructions.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the `backend` directory:
   ```
   cd churn-prediction-dashboard/backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

5. Run database migrations:
   ```
   python manage.py migrate
   ```

6. Start the Django development server:
   ```
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```
   cd churn-prediction-dashboard/frontend
   ```

2. Install the required packages:
   ```
   npm install
   ```

3. Start the React development server:
   ```
   npm start
   ```

## Usage Guidelines

- Access the dashboard at `http://localhost:3000` after starting the frontend server.
- The backend API can be accessed at `http://localhost:8000/api/` (or the appropriate endpoint based on your Django settings).

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.