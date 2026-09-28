import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Complaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [category, setCategory] = useState('hygiene');
  const [meal, setMeal] = useState('Lunch');
  const [hall, setHall] = useState('Central Mess Hall 2 (Block B)');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchComplaints = () => {
    api.getComplaints()
      .then(res => {
        if (Array.isArray(res.data)) {
          setComplaints(res.data);
        } else if (res.data?.data) {
          setComplaints(res.data.data);
        }
      })
      .catch(err => console.warn('Could not load complaints from Django API:', err));
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.createComplaint({
        student_name: user?.name || 'Rahul Sharma',
        room: `${user?.room_number || 'B-304'} (${user?.hostel_block || 'Block B'})`,
        category,
        meal,
        hall,
        priority,
        description
      });

      const newTicketId = res.data?.ticket_id || 'CMP-NEW';
      setToastMessage(`Grievance #${newTicketId} logged in PostgreSQL database!`);
      setDescription('');
      fetchComplaints();
      setTimeout(() => setToastMessage(''), 5000);
    } catch (err) {
      console.error('Error logging complaint:', err);
      setToastMessage('Error logging grievance to server.');
      setTimeout(() => setToastMessage(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="container page-header-content">
          <div>
            <div className="breadcrumb">
              <Link to="/">Home</Link>
              <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
              <span>Complaints & Grievances</span>
            </div>
            <h1>Grievance Redressal Portal</h1>
            <p className="lead" style={{ margin: 0 }}>Report hygiene issues, food shortages, or service faults with real-time tracking.</p>
          </div>

          <span className="badge badge-veg" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <i className="fa-solid fa-clock-rotate-left"></i> 24-Hour SLA Commitment
          </span>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '3.5rem' }}>
        {toastMessage && (
          <div className="toast-fixed">
            <i className="fa-solid fa-circle-check" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}></i>
            <div>
              <h4 style={{ fontSize: '0.9rem', margin: 0 }}>Notice</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>{toastMessage}</p>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Submission Form */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <i className="fa-solid fa-file-circle-exclamation" style={{ color: 'var(--danger)' }}></i>
                Lodge a Formal Grievance
              </div>
              <span className="badge badge-primary">Confidential</span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Grievance Category *</label>
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="hygiene">Food Hygiene & Cleanliness</option>
                  <option value="quality">Poor Cooking / Stale Food</option>
                  <option value="water">RO Drinking Water / Dispenser Fault</option>
                  <option value="shortage">Food Shortage / Refill Delay</option>
                  <option value="cutlery">Unwashed Plates / Dirty Cutlery</option>
                  <option value="timing">Mess Timings / Unpunctual Service</option>
                  <option value="staff">Mess Staff Conduct</option>
                  <option value="other">Other Campus Mess Issue</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Meal Affected</label>
                  <select
                    className="form-control"
                    value={meal}
                    onChange={(e) => setMeal(e.target.value)}
                  >
                    <option value="Lunch">Today's Lunch</option>
                    <option value="Breakfast">Today's Breakfast</option>
                    <option value="Snacks">Evening Snacks</option>
                    <option value="Dinner">Yesterday Dinner</option>
                    <option value="General">General / Ongoing</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Mess Hall</label>
                  <select
                    className="form-control"
                    value={hall}
                    onChange={(e) => setHall(e.target.value)}
                  >
                    <option value="Central Mess Hall 2 (Block B)">Central Mess Hall 2 (Block B)</option>
                    <option value="Central Mess Hall 1 (Block A)">Central Mess Hall 1 (Block A)</option>
                    <option value="Dining Annexe">Girls Hostel Dining Annexe</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Urgency Level</label>
                <div style={{ display: 'flex', gap: '1.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="prio"
                      value="low"
                      checked={priority === 'low'}
                      onChange={() => setPriority('low')}
                    /> Normal (24-48h)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="prio"
                      value="medium"
                      checked={priority === 'medium'}
                      onChange={() => setPriority('medium')}
                    /> Medium (24h)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--danger)', fontWeight: 700, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="prio"
                      value="urgent"
                      checked={priority === 'urgent'}
                      onChange={() => setPriority('urgent')}
                    /> Urgent
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Description *</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Describe the incident (counter number, food item, exact timing, staff present)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={submitting}
                style={{ backgroundColor: '#dc2626' }}
              >
                <i className="fa-solid fa-bullhorn"></i> {submitting ? 'Submitting to Database...' : 'Submit Grievance Ticket'}
              </button>
            </form>
          </div>

          {/* Complaints Tracker List */}
          <div>
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <i className="fa-solid fa-list-check" style={{ color: 'var(--primary)' }}></i>
                  My Grievance Tickets
                </div>
                <span className="status-badge status-resolved">PostgreSQL Queue</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {complaints.map((t) => (
                  <div key={t.id || t.ticket_id} style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <i className="fa-solid fa-ticket" style={{ color: t.status === 'Resolved' ? 'var(--primary)' : 'var(--danger)' }}></i>
                        #{t.ticket_id}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>• {t.category}</span>
                      </div>
                      <span className={`status-badge ${t.status === 'Resolved' ? 'status-resolved' : t.status === 'In Progress' ? 'status-in-progress' : 'status-pending'}`}>
                        {t.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', margin: '0 0 0.4rem 0' }}>
                      <strong>Issue:</strong> {t.description}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {t.hall} • {t.created_at ? t.created_at.split('T')[0] : 'Today'}
                    </div>

                    {t.resolution_note && (
                      <div style={{
                        background: '#f0fdf4',
                        borderLeft: '3px solid #10b981',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                        fontSize: '0.825rem',
                        marginTop: '0.75rem',
                        color: '#166534'
                      }}>
                        <strong><i className="fa-solid fa-wrench"></i> Resolution Note by Staff:</strong><br />
                        {t.resolution_note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ marginTop: '1.5rem', background: '#fff5f5', borderColor: '#fecaca' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '1.5rem', color: 'var(--danger)', marginTop: '0.2rem' }}></i>
                <div>
                  <h4 style={{ color: '#991b1b', marginBottom: '0.25rem' }}>Emergency Escalation</h4>
                  <p style={{ fontSize: '0.825rem', color: '#7f1d1d', margin: 0, lineHeight: '1.5' }}>
                    If you spot an immediate safety hazard, food contamination, or emergency hygiene issue, call Chief Hostel Warden:
                    <strong> 080-2442-9900</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
