# Hackathon Instructions for Churn Prediction Dashboard

## Overview
Welcome to the Churn Prediction Dashboard hackathon! This document provides detailed instructions on how to set up, run, and present your project effectively. 

## Project Setup

### Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- PostgreSQL (if using PostgreSQL instead of SQLite)
- Docker (optional, for containerized setup)

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

### Docker Setup (Optional)
If you prefer to run the project using Docker, ensure you have Docker installed and run:
```
docker-compose up --build
```

## Features
- **Dashboard**: Displays key performance indicators and alerts.
- **Churn Chart**: Visualizes churn risk distribution.
- **Customer Table**: Lists customers with their details and churn risk.
- **What-If Simulator**: Allows users to simulate changes and see potential impacts on churn risk.

## Demo Script
1. **Introduction**: Briefly introduce the project and its purpose.
2. **Walkthrough**: Navigate through the dashboard, explaining each component:
   - Show the Dashboard with KPIs.
   - Demonstrate the Churn Chart and its insights.
   - Display the Customer Table and highlight key customers.
   - Use the Prediction Form to simulate scenarios.
3. **Technical Overview**: Discuss the architecture, including the separation of frontend and backend, and how data flows between them.
4. **Conclusion**: Summarize the project and its potential impact on customer retention strategies.

## Presentation Tips
- Keep your presentation concise and focused.
- Use visuals to enhance understanding.
- Be prepared to answer questions about the technology stack and implementation choices.
- Practice your demo to ensure smooth navigation and functionality.

## Contact Information
For any questions or support during the hackathon, please reach out to the project lead at [your_email@example.com].

Good luck, and have fun building your Churn Prediction Dashboard!