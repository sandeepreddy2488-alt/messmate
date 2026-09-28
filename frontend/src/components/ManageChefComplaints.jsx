import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function ManageChefComplaints({ onNotify }) {
  const [complaints, setComplaints] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [selectedChef, setSelectedChef] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // Resolution note state per complaint ID
  const [resolutionNotes, setResolutionNotes] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchChefs();
  }, []);

  useEffect(() => {
    fetchComplaints(selectedChef, selectedStatus);
  }, [selectedChef, selectedStatus]);

  const fetchChefs = async () => {
    try {
      const res = await api.getChefs();
      const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setChefs(data);
    } catch (err) {
      console.error('Error fetching chefs:', err);
    }
  };

  const fetchComplaints = async (chefFilter, statusFilter) => {
    setLoading(true);
    try {
      const params = {};
      if (chefFilter && chefFilter !== 'all') {
        params.chef = chefFilter;
      }
      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const res = await api.getChefComplaints(params);
      const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setComplaints(data);
    } catch (err) {
      console.error('Error fetching chef complaints:', err);
      if (onNotify) onNotify('Failed to load chef complaints from database.');
    } finally {
      setLoading(false);
    }
  };

  const normalizeStatus = (status) => {
    if (!status) return 'PENDING';
    const s = status.toString().trim().toUpperCase().replace(' ', '_');
    if (['PENDING', 'ACCEPTED', 'IN_REVIEW', 'RESOLVED', 'REJECTED'].includes(s)) return s;
    return 'PENDING';
  };

  const displayStatus = (status) => {
    const norm = normalizeStatus(status);
    switch (norm) {
      case 'PENDING': return 'Pending';
      case 'ACCEPTED': return 'Accepted';
      case 'IN_REVIEW': return 'In Review';
      case 'RESOLVED': return 'Resolved';
      case 'REJECTED': return 'Rejected';
      default: return status || 'Pending';
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    setUpdatingId(complaintId);
    try {
      const currentNote = resolutionNotes[complaintId] || '';
      const normStatus = normalizeStatus(newStatus);

      if (normStatus === 'ACCEPTED') {
        await api.acceptChefComplaint(complaintId, {}, 'admin');
        if (onNotify) onNotify('Complaint accepted successfully!');
      } else if (normStatus === 'REJECTED') {
        await api.rejectChefComplaint(complaintId, {
          rejection_reason: currentNote.trim() || 'Dismissed by supervisor.'
        }, 'admin');
        if (onNotify) onNotify('Complaint marked as Rejected.');
      } else if (normStatus === 'RESOLVED') {
        await api.resolveChefComplaint(complaintId, {
          resolution_note: currentNote.trim() || 'Inspected and resolved by Mess Administration.'
        }, 'admin');
        if (onNotify) onNotify('Complaint marked as Resolved!');
      } else {
        await api.updateChefComplaint(complaintId, { status: normStatus, role: 'admin' }, 'admin');
        if (onNotify) onNotify(`Complaint marked as "${displayStatus(normStatus)}"!`);
      }

      fetchComplaints(selectedChef, selectedStatus);
    } catch (err) {
      console.error('Error updating complaint status:', err);
      if (onNotify) onNotify('Failed to update complaint status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => normalizeStatus(c.status) === 'PENDING').length;
  const acceptedCount = complaints.filter(c => normalizeStatus(c.status) === 'ACCEPTED').length;
  const resolvedCount = complaints.filter(c => normalizeStatus(c.status) === 'RESOLVED').length;
  const rejectedCount = complaints.filter(c => normalizeStatus(c.status) === 'REJECTED').length;

  const getStatusBadgeStyle = (status) => {
    const norm = normalizeStatus(status);
    switch (norm) {
      case 'ACCEPTED':
        return { background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' };
      case 'RESOLVED':
        return { background: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe' };
      case 'REJECTED':
        return { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' };
      case 'IN_REVIEW':
        return { background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' };
      case 'PENDING':
      default:
        return { background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
        border: '1px solid #fecdd3',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            background: '#e11d48',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem'
          }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#9f1239', fontSize: '1.25rem' }}>
              Manage Chef Complaints
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#be123c' }}>
              Dedicated grievance resolution console for complaints submitted against specific kitchen chefs
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontSize: '0.85rem' }}>
            {pendingCount} Pending
          </span>
          <span className="badge" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', fontSize: '0.85rem' }}>
            {acceptedCount} Accepted
          </span>
          <span className="badge" style={{ background: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: '0.85rem' }}>
            {resolvedCount} Resolved
          </span>
          <span className="badge" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', fontSize: '0.85rem' }}>
            {rejectedCount} Rejected
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* Chef Filter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-dark)', marginRight: '0.25rem' }}>
              <i className="fa-solid fa-kitchen-set" style={{ marginRight: '0.4rem', color: '#e11d48' }}></i>
              Filter by Chef:
            </span>

            <button
              type="button"
              onClick={() => setSelectedChef('all')}
              className={`btn btn-sm ${selectedChef === 'all' ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderRadius: 'var(--radius-full)', padding: '0.35rem 0.85rem', fontSize: '0.825rem' }}
            >
              All Chefs
            </button>

            {['GOPI', 'SATTIBABU', 'BUTTER MILK BABBLU'].map(name => {
              const isActive = selectedChef.toUpperCase() === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedChef(name)}
                  className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                  style={{ borderRadius: 'var(--radius-full)', padding: '0.35rem 0.85rem', fontSize: '0.825rem' }}
                >
                  {name}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => fetchComplaints(selectedChef, selectedStatus)}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <i className="fa-solid fa-arrows-rotate"></i> Refresh Complaints
          </button>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
          <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
          {['all', 'Pending', 'Accepted', 'Resolved', 'Rejected'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className="btn btn-sm"
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '0.25rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                background: selectedStatus === st ? '#0f172a' : 'var(--bg-subtle)',
                color: selectedStatus === st ? '#ffffff' : 'var(--text-dark)',
                border: '1px solid var(--border)'
              }}
            >
              {st === 'all' ? 'All' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints Table / List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#e11d48', marginBottom: '1rem' }}></i>
            <h4>Loading Chef Complaints...</h4>
          </div>
        ) : complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-circle-check" style={{ fontSize: '2.5rem', color: '#10b981', marginBottom: '0.75rem' }}></i>
            <h4 style={{ margin: 0 }}>No Complaints Found</h4>
            <p style={{ fontSize: '0.85rem' }}>No grievances recorded for chef {selectedChef} under status "{selectedStatus}".</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-dark)' }}>ID</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-dark)' }}>Chef Name</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-dark)' }}>Student</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-dark)' }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-dark)', width: '30%' }}>Complaint Message</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-dark)' }}>Date</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-dark)' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-dark)' }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((item, idx) => {
                  const statusStyle = getStatusBadgeStyle(item.status);
                  const isUpdating = updatingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: idx % 2 === 0 ? '#ffffff' : 'var(--bg-subtle)'
                      }}
                    >
                      {/* Ticket ID */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top', fontFamily: 'monospace', fontWeight: 700 }}>
                        #{item.ticket_id}
                      </td>

                      {/* Chef Name */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                        <span style={{
                          background: '#fee2e2',
                          color: '#991b1b',
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          border: '1px solid #fecaca'
                        }}>
                          <i className="fa-solid fa-kitchen-set"></i>
                          {item.chef_name}
                        </span>
                      </td>

                      {/* Student */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top', fontWeight: 600, color: 'var(--text-dark)' }}>
                        {item.student_name || 'Hostel Student'}
                      </td>

                      {/* Category */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top' }}>
                        <span style={{
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)'
                        }}>
                          {item.category}
                        </span>
                      </td>

                      {/* Message */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top', color: 'var(--text-body)', lineHeight: '1.5' }}>
                        <div style={{ marginBottom: '0.35rem' }}>{item.message}</div>
                        {item.resolution_note && (
                          <div style={{
                            fontSize: '0.78rem',
                            color: '#15803d',
                            background: '#f0fdf4',
                            padding: '0.35rem 0.55rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid #bbf7d0'
                          }}>
                            <strong>Resolution:</strong> {item.resolution_note}
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'N/A'}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                        <span style={{
                          padding: '0.2rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          ...statusStyle
                        }}>
                          {displayStatus(item.status)}
                        </span>
                      </td>

                      {/* Admin Actions */}
                      <td style={{ padding: '0.85rem 1rem', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {normalizeStatus(item.status) === 'PENDING' && (
                              <>
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleStatusChange(item.id, 'ACCEPTED')}
                                  className="btn btn-sm"
                                  style={{
                                    background: '#16a34a',
                                    color: '#ffffff',
                                    border: 'none',
                                    fontSize: '0.75rem',
                                    padding: '0.25rem 0.6rem',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                  }}
                                  title="Accept this complaint"
                                >
                                  <i className="fa-solid fa-check"></i> Accept
                                </button>

                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleStatusChange(item.id, 'REJECTED')}
                                  className="btn btn-sm"
                                  style={{
                                    background: '#dc2626',
                                    color: '#ffffff',
                                    border: 'none',
                                    fontSize: '0.75rem',
                                    padding: '0.25rem 0.6rem',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                  }}
                                  title="Reject this complaint"
                                >
                                  <i className="fa-solid fa-xmark"></i> Reject
                                </button>
                              </>
                            )}

                            {normalizeStatus(item.status) === 'ACCEPTED' && (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleStatusChange(item.id, 'RESOLVED')}
                                className="btn btn-sm"
                                style={{
                                  background: '#2563eb',
                                  color: '#ffffff',
                                  border: 'none',
                                  fontSize: '0.75rem',
                                  padding: '0.25rem 0.6rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                                title="Mark complaint as Resolved"
                              >
                                <i className="fa-solid fa-circle-check"></i> Mark Resolved
                              </button>
                            )}

                            {normalizeStatus(item.status) === 'RESOLVED' && (
                              <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>
                                <i className="fa-solid fa-circle-check" style={{ marginRight: '0.25rem' }}></i>
                                Resolved
                              </span>
                            )}

                            {normalizeStatus(item.status) === 'REJECTED' && (
                              <span style={{ fontSize: '0.78rem', color: '#b91c1c', fontWeight: 600 }}>
                                <i className="fa-solid fa-ban" style={{ marginRight: '0.25rem' }}></i>
                                Dismissed
                              </span>
                            )}
                          </div>

                          {/* Quick note input */}
                          <input
                            type="text"
                            placeholder="Add supervisor note..."
                            value={resolutionNotes[item.id] || ''}
                            onChange={(e) => setResolutionNotes({ ...resolutionNotes, [item.id]: e.target.value })}
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.45rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border)',
                              maxWidth: '180px'
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
