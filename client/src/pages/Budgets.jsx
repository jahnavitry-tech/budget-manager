import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { useBudget } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';
import { FiDollarSign, FiPercent, FiBell, FiSliders, FiSave, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const Budgets = () => {
  const { user } = useAuth();
  const { currentMonthSummary, categoryBreakdown } = useBudget();
  
  // State management
  const [overallBudget, setOverallBudget] = useState({
    monthlyIncome: 85000,
    budgetLimit: 65000,
    enableAlerts: true,
    alertThreshold: 80
  });
  
  const [categoryBudgets, setCategoryBudgets] = useState([
    {
      id: 'food',
      name: 'Food',
      icon: '🍔',
      currentSpending: 12500,
      limit: 15000,
      limitType: 'amount', // 'amount' or 'percentage'
      enabled: true
    },
    {
      id: 'bills',
      name: 'Monthly Bills & EMIs',
      icon: '💳',
      currentSpending: 8200,
      limit: 10000,
      limitType: 'amount',
      enabled: true
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      icon: '🎬',
      currentSpending: 2800,
      limit: 5000,
      limitType: 'amount',
      enabled: true
    },
    {
      id: 'investments',
      name: 'Investments',
      icon: '📈',
      currentSpending: 15000,
      limit: 20000,
      limitType: 'amount',
      enabled: true
    },
    {
      id: 'longterm',
      name: 'Long Term',
      icon: '🏠',
      currentSpending: 0,
      limit: 10000,
      limitType: 'amount',
      enabled: true
    }
  ]);
  
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Calculate overall budget metrics
  const calculateOverallMetrics = () => {
    const totalSpending = categoryBudgets.reduce((sum, cat) => sum + cat.currentSpending, 0);
    const overallPercentage = (totalSpending / overallBudget.budgetLimit) * 100;
    const remainingBudget = overallBudget.budgetLimit - totalSpending;
    const remainingPercentage = (remainingBudget / overallBudget.budgetLimit) * 100;
    
    return {
      totalSpending,
      overallPercentage: Math.min(overallPercentage, 100),
      remainingBudget,
      remainingPercentage: Math.max(remainingPercentage, 0),
      isOverBudget: overallPercentage > 100
    };
  };

  const overallMetrics = calculateOverallMetrics();

  // Handle overall budget changes
  const handleOverallBudgetChange = (field, value) => {
    setOverallBudget(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle category budget changes
  const handleCategoryBudgetChange = (categoryId, field, value) => {
    setCategoryBudgets(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, [field]: value }
          : cat
      )
    );
  };

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Save budget settings
  const saveBudgetSettings = async () => {
    try {
      // In a real implementation, this would call the API
      // await api.saveBudgetSettings({ overallBudget, categoryBudgets });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving budget settings:', error);
      alert('Failed to save budget settings. Please try again.');
    }
  };

  // Calculate category spending percentage
  const getCategoryPercentage = (category) => {
    if (category.limitType === 'percentage') {
      return (category.currentSpending / (overallBudget.monthlyIncome * category.limit / 100)) * 100;
    } else {
      return (category.currentSpending / category.limit) * 100;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get spending status color
  const getStatusColor = (percentage) => {
    if (percentage >= 100) return 'var(--danger)';
    if (percentage >= 80) return 'var(--warning)';
    return 'var(--success)';
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
            <h1 style={{ margin: '0 0 0.5rem 0' }}>Budget Management</h1>
            <p style={{ margin: 0, color: 'var(--gray)' }}>
              Set and manage your budget limits for better financial control
            </p>
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={saveBudgetSettings}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FiSave />
            Save Budget Settings
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="alert alert-success" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginBottom: '2rem'
          }}>
            <FiCheckCircle />
            Budget settings saved successfully!
          </div>
        )}

        {/* Overall Budget Panel */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border)'
          }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiDollarSign />
              Overall Budget
            </h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>
              (family_accounts-budget_limit)
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Monthly Income */}
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Monthly Income
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem', color: 'var(--success)' }}>$</span>
                <input
                  type="number"
                  className="form-input"
                  value={overallBudget.monthlyIncome}
                  onChange={(e) => handleOverallBudgetChange('monthlyIncome', parseInt(e.target.value) || 0)}
                  style={{ fontSize: '1.5rem', padding: '0.75rem' }}
                />
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--gray)', marginTop: '0.25rem' }}>
                (transactions-SUM WHERE category_type='income')
              </div>
            </div>
            
            {/* Budget Limit */}
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Budget Limit
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>$</span>
                <input
                  type="number"
                  className="form-input"
                  value={overallBudget.budgetLimit}
                  onChange={(e) => handleOverallBudgetChange('budgetLimit', parseInt(e.target.value) || 0)}
                  style={{ fontSize: '1.5rem', padding: '0.75rem' }}
                />
              </div>
              <div style={{ 
                fontSize: '0.9rem', 
                marginTop: '0.5rem',
                color: overallBudget.budgetLimit > overallBudget.monthlyIncome ? 'var(--warning)' : 'var(--gray)'
              }}>
                {overallBudget.budgetLimit > overallBudget.monthlyIncome && (
                  <span>⚠️ Budget exceeds monthly income</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Overall Progress Visualization */}
          <div style={{ marginTop: '2rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '0.5rem'
            }}>
              <span>Total Spending: {formatCurrency(overallMetrics.totalSpending)}</span>
              <span>Remaining: {formatCurrency(overallMetrics.remainingBudget)}</span>
            </div>
            
            <div style={{ 
              height: '20px', 
              backgroundColor: 'var(--light-gray)', 
              borderRadius: '10px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(overallMetrics.overallPercentage, 100)}%`,
                backgroundColor: getStatusColor(overallMetrics.overallPercentage),
                transition: 'width 0.3s ease'
              }}></div>
              {overallMetrics.overallPercentage > 100 && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  height: '100%',
                  width: `${overallMetrics.overallPercentage - 100}%`,
                  backgroundColor: 'var(--danger)',
                  opacity: 0.7
                }}></div>
              )}
            </div>
            
            <div style={{ 
              textAlign: 'center', 
              marginTop: '0.5rem',
              color: overallMetrics.isOverBudget ? 'var(--danger)' : 'var(--gray)'
            }}>
              {overallMetrics.isOverBudget 
                ? `⚠️ Over budget by ${formatCurrency(Math.abs(overallMetrics.remainingBudget))}`
                : `${overallMetrics.overallPercentage.toFixed(1)}% of budget used`
              }
            </div>
          </div>
        </div>

        {/* Alert Settings */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border)'
          }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiBell />
              Budget Alerts
            </h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={overallBudget.enableAlerts}
                  onChange={(e) => handleOverallBudgetChange('enableAlerts', e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                Enable Budget Alerts
              </label>
              <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>
                Receive notifications when approaching budget limits
              </div>
            </div>
            
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Alert Threshold
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={overallBudget.alertThreshold}
                  onChange={(e) => handleOverallBudgetChange('alertThreshold', parseInt(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span style={{ minWidth: '40px', textAlign: 'right' }}>
                  {overallBudget.alertThreshold}%
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--gray)', marginTop: '0.25rem' }}>
                Get alerts when spending reaches this percentage
              </div>
            </div>
          </div>
        </div>

        {/* Category Budgets */}
        <div className="card">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border)'
          }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiSliders />
              Category Budgets
            </h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>
              (budget_limits per category)
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {categoryBudgets.map((category) => {
              const percentage = getCategoryPercentage(category);
              const isOverLimit = percentage >= 100;
              
              return (
                <div key={category.id} className="card" style={{ 
                  margin: 0,
                  border: `1px solid ${getStatusColor(percentage)}`,
                  opacity: category.enabled ? 1 : 0.6
                }}>
                  <div 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      cursor: 'pointer',
                      padding: '1rem'
                    }}
                    onClick={() => toggleCategoryExpansion(category.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{category.icon}</span>
                      <div>
                        <h3 style={{ margin: '0 0 0.25rem 0' }}>{category.name}</h3>
                        <div style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>
                          Current: {formatCurrency(category.currentSpending)}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: '600',
                        color: getStatusColor(percentage)
                      }}>
                        {percentage.toFixed(1)}%
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>
                        of limit used
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {expandedCategories[category.id] && (
                    <div style={{ 
                      borderTop: '1px solid var(--border)',
                      padding: '1rem'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {/* Limit Setting */}
                        <div>
                          <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Budget Limit
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {category.limitType === 'amount' ? (
                              <>
                                <span>$</span>
                                <input
                                  type="number"
                                  className="form-input"
                                  value={category.limit}
                                  onChange={(e) => handleCategoryBudgetChange(category.id, 'limit', parseInt(e.target.value) || 0)}
                                  style={{ flex: 1 }}
                                />
                              </>
                            ) : (
                              <>
                                <input
                                  type="number"
                                  className="form-input"
                                  value={category.limit}
                                  onChange={(e) => handleCategoryBudgetChange(category.id, 'limit', parseInt(e.target.value) || 0)}
                                  style={{ flex: 1 }}
                                />
                                <span>%</span>
                              </>
                            )}
                          </div>
                          
                          <div style={{ marginTop: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                name={`limitType-${category.id}`}
                                checked={category.limitType === 'amount'}
                                onChange={() => handleCategoryBudgetChange(category.id, 'limitType', 'amount')}
                                style={{ marginRight: '0.5rem' }}
                              />
                              Fixed Amount
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginTop: '0.25rem' }}>
                              <input
                                type="radio"
                                name={`limitType-${category.id}`}
                                checked={category.limitType === 'percentage'}
                                onChange={() => handleCategoryBudgetChange(category.id, 'limitType', 'percentage')}
                                style={{ marginRight: '0.5rem' }}
                              />
                              Percentage of Income
                            </label>
                          </div>
                        </div>
                        
                        {/* Current Status */}
                        <div>
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              marginBottom: '0.25rem'
                            }}>
                              <span>Progress</span>
                              <span>{percentage.toFixed(1)}%</span>
                            </div>
                            
                            <div style={{ 
                              height: '12px', 
                              backgroundColor: 'var(--light-gray)', 
                              borderRadius: '6px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                height: '100%',
                                width: `${Math.min(percentage, 100)}%`,
                                backgroundColor: getStatusColor(percentage),
                                transition: 'width 0.3s ease'
                              }}></div>
                            </div>
                            
                            {isOverLimit && (
                              <div style={{ 
                                color: 'var(--danger)', 
                                fontSize: '0.8rem', 
                                marginTop: '0.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                <FiAlertCircle size={14} />
                                Over limit by {formatCurrency(category.currentSpending - (category.limitType === 'percentage' ? (overallBudget.monthlyIncome * category.limit / 100) : category.limit))}
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <input
                                type="checkbox"
                                checked={category.enabled}
                                onChange={(e) => handleCategoryBudgetChange(category.id, 'enabled', e.target.checked)}
                                style={{ marginRight: '0.5rem' }}
                              />
                              Enable Budget Tracking
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budgets;