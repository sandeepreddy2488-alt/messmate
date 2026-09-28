import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import ManageMenu from '../components/ManageMenu';
import ManageChefs from '../components/ManageChefs';
import ManageChefReviews from '../components/ManageChefReviews';
import ManageChefComplaints from '../components/ManageChefComplaints';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('menu');
  const [complaints, setComplaints] = useState([]);
  const [acceptedChefComplaints, setAcceptedChefComplaints] = useState([]);
  const [stats, setStats] = useState({
    complaints: { total: 3, pending: 1, in_progress: 1, resolved: 1 },
    chef_complaints: { total: 16, pending: 10, accepted: 0, resolved: 6, rejected: 0 },
    ratings: { avg_rating: 4.3 },
    meals_served_today: 842,
    total_capacity: 1050
  });

  const [toastMessage, setToastMessage] = useState('');

  const loadData = () => {
    api.getComplaints()
      .then(res => {
        if (Array.isArray(res.data)) {
          setComplaints(res.data);
        } else if (res.data?.data) {
          setComplaints(res.data.data);
        }
      })
      .catch(err => console.warn('Could not load complaints for admin:', err));

    api.getChefComplaints({ status: 'ACCEPTED' })
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setAcceptedChefComplaints(data);
      })
      .catch(err => console.warn('Could not load accepted chef complaints:', err));

    api.getStats()
      .then(res => {
        if (res.data?.data) setStats(res.data.data);
      })
      .catch(err => console.warn('Could not load stats for admin:', err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = async (ticketId) => {
    try {
      await api.updateComplaintStatus(ticketId, 'Resolved', 'Inspected and marked resolved by Mess Supervisor.');
      setToastMessage(`Ticket #${ticketId} marked Resolved in PostgreSQL database!`);
      loadData();
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      console.error('Error updating status:', err);
      setToastMessage('Failed to update ticket status.');
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
        <div className="container page-header-content">
          <div>
            <div className="breadcrumb">
              <Link to="/">Home</Link>
              <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
              <span>Admin Console</span>
            </div>
            <h1>Mess Administration & Operations</h1>
            <p className="lead" style={{ margin: 0 }}>Central Mess Hall #2 • Live Kitchen Supervision & PostgreSQL Integration</p>
          </div>

          <span className="badge badge-live" style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}>
            Kitchen Live: Lunch Closing & Snacks Prep
          </span>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '3.5rem' }}>
        {toastMessage && (
          <div className="toast-fixed">
            <i className="fa-solid fa-circle-check" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}></i>
            <div>
              <h4 style={{ fontSize: '0.9rem', margin: 0 }}>Admin Action</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>{toastMessage}</p>
            </div>
          </div>
        )}

        {/* Admin Section Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.85rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`btn ${activeTab === 'menu' ? 'btn-primary' : 'btn-outline'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
          >
            <i className="fa-solid fa-utensils"></i>
            <span>Manage Food Menu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('operations')}
            className={`btn ${activeTab === 'operations' ? 'btn-primary' : 'btn-outline'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
          >
            <i className="fa-solid fa-clipboard-list"></i>
            <span>Kitchen Ops & Grievances</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chefs')}
            className={`btn ${activeTab === 'chefs' ? 'btn-primary' : 'btn-outline'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
          >
            <i className="fa-solid fa-kitchen-set"></i>
            <span>Chef Profiles</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chef-reviews')}
            className={`btn ${activeTab === 'chef-reviews' ? 'btn-primary' : 'btn-outline'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
          >
            <i className="fa-solid fa-comment-dots" style={{ color: activeTab === 'chef-reviews' ? '#fde047' : '#f59e0b' }}></i>
            <span>Manage Chef Reviews</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chef-complaints')}
            className={`btn ${activeTab === 'chef-complaints' ? 'btn-primary' : 'btn-outline'}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
          >
            <i className="fa-solid fa-shield-halved" style={{ color: activeTab === 'chef-complaints' ? '#fca5a5' : '#e11d48' }}></i>
            <span>Manage Chef Complaints</span>
          </button>
        </div>

        {/* Tab 1: Manage Food Menu */}
        {activeTab === 'menu' && (
          <ManageMenu onNotify={(msg) => {
            setToastMessage(msg);
            setTimeout(() => setToastMessage(''), 4000);
          }} />
        )}

        {/* Tab 2: Operations & Grievances */}
        {activeTab === 'operations' && (
          <>
            {/* Admin KPI Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{stats.meals_served_today} / {stats.total_capacity}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Meals Served Today (80%)</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
              <i className="fa-solid fa-star"></i>
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{stats.ratings?.avg_rating || 4.3} ★</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avg Student Rating Today</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', background: 'var(--danger-soft)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
              <i className="fa-solid fa-circle-exclamation"></i>
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--danger)' }}>
                {(stats.complaints?.pending || 0) + (stats.complaints?.in_progress || 0)} Open
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pending Grievances</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
              <i className="fa-solid fa-clipboard-check"></i>
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb' }}>98%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hygiene Audit Score (FSSAI)</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
              <i className="fa-solid fa-check"></i>
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15803d' }}>
                {stats.chef_complaints?.accepted ?? acceptedChefComplaints.length}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Accepted Complaints</div>
            </div>
          </div>
        </div>

        {/* 2-Column Operations Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.75rem' }}>
          {/* Left: Grievances Table & Kitchen Status */}
          <div>
            <div className="card" style={{ marginBottom: '2rem' }}>
              <div className="card-header">
                <div className="card-title">
                  <i className="fa-solid fa-inbox" style={{ color: 'var(--danger)' }}></i>
                  Active Student Grievances (Live PostgreSQL Queue)
                </div>
                <span className="badge" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>Needs Attention</span>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Ticket</th>
                      <th>Student / Room</th>
                      <th>Issue Summary</th>
                      <th>Priority</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((t) => (
                      <tr key={t.id || t.ticket_id}>
                        <td><strong>#{t.ticket_id}</strong></td>
                        <td>
                          <div>{t.student_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.room}</div>
                        </td>
                        <td>{t.description?.substring(0, 45)}...</td>
                        <td>
                          <span className={`status-badge ${t.status === 'Resolved' ? 'status-resolved' : t.status === 'In Progress' ? 'status-in-progress' : 'status-pending'}`}>
                            {t.priority ? t.priority.toUpperCase() : 'NORMAL'}
                          </span>
                        </td>
                        <td>
                          {t.status === 'Resolved' ? (
                            <span className="badge badge-veg"><i className="fa-solid fa-check"></i> Resolved</span>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleResolve(t.ticket_id)}
                            >
                              Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recently Accepted Chef Complaints */}
            <div className="card" style={{ marginBottom: '2rem' }}>
              <div className="card-header">
                <div className="card-title">
                  <i className="fa-solid fa-shield-halved" style={{ color: '#16a34a' }}></i>
                  Recently Accepted Chef Complaints
                </div>
                <span className="badge" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
                  {stats.chef_complaints?.accepted ?? acceptedChefComplaints.length} Accepted
                </span>
              </div>

              {acceptedChefComplaints.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  <i className="fa-solid fa-inbox" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block', color: '#94a3b8' }}></i>
                  No complaints currently in Accepted status.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Complaint ID</th>
                        <th>Chef</th>
                        <th>Category</th>
                        <th>Submitted By</th>
                        <th>Accepted Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {acceptedChefComplaints.slice(0, 5).map(c => (
                        <tr key={c.id}>
                          <td><strong>#{c.ticket_id}</strong></td>
                          <td>
                            <span style={{
                              background: '#fee2e2',
                              color: '#991b1b',
                              padding: '0.15rem 0.5rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.78rem',
                              fontWeight: 700
                            }}>
                              {c.chef_name}
                            </span>
                          </td>
                          <td>{c.category}</td>
                          <td>{c.student_name || 'Hostel Student'}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {c.accepted_at ? new Date(c.accepted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                          </td>
                          <td>
                            <span className="badge" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', fontSize: '0.78rem' }}>
                              <i className="fa-solid fa-check" style={{ marginRight: '0.25rem' }}></i> Accepted
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Kitchen Prep Progress */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <i className="fa-solid fa-kitchen-set" style={{ color: 'var(--primary)' }}></i>
                  Evening & Dinner Kitchen Prep Status
                </div>
                <span className="badge badge-veg">On Schedule</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    <span><strong>Dinner:</strong> Mixed Vegetable Korma & Moong Dal</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>70% Ready</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '70%', height: '100%', background: 'var(--primary)' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    <span><strong>Snacks:</strong> Fresh Samosa Frying & Tea Brewing</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>95% Ready</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '95%', height: '100%', background: 'var(--accent)' }}></div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <strong>Special Meal Bookings:</strong><br />
                    • Jain Diet (No Onion/Garlic): 32 students<br />
                    • Sick Diet (Khichdi & Curd): 14 students
                  </div>
                  <div>
                    <strong>Ration Inventory Alert:</strong><br />
                    <span style={{ color: 'var(--primary)' }}><i className="fa-solid fa-circle-check"></i> Paneer stock: OK (45 kg)</span><br />
                    <span style={{ color: 'var(--primary)' }}><i className="fa-solid fa-circle-check"></i> Basmati Rice: OK (200 kg)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Feedback Category Scores */}
          <div>
            {/* Satisfaction Metrics */}
            <div className="card">
              <div className="card-header">
                <div className="card-title" style={{ fontSize: '1rem' }}>
                  <i className="fa-solid fa-chart-pie" style={{ color: 'var(--accent)' }}></i>
                  Feedback Category Scores
                </div>
                <span className="badge badge-primary">Sept 20</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span>Taste & Cooking</span>
                    <strong>4.4 / 5.0</strong>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '88%', height: '100%', background: '#10b981' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span>Hygiene & Cleanliness</span>
                    <strong>4.7 / 5.0</strong>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '94%', height: '100%', background: '#10b981' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span>Food Temperature</span>
                    <strong>3.9 / 5.0</strong>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '78%', height: '100%', background: '#f59e0b' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span>Service & Refill Speed</span>
                    <strong>4.2 / 5.0</strong>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '84%', height: '100%', background: '#3b82f6' }}></div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                <Link to="/feedback" className="btn btn-outline btn-sm btn-block">
                  View All Student Comments
                </Link>
              </div>
            </div>
          </div>
        </div>
        </>
        )}

        {/* Tab 3: Manage Chefs */}
        {activeTab === 'chefs' && (
          <ManageChefs onNotify={(msg) => {
            setToastMessage(msg);
            setTimeout(() => setToastMessage(''), 4000);
          }} />
        )}

        {/* Tab 4: Manage Chef Reviews */}
        {activeTab === 'chef-reviews' && (
          <ManageChefReviews onNotify={(msg) => {
            setToastMessage(msg);
            setTimeout(() => setToastMessage(''), 4000);
          }} />
        )}

        {/* Tab 5: Manage Chef Complaints */}
        {activeTab === 'chef-complaints' && (
          <ManageChefComplaints onNotify={(msg) => {
            setToastMessage(msg);
            setTimeout(() => setToastMessage(''), 4000);
          }} />
        )}
      </div>
    </div>
  );
}
