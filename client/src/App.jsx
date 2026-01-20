import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BudgetProvider } from './contexts/BudgetContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <BudgetProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/transactions" 
                element={
                  <PrivateRoute>
                    <Transactions />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/budgets" 
                element={
                  <PrivateRoute>
                    <Budgets />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <PrivateRoute>
                    <Reports />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/test" element={<div style={{padding: '2rem'}}><h1>Test Route Working!</h1></div>} />
            </Routes>
          </div>
        </Router>
      </BudgetProvider>
    </AuthProvider>
  );
}

export default App;