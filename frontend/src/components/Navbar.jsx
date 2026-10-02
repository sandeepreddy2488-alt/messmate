import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'MM';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <nav style={{
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '4.6rem'
      }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            boxShadow: '0 4px 10px rgba(5, 150, 105, 0.28)'
          }}>
            <i className="fa-solid fa-utensils"></i>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-0.02em' }}>
              Mess<span style={{ color: 'var(--primary)' }}>Mate</span>
            </span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              background: role === 'admin' ? '#0f172a' : 'var(--primary-soft)',
              color: role === 'admin' ? '#ffffff' : 'var(--primary)',
              border: role === 'admin' ? '1px solid #1e293b' : '1px solid var(--primary-border)',
              letterSpacing: '0.02em'
            }}>
              {role === 'admin' ? 'Admin Portal' : (user ? 'Central Mess' : 'Smart Hostel')}
            </span>
          </div>
        </Link>

        {/* Hamburger Toggle for Mobile */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
          style={{
            display: 'none',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '1.25rem',
            color: 'var(--text-dark)',
            cursor: 'pointer',
            padding: '0.5rem 0.75rem',
            transition: 'var(--transition-fast)'
          }}
          className="mobile-btn"
        >
          <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>

        {/* Desktop Nav Links */}
        <div className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <NavLink to="/" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`} title="Home">
            <i className="fa-solid fa-house"></i>
          </NavLink>
          <NavLink to="/today-menu" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-calendar-day"></i> Today's Menu
          </NavLink>
          <NavLink to="/weekly-menu" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-calendar-week"></i> Weekly Menu
          </NavLink>
          <NavLink to="/feedback" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-star"></i> Ratings
          </NavLink>
          <NavLink to="/complaints" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-circle-exclamation"></i> Complaints
          </NavLink>
          <NavLink to="/chefs" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-kitchen-set"></i> Chefs
          </NavLink>
          <NavLink to="/chef-reviews" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-comment-dots"></i> Reviews
          </NavLink>
          <NavLink to="/chef-complaints" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-shield-halved"></i> Chef Complaints
          </NavLink>
        </div>

        {/* User Pill / Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <>
              {role === 'admin' ? (
                <Link to="/admin" className="btn btn-outline-primary btn-sm" style={{ fontWeight: 700 }}>
                  <i className="fa-solid fa-shield-halved"></i> Admin Console
                </Link>
              ) : (
                <Link to="/dashboard" className="btn btn-outline btn-sm" style={{ fontWeight: 600 }}>
                  <i className="fa-solid fa-gauge" style={{ color: 'var(--primary)' }}></i> Dashboard
                </Link>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                background: 'var(--bg-subtle)',
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: '1px solid var(--border)'
              }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  background: role === 'admin' ? '#0f172a' : 'var(--primary)',
                  color: '#ffffff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}>
                  {getInitials(user?.name || user?.username)}
                </div>
                <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name || user?.username || (role === 'admin' ? 'Admin' : 'Student')}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-sm"
                style={{
                  background: 'transparent',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.65rem'
                }}
                title="Sign out of MessMate"
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                <span style={{ fontSize: '0.825rem' }}>Logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: 'var(--radius-full)' }}>
              <i className="fa-solid fa-arrow-right-to-bracket"></i>
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="mobile-nav-menu" style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideDown 0.2s ease'
        }}>
          <NavLink to="/" onClick={() => setMobileOpen(false)} className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-house"></i> Home
          </NavLink>
          <NavLink to="/today-menu" onClick={() => setMobileOpen(false)} className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-calendar-day"></i> Today's Menu
          </NavLink>
          <NavLink to="/weekly-menu" onClick={() => setMobileOpen(false)} className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-calendar-week"></i> Weekly Menu
          </NavLink>
          <NavLink to="/feedback" onClick={() => setMobileOpen(false)} className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-star"></i> Ratings & Feedback
          </NavLink>
          <NavLink to="/complaints" onClick={() => setMobileOpen(false)} className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-circle-exclamation"></i> Complaints
          </NavLink>
          <NavLink to="/chefs" onClick={() => setMobileOpen(false)} className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-kitchen-set"></i> Chefs Directory
          </NavLink>
          <NavLink to="/chef-reviews" onClick={() => setMobileOpen(false)} className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-comment-dots"></i> Chef Reviews
          </NavLink>
          <NavLink to="/chef-complaints" onClick={() => setMobileOpen(false)} className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-shield-halved"></i> Chef Complaints
          </NavLink>
        </div>
      )}

      <style>{`
        .nav-pill {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-body);
          padding: 0.45rem 0.85rem;
          border-radius: var(--radius-full);
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          white-space: nowrap;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-pill:hover {
          background-color: var(--primary-soft);
          color: var(--primary);
        }
        .nav-pill.active {
          background-color: var(--primary-soft);
          color: var(--primary-dark);
          font-weight: 700;
          box-shadow: inset 0 0 0 1px var(--primary-border);
        }
        .mobile-nav-item {
          padding: 0.65rem 0.9rem;
          border-radius: var(--radius-md);
          font-size: 0.925rem;
          font-weight: 500;
          color: var(--text-body);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: var(--transition-fast);
        }
        .mobile-nav-item:hover, .mobile-nav-item.active {
          background-color: var(--primary-soft);
          color: var(--primary);
          font-weight: 700;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 1080px) {
          .mobile-btn { display: block !important; }
          .desktop-nav-links { display: none !important; }
        }
        @media (min-width: 1081px) {
          .mobile-nav-menu { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
