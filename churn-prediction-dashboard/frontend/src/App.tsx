import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PredictionForm from './components/PredictionForm';
import CustomerTable from './components/CustomerTable';
import ChurnChart from './components/ChurnChart';

const App: React.FC = () => {
    return (
        <Router>
            <div className="App">
                <Switch>
                    <Route path="/" exact component={Dashboard} />
                    <Route path="/prediction" component={PredictionForm} />
                    <Route path="/customers" component={CustomerTable} />
                    <Route path="/churn-chart" component={ChurnChart} />
                </Switch>
            </div>
        </Router>
    );
};

export default App;