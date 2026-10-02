import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function StudentRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    hostelBlock: 'Block B',
    roomNumber: 'B-304'
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const validateField = (name, value, allValues = form) => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full Name is required.';
        return '';
      case 'studentId':
        if (!value.trim()) return 'Student ID / Roll Number is required.';
        return '';
      case 'email':
        if (!value.trim()) return 'Email address is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return 'Please enter a valid email address.';
        }
        return '';
      case 'password':
        if (!value) return 'Password is required.';
        if (value.length < 6) return 'Password must be at least 6 characters long.';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password.';
        if (value !== allValues.password) return 'Passwords do not match.';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);

    if (fieldErrors[name]) {
      const error = validateField(name, value, updatedForm);
      setFieldErrors(prev => ({ ...prev, [name]: error }));
    }

    if (name === 'password' && form.confirmPassword) {
      if (form.confirmPassword !== value) {
        setFieldErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
      } else {
        setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    const errors = {};
    const nameErr = validateField('fullName', form.fullName);
    if (nameErr) errors.fullName = nameErr;

    const idErr = validateField('studentId', form.studentId);
    if (idErr) errors.studentId = idErr;

    const emailErr = validateField('email', form.email);
    if (emailErr) errors.email = emailErr;

    const passErr = validateField('password', form.password);
    if (passErr) errors.password = passErr;

    const confirmErr = validateField('confirmPassword', form.confirmPassword, form);
    if (confirmErr) errors.confirmPassword = confirmErr;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGeneralError('Please correct the errors indicated below.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.registerStudent({
        full_name: form.fullName.trim(),
        student_id: form.studentId.trim(),
        email: form.email.trim(),
        password: form.password,
        confirm_password: form.confirmPassword,
        phone_number: form.phone.trim(),
        hostel_block: form.hostelBlock.trim() || 'Block B',
        room_number: form.roomNumber.trim() || 'B-304'
      });

      if (res.data?.success) {
        setSuccessData({
          name: form.fullName.trim(),
          studentId: form.studentId.trim().toUpperCase(),
          email: form.email.trim().toLowerCase()
        });
      } else {
        setGeneralError(res.data?.error || 'Registration failed. Please check your information.');
      }
    } catch (err) {
      console.warn('Registration error:', err);
      const data = err.response?.data;
      if (data?.errors) {
        const mappedErrors = {};
        if (data.errors.full_name) mappedErrors.fullName = data.errors.full_name[0];
        if (data.errors.student_id) mappedErrors.studentId = data.errors.student_id[0];
        if (data.errors.email) mappedErrors.email = data.errors.email[0];
        if (data.errors.password) mappedErrors.password = data.errors.password[0];
        if (data.errors.confirm_password) mappedErrors.confirmPassword = data.errors.confirm_password[0];
        setFieldErrors(mappedErrors);
      }
      setGeneralError(data?.error || 'Failed to connect to backend server. Please ensure the Django backend is running.');
    } finally {
      setLoading(false);
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
      <div className="auth-split-wrapper" style={{ maxWidth: '1060px' }}>
        {/* LEFT: Hostel Dining Showcase */}
        <div className="auth-hero-pane">
          <div>
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
              <i className="fa-solid fa-id-card-clip"></i>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Student Board Registration</span>
            </div>

            <h2 style={{ color: '#ffffff', fontSize: '2.1rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Join MessMate Campus Dining.
            </h2>
            <p style={{ color: '#d1fae5', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              Create your verified student resident account to unlock digital mess card passes, daily meal schedules, live feedback, and direct chef ratings.
            </p>

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
                  <i className="fa-solid fa-qrcode"></i>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Instant Digital Mess Pass</div>
                  <div style={{ color: '#a7f3d0', fontSize: '0.8rem' }}>Fast QR meal check-in at all hostel dining halls</div>
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
                  <i className="fa-solid fa-utensils"></i>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>4 Daily Meals Tracked</div>
                  <div style={{ color: '#a7f3d0', fontSize: '0.8rem' }}>Live status and calorie/nutrition insights</div>
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
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Confidential Grievance Portal</div>
                  <div style={{ color: '#a7f3d0', fontSize: '0.8rem' }}>Strict 24-hr resolution tracking with catering supervisors</div>
                </div>
              </div>
            </div>
          </div>

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
            <i className="fa-solid fa-graduation-cap"></i>
            <span>Official Campus Hostel Catering Network</span>
          </div>
        </div>

        {/* RIGHT: Registration Form */}
        <div className="auth-form-pane" style={{ padding: '2.5rem' }}>
          {successData ? (
            /* Success State */
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: '#dcfce7',
                color: '#15803d',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                marginBottom: '1rem'
              }}>
                <i className="fa-solid fa-check"></i>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                Account Created Successfully!
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Welcome, <strong>{successData.name}</strong>! Your student account with ID <strong>{successData.studentId}</strong> is ready.
              </p>
              <button
                onClick={() => navigate(`/login?registered=1&student_id=${encodeURIComponent(successData.studentId)}`)}
                className="btn btn-primary btn-block"
                style={{ padding: '0.75rem' }}
              >
                <i className="fa-solid fa-arrow-right-to-bracket"></i>
                <span>Sign In to Student Portal</span>
              </button>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  background: 'var(--primary-soft)',
                  color: 'var(--primary)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  marginBottom: '0.65rem'
                }}>
                  <i className="fa-solid fa-user-plus"></i>
                </div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>
                  Create Student Account
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  Enter your details to register for the hostel mess system
                </p>
              </div>

              {generalError && (
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
                  <span>{generalError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Full Name */}
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ fontSize: '0.825rem' }}>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-control"
                    placeholder="e.g. Rahul Sharma"
                    value={form.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={{ borderColor: fieldErrors.fullName ? 'var(--danger)' : undefined }}
                    required
                  />
                  {fieldErrors.fullName && (
                    <span style={{ color: 'var(--danger)', fontSize: '0.75rem', display: 'block', marginTop: '0.2rem' }}>
                      {fieldErrors.fullName}
                    </span>
                  )}
                </div>

                {/* 2-col: Student ID & Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.825rem' }}>Student ID / Roll No *</label>
                    <input
                      type="text"
                      name="studentId"
                      className="form-control"
                      placeholder="e.g. 21BCSE104"
                      value={form.studentId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ borderColor: fieldErrors.studentId ? 'var(--danger)' : undefined }}
                      required
                    />
                    {fieldErrors.studentId && (
                      <span style={{ color: 'var(--danger)', fontSize: '0.75rem', display: 'block', marginTop: '0.2rem' }}>
                        {fieldErrors.studentId}
                      </span>
                    )}
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.825rem' }}>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="e.g. student@college.edu"
                      value={form.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ borderColor: fieldErrors.email ? 'var(--danger)' : undefined }}
                      required
                    />
                    {fieldErrors.email && (
                      <span style={{ color: 'var(--danger)', fontSize: '0.75rem', display: 'block', marginTop: '0.2rem' }}>
                        {fieldErrors.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2-col: Password & Confirm Password */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.825rem' }}>Password *</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="Min 6 characters"
                      value={form.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ borderColor: fieldErrors.password ? 'var(--danger)' : undefined }}
                      required
                    />
                    {fieldErrors.password && (
                      <span style={{ color: 'var(--danger)', fontSize: '0.75rem', display: 'block', marginTop: '0.2rem' }}>
                        {fieldErrors.password}
                      </span>
                    )}
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.825rem' }}>Confirm Password *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      placeholder="Re-enter password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ borderColor: fieldErrors.confirmPassword ? 'var(--danger)' : undefined }}
                      required
                    />
                    {fieldErrors.confirmPassword && (
                      <span style={{ color: 'var(--danger)', fontSize: '0.75rem', display: 'block', marginTop: '0.2rem' }}>
                        {fieldErrors.confirmPassword}
                      </span>
                    )}
                  </div>
                </div>

                {/* Submit button (Per Requirement 9) */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-block"
                  style={{ padding: '0.75rem', fontSize: '0.95rem' }}
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-user-check"></i>
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </form>

              <div style={{
                textAlign: 'center',
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border)'
              }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    style={{
                      color: 'var(--primary)',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
