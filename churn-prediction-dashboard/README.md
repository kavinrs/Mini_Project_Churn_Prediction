# Churn Prediction Dashboard

## Overview
The Churn Prediction Dashboard is a web application designed to help businesses predict customer churn using machine learning models. The application provides a user-friendly interface for visualizing churn risk, analyzing customer data, and simulating potential outcomes based on different scenarios.

## Features
- **Dashboard**: Displays key performance indicators (KPIs) and alerts related to customer churn.
- **Churn Risk Visualization**: Graphical representation of churn risk distribution among customers.
- **Customer Table**: A detailed table showing customer information and their respective churn risk scores.
- **What-If Simulator**: A form that allows users to simulate changes in customer attributes to see potential impacts on churn risk.

## Technologies Used
- **Frontend**: React, TypeScript, Axios
- **Backend**: Django, Django REST Framework
- **Database**: SQLite (for development), PostgreSQL (for production)
- **Machine Learning**: Scikit-learn for churn prediction model

## Project Structure
```
churn-prediction-dashboard
├── backend
│   ├── ChurnDjango
│   ├── churn
│   ├── manage.py
│   └── requirements.txt
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
   cd backend
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
   cd frontend
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
- The backend API can be accessed at `http://localhost:8000/api/` after starting the Django server.

## Contribution
Feel free to contribute to the project by submitting issues or pull requests. For any questions, please reach out to the project maintainers.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.