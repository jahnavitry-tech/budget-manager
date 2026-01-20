import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiHome, FiDollarSign, FiPieChart, FiFileText, FiSettings, FiLogOut } from 'react-icons/fi';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FiHome /> },
    { path: '/transactions', label: 'Transactions', icon: <FiDollarSign /> },
    { path: '/budgets', label: 'Budgets', icon: <FiPieChart /> },
    { path: '/reports', label: 'Reports', icon: <FiFileText /> },
    { path: '/settings', label: 'Settings', icon: <FiSettings /> }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '1rem 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <h2 style={{ color: 'var(--primary)', margin: 0 }}>Budget Manager</h2>
          
          {/* Desktop Navigation */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive(item.path) ? 'var(--primary)' : 'var(--dark)',
                  backgroundColor: isActive(item.path) ? 'rgba(67, 97, 238, 0.1)' : 'transparent',
                  fontWeight: isActive(item.path) ? '600' : 'normal',
                  transition: 'all 0.3s ease'
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--gray)' }}>
            Welcome, {user?.fullName || 'User'}
          </span>
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--danger)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease'
            }}
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div style={{ 
        display: 'none',
        borderTop: '1px solid var(--border)',
        padding: '0.5rem 0'
      }}>
        <div className="container" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '0.5rem'
        }}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.5rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive(item.path) ? 'var(--primary)' : 'var(--gray)',
                backgroundColor: isActive(item.path) ? 'rgba(67, 97, 238, 0.1)' : 'transparent',
                fontSize: '0.75rem'
              }}
            >
              <div style={{ fontSize: '1.25rem' }}>{item.icon}</div>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;