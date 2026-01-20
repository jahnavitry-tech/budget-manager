import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user, token } = useAuth();
  
  console.log('PrivateRoute - isAuthenticated:', isAuthenticated, 'loading:', loading, 'user:', user, 'token:', token);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔐</div>
        <div>Checking authentication...</div>
        <div style={{ fontSize: '0.9rem', color: 'var(--gray)', marginTop: '0.5rem' }}>
          Verifying your credentials
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Redirecting to login - not authenticated');
    return <Navigate to="/login" replace />;
  }
  
  console.log('Rendering protected route content');
  return children;
};

export default PrivateRoute;