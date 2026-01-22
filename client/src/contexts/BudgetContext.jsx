import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { dashboardAPI, transactionsAPI, categoriesAPI, budgetsAPI } from '../services/api';

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
    
    // Only fetch if we have both user and token and user is fully loaded
    if (user && token && user.userId) {
      console.log('Fetching dashboard data...');
      fetchDashboardData();
    } else if (!user && !token) {
      // Clear data when logged out
      console.log('Clearing dashboard data - user logged out');
      setCurrentMonthSummary(null);
      setRecentTransactions([]);
      setCategoryBreakdown([]);
      setLoading(false);
    } else {
      console.log('Not fetching - missing user or token or user not fully loaded');
      setLoading(false);
    }
  }, [user, token]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching real dashboard data from API...');
      
      // Fetch dashboard overview data
      const [overviewResponse, recentResponse, categoriesResponse] = await Promise.all([
        dashboardAPI.getOverview(),
        transactionsAPI.getRecent(),
        categoriesAPI.getDefault()
      ]);
      
      console.log('API Responses:', {
        overview: overviewResponse.data,
        recent: recentResponse.data,
        categories: categoriesResponse.data
      });
      
      // Process overview data
      const overviewData = overviewResponse.data;
      const summary = {
        totalIncome: overviewData.total_income || 0,
        totalExpenses: Math.abs(overviewData.total_expenses) || 0,
        remaining: overviewData.total_savings || 0,
        remainingPercentage: overviewData.savings_percentage || 0
      };
      
      // Process recent transactions
      const transactions = (recentResponse.data.transactions || []).map(tx => ({
        id: tx.transaction_id,
        description: tx.description,
        category: tx.category_name,
        amount: parseFloat(tx.amount),
        date: tx.transaction_date,
        addedBy: tx.added_by_user_name || 'Unknown'
      }));
      
      // Process category breakdown
      const categories = (categoriesResponse.data.categories || []).map(cat => ({
        id: cat.category_id,
        name: cat.category_name,
        type: cat.category_type,
        amount: Math.abs(parseFloat(cat.total_amount) || 0),
        color: cat.color_code || '#CCCCCC',
        icon: cat.icon || '💰'
      }));
      
      setCurrentMonthSummary(summary);
      setRecentTransactions(transactions);
      setCategoryBreakdown(categories);
      
      console.log('Dashboard data updated:', { summary, transactions, categories });
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(`Failed to load dashboard data: ${err.response?.data?.message || err.message}`);
      
      // Fallback to mock data if API fails
      const mockSummary = {
        totalIncome: 85000,
        totalExpenses: 62500,
        remaining: 22500,
        remainingPercentage: 26.5
      };
      
      const mockTransactions = [
        { description: 'Monthly Salary Deposit', category: 'Salary', amount: 85000, date: '2024-01-01', addedBy: 'System' },
        { description: 'Weekly Grocery Shopping', category: 'Food', amount: -12500, date: '2024-01-05', addedBy: 'System' },
        { description: 'Electricity and Internet Bill', category: 'Monthly Bills & EMIs', amount: -8200, date: '2024-01-10', addedBy: 'System' },
        { description: 'Movie Night Out', category: 'Entertainment', amount: -2800, date: '2024-01-12', addedBy: 'System' },
        { description: 'Monthly Mutual Fund SIP', category: 'Investments', amount: -15000, date: '2024-01-15', addedBy: 'System' }
      ];
      
      const mockCategories = [
        { id: '9796595e-b4b4-44f5-bc57-ac623c735003', name: 'Food', amount: 12500, color: '#FF9800', icon: '🍔' },
        { id: 'bills-category-id-mock-uuid-12345', name: 'Monthly Bills & EMIs', amount: 8200, color: '#F44336', icon: '🏠' },
        { id: 'entertainment-category-id-mock-uuid', name: 'Entertainment', amount: 2800, color: '#E91E63', icon: '🎬' },
        { id: 'investments-category-id-mock-uuid-', name: 'Investments', amount: 15000, color: '#3F51B5', icon: '📈' },
        { id: 'longterm-category-id-mock-uuid-ab', name: 'Long Term', amount: 5000, color: '#9C27B0', icon: '🏦' }
      ];
      
      setCurrentMonthSummary(mockSummary);
      setRecentTransactions(mockTransactions);
      setCategoryBreakdown(mockCategories);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transactionData) => {
    try {
      // API call to add transaction
      const response = await transactionsAPI.create(transactionData);
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
      const response = await transactionsAPI.update(transactionId, transactionData);
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
      await transactionsAPI.delete(transactionId);
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
      const response = await budgetsAPI.create(budgetData);
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