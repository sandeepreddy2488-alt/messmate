import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ChefComplaints() {
  const { user, role } = useAuth();
  const isAdmin = role === 'admin';

  const [searchParams, setSearchParams] = useSearchParams();
  const initialChef = searchParams.get('chef') || 'all';
  const openParam = searchParams.get('open');

  const [complaints, setComplaints] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [selectedChef, setSelectedChef] = useState(initialChef);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Lodge Complaint Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalChefId, setModalChefId] = useState('');
  const [isChefFixed, setIsChefFixed] = useState(false);
  const [category, setCategory] = useState('Food Quality');
  const [message, setMessage] = useState('');
  const [studentName, setStudentName] = useState(user?.name || user?.username || 'Hostel Student');
  const [submitting, setSubmitting] = useState(false);

  // Admin Action Modal state (Accept / Reject / Resolve)
  const [actionModal, setActionModal] = useState(null); // { type: 'accept' | 'reject' | 'resolve', complaint }
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [resolutionNoteInput, setResolutionNoteInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const categories = [
    'Food Quality',
    'Taste',
    'Hygiene',
    'Quantity',
    'Behaviour',
    'Other'
  ];

  const statuses = [
    'all',
    'Pending',
    'Accepted',
    'Resolved',
    'Rejected'
  ];

  // Helper to normalize status codes
  const normalizeStatus = (status) => {
    if (!status) return 'PENDING';
    const s = status.toString().trim().toUpperCase().replace(' ', '_');
    if (['PENDING', 'ACCEPTED', 'IN_REVIEW', 'RESOLVED', 'REJECTED'].includes(s)) return s;
    return 'PENDING';
  };

  // Helper for human-readable display status
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

  useEffect(() => {
    fetchChefs();
  }, []);

  useEffect(() => {
    fetchComplaints(selectedChef, selectedStatus);
  }, [selectedChef, selectedStatus]);

  useEffect(() => {
    if (openParam && chefs.length > 0) {
      const match = chefs.find(c => c.id.toString() === openParam || c.name.toUpperCase() === openParam.toUpperCase());
      if (match) {
        handleOpenComplaintModal(match.id.toString(), true);
      } else {
        handleOpenComplaintModal(undefined, false);
      }
    }
  }, [openParam, chefs]);

  const fetchChefs = async () => {
    try {
      const res = await api.getChefs({ active: true });
      const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setChefs(data);
      if (data.length > 0 && !modalChefId) {
        setModalChefId(data[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to load chefs:', err);
    }
  };

  const fetchComplaints = async (chefFilter, statusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const baseParams = {};
      if (chefFilter && chefFilter !== 'all') {
        baseParams.chef = chefFilter;
      }
      const res = await api.getChefComplaints(baseParams);
      const allData = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setAllComplaints(allData);

      if (statusFilter && statusFilter !== 'all') {
        const normFilter = normalizeStatus(statusFilter);
        const filtered = allData.filter(c => normalizeStatus(c.status) === normFilter);
        setComplaints(filtered);
      } else {
        setComplaints(allData);
      }
    } catch (err) {
      console.error('Failed to load chef complaints:', err);
      setError('Could not load chef complaints from database.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleOpenComplaintModal = (chefIdToPreselect, fixed = false) => {
    const idToUse = chefIdToPreselect || modalChefId || (chefs[0]?.id?.toString() || '1');
    setModalChefId(idToUse.toString());
    setIsChefFixed(fixed);
    setCategory('Food Quality');
    setMessage('');
    setStudentName(user?.name || user?.username || 'Hostel Student');
    setIsModalOpen(true);
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!modalChefId) {
      showToast('Please select a chef for this complaint.');
      return;
    }
    if (!message.trim()) {
      showToast('Please describe the complaint details.');
      return;
    }

    setSubmitting(true);
    try {
      const targetChef = chefs.find(c => c.id.toString() === modalChefId.toString());
      const chefName = targetChef ? targetChef.name : 'Chef';

      const res = await api.submitChefComplaintDirect({
        chef: parseInt(modalChefId, 10),
        category,
        message: message.trim(),
        student_name: studentName.trim() || 'Hostel Student'
      });

      const ticketId = res.data?.ticket_id || 'CH-CMP';
      showToast(`Grievance #${ticketId} submitted directly to Chef ${chefName}. Notice logged for Kitchen Supervisor.`);
      setIsModalOpen(false);
      setMessage('');
      fetchComplaints(selectedChef, selectedStatus);
    } catch (err) {
      console.error('Error submitting chef complaint:', err);
      showToast('Failed to submit chef complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Action Modal Handlers (Accept / Reject / Resolve)
  const handleOpenAcceptModal = (complaint) => {
    setActionModal({ type: 'accept', complaint });
  };

  const handleOpenRejectModal = (complaint) => {
    setRejectionReasonInput('');
    setActionModal({ type: 'reject', complaint });
  };

  const handleOpenResolveModal = (complaint) => {
    setResolutionNoteInput(complaint.resolution_note || '');
    setActionModal({ type: 'resolve', complaint });
  };

  const handleConfirmAction = async (e) => {
    if (e) e.preventDefault();
    if (!actionModal) return;
    const { type, complaint } = actionModal;

    setActionLoading(true);
    try {
      const adminUsername = user?.username || user?.name || 'Sandeep';
      const adminEmail = user?.email || 'messmate.admin@gmail.com';
      const basePayload = {
        role: 'admin',
        admin_username: adminUsername,
        admin_email: adminEmail,
      };

      if (type === 'accept') {
        await api.acceptChefComplaint(complaint.id, basePayload, 'admin');
        showToast(`Complaint #${complaint.ticket_id} accepted successfully! Recorded in PostgreSQL.`);
      } else if (type === 'reject') {
        await api.rejectChefComplaint(complaint.id, {
          ...basePayload,
          rejection_reason: rejectionReasonInput.trim()
        }, 'admin');
        showToast(`Complaint #${complaint.ticket_id} marked as Rejected.`);
      } else if (type === 'resolve') {
        await api.resolveChefComplaint(complaint.id, {
          ...basePayload,
          resolution_note: resolutionNoteInput.trim() || `Addressed with Chef ${complaint.chef_name}.`
        }, 'admin');
        showToast(`Complaint #${complaint.ticket_id} marked as Resolved.`);
      }

      setActionModal(null);
      setRejectionReasonInput('');
      setResolutionNoteInput('');
      fetchComplaints(selectedChef, selectedStatus);
    } catch (err) {
      console.error(`Failed to ${type} complaint:`, err);
      const serverMsg = err.response?.data?.detail || err.response?.data?.error || 'Error updating complaint. Admin privilege required.';
      showToast(serverMsg);
    } finally {
      setActionLoading(false);
    }
  };

  // Dynamic 5-Card Status Metrics (Computed from database records)
  const totalCount = allComplaints.length;
  const pendingCount = allComplaints.filter(c => normalizeStatus(c.status) === 'PENDING').length;
  const acceptedCount = allComplaints.filter(c => normalizeStatus(c.status) === 'ACCEPTED').length;
  const resolvedCount = allComplaints.filter(c => normalizeStatus(c.status) === 'RESOLVED').length;
  const rejectedCount = allComplaints.filter(c => normalizeStatus(c.status) === 'REJECTED').length;

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

  const targetChefObj = chefs.find(c => c.id.toString() === modalChefId.toString());

  return (
    <div style={{ backgroundColor: 'var(--bg-body)', minHeight: '85vh', paddingBottom: '4rem' }}>
      {/* Page Header */}
      <div className="page-header" style={{ background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', borderBottom: '1px solid #fecdd3' }}>
        <div className="container page-header-content">
          <div>
            <div className="breadcrumb">
              <Link to="/">Home</Link>
              <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
              <Link to="/chefs">Chefs</Link>
              <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
              <span>Chef Complaints</span>
            </div>
            <h1 style={{ color: '#9f1239' }}>Chef Complaints</h1>
            <p className="lead" style={{ margin: 0, color: '#be123c' }}>
              Direct grievances & culinary complaints logged against specific mess chefs
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleOpenComplaintModal(undefined, false)}
              className="btn btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 700,
                background: '#e11d48',
                color: '#ffffff',
                border: 'none',
                boxShadow: 'var(--shadow-md)',
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <i className="fa-solid fa-triangle-exclamation"></i>
              Complaint to Chef
            </button>
            <Link to="/chef-reviews" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
              <i className="fa-solid fa-star"></i> Go to Chef Reviews
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '2rem' }}>
        {/* Toast Alert */}
        {toastMessage && (
          <div className="toast-fixed" style={{ zIndex: 1300 }}>
            <i className="fa-solid fa-circle-check" style={{ color: '#e11d48', fontSize: '1.25rem' }}></i>
            <div>
              <h4 style={{ fontSize: '0.9rem', margin: 0 }}>Chef Complaint System</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>{toastMessage}</p>
            </div>
          </div>
        )}

        {/* Dynamic Top Summary Cards (5 Status Counters) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {/* Card 1: Total */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #e11d48', padding: '1.1rem 1.25rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: '#ffe4e6',
              color: '#e11d48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.35rem'
            }}>
              <i className="fa-solid fa-clipboard-list"></i>
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-dark)' }}>{totalCount}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Complaints</div>
            </div>
          </div>

          {/* Card 2: Pending */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #d97706', padding: '1.1rem 1.25rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.35rem'
            }}>
              <i className="fa-solid fa-hourglass-start"></i>
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#b45309' }}>{pendingCount}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pending Complaints</div>
            </div>
          </div>

          {/* Card 3: Accepted */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #16a34a', padding: '1.1rem 1.25rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.35rem'
            }}>
              <i className="fa-solid fa-check"></i>
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15803d' }}>{acceptedCount}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Accepted Complaints</div>
            </div>
          </div>

          {/* Card 4: Resolved */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #2563eb', padding: '1.1rem 1.25rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: '#dbeafe',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.35rem'
            }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1d4ed8' }}>{resolvedCount}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Resolved Complaints</div>
            </div>
          </div>

          {/* Card 5: Rejected */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #dc2626', padding: '1.1rem 1.25rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              background: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.35rem'
            }}>
              <i className="fa-solid fa-xmark"></i>
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#b91c1c' }}>{rejectedCount}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rejected Complaints</div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="card" style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {/* Chef Filter Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-dark)', marginRight: '0.25rem' }}>
                <i className="fa-solid fa-kitchen-set" style={{ marginRight: '0.4rem', color: '#e11d48' }}></i>
                Chef:
              </span>

              <button
                type="button"
                onClick={() => setSelectedChef('all')}
                className={`btn btn-sm ${selectedChef === 'all' ? 'btn-primary' : 'btn-outline'}`}
                style={{ borderRadius: 'var(--radius-full)', padding: '0.4rem 1rem', fontWeight: 600 }}
              >
                All Chefs
              </button>

              {['GOPI', 'SATTIBABU', 'BUTTER MILK BABBLU'].map(chefName => {
                const isActive = selectedChef.toUpperCase() === chefName;
                return (
                  <button
                    key={chefName}
                    type="button"
                    onClick={() => setSelectedChef(chefName)}
                    className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                    style={{ borderRadius: 'var(--radius-full)', padding: '0.4rem 1rem', fontWeight: 600 }}
                  >
                    <i className="fa-solid fa-user-tie" style={{ marginRight: '0.35rem' }}></i>
                    {chefName}
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Matching: <strong>{complaints.length}</strong> complaints
            </div>
          </div>

          {/* Status Filter Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '0.25rem' }}>
              Status:
            </span>
            {statuses.map(st => {
              const isActive = selectedStatus === st;
              return (
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
                    background: isActive ? '#0f172a' : 'var(--bg-subtle)',
                    color: isActive ? '#ffffff' : 'var(--text-dark)',
                    border: '1px solid var(--border)'
                  }}
                >
                  {st === 'all' ? 'All' : st}
                </button>
              );
            })}
          </div>
        </div>

        {/* Complaints List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#e11d48', marginBottom: '1rem' }}></i>
            <h4 style={{ margin: 0 }}>Loading Chef Complaints...</h4>
          </div>
        ) : error ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger)' }}>
            <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}></i>
            <h4>{error}</h4>
            <button onClick={() => fetchComplaints(selectedChef, selectedStatus)} className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>
              Retry
            </button>
          </div>
        ) : complaints.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto 1.25rem auto'
            }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-dark)' }}>No Complaints Found</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
              No grievances found for {selectedChef === 'all' ? 'any chef' : selectedChef} with status filter "{selectedStatus}".
            </p>
            <button
              onClick={() => handleOpenComplaintModal(undefined, false)}
              className="btn btn-sm"
              style={{
                background: '#e11d48',
                color: '#ffffff',
                fontWeight: 700,
                padding: '0.5rem 1.2rem',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '0.4rem' }}></i> Lodge Complaint
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {complaints.map(item => {
              const normStatus = normalizeStatus(item.status);
              const statusStyle = getStatusBadgeStyle(item.status);
              const currentDisplay = displayStatus(item.status);
              const isResolved = normStatus === 'RESOLVED';
              const isPending = normStatus === 'PENDING';

              return (
                <div
                  key={item.id}
                  className="card interactive-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    padding: '1.35rem',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-sm)',
                    border: isPending ? '1.5px solid #fca5a5' : isResolved ? '1px solid #bbf7d0' : '1px solid var(--border)'
                  }}
                >
                  {/* Top Bar: Ticket ID, Chef Directed To, Category, and Current Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        background: '#f1f5f9',
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #cbd5e1'
                      }}>
                        #{item.ticket_id}
                      </span>

                      {/* Chef Directed Badge */}
                      <span style={{
                        background: '#fee2e2',
                        color: '#991b1b',
                        border: '1px solid #fecaca',
                        fontWeight: 700,
                        fontSize: '0.825rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}>
                        <i className="fa-solid fa-kitchen-set"></i>
                        Directed to Chef: <strong>{item.chef_name}</strong>
                      </span>

                      {/* Category Badge */}
                      <span style={{
                        background: '#eff6ff',
                        color: '#1e40af',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #bfdbfe'
                      }}>
                        <i className="fa-solid fa-tag" style={{ marginRight: '0.3rem' }}></i>
                        {item.category}
                      </span>
                    </div>

                    {/* Current Status Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Current Status:
                      </span>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        ...statusStyle
                      }}>
                        {normStatus === 'PENDING' && <i className="fa-solid fa-hourglass-start"></i>}
                        {normStatus === 'ACCEPTED' && <i className="fa-solid fa-check"></i>}
                        {normStatus === 'RESOLVED' && <i className="fa-solid fa-check-double"></i>}
                        {normStatus === 'REJECTED' && <i className="fa-solid fa-xmark"></i>}
                        {displayStatus(item.status)}
                      </span>
                    </div>
                  </div>

                  {/* Student & Date Info */}
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                    <span><strong>Submitted By:</strong> {item.student_name || 'Hostel Student'}</span>
                    <span>•</span>
                    <span>
                      <i className="fa-regular fa-clock" style={{ marginRight: '0.3rem' }}></i>
                      {item.created_at ? new Date(item.created_at).toLocaleString() : 'Recent'}
                    </span>
                  </div>

                  {/* Complaint Message */}
                  <div style={{
                    background: 'var(--bg-subtle)',
                    padding: '0.95rem 1.1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    lineHeight: '1.55',
                    color: 'var(--text-dark)',
                    borderLeft: '4px solid #dc2626'
                  }}>
                    {item.message}
                  </div>

                  {/* Accepted Timestamp Info if any */}
                  {item.accepted_at && (
                    <div style={{
                      fontSize: '0.78rem',
                      color: '#15803d',
                      background: '#f0fdf4',
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #bbf7d0',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      width: 'fit-content'
                    }}>
                      <i className="fa-solid fa-circle-check"></i>
                      <span>
                        Accepted on {new Date(item.accepted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {item.accepted_by_name ? ` by ${item.accepted_by_name}` : ''}
                      </span>
                    </div>
                  )}

                  {/* Resolution Note if any */}
                  {item.resolution_note && (
                    <div style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem 1rem',
                      fontSize: '0.85rem',
                      color: '#15803d'
                    }}>
                      <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                        <i className="fa-solid fa-circle-check" style={{ marginRight: '0.35rem' }}></i>
                        Resolution / Admin Note:
                      </strong>
                      {item.resolution_note}
                    </div>
                  )}

                  {/* Rejection Reason if any */}
                  {item.rejection_reason && (
                    <div style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem 1rem',
                      fontSize: '0.85rem',
                      color: '#991b1b'
                    }}>
                      <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                        <i className="fa-solid fa-circle-xmark" style={{ marginRight: '0.35rem' }}></i>
                        Rejection Reason:
                      </strong>
                      {item.rejection_reason}
                    </div>
                  )}

                  {/* ================= ADMIN ACTION AREA ================= */}
                  {isAdmin && (
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '0.75rem 1rem',
                      background: '#f8fafc',
                      border: '1px dashed #cbd5e1',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{
                          background: '#0f172a',
                          color: '#ffffff',
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Admin Action
                        </span>
                        <span style={{ fontSize: '0.825rem', color: 'var(--text-dark)', fontWeight: 600 }}>
                          Current Status:{' '}
                          <span style={{
                            padding: '0.15rem 0.55rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            ...statusStyle
                          }}>
                            {normStatus === 'PENDING' && '🟡 Pending'}
                            {normStatus === 'ACCEPTED' && '🟢 ✓ Accepted'}
                            {normStatus === 'RESOLVED' && '🔵 ✓ Resolved'}
                            {normStatus === 'REJECTED' && '🔴 ✕ Rejected'}
                            {normStatus !== 'PENDING' && normStatus !== 'ACCEPTED' && normStatus !== 'RESOLVED' && normStatus !== 'REJECTED' && displayStatus(item.status)}
                          </span>
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {normStatus === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenAcceptModal(item)}
                              className="btn btn-sm"
                              style={{
                                background: '#16a34a',
                                color: '#ffffff',
                                border: 'none',
                                padding: '0.35rem 0.85rem',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                borderRadius: 'var(--radius-sm)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                cursor: 'pointer'
                              }}
                            >
                              <i className="fa-solid fa-check"></i> Accept Complaint
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenRejectModal(item)}
                              className="btn btn-sm"
                              style={{
                                background: '#dc2626',
                                color: '#ffffff',
                                border: 'none',
                                padding: '0.35rem 0.85rem',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                borderRadius: 'var(--radius-sm)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                cursor: 'pointer'
                              }}
                            >
                              <i className="fa-solid fa-xmark"></i> Reject Complaint
                            </button>
                          </>
                        )}

                        {normStatus === 'ACCEPTED' && (
                          <button
                            type="button"
                            onClick={() => handleOpenResolveModal(item)}
                            className="btn btn-sm"
                            style={{
                              background: '#2563eb',
                              color: '#ffffff',
                              border: 'none',
                              padding: '0.35rem 0.85rem',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              borderRadius: 'var(--radius-sm)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              cursor: 'pointer'
                            }}
                          >
                            <i className="fa-solid fa-circle-check"></i> Mark as Resolved
                          </button>
                        )}

                        {normStatus === 'RESOLVED' && (
                          <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>
                            <i className="fa-solid fa-check-double" style={{ marginRight: '0.3rem' }}></i>
                            Resolved
                          </span>
                        )}

                        {normStatus === 'REJECTED' && (
                          <span style={{ fontSize: '0.78rem', color: '#b91c1c', fontWeight: 600 }}>
                            <i className="fa-solid fa-ban" style={{ marginRight: '0.3rem' }}></i>
                            Dismissed
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= ADMIN ACTION CONFIRMATION MODALS ================= */}
      {actionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1400,
          padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '1.85rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  color: actionModal.type === 'accept' ? '#15803d' : actionModal.type === 'reject' ? '#b91c1c' : '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {actionModal.type === 'accept' && <><i className="fa-solid fa-circle-check"></i> Accept this complaint?</>}
                  {actionModal.type === 'reject' && <><i className="fa-solid fa-circle-xmark"></i> Reject this complaint?</>}
                  {actionModal.type === 'resolve' && <><i className="fa-solid fa-circle-check"></i> Mark this complaint as resolved?</>}
                </h3>
                <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  {actionModal.type === 'accept' && 'Official acknowledgement and assignment of student grievance'}
                  {actionModal.type === 'reject' && 'Dismissal of invalid or duplicate kitchen complaint'}
                  {actionModal.type === 'resolve' && 'Confirmation that the kitchen grievance has been rectified'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActionModal(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleConfirmAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Question Banner */}
              <div style={{
                background: actionModal.type === 'accept' ? '#f0fdf4' : actionModal.type === 'reject' ? '#fef2f2' : '#eff6ff',
                border: `1px solid ${actionModal.type === 'accept' ? '#bbf7d0' : actionModal.type === 'reject' ? '#fecaca' : '#bfdbfe'}`,
                padding: '1rem 1.15rem',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{
                  fontWeight: 700,
                  color: actionModal.type === 'accept' ? '#166534' : actionModal.type === 'reject' ? '#991b1b' : '#1e3a8a',
                  fontSize: '0.95rem',
                  marginBottom: '0.4rem'
                }}>
                  {actionModal.type === 'accept' && 'Accept this complaint?'}
                  {actionModal.type === 'reject' && 'Reject this complaint?'}
                  {actionModal.type === 'resolve' && 'Mark this complaint as resolved?'}
                </div>
                <div style={{
                  fontSize: '0.825rem',
                  color: actionModal.type === 'accept' ? '#15803d' : actionModal.type === 'reject' ? '#b91c1c' : '#1e40af',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem'
                }}>
                  <div><strong>Complaint ID:</strong> #{actionModal.complaint.ticket_id}</div>
                  <div><strong>Directed to Chef:</strong> {actionModal.complaint.chef_name}</div>
                  <div><strong>Category:</strong> {actionModal.complaint.category}</div>
                  {actionModal.type === 'accept' && (
                    <div style={{ marginTop: '0.25rem', color: '#166534' }}>
                      Status will become: <strong>✓ Accepted</strong> (stored in PostgreSQL with timestamp)
                    </div>
                  )}
                  {actionModal.type === 'resolve' && (
                    <div style={{ marginTop: '0.25rem', color: '#1e3a8a' }}>
                      Status will become: <strong>✓ Resolved</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Rejection Reason */}
              {actionModal.type === 'reject' && (
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-dark)' }}>
                    Rejection Reason:
                  </label>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={rejectionReasonInput}
                    onChange={(e) => setRejectionReasonInput(e.target.value)}
                    placeholder="Enter reason for rejecting this complaint (optional)..."
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                    Reason will be recorded with timestamp in PostgreSQL and shown on the card.
                  </span>
                </div>
              )}

              {/* Optional Resolution Note */}
              {actionModal.type === 'resolve' && (
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--text-dark)' }}>
                    Resolution / Admin Note:
                  </label>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={resolutionNoteInput}
                    onChange={(e) => setResolutionNoteInput(e.target.value)}
                    placeholder="Enter explanation or action taken (e.g. 'Discussed with Chef and corrected spice levels')..."
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn"
                  style={{
                    background: actionModal.type === 'accept' ? '#16a34a' : actionModal.type === 'reject' ? '#dc2626' : '#2563eb',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontWeight: 700,
                    border: 'none',
                    padding: '0.5rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer'
                  }}
                >
                  {actionLoading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Processing...
                    </>
                  ) : actionModal.type === 'accept' ? (
                    <>
                      <i className="fa-solid fa-check"></i> ✓ Accept
                    </>
                  ) : actionModal.type === 'reject' ? (
                    <>
                      <i className="fa-solid fa-xmark"></i> ✕ Reject
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-circle-check"></i> ✓ Resolve
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= LODGE COMPLAINT TO CHEF MODAL ================= */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200,
          padding: '1rem'
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  Lodge Complaint to Chef
                </h3>
                <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Submit direct dish preparation or service grievance to kitchen staff
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSubmitComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Target Chef Field */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  Complaint Directed To: *
                </label>
                {isChefFixed && targetChefObj ? (
                  <div style={{
                    padding: '0.65rem 0.85rem',
                    background: '#fee2e2',
                    border: '1.5px solid #fca5a5',
                    borderRadius: 'var(--radius-md)',
                    color: '#991b1b',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>
                      <i className="fa-solid fa-user-tie" style={{ marginRight: '0.4rem' }}></i>
                      {targetChefObj.name} ({targetChefObj.role})
                    </span>
                    <span style={{ fontSize: '0.75rem', background: '#ffffff', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)' }}>
                      Preselected
                    </span>
                  </div>
                ) : (
                  <select
                    className="input-field"
                    value={modalChefId}
                    onChange={(e) => setModalChefId(e.target.value)}
                    required
                  >
                    {chefs.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.role} ({c.speciality})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Category Dropdown */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  Complaint Category *
                </label>
                <select
                  className="input-field"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Student Identity */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  Your Name / Identity *
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Rahul Sharma (B-304)"
                  required
                />
              </div>

              {/* Complaint Message */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  Complaint Details *
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the issue specifically (dish cooked, meal timing, taste/spiciness, hygiene infraction, portion size)..."
                  required
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-sm"
                  style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontWeight: 700,
                    padding: '0.55rem 1.1rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none'
                  }}
                >
                  {submitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-triangle-exclamation"></i> Submit Complaint
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
