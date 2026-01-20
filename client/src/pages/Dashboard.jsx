import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { useBudget } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';
import { FiPlus, FiClock, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const Dashboard = () => {
  const { 
    currentMonthSummary, 
    recentTransactions, 
    categoryBreakdown,
    loading,
    error,
    fetchDashboardData
  } = useBudget();
  
  const { user, token } = useAuth();
  
  const [timeFilter, setTimeFilter] = useState('month');
  const [categoryFilter, setCategoryFilter] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [barFilter, setBarFilter] = useState('month');
  const [barStartDate, setBarStartDate] = useState('');
  const [barEndDate, setBarEndDate] = useState('');
  const [hoveredSlice, setHoveredSlice] = useState(null);

  // Debug logging
  console.log('Dashboard render - loading:', loading, 'user:', user, 'token:', token);
  console.log('Budget data - summary:', currentMonthSummary, 'transactions:', recentTransactions, 'categories:', categoryBreakdown);
  
  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="container" style={{ padding: '2rem 0' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>📊</div>
            <div>Loading dashboard data...</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--gray)', marginTop: '0.5rem' }}>
              Initializing your financial overview
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <div>
        <Navigation />
        <div className="container" style={{ padding: '2rem 0' }}>
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Error Loading Dashboard</h3>
            <p style={{ color: 'var(--gray)', marginBottom: '1rem' }}>{error}</p>
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Handle missing data
  if (!currentMonthSummary && !recentTransactions && !categoryBreakdown) {
    return (
      <div>
        <Navigation />
        <div className="container" style={{ padding: '2rem 0' }}>
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ marginBottom: '1rem' }}>No Data Available</h3>
            <p style={{ color: 'var(--gray)', marginBottom: '1rem' }}>
              Waiting for dashboard data to load...
            </p>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                if (typeof fetchDashboardData === 'function') {
                  fetchDashboardData();
                }
              }}
            >
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dummy Data with Database References
  const summary = currentMonthSummary || {
    totalIncome: 85000, // (transactions-amount WHERE category_type='income' AND month=January)
    totalExpenses: 62500, // (transactions-amount WHERE category_type='expense' AND month=January)
    remaining: 22500, // (calculated: total_income - total_expenses)
    remainingPercentage: 26.5 // (calculated: remaining/total_income * 100)
  };
  
  // Filtered data for charts
  const filteredIncome = summary.totalIncome || 85000;
  const filteredExpenses = summary.totalExpenses || 62500;
  
  // Ensure categories array exists (using categoryBreakdown from context)
  const safeCategories = Array.isArray(categoryBreakdown) ? categoryBreakdown : [];
  
  // Pie chart data calculation with error handling
  const totalFilteredAmount = safeCategories.reduce((sum, cat) => sum + (cat.amount || 0), 0) || 1;
  const pieChartData = [
    {
      name: 'Food',
      amount: 12500,
      percentage: (12500 / totalFilteredAmount) * 100,
      color: '#FF9800'
    },
    {
      name: 'Monthly Bills & EMIs',
      amount: 8200,
      percentage: (8200 / totalFilteredAmount) * 100,
      color: '#F44336'
    },
    {
      name: 'Entertainment',
      amount: 2800,
      percentage: (2800 / totalFilteredAmount) * 100,
      color: '#E91E63'
    },
    {
      name: 'Investments',
      amount: 15000,
      percentage: (15000 / totalFilteredAmount) * 100,
      color: '#3F51B5'
    },
    {
      name: 'Long Term',
      amount: 5000,
      percentage: (5000 / totalFilteredAmount) * 100,
      color: '#9C27B0'
    },
    {
      name: 'Remaining',
      amount: 22500,
      percentage: (22500 / totalFilteredAmount) * 100,
      color: '#4CAF50'
    }
  ].filter(item => item.amount > 0); // Only show categories with amounts
  
  const transactions = recentTransactions || [
    {
      description: 'Salary Deposit', // (transactions-description)
      category: 'Salary', // (categories-category_name)
      amount: 85000, // (transactions-amount)
      date: '2024-01-01', // (transactions-transaction_date)
      addedBy: 'John Doe' // (users-full_name)
    },
    {
      description: 'Grocery Shopping', // (transactions-description)
      category: 'Food', // (categories-category_name)
      amount: -12500, // (transactions-amount)
      date: '2024-01-05', // (transactions-transaction_date)
      addedBy: 'Jane Smith' // (users-full_name)
    },
    {
      description: 'Electricity Bill', // (transactions-description)
      category: 'Monthly Bills & EMIs', // (categories-category_name)
      amount: -8200, // (transactions-amount)
      date: '2024-01-10', // (transactions-transaction_date)
      addedBy: 'Mike Johnson' // (users-full_name)
    },
    {
      description: 'Movie Tickets', // (transactions-description)
      category: 'Entertainment', // (categories-category_name)
      amount: -2800, // (transactions-amount)
      date: '2024-01-12', // (transactions-transaction_date)
      addedBy: 'Sarah Wilson' // (users-full_name)
    },
    {
      description: 'Mutual Fund SIP', // (transactions-description)
      category: 'Investments', // (categories-category_name)
      amount: -15000, // (transactions-amount)
      date: '2024-01-15', // (transactions-transaction_date)
      addedBy: 'John Doe' // (users-full_name)
    }
  ];
  
  const categories = categoryBreakdown || [
    {
      name: 'Food', // (categories-category_name)
      amount: 12500, // (SUM transactions-amount WHERE category_id=food_category_id)
      color: '#FF9800', // (categories-color_code)
      icon: '🍔' // (categories-icon)
    },
    {
      name: 'Monthly Bills & EMIs', // (categories-category_name)
      amount: 8200, // (SUM transactions-amount WHERE category_id=bills_category_id)
      color: '#F44336', // (categories-color_code)
      icon: '💳' // (categories-icon)
    },
    {
      name: 'Entertainment', // (categories-category_name)
      amount: 2800, // (SUM transactions-amount WHERE category_id=entertainment_category_id)
      color: '#E91E63', // (categories-color_code)
      icon: '🎬' // (categories-icon)
    },
    {
      name: 'Investments', // (categories-category_name)
      amount: 15000, // (SUM transactions-amount WHERE category_id=investments_category_id)
      color: '#3F51B5', // (categories-color_code)
      icon: '📈' // (categories-icon)
    },
    {
      name: 'Long Term', // (categories-category_name)
      amount: 0, // (SUM transactions-amount WHERE category_id=longterm_category_id)
      color: '#9C27B0', // (categories-color_code)
      icon: '🏠' // (categories-icon)
    }
  ];

  return (
    <div>
      <Navigation />
      
      <div className="container" style={{ padding: '2rem 0' }}>
        {/* Header with User Info */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem',
          padding: '1rem',
          backgroundColor: 'rgba(67, 97, 238, 0.05)',
          borderRadius: '12px'
        }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0' }}>Dashboard</h1>
            <p style={{ 
              margin: 0, 
              color: 'var(--gray)', 
              fontSize: '0.9rem' 
            }}>
              Welcome back! Here's your financial overview for January 2024
              <br />
              <small>(family_accounts-account_name: Doe Family)</small>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ 
              textAlign: 'right', 
              fontSize: '0.9rem', 
              color: 'var(--gray)' 
            }}>
              <div>Last updated: Today, 10:30 AM</div>
              <div style={{ fontSize: '0.8rem' }}>
                (transactions-updated_at latest record)
              </div>
            </div>
            <button 
              className="btn btn-primary" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.75rem 1.5rem'
              }}
            >
              <FiPlus />
              Add Transaction
              <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                (transactions-create)
              </span>
            </button>
          </div>
        </div>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
          {/* Income Card */}
          <div className="card" style={{ 
            borderLeft: '4px solid var(--success)',
            backgroundColor: 'rgba(76, 201, 240, 0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: '10px', 
              right: '10px', 
              fontSize: '0.7rem', 
              color: 'var(--success)',
              opacity: 0.7
            }}>
              (transactions-SUM WHERE category_type='income')
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Income
                </h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
                  ₹{summary.totalIncome?.toFixed(2) || '0.00'}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--success)', margin: '0.25rem 0' }}>
                  +12% from last month
                </p>
              </div>
              <FiTrendingUp style={{ fontSize: '2rem', color: 'var(--success)' }} />
            </div>
          </div>

          {/* Expenses Card */}
          <div className="card" style={{ 
            borderLeft: '4px solid var(--danger)',
            backgroundColor: 'rgba(230, 57, 70, 0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: '10px', 
              right: '10px', 
              fontSize: '0.7rem', 
              color: 'var(--danger)',
              opacity: 0.7
            }}>
              (transactions-SUM WHERE category_type='expense')
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Total Expenses
                </h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--danger)' }}>
                  ₹{summary.totalExpenses?.toFixed(2) || '0.00'}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--danger)', margin: '0.25rem 0' }}>
                  +8% from last month
                </p>
              </div>
              <FiTrendingDown style={{ fontSize: '2rem', color: 'var(--danger)' }} />
            </div>
          </div>

          {/* Remaining Balance Card */}
          <div className="card" style={{ 
            borderLeft: '4px solid var(--primary)',
            backgroundColor: 'rgba(67, 97, 238, 0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: '10px', 
              right: '10px', 
              fontSize: '0.7rem', 
              color: 'var(--primary)',
              opacity: 0.7
            }}>
              (calculated: income - expenses)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Remaining Balance
                </h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  ₹{summary.remaining?.toFixed(2) || '0.00'}
                </p>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: summary.remainingPercentage >= 0 ? 'var(--success)' : 'var(--danger)',
                  fontWeight: '600'
                }}>
                  {summary.remainingPercentage?.toFixed(1) || '0'}% remaining
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--gray)', margin: '0.25rem 0 0 0' }}>
                  Budget utilization tracked
                </p>
              </div>
              <FiClock style={{ fontSize: '2rem', color: 'var(--primary)' }} />
            </div>
          </div>
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
          {/* Enhanced Income vs Expenses Bar Chart with Filtering */}
          <div className="card" style={{ position: 'relative' }}>
            <div style={{ 
              position: 'absolute', 
              top: '10px', 
              right: '10px', 
              fontSize: '0.7rem', 
              color: 'var(--gray)',
              opacity: 0.7
            }}>
              (transactions-GROUP BY category_type)
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Income vs Expenses</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select 
                  value={barFilter}
                  onChange={(e) => setBarFilter(e.target.value)}
                  className="form-input"
                  style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}
                >
                  <option value="month">This Month</option>
                  <option value="week">This Week</option>
                  <option value="custom">Custom Range</option>
                </select>
                {barFilter === 'custom' && (
                  <>
                    <input 
                      type="date" 
                      value={barStartDate}
                      onChange={(e) => setBarStartDate(e.target.value)}
                      className="form-input"
                      style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                    />
                    <input 
                      type="date" 
                      value={barEndDate}
                      onChange={(e) => setBarEndDate(e.target.value)}
                      className="form-input"
                      style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                    />
                  </>
                )}
              </div>
            </div>
            
            <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '2rem' }}>
              {/* Income Bar */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  width: '60px', 
                  height: `${(filteredIncome / Math.max(filteredIncome, filteredExpenses)) * 180}px`, 
                  backgroundColor: 'var(--success)',
                  borderRadius: '8px 8px 0 0',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  padding: '4px',
                  transition: 'height 0.3s ease',
                  position: 'relative'
                }}>
                  <span style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>
                    ₹{filteredIncome?.toLocaleString('en-IN')}
                  </span>
                  {/* Tooltip */}
                  <div style={{
                    position: 'absolute',
                    top: '-40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    color: 'white',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    textAlign: 'center',
                    minWidth: '100px',
                    zIndex: 10
                  }}>
                    <div style={{ fontWeight: 'bold' }}>Income</div>
                    <div>₹{filteredIncome?.toLocaleString('en-IN')}</div>
                    <div>({((filteredIncome / (filteredIncome + filteredExpenses)) * 100)?.toFixed(1)}%)</div>
                  </div>
                </div>
                <div style={{ 
                  marginTop: '0.5rem', 
                  fontWeight: '600', 
                  color: 'var(--success)' 
                }}>
                  Income
                </div>
              </div>
              
              {/* Expenses Bar */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  width: '60px', 
                  height: `${(filteredExpenses / Math.max(filteredIncome, filteredExpenses)) * 180}px`, 
                  backgroundColor: 'var(--danger)',
                  borderRadius: '8px 8px 0 0',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  padding: '4px',
                  transition: 'height 0.3s ease',
                  position: 'relative'
                }}>
                  <span style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>
                    ₹{filteredExpenses?.toLocaleString('en-IN')}
                  </span>
                  {/* Tooltip */}
                  <div style={{
                    position: 'absolute',
                    top: '-40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    color: 'white',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    textAlign: 'center',
                    minWidth: '100px',
                    zIndex: 10
                  }}>
                    <div style={{ fontWeight: 'bold' }}>Expenses</div>
                    <div>₹{filteredExpenses?.toLocaleString('en-IN')}</div>
                    <div>({((filteredExpenses / (filteredIncome + filteredExpenses)) * 100)?.toFixed(1)}%)</div>
                  </div>
                </div>
                <div style={{ 
                  marginTop: '0.5rem', 
                  fontWeight: '600', 
                  color: 'var(--danger)' 
                }}>
                  Expenses
                </div>
              </div>
            </div>
            
            {/* Summary Stats */}
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem', 
              backgroundColor: 'rgba(67, 97, 238, 0.05)', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-around', 
                fontSize: '0.9rem' 
              }}>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--success)' }}>
                    ₹{filteredIncome?.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Total Income</div>
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--danger)' }}>
                    ₹{filteredExpenses?.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Total Expenses</div>
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--primary)' }}>
                    ₹{(filteredIncome - filteredExpenses)?.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Net Balance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Spending by Category Pie Chart */}
          <div className="card" style={{ position: 'relative' }}>
            <div style={{ 
              position: 'absolute', 
              top: '10px', 
              right: '10px', 
              fontSize: '0.7rem', 
              color: 'var(--gray)',
              opacity: 0.7
            }}>
              (transactions-GROUP BY category_id)
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Spending by Category</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="form-input"
                  style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}
                >
                  <option value="month">This Month</option>
                  <option value="week">This Week</option>
                  <option value="custom">Custom Range</option>
                </select>
                {categoryFilter === 'custom' && (
                  <>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="form-input"
                      style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                    />
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="form-input"
                      style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                    />
                  </>
                )}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Pie Chart Visualization */}
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <svg width="180" height="180" viewBox="0 0 180 180">
                    {/* Background circle */}
                    <circle cx="90" cy="90" r="75" fill="#f8f9fa" />
                    
                    {/* Pie slices */}
                    {pieChartData.map((slice, index) => {
                      const cumulativePercentage = pieChartData.slice(0, index).reduce((sum, item) => sum + item.percentage, 0);
                      const startX = 90 + 75 * Math.cos((cumulativePercentage * 3.6 - 90) * Math.PI / 180);
                      const startY = 90 + 75 * Math.sin((cumulativePercentage * 3.6 - 90) * Math.PI / 180);
                      const endX = 90 + 75 * Math.cos(((cumulativePercentage + slice.percentage) * 3.6 - 90) * Math.PI / 180);
                      const endY = 90 + 75 * Math.sin(((cumulativePercentage + slice.percentage) * 3.6 - 90) * Math.PI / 180);
                      const largeArcFlag = slice.percentage > 50 ? 1 : 0;
                      
                      return (
                        <path
                          key={index}
                          d={`M 90 90 L ${startX} ${startY} A 75 75 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                          fill={slice.color}
                          stroke="white"
                          strokeWidth="2"
                          onMouseEnter={() => setHoveredSlice(slice)}
                          onMouseLeave={() => setHoveredSlice(null)}
                          style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                        />
                      );
                    })}
                    
                    {/* Center circle with total */}
                    <circle cx="90" cy="90" r="45" fill="white" />
                    <text x="90" y="85" textAnchor="middle" fontSize="16" fontWeight="bold" fill="var(--dark)">
                      ₹{totalFilteredAmount?.toLocaleString('en-IN')}
                    </text>
                    <text x="90" y="100" textAnchor="middle" fontSize="10" fill="var(--gray)">
                      Total
                    </text>
                  </svg>
                  
                  {/* Tooltip */}
                  {hoveredSlice && (
                    <div style={{
                      position: 'absolute',
                      top: '-60px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      color: 'white',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      textAlign: 'center',
                      minWidth: '120px',
                      zIndex: 10
                    }}>
                      <div style={{ fontWeight: 'bold' }}>{hoveredSlice.name}</div>
                      <div>₹{hoveredSlice.amount?.toLocaleString('en-IN')}</div>
                      <div>{hoveredSlice.percentage?.toFixed(1)}%</div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Legend */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {pieChartData.map((slice, index) => (
                  <div 
                    key={index}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      padding: '0.25rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: hoveredSlice?.name === slice.name ? 'rgba(67, 97, 238, 0.1)' : 'transparent'
                    }}
                    onMouseEnter={() => setHoveredSlice(slice)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  >
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      backgroundColor: slice.color,
                      borderRadius: '50%'
                    }}></div>
                    <div>
                      <div style={{ fontWeight: '600' }}>{slice.name}</div>
                      <div style={{ color: 'var(--gray)' }}>
                        ₹{slice.amount?.toLocaleString('en-IN')} ({slice.percentage?.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Recent Transactions */}
        <div className="card" style={{ position: 'relative' }}>
          <div style={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px', 
            fontSize: '0.7rem', 
            color: 'var(--gray)',
            opacity: 0.7
          }}>
            (transactions-LIMIT 5 ORDER BY created_at DESC)
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0' }}>Recent Transactions</h3>
              <p style={{ 
                margin: 0, 
                fontSize: '0.9rem', 
                color: 'var(--gray)' 
              }}>
                Latest activity from your family account
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select 
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="form-input"
                style={{ width: 'auto', padding: '0.5rem', fontSize: '0.9rem' }}
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last 3 Months</option>
              </select>
              <button 
                className="btn btn-outline"
                style={{ 
                  padding: '0.5rem 1rem', 
                  fontSize: '0.8rem' 
                }}
              >
                View All
              </button>
            </div>
          </div>
          
          <div>
            {transactions.slice(0, 5).map((transaction, index) => (
              <div 
                key={index} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1rem',
                  borderBottom: index < transactions.length - 1 ? '1px solid var(--border)' : 'none',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  backgroundColor: 'rgba(248, 249, 250, 0.5)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(67, 97, 238, 0.05)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(248, 249, 250, 0.5)'}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    marginBottom: '0.25rem' 
                  }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%',
                      backgroundColor: transaction.amount >= 0 ? 'var(--success)' : 'var(--danger)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {transaction.amount >= 0 ? '↑' : '↓'}
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                      {transaction.description || 'Unnamed Transaction'}
                    </div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    color: 'var(--gray)', 
                    fontSize: '0.9rem',
                    marginLeft: '40px'
                  }}>
                    <span style={{ 
                      backgroundColor: 'rgba(108, 117, 125, 0.1)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem'
                    }}>
                      {transaction.category || 'Uncategorized'}
                    </span>
                    <span>•</span>
                    <span>{transaction.date}</span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      👤 {transaction.addedBy}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontWeight: '700',
                    fontSize: '1.2rem',
                    color: transaction.amount >= 0 ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {transaction.amount >= 0 ? '+' : ''}₹{transaction.amount?.toLocaleString('en-IN') || '0.00'}
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: 'var(--gray)',
                    marginTop: '0.25rem'
                  }}>
                    {transaction.time || '10:30 AM'}
                  </div>
                </div>
              </div>
            ))}
            
            {transactions.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                color: 'var(--gray)', 
                padding: '3rem 2rem',
                backgroundColor: 'rgba(248, 249, 250, 0.5)',
                borderRadius: '12px',
                margin: '1rem 0'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--dark)' }}>
                  No Recent Transactions
                </h3>
                <p style={{ margin: '0 0 1rem 0' }}>
                  Start tracking your family's finances by adding your first transaction
                </p>
                <p style={{ fontSize: '0.9rem' }}>
                  (transactions-table empty for family_account_id)
                </p>
                <button 
                  className="btn btn-primary"
                  style={{ marginTop: '1rem' }}
                >
                  <FiPlus style={{ marginRight: '0.5rem' }} />
                  Add First Transaction
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;