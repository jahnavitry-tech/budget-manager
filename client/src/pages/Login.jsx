import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  console.log('Login component rendering');
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    accountName: '',
    isJoiningFamily: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.message);
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const result = await register({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          fullName: formData.fullName,
          accountName: formData.accountName,
          isJoiningFamily: formData.isJoiningFamily
        });

        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            backgroundColor: 'var(--primary)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1rem', 
            fontSize: '24px', 
            color: 'white', 
            fontWeight: 'bold' 
          }}>
            💰
          </div>
          <h1 style={{ 
            color: 'var(--primary)', 
            marginBottom: '0.5rem', 
            fontSize: '24px', 
            fontWeight: '700' 
          }}>
            Budget Manager
          </h1>
          <p style={{ 
            color: 'var(--gray)', 
            fontSize: '16px',
            marginBottom: '1.5rem'
          }}>
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
          
          {/* Dummy Data Reference */}
          <div style={{ 
            backgroundColor: 'rgba(67, 97, 238, 0.1)', 
            padding: '0.75rem', 
            borderRadius: '8px', 
            fontSize: '12px', 
            color: 'var(--primary)',
            marginBottom: '1rem'
          }}>
            Demo Login: user@example.com / password123<br/>
            (users-email / users-password_hash)
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              {/* Full Name Field */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '600', color: 'var(--dark)' }}>
                  Full Name (users-full_name)
                </label>
                <input
                  type="text"
                  name="fullName"
                  className="form-input"
                  value={formData.fullName}
                  onChange={handleChange}
                  required={!isLogin}
                  style={{ 
                    height: '48px', 
                    padding: '12px 16px',
                    fontSize: '16px'
                  }}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Account Type Selection */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '600', color: 'var(--dark)' }}>
                  Account Type (family_accounts-account_name)
                </label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '1rem', 
                  marginBottom: '1rem' 
                }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    padding: '12px',
                    border: formData.isJoiningFamily ? '2px solid var(--border)' : '2px solid var(--primary)',
                    borderRadius: '8px',
                    backgroundColor: formData.isJoiningFamily ? 'white' : 'rgba(67, 97, 238, 0.1)'
                  }}>
                    <input
                      type="radio"
                      name="isJoiningFamily"
                      checked={!formData.isJoiningFamily}
                      onChange={() => setFormData({...formData, isJoiningFamily: false})}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <div>
                      <div style={{ fontWeight: '600' }}>New Family</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray)' }}>Create account</div>
                    </div>
                  </label>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    padding: '12px',
                    border: !formData.isJoiningFamily ? '2px solid var(--border)' : '2px solid var(--primary)',
                    borderRadius: '8px',
                    backgroundColor: !formData.isJoiningFamily ? 'white' : 'rgba(67, 97, 238, 0.1)'
                  }}>
                    <input
                      type="radio"
                      name="isJoiningFamily"
                      checked={formData.isJoiningFamily}
                      onChange={() => setFormData({...formData, isJoiningFamily: true})}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <div>
                      <div style={{ fontWeight: '600' }}>Join Family</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray)' }}>Existing account</div>
                    </div>
                  </label>
                </div>
                
                <input
                  type="text"
                  name="accountName"
                  className="form-input"
                  placeholder={formData.isJoiningFamily ? "Enter existing family account name" : "Enter new family account name"}
                  value={formData.accountName}
                  onChange={handleChange}
                  required
                  style={{ 
                    height: '48px', 
                    padding: '12px 16px',
                    fontSize: '16px'
                  }}
                />
                <div style={{ fontSize: '12px', color: 'var(--gray)', marginTop: '0.5rem' }}>
                  {formData.isJoiningFamily 
                    ? "(family_accounts-account_name lookup)" 
                    : "(family_accounts-account_name creation)"}
                </div>
              </div>
            </>
          )}

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '600', color: 'var(--dark)' }}>
              Email Address (users-email)
            </label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ 
                height: '48px', 
                padding: '12px 16px',
                fontSize: '16px'
              }}
              placeholder="Enter your email"
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '600', color: 'var(--dark)' }}>
              Password (users-password_hash)
            </label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              style={{ 
                height: '48px', 
                padding: '12px 16px',
                fontSize: '16px'
              }}
              placeholder="Enter password (min 6 characters)"
            />
            <div style={{ fontSize: '12px', color: 'var(--gray)', marginTop: '0.5rem' }}>
              Stored securely as encrypted hash
            </div>
          </div>

          {/* Confirm Password Field - Registration Only */}
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600', color: 'var(--dark)' }}>
                Confirm Password (users-password_hash verification)
              </label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                required={!isLogin}
                minLength="6"
                style={{ 
                  height: '48px', 
                  padding: '12px 16px',
                  fontSize: '16px'
                }}
                placeholder="Confirm your password"
              />
              <div style={{ fontSize: '12px', color: 'var(--gray)', marginTop: '0.5rem' }}>
                Must match password field above
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              marginBottom: '1rem',
              height: '48px',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  border: '2px solid white', 
                  borderTop: '2px solid transparent', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }}></div>
                Processing...
              </>
            ) : (
              isLogin ? 'Sign In (users-authentication)' : 'Create Account (users-registration)'
            )}
          </button>
          
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </form>

        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({
                email: '',
                password: '',
                confirmPassword: '',
                fullName: '',
                accountName: '',
                isJoiningFamily: false
              });
            }}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--primary)', 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;