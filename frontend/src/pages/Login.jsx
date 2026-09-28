import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function Login() {
  const [activeTab, setActiveTab] = useState('student');
  const [identifier, setIdentifier] = useState('21BCSE104');
  const [password, setPassword] = useState('student123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Admin interactive setup state
  const [showSetup, setShowSetup] = useState(false);
  const [setupUsername, setSetupUsername] = useState('admin');
  const [setupEmail, setSetupEmail] = useState('messmate.admin@gmail.com');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrorMessage('');
    setSuccessMessage('');
    if (tab === 'student') {
      setIdentifier('21BCSE104');
      setPassword('student123');
    } else {
      setIdentifier('messmate.admin@gmail.com');
      setPassword('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await api.login({
        role: activeTab,
        identifier: identifier.trim(),
        password: password,
      });

      if (res.data?.success) {
        login(res.data.user);
        if (activeTab === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrorMessage(res.data?.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      console.warn('Authentication error:', err);
      const serverMsg = err.response?.data?.error;
      if (serverMsg) {
        setErrorMessage(serverMsg);
      } else if (err.response?.status === 401) {
        setErrorMessage(activeTab === 'admin' 
          ? 'Invalid admin credentials. Please ensure your password was set or click "Set / Change Admin Password" below.' 
          : 'Invalid student roll number or password.');
      } else if (err.response?.status === 403) {
        setErrorMessage('Access denied: Account lacks administrative privileges.');
      } else {
        setErrorMessage('Unable to reach authentication server. Please ensure the Django backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSetupSubmit = async (e) => {
    e.preventDefault();
    setSetupError('');

    if (setupPassword !== setupConfirm) {
      setSetupError('Passwords do not match. Please verify and try again.');
      return;
    }
    if (setupPassword.length < 4) {
      setSetupError('Password must be at least 4 characters long.');
      return;
    }

    setSetupLoading(true);
    try {
      const res = await api.setupAdmin({
        username: setupUsername.trim(),
        email: setupEmail.trim(),
        password: setupPassword,
      });

      if (res.data?.success) {
        setSuccessMessage('Admin account configured successfully! You can now log in below.');
        setIdentifier(setupEmail.trim());
        setPassword('');
        setSetupPassword('');
        setSetupConfirm('');
        setShowSetup(false);
      } else {
        setSetupError(res.data?.error || 'Failed to configure admin account.');
      }
    } catch (err) {
      console.error('Setup error:', err);
      setSetupError(err.response?.data?.error || 'Failed to connect to backend server.');
    } finally {
      setSetupLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 4.5rem - 180px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      background: 'radial-gradient(circle at top right, #f0fdf4 0%, #f8fafc 80%)'
    }}>
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: '500px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-xl)',
        padding: '2.5rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            background: activeTab === 'admin' ? '#0f172a' : 'var(--primary-soft)',
            color: activeTab === 'admin' ? '#ffffff' : 'var(--primary)',
            borderRadius: 'var(--radius-md)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            marginBottom: '0.75rem',
            transition: 'all 0.2s ease'
          }}>
            <i className={`fa-solid ${activeTab === 'admin' ? 'fa-shield-halved' : 'fa-lock'}`}></i>
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>
            {activeTab === 'admin' ? 'Mess Admin Portal' : 'Sign In to MessMate'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {activeTab === 'admin' 
              ? 'Enter verified administrator credentials to access the console'
              : 'Access your meal tokens & grievance tracking'}
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => handleTabChange('student')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.925rem',
              color: activeTab === 'student' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'student' ? '3px solid var(--primary)' : 'none',
              cursor: 'pointer'
            }}
          >
            <i className="fa-solid fa-user-graduate"></i> Student Login
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.925rem',
              color: activeTab === 'admin' ? '#0f172a' : 'var(--text-muted)',
              borderBottom: activeTab === 'admin' ? '3px solid #0f172a' : 'none',
              cursor: 'pointer'
            }}
          >
            <i className="fa-solid fa-user-shield"></i> Mess Admin
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <i className="fa-solid fa-circle-check" style={{ color: '#10b981', fontSize: '1rem', flexShrink: 0 }}></i>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert Banner */}
        {errorMessage && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <i className="fa-solid fa-circle-exclamation" style={{ color: '#ef4444', fontSize: '1rem', flexShrink: 0 }}></i>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Interactive Admin Password Setup Modal / Panel */}
        {showSetup && activeTab === 'admin' && (
          <div style={{
            background: '#f8fafc',
            border: '2px solid #3b82f6',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            marginBottom: '1.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <i className="fa-solid fa-key" style={{ color: '#2563eb' }}></i> Configure Admin Account
              </div>
              <button
                type="button"
                onClick={() => setShowSetup(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1rem' }}
                title="Close setup"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem', lineHeight: '1.4' }}>
              Set your personal secret password for <strong>{setupEmail}</strong>. Passwords are saved with Django PBKDF2 hashing and are never stored in plain text.
            </p>

            {setupError && (
              <div style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                {setupError}
              </div>
            )}

            <form onSubmit={handleAdminSetupSubmit}>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Admin Email</label>
                <input
                  type="email"
                  className="form-control"
                  style={{ fontSize: '0.85rem' }}
                  value={setupEmail}
                  onChange={(e) => setSetupEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Admin Username</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontSize: '0.85rem' }}
                  value={setupUsername}
                  onChange={(e) => setSetupUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>New Secret Password</label>
                <input
                  type="password"
                  className="form-control"
                  style={{ fontSize: '0.85rem' }}
                  placeholder="Enter your secret password"
                  value={setupPassword}
                  onChange={(e) => setSetupPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  style={{ fontSize: '0.85rem' }}
                  placeholder="Re-enter secret password"
                  value={setupConfirm}
                  onChange={(e) => setSetupConfirm(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={setupLoading}
                  style={{ background: '#2563eb' }}
                >
                  {setupLoading ? 'Securing & Saving...' : 'Save & Secure Admin Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSetup(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              {activeTab === 'student' ? 'Student ID / Roll Number' : 'Admin Email or Username'}
            </label>
            <input
              type="text"
              className="form-control"
              value={identifier}
              placeholder={activeTab === 'student' ? 'e.g. 21BCSE104' : 'messmate.admin@gmail.com or admin'}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              {activeTab === 'admin' && (
                <button
                  type="button"
                  onClick={() => { setShowSetup(!showSetup); setSetupError(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <i className="fa-solid fa-gear"></i> {showSetup ? 'Hide Setup' : 'Set / Update Admin Password'}
                </button>
              )}
            </div>
            <input
              type="password"
              className="form-control"
              value={password}
              placeholder={activeTab === 'student' ? '••••••••' : 'Enter your admin password'}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
            style={{ marginTop: '1.25rem', background: activeTab === 'admin' ? '#0f172a' : 'var(--primary)' }}
          >
            {loading ? 'Authenticating...' : (
              activeTab === 'student' ? 'Enter Student Dashboard' : 'Access Mess Admin Panel'
            )}
          </button>
        </form>

        {/* Quick Demo Info Box */}
        <div style={{
          background: '#f8fafc',
          border: '1px dashed #cbd5e1',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginTop: '1.5rem',
          fontSize: '0.825rem'
        }}>
          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <i className="fa-solid fa-circle-info" style={{ color: 'var(--primary)' }}></i> Sign In Information
          </div>
          <div style={{ color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: '1.5' }}>
            <div><strong>Student Demo:</strong> <code>21BCSE104</code> / <code>student123</code></div>
            <div style={{ marginTop: '0.35rem' }}>
              <strong>Mess Admin:</strong> Email <code>messmate.admin@gmail.com</code> (or username <code>admin</code>).
              <div style={{ marginTop: '0.2rem', fontSize: '0.78rem' }}>
                Use the <strong>"Set / Update Admin Password"</strong> link above to set your secret password, or run:
                <br />
                <code style={{ fontSize: '0.75rem', background: '#e2e8f0', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>
                  python manage.py setup_admin --email messmate.admin@gmail.com
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
