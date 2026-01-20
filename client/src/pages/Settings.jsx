import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiMail, FiLock, FiUsers, FiDollarSign, FiBell, FiMoon, FiSun, FiDownload, FiUpload, FiCamera, FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';

const Settings = () => {
  const { user, logout } = useAuth();
  
  // State management
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || 'Demo User',
    email: user?.email || 'user@example.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [familyMembers, setFamilyMembers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Member' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Member' }
  ]);
  
  const [preferences, setPreferences] = useState({
    currency: 'USD',
    notifications: {
      email: true,
      push: false,
      budgetAlerts: true,
      weeklySummary: true
    },
    theme: 'light',
    dataExport: {
      autoExport: false,
      exportFormat: 'pdf',
      frequency: 'monthly'
    }
  });
  
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '' });

  // Handle profile form changes
  const handleProfileChange = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle profile update
  const updateProfile = async (e) => {
    e.preventDefault();
    
    // Password validation
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    
    try {
      // In a real implementation, this would call the API
      // await api.updateUserProfile(profileForm);
      
      alert('Profile updated successfully!');
      
      // Reset password fields
      setProfileForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  // Handle preference changes
  const handlePreferenceChange = (section, field, value) => {
    if (section) {
      setPreferences(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle notification toggles
  const toggleNotification = (setting) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [setting]: !prev.notifications[setting]
      }
    }));
  };

  // Add family member
  const addFamilyMember = () => {
    if (newMember.name && newMember.email) {
      const member = {
        id: Date.now(),
        name: newMember.name,
        email: newMember.email,
        role: 'Member'
      };
      
      setFamilyMembers(prev => [...prev, member]);
      setNewMember({ name: '', email: '' });
      setShowAddMemberModal(false);
    }
  };

  // Remove family member
  const removeFamilyMember = (memberId) => {
    if (window.confirm('Are you sure you want to remove this family member?')) {
      setFamilyMembers(prev => prev.filter(member => member.id !== memberId));
    }
  };

  // Save preferences
  const savePreferences = async () => {
    try {
      // In a real implementation, this would call the API
      // await api.saveUserPreferences(preferences);
      
      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: preferences.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FiUser /> },
    { id: 'family', label: 'Family', icon: <FiUsers /> },
    { id: 'preferences', label: 'Preferences', icon: <FiBell /> }
  ];

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
            <h1 style={{ margin: '0 0 0.5rem 0' }}>Settings</h1>
            <p style={{ margin: 0, color: 'var(--gray)' }}>
              Manage your profile, family account, and preferences
            </p>
          </div>
          
          <button 
            className="btn btn-secondary"
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FiLock />
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            borderBottom: '1px solid var(--border)',
            marginBottom: '2rem'
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '1rem 1.5rem',
                  border: 'none',
                  backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                  color: activeTab === tab.id ? 'white' : 'var(--dark)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: activeTab === tab.id ? '8px 8px 0 0' : '0',
                  fontWeight: activeTab === tab.id ? '600' : 'normal'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h2 style={{ marginBottom: '1.5rem' }}>Profile Settings</h2>
              
              <form onSubmit={updateProfile}>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {/* Profile Picture */}
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <div style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--light-gray)',
                      margin: '0 auto 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      border: '3px solid var(--border)'
                    }}>
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <button 
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
                    >
                      <FiCamera />
                      Change Photo
                    </button>
                  </div>
                  
                  {/* Full Name */}
                  <div>
                    <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                      <FiUser style={{ marginRight: '0.5rem' }} />
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={profileForm.fullName}
                      onChange={(e) => handleProfileChange('fullName', e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                      <FiMail style={{ marginRight: '0.5rem' }} />
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      value={profileForm.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      style={{ width: '100%' }}
                      readOnly
                    />
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray)', marginTop: '0.25rem' }}>
                      Contact support to change email address
                    </div>
                  </div>
                  
                  {/* Password Change */}
                  <div style={{ 
                    borderTop: '1px solid var(--border)', 
                    paddingTop: '1.5rem',
                    marginTop: '1rem'
                  }}>
                    <h3 style={{ marginBottom: '1rem' }}>Change Password</h3>
                    
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      <div>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="form-input"
                          value={profileForm.currentPassword}
                          onChange={(e) => handleProfileChange('currentPassword', e.target.value)}
                          style={{ width: '100%' }}
                        />
                      </div>
                      
                      <div>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                          New Password
                        </label>
                        <input
                          type="password"
                          className="form-input"
                          value={profileForm.newPassword}
                          onChange={(e) => handleProfileChange('newPassword', e.target.value)}
                          style={{ width: '100%' }}
                        />
                      </div>
                      
                      <div>
                        <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="form-input"
                          value={profileForm.confirmPassword}
                          onChange={(e) => handleProfileChange('confirmPassword', e.target.value)}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    className="btn btn-primary"
                    style={{ alignSelf: 'flex-start' }}
                  >
                    <FiEdit style={{ marginRight: '0.5rem' }} />
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Family Tab */}
          {activeTab === 'family' && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h2>Family Account Management</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddMemberModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <FiPlus />
                  Add Family Member
                </button>
              </div>
              
              {/* Account Info */}
              <div className="card" style={{ 
                marginBottom: '2rem',
                borderLeft: '4px solid var(--primary)'
              }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>Family Account</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                      Doe Family Budget
                    </div>
                    <div style={{ color: 'var(--gray)', marginTop: '0.25rem' }}>
                      Account Owner: {user?.fullName || 'Demo User'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                      {formatCurrency(85000)}
                    </div>
                    <div style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>
                      Monthly Budget
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Family Members List */}
              <div>
                <h3 style={{ marginBottom: '1rem' }}>Family Members</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {familyMembers.map(member => (
                    <div key={member.id} className="card" style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--light-gray)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '600'
                        }}>
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600' }}>{member.name}</div>
                          <div style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>{member.email}</div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem',
                          backgroundColor: member.role === 'Admin' ? 'rgba(67, 97, 238, 0.1)' : 'var(--light-gray)',
                          color: member.role === 'Admin' ? 'var(--primary)' : 'var(--gray)',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}>
                          {member.role}
                        </span>
                        
                        {member.role !== 'Admin' && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => removeFamilyMember(member.id)}
                            title="Remove member"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h2>User Preferences</h2>
                <button 
                  className="btn btn-primary"
                  onClick={savePreferences}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <FiEdit style={{ marginRight: '0.5rem' }} />
                  Save Preferences
                </button>
              </div>
              
              <div style={{ display: 'grid', gap: '2rem' }}>
                {/* Currency Settings */}
                <div className="card">
                  <h3 style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <FiDollarSign />
                    Currency
                  </h3>
                  <div>
                    <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                      Display Currency
                    </label>
                    <select
                      className="form-select"
                      value={preferences.currency}
                      onChange={(e) => handlePreferenceChange(null, 'currency', e.target.value)}
                      style={{ width: '200px' }}
                    >
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="GBP">British Pound (GBP)</option>
                      <option value="INR">Indian Rupee (INR)</option>
                    </select>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray)', marginTop: '0.25rem' }}>
                      Note: Multi-currency support coming in future versions
                    </div>
                  </div>
                </div>
                
                {/* Notification Settings */}
                <div className="card">
                  <h3 style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <FiBell />
                    Notifications
                  </h3>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Email Notifications</span>
                      <input
                        type="checkbox"
                        checked={preferences.notifications.email}
                        onChange={() => toggleNotification('email')}
                      />
                    </label>
                    
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Push Notifications</span>
                      <input
                        type="checkbox"
                        checked={preferences.notifications.push}
                        onChange={() => toggleNotification('push')}
                      />
                    </label>
                    
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Budget Alerts</span>
                      <input
                        type="checkbox"
                        checked={preferences.notifications.budgetAlerts}
                        onChange={() => toggleNotification('budgetAlerts')}
                      />
                    </label>
                    
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Weekly Summary</span>
                      <input
                        type="checkbox"
                        checked={preferences.notifications.weeklySummary}
                        onChange={() => toggleNotification('weeklySummary')}
                      />
                    </label>
                  </div>
                </div>
                
                {/* Theme Settings */}
                <div className="card">
                  <h3 style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    {preferences.theme === 'light' ? <FiSun /> : <FiMoon />}
                    Theme
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <label 
                      className={`card ${preferences.theme === 'light' ? 'active' : ''}`}
                      style={{ 
                        textAlign: 'center', 
                        padding: '1rem',
                        cursor: 'pointer',
                        border: preferences.theme === 'light' ? '2px solid var(--primary)' : '1px solid var(--border)',
                        flex: 1
                      }}
                      onClick={() => handlePreferenceChange(null, 'theme', 'light')}
                    >
                      <FiSun style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                      <div>Light Mode</div>
                    </label>
                    
                    <label 
                      className={`card ${preferences.theme === 'dark' ? 'active' : ''}`}
                      style={{ 
                        textAlign: 'center', 
                        padding: '1rem',
                        cursor: 'pointer',
                        border: preferences.theme === 'dark' ? '2px solid var(--primary)' : '1px solid var(--border)',
                        flex: 1
                      }}
                      onClick={() => handlePreferenceChange(null, 'theme', 'dark')}
                    >
                      <FiMoon style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                      <div>Dark Mode</div>
                    </label>
                  </div>
                </div>
                
                {/* Data Export Settings */}
                <div className="card">
                  <h3 style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <FiDownload />
                    Data Export
                  </h3>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Auto Export Reports</span>
                      <input
                        type="checkbox"
                        checked={preferences.dataExport.autoExport}
                        onChange={(e) => handlePreferenceChange('dataExport', 'autoExport', e.target.checked)}
                      />
                    </label>
                    
                    <div>
                      <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Export Format
                      </label>
                      <select
                        className="form-select"
                        value={preferences.dataExport.exportFormat}
                        onChange={(e) => handlePreferenceChange('dataExport', 'exportFormat', e.target.value)}
                        style={{ width: '200px' }}
                      >
                        <option value="pdf">PDF</option>
                        <option value="csv">CSV</option>
                        <option value="xlsx">Excel</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Export Frequency
                      </label>
                      <select
                        className="form-select"
                        value={preferences.dataExport.frequency}
                        onChange={(e) => handlePreferenceChange('dataExport', 'frequency', e.target.value)}
                        style={{ width: '200px' }}
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Family Member Modal */}
      {showAddMemberModal && (
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
            maxWidth: '400px',
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
              <h2 style={{ margin: 0 }}>Add Family Member</h2>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  setShowAddMemberModal(false);
                  setNewMember({ name: '', email: '' });
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={newMember.name}
                  onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  style={{ width: '100%' }}
                />
              </div>
              
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={newMember.email}
                  onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  style={{ width: '100%' }}
                />
              </div>
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
                  setShowAddMemberModal(false);
                  setNewMember({ name: '', email: '' });
                }}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={addFamilyMember}
                disabled={!newMember.name || !newMember.email}
                style={{ flex: 1 }}
              >
                <FiPlus style={{ marginRight: '0.5rem' }} />
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;