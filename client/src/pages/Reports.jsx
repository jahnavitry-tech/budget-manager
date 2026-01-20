import React, { useState, useRef } from 'react';
import Navigation from '../components/Navigation';
import { useBudget } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';
import { FiDownload, FiUpload, FiFile, FiImage, FiTable, FiBarChart2, FiPieChart, FiCalendar, FiPrinter } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Reports = () => {
  const { user } = useAuth();
  const { currentMonthSummary, recentTransactions, categoryBreakdown } = useBudget();
  
  // State management
  const [reportType, setReportType] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2024-01-31'
  });
  const [exportFormat, setExportFormat] = useState('pdf');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importType, setImportType] = useState('csv');
  const [file, setFile] = useState(null);
  
  // Report data generation
  const generateReportData = () => {
    const transactions = recentTransactions || [];
    const categories = categoryBreakdown || [];
    
    // Monthly summary data
    const monthlyData = {
      income: currentMonthSummary?.totalIncome || 85000,
      expenses: Math.abs(currentMonthSummary?.totalExpenses || 62500),
      savings: (currentMonthSummary?.totalIncome || 85000) + (currentMonthSummary?.totalExpenses || 62500),
      categories: categories.map(cat => ({
        name: cat.name,
        amount: cat.amount,
        percentage: ((cat.amount / Math.abs(currentMonthSummary?.totalExpenses || 62500)) * 100).toFixed(1)
      }))
    };
    
    // Weekly breakdown
    const weeklyData = [
      { week: 'Week 1', income: 20000, expenses: 15000, savings: 5000 },
      { week: 'Week 2', income: 22000, expenses: 18000, savings: 4000 },
      { week: 'Week 3', income: 21000, expenses: 16000, savings: 5000 },
      { week: 'Week 4', income: 22000, expenses: 13500, savings: 8500 }
    ];
    
    // Category breakdown
    const categoryData = categories.map(cat => ({
      name: cat.name,
      icon: cat.icon || '📦',
      amount: cat.amount,
      color: cat.color || '#333'
    }));
    
    return { monthlyData, weeklyData, categoryData, transactions };
  };
  
  const reportData = generateReportData();
  const reportRef = useRef();

  // Handle file import
  const handleFileImport = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Simulate file processing
      setTimeout(() => {
        alert(`${importType.toUpperCase()} file processed successfully!`);
        setShowImportModal(false);
        setFile(null);
      }, 2000);
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`budget-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Description', 'Category', 'Amount', 'Type'],
      ...reportData.transactions.map(t => [
        t.date,
        t.description,
        t.category,
        t.amount,
        t.amount >= 0 ? 'Income' : 'Expense'
      ])
    ]
    .map(row => row.join(','))
    .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle export
  const handleExport = () => {
    if (exportFormat === 'pdf') {
      exportToPDF();
    } else if (exportFormat === 'csv') {
      exportToCSV();
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
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
            <h1 style={{ margin: '0 0 0.5rem 0' }}>Financial Reports</h1>
            <p style={{ margin: 0, color: 'var(--gray)' }}>
              Generate detailed reports and analytics of your financial data
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowImportModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FiUpload />
              Import Data
            </button>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                className="form-select"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                style={{ minWidth: '100px' }}
              >
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
              </select>
              <button 
                className="btn btn-primary"
                onClick={handleExport}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FiDownload />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Report Controls */}
        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            alignItems: 'end'
          }}>
            {/* Report Type */}
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                <FiBarChart2 style={{ marginRight: '0.5rem' }} />
                Report Type
              </label>
              <select
                className="form-select"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="monthly">Monthly Summary</option>
                <option value="weekly">Weekly Breakdown</option>
                <option value="category">Category Analysis</option>
                <option value="trends">Spending Trends</option>
              </select>
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
            
            <button 
              className="btn btn-primary"
              style={{ height: 'fit-content', padding: '0.75rem 1.5rem' }}
            >
              <FiBarChart2 style={{ marginRight: '0.5rem' }} />
              Generate Report
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div ref={reportRef}>
          {/* Monthly Summary Report */}
          {reportType === 'monthly' && (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '2rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border)'
              }}>
                <h2 style={{ margin: 0 }}>Monthly Financial Summary</h2>
                <div style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>
                  {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
                </div>
              </div>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
                <div className="card" style={{ 
                  borderLeft: '4px solid var(--success)',
                  backgroundColor: 'rgba(76, 201, 240, 0.05)'
                }}>
                  <h3 style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    Total Income
                  </h3>
                  <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--success)' }}>
                    {formatCurrency(reportData.monthlyData.income)}
                  </div>
                </div>
                
                <div className="card" style={{ 
                  borderLeft: '4px solid var(--danger)',
                  backgroundColor: 'rgba(244, 67, 54, 0.05)'
                }}>
                  <h3 style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    Total Expenses
                  </h3>
                  <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--danger)' }}>
                    {formatCurrency(reportData.monthlyData.expenses)}
                  </div>
                </div>
                
                <div className="card" style={{ 
                  borderLeft: '4px solid var(--primary)',
                  backgroundColor: 'rgba(67, 97, 238, 0.05)'
                }}>
                  <h3 style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    Net Savings
                  </h3>
                  <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--primary)' }}>
                    {formatCurrency(reportData.monthlyData.savings)}
                  </div>
                </div>
              </div>
              
              {/* Category Breakdown */}
              <div>
                <h3 style={{ marginBottom: '1rem' }}>Spending by Category</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {reportData.monthlyData.categories.map((category, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '1rem',
                      backgroundColor: 'var(--light-gray)',
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                          width: '12px', 
                          height: '12px', 
                          backgroundColor: '#333',
                          borderRadius: '50%'
                        }}></div>
                        <span style={{ fontWeight: '600' }}>{category.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span>{formatCurrency(category.amount)}</span>
                        <span style={{ color: 'var(--gray)' }}>{category.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Weekly Breakdown Report */}
          {reportType === 'weekly' && (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '2rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border)'
              }}>
                <h2 style={{ margin: 0 }}>Weekly Spending Breakdown</h2>
                <div style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>
                  {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
                </div>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table className="table" style={{ width: '100%', minWidth: '600px' }}>
                  <thead>
                    <tr>
                      <th>Week</th>
                      <th>Income</th>
                      <th>Expenses</th>
                      <th>Savings</th>
                      <th>Savings Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.weeklyData.map((week, index) => (
                      <tr key={index}>
                        <td>{week.week}</td>
                        <td style={{ color: 'var(--success)' }}>{formatCurrency(week.income)}</td>
                        <td style={{ color: 'var(--danger)' }}>{formatCurrency(week.expenses)}</td>
                        <td style={{ color: 'var(--primary)' }}>{formatCurrency(week.savings)}</td>
                        <td>{((week.savings / week.income) * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Category Analysis Report */}
          {reportType === 'category' && (
            <div className="card">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '2rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border)'
              }}>
                <h2 style={{ margin: 0 }}>Category Spending Analysis</h2>
                <div style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>
                  {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {reportData.categoryData.map((category, index) => (
                  <div key={index} className="card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                      {category.icon}
                    </div>
                    <h3 style={{ margin: '0 0 1rem 0' }}>{category.name}</h3>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: '700', 
                      color: 'var(--primary)',
                      marginBottom: '0.5rem'
                    }}>
                      {formatCurrency(category.amount)}
                    </div>
                    <div style={{ 
                      height: '8px', 
                      backgroundColor: 'var(--light-gray)', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min((category.amount / 20000) * 100, 100)}%`,
                        backgroundColor: category.color,
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
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
              <h2 style={{ margin: 0 }}>Import Financial Data</h2>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  setShowImportModal(false);
                  setFile(null);
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Import Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <label 
                  className={`card ${importType === 'csv' ? 'active' : ''}`}
                  style={{ 
                    textAlign: 'center', 
                    padding: '1rem',
                    cursor: 'pointer',
                    border: importType === 'csv' ? '2px solid var(--primary)' : '1px solid var(--border)'
                  }}
                  onClick={() => setImportType('csv')}
                >
                  <FiTable style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                  <div>CSV Bank Statement</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray)', marginTop: '0.25rem' }}>
                    (.csv files)
                  </div>
                </label>
                
                <label 
                  className={`card ${importType === 'image' ? 'active' : ''}`}
                  style={{ 
                    textAlign: 'center', 
                    padding: '1rem',
                    cursor: 'pointer',
                    border: importType === 'image' ? '2px solid var(--primary)' : '1px solid var(--border)'
                  }}
                  onClick={() => setImportType('image')}
                >
                  <FiImage style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                  <div>Receipt Images</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray)', marginTop: '0.25rem' }}>
                    (.jpg, .png files)
                  </div>
                </label>
                
                <label 
                  className={`card ${importType === 'pdf' ? 'active' : ''}`}
                  style={{ 
                    textAlign: 'center', 
                    padding: '1rem',
                    cursor: 'pointer',
                    border: importType === 'pdf' ? '2px solid var(--primary)' : '1px solid var(--border)'
                  }}
                  onClick={() => setImportType('pdf')}
                >
                  <FiFile style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                  <div>PDF Documents</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray)', marginTop: '0.25rem' }}>
                    (.pdf files)
                  </div>
                </label>
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Select File
              </label>
              <input
                type="file"
                className="form-input"
                accept={
                  importType === 'csv' ? '.csv' :
                  importType === 'image' ? '.jpg,.jpeg,.png' :
                  '.pdf'
                }
                onChange={handleFileImport}
                style={{ width: '100%' }}
              />
              {file && (
                <div style={{ 
                  marginTop: '0.5rem', 
                  padding: '0.5rem', 
                  backgroundColor: 'var(--light-gray)', 
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FiFile />
                  <span>{file.name}</span>
                </div>
              )}
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '1rem',
              borderTop: '1px solid var(--border)',
              paddingTop: '1rem'
            }}>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowImportModal(false);
                  setFile(null);
                }}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => file && handleFileImport({ target: { files: [file] } })}
                disabled={!file}
                style={{ flex: 1 }}
              >
                Process File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;