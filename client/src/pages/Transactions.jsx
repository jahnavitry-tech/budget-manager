import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { useBudget } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';
import { FiPlus, FiSearch, FiFilter, FiCamera, FiUpload, FiEdit, FiTrash2, FiCalendar, FiDollarSign } from 'react-icons/fi';

const Transactions = () => {
  const { user } = useAuth();
  const { recentTransactions, addTransaction, updateTransaction, deleteTransaction } = useBudget();
  
  // State management
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  
  // Filter states
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    transactionDate: '',
    transactionType: 'expense'
  });
  
  // Categories for dropdown
  const categories = [
    { id: 'food', name: 'Food', icon: '🍔' },
    { id: 'bills', name: 'Monthly Bills & EMIs', icon: '💳' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'investments', name: 'Investments', icon: '📈' },
    { id: 'longterm', name: 'Long Term', icon: '🏠' },
    { id: 'salary', name: 'Salary', icon: '💰' },
    { id: 'other', name: 'Other', icon: '📦' }
  ];

  // Initialize transactions data
  useEffect(() => {
    // Convert recentTransactions to proper format
    const formattedTransactions = (recentTransactions || []).map((trans, index) => ({
      id: `trans-${index}`,
      description: trans.description,
      amount: trans.amount,
      category: trans.category,
      date: trans.date,
      addedBy: trans.addedBy || user?.fullName || 'Current User',
      createdAt: new Date().toISOString()
    }));
    
    setTransactions(formattedTransactions);
    setFilteredTransactions(formattedTransactions);
  }, [recentTransactions, user]);

  // Apply filters
  useEffect(() => {
    let filtered = [...transactions];
    
    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(trans => {
        const transDate = new Date(trans.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return transDate >= startDate && transDate <= endDate;
      });
    }
    
    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(trans => trans.category === categoryFilter);
    }
    
    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(trans => 
        trans.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trans.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTransactions(filtered);
  }, [transactions, dateRange, categoryFilter, searchTerm]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const transactionData = {
        description: formData.description,
        amount: parseFloat(formData.amount) * (formData.transactionType === 'expense' ? -1 : 1),
        category: formData.category,
        transaction_date: formData.transactionDate,
        added_by_user_id: user?.userId
      };
      
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, transactionData);
      } else {
        await addTransaction(transactionData);
      }
      
      // Reset form and close modal
      resetForm();
      setShowAddModal(false);
      setEditingTransaction(null);
      
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction. Please try again.');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      category: '',
      transactionDate: '',
      transactionType: 'expense'
    });
  };

  // Handle edit transaction
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      description: transaction.description,
      amount: Math.abs(transaction.amount).toString(),
      category: transaction.category,
      transactionDate: transaction.date,
      transactionType: transaction.amount < 0 ? 'expense' : 'income'
    });
    setShowAddModal(true);
  };

  // Handle delete transaction
  const handleDelete = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(transactionId);
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Failed to delete transaction. Please try again.');
      }
    }
  };

  // Handle receipt scan
  const handleReceiptScan = () => {
    setShowScanModal(true);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  // Get category icon
  const getCategoryIcon = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.icon : '📦';
  };

  return (
    <div>
      <Navigation />
      
      <div className="container" style={{ padding: '2rem 0' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0' }}>Transactions</h1>
            <p style={{ margin: 0, color: 'var(--gray)' }}>
              Manage all your financial transactions
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn btn-secondary"
              onClick={handleReceiptScan}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FiCamera />
              Scan Receipt
            </button>
            
            <button 
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setEditingTransaction(null);
                setShowAddModal(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FiPlus />
              Add Transaction
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1rem',
            alignItems: 'end'
          }}>
            {/* Search */}
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                <FiSearch style={{ marginRight: '0.5rem' }} />
                Search
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Search by description or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            
            {/* Date Range */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  <FiCalendar style={{ marginRight: '0.5rem' }} />
                  Start Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              
              <div style={{ flex: 1 }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  <FiCalendar style={{ marginRight: '0.5rem' }} />
                  End Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                <FiFilter style={{ marginRight: '0.5rem' }} />
                Category
              </label>
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', minWidth: '800px' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Added By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {getCategoryIcon(transaction.category)}
                          {transaction.category}
                        </span>
                      </td>
                      <td>{transaction.description}</td>
                      <td>
                        <span style={{ 
                          color: transaction.amount >= 0 ? 'var(--success)' : 'var(--danger)',
                          fontWeight: '600'
                        }}>
                          {transaction.amount >= 0 ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td>{transaction.addedBy}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleEdit(transaction)}
                            title="Edit transaction"
                          >
                            <FiEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(transaction.id)}
                            title="Delete transaction"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                      <h3>No Transactions Found</h3>
                      <p style={{ color: 'var(--gray)' }}>
                        {transactions.length === 0 
                          ? 'No transactions recorded yet.' 
                          : 'No transactions match your current filters.'
                        }
                      </p>
                      <button 
                        className="btn btn-primary"
                        onClick={() => {
                          resetForm();
                          setShowAddModal(true);
                        }}
                      >
                        <FiPlus style={{ marginRight: '0.5rem' }} />
                        Add Your First Transaction
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Transaction Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ 
            width: '100%', 
            maxWidth: '500px', 
            maxHeight: '90vh', 
            overflowY: 'auto',
            margin: '1rem'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border)'
            }}>
              <h2 style={{ margin: 0 }}>
                {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
              </h2>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTransaction(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {/* Transaction Type */}
                <div>
                  <label className="form-label">Transaction Type</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="transactionType"
                        value="income"
                        checked={formData.transactionType === 'income'}
                        onChange={handleInputChange}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Income
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="transactionType"
                        value="expense"
                        checked={formData.transactionType === 'expense'}
                        onChange={handleInputChange}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Expense
                    </label>
                  </div>
                </div>
                
                {/* Description */}
                <div>
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    name="description"
                    className="form-input"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter transaction description"
                  />
                </div>
                
                {/* Amount */}
                <div>
                  <label className="form-label">
                    <FiDollarSign style={{ marginRight: '0.5rem' }} />
                    Amount
                  </label>
                  <input
                    type="number"
                    name="amount"
                    className="form-input"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                
                {/* Category */}
                <div>
                  <label className="form-label">Category</label>
                  <select
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Date */}
                <div>
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    name="transactionDate"
                    className="form-input"
                    value={formData.transactionDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                marginTop: '2rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border)'
              }}>
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTransaction(null);
                    resetForm();
                  }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Scan Modal */}
      {showScanModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ 
            width: '100%', 
            maxWidth: '500px',
            margin: '1rem'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border)'
            }}>
              <h2 style={{ margin: 0 }}>Scan Receipt</h2>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => setShowScanModal(false)}
              >
                ×
              </button>
            </div>
            
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📸</div>
              <h3>Receipt Scanning Coming Soon</h3>
              <p style={{ color: 'var(--gray)', marginBottom: '2rem' }}>
                This feature will allow you to scan receipts using your camera or upload images for automatic transaction extraction.
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiCamera />
                  Use Camera
                </button>
                <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiUpload />
                  Upload File
                </button>
              </div>
              
              <button 
                className="btn btn-primary"
                onClick={() => setShowScanModal(false)}
                style={{ marginTop: '2rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;