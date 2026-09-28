import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--text-dark)',
      color: '#94a3b8',
      padding: '3.5rem 0 1.5rem 0',
      marginTop: 'auto',
      borderTop: '1px solid #334155'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          <div>
            <h3 style={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <i className="fa-solid fa-utensils" style={{ color: 'var(--primary-light)' }}></i> MessMate
            </h3>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
              React + Django REST + PostgreSQL powered campus mess management solution enhancing dining transparency, meal quality tracking, and student convenience.
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
              <span className="badge" style={{ background: '#1e293b', color: '#94a3b8' }}>Django 5 & React</span>
              <span className="badge" style={{ background: '#1e293b', color: '#94a3b8' }}>PostgreSQL 18</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1rem' }}>Navigation</h4>
            <ul style={{ fontSize: '0.875rem', lineHeight: '2' }}>
              <li><Link to="/" style={{ color: '#94a3b8' }}>Home Overview</Link></li>
              <li><Link to="/today-menu" style={{ color: '#94a3b8' }}>Today's Meal Menu</Link></li>
              <li><Link to="/weekly-menu" style={{ color: '#94a3b8' }}>Full Weekly Schedule</Link></li>
              <li><Link to="/feedback" style={{ color: '#94a3b8' }}>Meal Ratings & Reviews</Link></li>
              <li><Link to="/chefs" style={{ color: '#94a3b8' }}>Meet Our Mess Chefs</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1rem' }}>Student Portals</h4>
            <ul style={{ fontSize: '0.875rem', lineHeight: '2' }}>
              <li><Link to="/complaints" style={{ color: '#94a3b8' }}>File Grievance</Link></li>
              <li><Link to="/chef-complaints" style={{ color: '#94a3b8' }}>Chef Complaints</Link></li>
              <li><Link to="/dashboard" style={{ color: '#94a3b8' }}>Student Dashboard</Link></li>
              <li><Link to="/admin" style={{ color: '#94a3b8' }}>Admin Operations</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1rem' }}>Mess Timings</h4>
            <div style={{ fontSize: '0.825rem', lineHeight: '1.8' }}>
              <div><strong>Breakfast:</strong> 07:30 AM – 09:30 AM</div>
              <div><strong>Lunch:</strong> 12:30 PM – 02:30 PM</div>
              <div><strong>Snacks:</strong> 05:00 PM – 06:00 PM</div>
              <div><strong>Dinner:</strong> 07:30 PM – 09:30 PM</div>
              <div style={{ marginTop: '0.75rem', color: '#cbd5e1' }}>
                <i className="fa-solid fa-phone" style={{ color: 'var(--primary-light)' }}></i> Helpline: Ext 4022
              </div>
            </div>
          </div>
        </div>

        <div style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.825rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>&copy; 2026 MessMate - Full-Stack React & Django Platform. Built for hostel residents.</div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <span>FSSAI Compliant</span>
            <span>Central Mess Wing B</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
