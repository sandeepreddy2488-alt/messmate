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
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '4.5rem'
      }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary)' }}>
          <i className="fa-solid fa-utensils" style={{
            fontSize: '1.6rem',
            background: 'var(--primary-soft)',
            color: 'var(--primary)',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)'
          }}></i>
          <span>MessMate</span>
          <span style={{
            fontSize: '0.725rem',
            fontWeight: 600,
            padding: '0.2rem 0.55rem',
            borderRadius: 'var(--radius-full)',
            background: role === 'admin' ? '#0f172a' : 'var(--primary-soft)',
            color: role === 'admin' ? '#ffffff' : 'var(--primary)',
            border: '1px solid rgba(5, 150, 105, 0.2)'
          }}>
            {role === 'admin' ? 'Admin Portal' : (user ? 'Central Mess #2' : 'Hostel Mess')}
          </span>
        </Link>

        {/* Hamburger Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            fontSize: '1.4rem',
            color: 'var(--text-dark)',
            cursor: 'pointer',
            padding: '0.4rem'
          }}
          className="mobile-btn"
        >
          <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>

        {/* Nav Links */}
        <div className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
          <NavLink to="/" className={({ isActive }) => `btn-nav ${isActive ? 'active' : ''}`} title="Home">
            <i className="fa-solid fa-house"></i>
          </NavLink>
          <NavLink to="/today-menu" className={({ isActive }) => `btn-nav ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-calendar-day"></i> Today's Menu
          </NavLink>
          <NavLink to="/weekly-menu" className={({ isActive }) => `btn-nav ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-calendar-week"></i> Weekly Menu
          </NavLink>
          <NavLink to="/feedback" className={({ isActive }) => `btn-nav ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-star"></i> Ratings
          </NavLink>
          <NavLink to="/complaints" className={({ isActive }) => `btn-nav ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-circle-exclamation"></i> Complaints
          </NavLink>
          <NavLink to="/chefs" className={({ isActive }) => `btn-nav ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-kitchen-set"></i> Chefs
          </NavLink>
          <NavLink to="/chef-reviews" className={({ isActive }) => `btn-nav ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-comment-dots"></i> Chef Reviews
          </NavLink>
          <NavLink to="/chef-complaints" className={({ isActive }) => `btn-nav ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-shield-halved"></i> Chef Complaints
          </NavLink>
        </div>

        {/* User Pill / Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <>
              {role === 'admin' ? (
                <Link to="/admin" className="btn btn-outline-primary btn-sm">
                  <i className="fa-solid fa-shield-halved"></i> Admin Console
                </Link>
              ) : (
                <Link to="/dashboard" className="btn btn-outline btn-sm">
                  <i className="fa-solid fa-gauge"></i> Student Portal
                </Link>
              )}

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'var(--bg-subtle)',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.875rem',
                fontWeight: 600,
                border: '1px solid var(--border)'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  background: role === 'admin' ? '#0f172a' : 'var(--primary)',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {getInitials(user?.name || user?.username)}
                </div>
                <span>{user?.name || user?.username || (role === 'admin' ? 'Administrator' : 'Student')}</span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-sm"
                style={{
                  background: 'transparent',
                  border: '1px solid #fca5a5',
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
            <Link to="/login" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <i className="fa-solid fa-arrow-right-to-bracket"></i>
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="mobile-nav-menu" style={{
          backgroundColor: 'var(--bg-card)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <NavLink to="/" onClick={() => setMobileOpen(false)} className={({ isActive }) => `btn-nav ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-house"></i> Home
          </NavLink>
          <NavLink to="/today-menu" onClick={() => setMobileOpen(false)} className={({ isActive }) => `btn-nav ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-calendar-day"></i> Today's Menu
          </NavLink>
          <NavLink to="/weekly-menu" onClick={() => setMobileOpen(false)} className={({ isActive }) => `btn-nav ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-calendar-week"></i> Weekly Menu
          </NavLink>
          <NavLink to="/feedback" onClick={() => setMobileOpen(false)} className={({ isActive }) => `btn-nav ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-star"></i> Ratings
          </NavLink>
          <NavLink to="/complaints" onClick={() => setMobileOpen(false)} className={({ isActive }) => `btn-nav ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-circle-exclamation"></i> Complaints
          </NavLink>
          <NavLink to="/chefs" onClick={() => setMobileOpen(false)} className={({ isActive }) => `btn-nav ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-kitchen-set"></i> Chefs
          </NavLink>
          <NavLink to="/chef-reviews" onClick={() => setMobileOpen(false)} className={({ isActive }) => `btn-nav ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-comment-dots"></i> Chef Reviews
          </NavLink>
          <NavLink to="/chef-complaints" onClick={() => setMobileOpen(false)} className={({ isActive }) => `btn-nav ${isActive ? 'active' : ''}`}>
            <i className="fa-solid fa-shield-halved"></i> Chef Complaints
          </NavLink>
        </div>
      )}

      <style>{`
        .btn-nav {
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--text-body);
          padding: 0.35rem 0.2rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          white-space: nowrap;
        }
        .btn-nav:hover, .btn-nav.active {
          color: var(--primary);
        }
        @media (max-width: 1040px) {
          .mobile-btn { display: block !important; }
          .desktop-nav-links { display: none !important; }
        }
        @media (min-width: 1041px) {
          .mobile-nav-menu { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
