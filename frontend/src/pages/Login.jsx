import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function Login() {
  const [searchParams] = useSearchParams();
  const registeredParam = searchParams.get('registered');
  const studentIdParam = searchParams.get('student_id');

  const [activeTab, setActiveTab] = useState('student');
  const [identifier, setIdentifier] = useState(studentIdParam || '21BCSE104');
  const [password, setPassword] = useState(registeredParam ? '' : 'student123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(
    registeredParam ? 'Account created successfully! Please sign in with your credentials.' : ''
  );

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
      setPassword('admin123');
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
      minHeight: 'calc(100vh - 4.6rem - 180px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      background: 'radial-gradient(circle at top right, #ecfdf5 0%, #f8fafc 50%, #eff6ff 100%)'
    }}>
      {/* 2-Column Split Layout (Per Requirement 9) */}
      <div className="auth-split-wrapper">
        {/* LEFT: Hostel, Food & Student Life Themed Showcase */}
        <div className="auth-hero-pane">
          <div>
            {/* Logo Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.45rem 0.95rem',
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(8px)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              marginBottom: '2rem'
            }}>
              <i className="fa-solid fa-utensils"></i>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.02em' }}>MessMate Campus Portal</span>
            </div>

            <h2 style={{ color: '#ffffff', fontSize: '2.1rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Smart Hostel Dining, Simplified.
            </h2>
            <p style={{ color: '#d1fae5', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              Your digital campus mess pass. View daily chef menus, check real-time meal timings, submit feedback, and resolve dining issues in one place.
            </p>

            {/* Feature Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  backdropFilter: 'blur(4px)'
                }}>
                  <i className="fa-solid fa-fire-burner"></i>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Live 4-Meal Service Tracking</div>
                  <div style={{ color: '#a7f3d0', fontSize: '0.8rem' }}>Breakfast, Lunch, Snacks & Dinner active schedules</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  backdropFilter: 'blur(4px)'
                }}>
                  <i className="fa-solid fa-star"></i>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Chef Ratings & Reviews</div>
                  <div style={{ color: '#a7f3d0', fontSize: '0.8rem' }}>Direct student ratings shape weekly catering menus</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  backdropFilter: 'blur(4px)'
                }}>
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>24-Hour SLA Grievance System</div>
                  <div style={{ color: '#a7f3d0', fontSize: '0.8rem' }}>Hygiene, shortage, and dining support resolution</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Hostels pill */}
          <div style={{
            fontSize: '0.825rem',
            color: '#a7f3d0',
            borderTop: '1px solid rgba(255, 255, 255, 0.25)',
            paddingTop: '1.25rem',
            marginTop: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <i className="fa-solid fa-hotel"></i>
            <span>Serving Central Mess Halls A & B • Hostel Blocks A, B, C & D</span>
          </div>
        </div>

        {/* RIGHT: Login Form Card */}
        <div className="auth-form-pane">
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: activeTab === 'admin' ? '#0f172a' : 'var(--primary-soft)',
              color: activeTab === 'admin' ? '#ffffff' : 'var(--primary)',
              borderRadius: 'var(--radius-lg)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              marginBottom: '0.75rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <i className={`fa-solid ${activeTab === 'admin' ? 'fa-shield-halved' : 'fa-graduation-cap'}`}></i>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.35rem 0' }}>
              {activeTab === 'admin' ? 'Mess Admin Portal' : 'Student Mess Login'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
              {activeTab === 'admin'
                ? 'Sign in with administrator credentials'
                : 'Enter your student credentials to access your dashboard'}
            </p>
          </div>

          {/* Student vs Admin Toggle Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg-subtle)',
            padding: '0.3rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            border: '1px solid var(--border)'
          }}>
            <button
              type="button"
              onClick={() => handleTabChange('student')}
              style={{
                border: 'none',
                background: activeTab === 'student' ? '#ffffff' : 'transparent',
                color: activeTab === 'student' ? 'var(--primary-dark)' : 'var(--text-muted)',
                fontWeight: activeTab === 'student' ? 700 : 500,
                fontSize: '0.875rem',
                padding: '0.55rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                boxShadow: activeTab === 'student' ? 'var(--shadow-sm)' : 'none',
                transition: 'var(--transition-fast)'
              }}
            >
              <i className="fa-solid fa-user-graduate" style={{ marginRight: '0.4rem' }}></i> Student
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('admin')}
              style={{
                border: 'none',
                background: activeTab === 'admin' ? '#ffffff' : 'transparent',
                color: activeTab === 'admin' ? '#0f172a' : 'var(--text-muted)',
                fontWeight: activeTab === 'admin' ? 700 : 500,
                fontSize: '0.875rem',
                padding: '0.55rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                boxShadow: activeTab === 'admin' ? 'var(--shadow-sm)' : 'none',
                transition: 'var(--transition-fast)'
              }}
            >
              <i className="fa-solid fa-shield-halved" style={{ marginRight: '0.4rem' }}></i> Mess Admin
            </button>
          </div>

          {/* Success / Error Banners */}
          {successMessage && (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <i className="fa-solid fa-circle-check"></i>
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                {activeTab === 'admin' ? 'Admin Email / Username' : 'Student ID / Roll Number'}
              </label>
              <div style={{ position: 'relative' }}>
                <i className={`fa-solid ${activeTab === 'admin' ? 'fa-envelope' : 'fa-id-card'}`} style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light)'
                }}></i>
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={activeTab === 'admin' ? 'messmate.admin@gmail.com' : 'e.g. 21BCSE104'}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <i className="fa-solid fa-lock" style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light)'
                }}></i>
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block"
              style={{
                padding: '0.75rem',
                fontSize: '1rem',
                background: activeTab === 'admin' ? '#0f172a' : undefined
              }}
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-arrow-right-to-bracket"></i>
                  <span>{activeTab === 'admin' ? 'Enter Admin Console' : 'Enter Student Dashboard'}</span>
                </>
              )}
            </button>
          </form>

          {/* Student "Create Account" Section (Per Requirement 9) */}
          {activeTab === 'student' && (
            <div style={{
              textAlign: 'center',
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border)'
            }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                Don't have an account?{' '}
                <Link
                  to="/register"
                  style={{
                    color: 'var(--primary)',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  Create Account
                </Link>
              </p>
            </div>
          )}

          {/* Admin Setup Dropdown */}
          {activeTab === 'admin' && (
            <div style={{
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border)',
              textAlign: 'center'
            }}>
              <button
                type="button"
                onClick={() => setShowSetup(!showSetup)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  textDecoration: 'underline'
                }}
              >
                <i className="fa-solid fa-key"></i>
                <span>{showSetup ? 'Hide Admin Password Setup' : 'Set / Update Admin Password'}</span>
              </button>

              {showSetup && (
                <form onSubmit={handleAdminSetupSubmit} style={{ marginTop: '1rem', textAlign: 'left', background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                    Configure Administrator Credentials
                  </div>

                  {setupError && (
                    <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                      {setupError}
                    </div>
                  )}

                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Admin Email</label>
                    <input
                      type="email"
                      className="form-control"
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
                      value={setupEmail}
                      onChange={(e) => setSetupEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
                      value={setupPassword}
                      onChange={(e) => setSetupPassword(e.target.value)}
                      placeholder="Min 4 characters"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
                      value={setupConfirm}
                      onChange={(e) => setSetupConfirm(e.target.value)}
                      placeholder="Repeat password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={setupLoading}
                    className="btn btn-outline btn-sm btn-block"
                    style={{ fontSize: '0.8rem' }}
                  >
                    {setupLoading ? 'Saving...' : 'Save & Set Password'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
