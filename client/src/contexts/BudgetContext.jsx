import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const BudgetContext = createContext();

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

export const BudgetProvider = ({ children }) => {
  const [currentMonthSummary, setCurrentMonthSummary] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user, token } = useAuth();

  // Fetch dashboard data
  useEffect(() => {
    console.log('BudgetContext - user:', user, 'token:', token);
    if (user && token) {
      console.log('Fetching dashboard data...');
      fetchDashboardData();
    } else {
      console.log('Not fetching - missing user or token');
      setLoading(false);
    }
  }, [user, token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, these would be separate API calls
      // For now, we'll simulate the data structure
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API calls
      const mockSummary = {
        totalIncome: 50000,
        totalExpenses: 35000,
        remaining: 15000,
        remainingPercentage: 30
      };
      
      const mockTransactions = [
        { description: 'Salary Deposit', category: 'Salary', amount: 50000, date: '2024-01-01' },
        { description: 'Grocery Shopping', category: 'Food', amount: -2500, date: '2024-01-05' },
        { description: 'Electricity Bill', category: 'Monthly Bills & EMIs', amount: -1200, date: '2024-01-10' },
        { description: 'Movie Tickets', category: 'Entertainment', amount: -800, date: '2024-01-12' },
        { description: 'Mutual Fund SIP', category: 'Investments', amount: -5000, date: '2024-01-15' }
      ];
      
      const mockCategories = [
        { name: 'Food', amount: 2500, color: '#FF9800' },
        { name: 'Monthly Bills & EMIs', amount: 1200, color: '#F44336' },
        { name: 'Entertainment', amount: 800, color: '#E91E63' },
        { name: 'Investments', amount: 5000, color: '#3F51B5' },
        { name: 'Long Term', amount: 0, color: '#9C27B0' }
      ];
      
      setCurrentMonthSummary(mockSummary);
      setRecentTransactions(mockTransactions);
      setCategoryBreakdown(mockCategories);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transactionData) => {
    try {
      // API call to add transaction
      const response = await axios.post('/api/transactions', transactionData);
      // Refresh dashboard data
      await fetchDashboardData();
      return response.data;
    } catch (err) {
      setError('Failed to add transaction');
      throw err;
    }
  };

  const updateTransaction = async (transactionId, transactionData) => {
    try {
      // API call to update transaction
      const response = await axios.put(`/api/transactions/${transactionId}`, transactionData);
      // Refresh dashboard data
      await fetchDashboardData();
      return response.data;
    } catch (err) {
      setError('Failed to update transaction');
      throw err;
    }
  };

  const deleteTransaction = async (transactionId) => {
    try {
      // API call to delete transaction
      await axios.delete(`/api/transactions/${transactionId}`);
      // Refresh dashboard data
      await fetchDashboardData();
    } catch (err) {
      setError('Failed to delete transaction');
      throw err;
    }
  };

  const setBudgetLimit = async (budgetData) => {
    try {
      // API call to set budget limit
      const response = await axios.post('/api/budgets', budgetData);
      // Refresh dashboard data
      await fetchDashboardData();
      return response.data;
    } catch (err) {
      setError('Failed to set budget limit');
      throw err;
    }
  };

  const value = {
    // State
    currentMonthSummary,
    recentTransactions,
    categoryBreakdown,
    loading,
    error,
    
    // Methods
    fetchDashboardData,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setBudgetLimit
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};