// churn-prediction-dashboard/frontend/src/types/index.ts

export interface Customer {
    id: number;
    name: string;
    email: string;
    churnRisk: number;
    lastInteraction: string;
}

export interface Prediction {
    customerId: number;
    predictedChurn: boolean;
    riskScore: number;
}

export interface Alert {
    id: number;
    message: string;
    severity: 'info' | 'warning' | 'error';
    timestamp: string;
}

export interface WhatIfSimulation {
    customerId: number;
    changes: Record<string, any>;
    predictedOutcome: boolean;
    riskScore: number;
}