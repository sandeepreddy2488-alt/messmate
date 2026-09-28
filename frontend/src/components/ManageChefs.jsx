import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';

export default function ManageChefs({ onNotify }) {
  const [activeSubTab, setActiveSubTab] = useState('profiles'); // 'profiles' | 'ratings' | 'complaints'
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states for Chef Profiles
  const [name, setName] = useState('');
  const [role, setRole] = useState('Head Chef');
  const [experience, setExperience] = useState('5 Years');
  const [speciality, setSpeciality] = useState('South Indian Meals');
  const [workingDays, setWorkingDays] = useState('Monday - Saturday');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Ratings State
  const [ratings, setRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [ratingChefFilter, setRatingChefFilter] = useState('all');

  // Complaints State
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [complaintChefFilter, setComplaintChefFilter] = useState('all');
  const [complaintStatusFilter, setComplaintStatusFilter] = useState('all');
  const [resolutionNotes, setResolutionNotes] = useState({});

  const fileInputRef = useRef(null);

  const rolesList = [
    'Head Chef',
    'Assistant Chef',
    'Senior Cook',
    'Tiffin & Breakfast Specialist',
    'Biryani & Non-Veg Specialist',
    'Dessert & Bakery Specialist',
    'Mess Kitchen Supervisor'
  ];

  // Fetch all chefs
  const fetchChefs = () => {
    setLoading(true);
    api.getChefs()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setChefs(data);
      })
      .catch(err => {
        console.error('Error fetching chefs:', err);
        if (onNotify) onNotify('Failed to load chefs from database.');
      })
      .finally(() => setLoading(false));
  };

  // Fetch ratings
  const fetchRatings = () => {
    setLoadingRatings(true);
    const chefParam = ratingChefFilter !== 'all' ? ratingChefFilter : null;
    api.getChefRatings(chefParam)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setRatings(data);
      })
      .catch(err => console.error('Error fetching chef ratings:', err))
      .finally(() => setLoadingRatings(false));
  };

  // Fetch complaints
  const fetchComplaints = () => {
    setLoadingComplaints(true);
    const chefParam = complaintChefFilter !== 'all' ? complaintChefFilter : null;
    api.getChefComplaints(chefParam)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setComplaints(data);
      })
      .catch(err => console.error('Error fetching chef complaints:', err))
      .finally(() => setLoadingComplaints(false));
  };

  useEffect(() => {
    fetchChefs();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'ratings') {
      fetchRatings();
    } else if (activeSubTab === 'complaints') {
      fetchComplaints();
    }
  }, [activeSubTab, ratingChefFilter, complaintChefFilter]);

  const handleResetForm = () => {
    setEditingId(null);
    setName('');
    setRole('Head Chef');
    setExperience('5 Years');
    setSpeciality('South Indian Meals');
    setWorkingDays('Monday - Saturday');
    setDescription('');
    setPhoto('');
    setIsActive(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEditClick = (chef) => {
    setEditingId(chef.id);
    setName(chef.name || '');
    setRole(chef.role || 'Head Chef');
    setExperience(chef.experience || '');
    setSpeciality(chef.speciality || '');
    setWorkingDays(chef.working_days || 'Monday - Saturday');
    setDescription(chef.description || '');
    setPhoto(chef.photo || '');
    setIsActive(chef.is_active !== false);
    setActiveSubTab('profiles');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      if (onNotify) onNotify('Image size should be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
      if (onNotify) onNotify('Photo uploaded and preview ready.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      if (onNotify) onNotify('Chef Name is required.');
      return;
    }

    setSubmitting(true);
    const payload = {
      name: name.trim(),
      role: role.trim(),
      experience: experience.trim(),
      speciality: speciality.trim(),
      working_days: workingDays.trim(),
      description: description.trim(),
      photo: photo.trim(),
      is_active: isActive
    };

    try {
      if (editingId) {
        await api.updateChef(editingId, payload);
        if (onNotify) onNotify(`Successfully updated Chef "${name}" in PostgreSQL!`);
      } else {
        await api.createChef(payload);
        if (onNotify) onNotify(`Successfully added new Chef "${name}" to database!`);
      }
      handleResetForm();
      fetchChefs();
    } catch (err) {
      console.error('Error saving chef:', err);
      if (onNotify) onNotify(err.response?.data?.error || 'Failed to save chef profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (chef) => {
    try {
      const updatedStatus = !chef.is_active;
      await api.updateChef(chef.id, { is_active: updatedStatus });
      if (onNotify) onNotify(`Chef "${chef.name}" marked as ${updatedStatus ? 'Active' : 'Inactive'}.`);
      fetchChefs();
    } catch (err) {
      console.error('Error toggling status:', err);
      if (onNotify) onNotify('Failed to update chef status.');
    }
  };

  const handleDeleteChef = async (chefId, chefName) => {
    if (!window.confirm(`Are you sure you want to remove Chef "${chefName}" from the mess database?`)) {
      return;
    }

    try {
      await api.deleteChef(chefId);
      if (onNotify) onNotify(`Chef "${chefName}" removed from database.`);
      if (editingId === chefId) handleResetForm();
      fetchChefs();
    } catch (err) {
      console.error('Error deleting chef:', err);
      if (onNotify) onNotify('Failed to delete chef profile.');
    }
  };

  // Status Change for Chef Complaints
  const handleUpdateComplaintStatus = async (complaintId, newStatus) => {
    try {
      const note = resolutionNotes[complaintId] || '';
      await api.updateChefComplaint(complaintId, {
        status: newStatus,
        resolution_note: note
      });
      if (onNotify) onNotify(`Complaint marked as "${newStatus}"!`);
      fetchComplaints();
    } catch (err) {
      console.error('Error updating status:', err);
      if (onNotify) onNotify('Failed to update complaint status.');
    }
  };

  const getInitials = (n) => {
    if (!n) return 'CH';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  // Filter complaints by status if set
  const filteredComplaints = complaintStatusFilter === 'all'
    ? complaints
    : complaints.filter(c => c.status?.toLowerCase() === complaintStatusFilter.toLowerCase());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Sub-Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        borderBottom: '2px solid var(--border)',
        paddingBottom: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('profiles')}
          className={`btn ${activeSubTab === 'profiles' ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}
        >
          <i className="fa-solid fa-kitchen-set"></i>
          <span>Chef Profiles & Staff ({chefs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('ratings')}
          className={`btn ${activeSubTab === 'ratings' ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}
        >
          <i className="fa-solid fa-star" style={{ color: activeSubTab === 'ratings' ? '#fde047' : '#f59e0b' }}></i>
          <span>Chef Ratings & Reviews</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('complaints')}
          className={`btn ${activeSubTab === 'complaints' ? 'btn-primary' : 'btn-outline'}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}
        >
          <i className="fa-solid fa-triangle-exclamation" style={{ color: activeSubTab === 'complaints' ? '#fca5a5' : '#dc2626' }}></i>
          <span>Direct Chef Complaints</span>
        </button>
      </div>

      {/* =========================================================================
          SUB-TAB 1: CHEF PROFILES MANAGEMENT
      ========================================================================= */}
      {activeSubTab === 'profiles' && (
        <>
          {/* Top Banner */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1px solid #bbf7d0',
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
                background: 'var(--primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem'
              }}>
                <i className="fa-solid fa-kitchen-set"></i>
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#166534', fontSize: '1.2rem' }}>
                  Mess Culinary Staff Directory
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#15803d' }}>
                  Manage chef working days, roles, specialities, and photos. Preserved experience is live in PostgreSQL.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <span className="badge" style={{ background: '#ffffff', color: '#166534', border: '1px solid #bbf7d0', fontSize: '0.85rem' }}>
                <i className="fa-solid fa-users" style={{ marginRight: '0.35rem' }}></i>
                {chefs.length} Registered Chefs
              </span>
              <span className="badge badge-live" style={{ fontSize: '0.85rem' }}>
                <i className="fa-solid fa-circle" style={{ fontSize: '0.45rem', marginRight: '0.35rem' }}></i>
                {chefs.filter(c => c.is_active).length} Active On Duty
              </span>
            </div>
          </div>

          {/* Form on Left, List on Right */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '2rem',
            alignItems: 'start'
          }}>
            {/* Left Column: Form */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--border)'
              }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className={`fa-solid ${editingId ? 'fa-pen-to-square' : 'fa-user-plus'}`} style={{ color: 'var(--primary)' }}></i>
                  {editingId ? 'Edit Chef Profile' : 'Add New Mess Chef'}
                </h3>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.8rem' }}
                  >
                    <i className="fa-solid fa-xmark"></i> Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                    Chef Full Name *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. GOPI"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                      Role / Designation *
                    </label>
                    <select
                      className="input-field"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      {rolesList.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                      Experience *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. 8 Years"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                      Speciality *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. South Indian Meals"
                      value={speciality}
                      onChange={(e) => setSpeciality(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                      Working Days *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Sunday Only or Monday - Saturday"
                      value={workingDays}
                      onChange={(e) => setWorkingDays(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                    Short Bio / Description
                  </label>
                  <textarea
                    className="input-field"
                    rows="3"
                    placeholder="Brief description of culinary background, responsibilities..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                    Chef Photo (Upload File or Enter URL)
                  </label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Or paste an Image URL (https://...)"
                    value={photo.startsWith('data:') ? '✓ Base64 Image Uploaded' : photo}
                    onChange={(e) => setPhoto(e.target.value)}
                  />

                  {photo && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      marginTop: '0.75rem',
                      background: 'var(--bg-subtle)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)'
                    }}>
                      <img
                        src={photo}
                        alt="Preview"
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Photo preview ready
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPhoto('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        <i className="fa-solid fa-trash"></i> Remove
                      </button>
                    </div>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-subtle)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)'
                }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                      Active Status
                    </span>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Only active chefs will appear on the student website
                    </p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                    />
                    <span style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }}>
                      {isActive ? 'Active on Duty' : 'Inactive / Off'}
                    </span>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <i className={`fa-solid ${editingId ? 'fa-check' : 'fa-plus'}`}></i>
                    <span>{submitting ? 'Saving...' : (editingId ? 'Update Chef Profile' : 'Save & Add Chef')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="btn btn-outline"
                    style={{ padding: '0.65rem 1rem' }}
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Directory */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid var(--border)'
              }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-dark)' }}>
                  Registered Mess Chefs ({chefs.length})
                </h3>
                <button
                  onClick={fetchChefs}
                  className="btn btn-outline btn-sm"
                  title="Refresh Chefs List"
                >
                  <i className={`fa-solid fa-rotate-right ${loading ? 'fa-spin' : ''}`}></i> Refresh
                </button>
              </div>

              {chefs.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-kitchen-set" style={{ fontSize: '2.5rem', marginBottom: '0.75rem', color: 'var(--border)' }}></i>
                  <p>No chefs registered in PostgreSQL database yet.</p>
                </div>
              ) : (
                chefs.map(chef => (
                  <div
                    key={chef.id}
                    className="card"
                    style={{
                      display: 'flex',
                      gap: '1.25rem',
                      padding: '1.25rem',
                      alignItems: 'flex-start',
                      border: editingId === chef.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: editingId === chef.id ? '#f0fdf4' : 'var(--bg-card)'
                    }}
                  >
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      background: '#f1f5f9',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border)'
                    }}>
                      {chef.photo ? (
                        <img
                          src={chef.photo}
                          alt={chef.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `
                              <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--primary-soft);color:var(--primary);font-weight:700;">
                                ${getInitials(chef.name)}
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--primary-soft)',
                          color: 'var(--primary)',
                          fontWeight: 700,
                          fontSize: '1.2rem'
                        }}>
                          {getInitials(chef.name)}
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: 700 }}>
                            {chef.name}
                          </h4>
                          <div style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 600 }}>
                            {chef.role}
                          </div>
                        </div>

                        <span
                          onClick={() => handleToggleActive(chef)}
                          style={{
                            cursor: 'pointer',
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: chef.is_active ? '#dcfce7' : '#f1f5f9',
                            color: chef.is_active ? '#166534' : '#64748b',
                            border: chef.is_active ? '1px solid #bbf7d0' : '1px solid #cbd5e1',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                          title="Click to toggle Active/Inactive"
                        >
                          <i className={`fa-solid ${chef.is_active ? 'fa-check' : 'fa-pause'}`}></i>
                          {chef.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        margin: '0.4rem 0'
                      }}>
                        <span><strong>Exp:</strong> {chef.experience}</span>
                        <span>•</span>
                        <span><strong>Speciality:</strong> {chef.speciality}</span>
                        <span>•</span>
                        <span><strong>Days:</strong> {chef.working_days}</span>
                      </div>

                      {/* Average Rating Pill */}
                      <div style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 600, marginBottom: '0.5rem' }}>
                        ⭐ {chef.avg_rating > 0 ? chef.avg_rating.toFixed(1) : 'No ratings yet'} ({chef.total_ratings || 0} reviews)
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                          onClick={() => handleEditClick(chef)}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.8rem', padding: '0.3rem 0.65rem' }}
                        >
                          <i className="fa-solid fa-pen"></i> Edit
                        </button>

                        <button
                          onClick={() => handleToggleActive(chef)}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.8rem', padding: '0.3rem 0.65rem' }}
                        >
                          <i className={`fa-solid ${chef.is_active ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          {chef.is_active ? ' Deactivate' : ' Activate'}
                        </button>

                        <button
                          onClick={() => handleDeleteChef(chef.id, chef.name)}
                          className="btn btn-sm"
                          style={{
                            fontSize: '0.8rem',
                            padding: '0.3rem 0.65rem',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626'
                          }}
                        >
                          <i className="fa-solid fa-trash"></i> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* =========================================================================
          SUB-TAB 2: CHEF RATINGS & REVIEWS
      ========================================================================= */}
      {activeSubTab === 'ratings' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          {/* Header & Chef Filter */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border)'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-dark)' }}>
                Student Chef Ratings & Feedback
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Direct meal performance and culinary ratings submitted by hostel students
              </p>
            </div>

            {/* Filter by Chef */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter by Chef:</span>
              <button
                type="button"
                onClick={() => setRatingChefFilter('all')}
                className={`btn btn-sm ${ratingChefFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                style={{ borderRadius: 'var(--radius-full)', padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
              >
                All Chefs
              </button>
              {chefs.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setRatingChefFilter(c.id.toString())}
                  className={`btn btn-sm ${ratingChefFilter === c.id.toString() ? 'btn-primary' : 'btn-outline'}`}
                  style={{ borderRadius: 'var(--radius-full)', padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Ratings Table / Cards */}
          {loadingRatings ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
              <p>Loading chef ratings...</p>
            </div>
          ) : ratings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-star" style={{ fontSize: '2.5rem', color: '#cbd5e1', marginBottom: '0.75rem' }}></i>
              <h4 style={{ margin: 0 }}>No Ratings Recorded Yet</h4>
              <p style={{ fontSize: '0.85rem' }}>No student ratings have been submitted for the selected chef filter.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {ratings.map(r => (
                <div
                  key={r.id}
                  style={{
                    padding: '1.1rem 1.25rem',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        background: 'var(--primary-soft)',
                        color: 'var(--primary)',
                        padding: '0.2rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}>
                        Chef: {r.chef_name}
                      </span>
                      <strong style={{ color: 'var(--text-dark)', fontSize: '0.92rem' }}>{r.student_name}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {/* Star Display */}
                      <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '1rem', letterSpacing: '2px' }}>
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {r.comment && (
                    <div style={{
                      background: '#ffffff',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      fontSize: '0.85rem',
                      color: 'var(--text-body)',
                      fontStyle: 'italic'
                    }}>
                      "{r.comment}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 3: DIRECT CHEF COMPLAINTS
      ========================================================================= */}
      {activeSubTab === 'complaints' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border)'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#991b1b' }}>
                Direct Chef Grievances & Complaints
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Complaints submitted specifically against designated kitchen staff and dish preparations
              </p>
            </div>

            {/* Filter by Chef */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter Chef:</span>
              <button
                type="button"
                onClick={() => setComplaintChefFilter('all')}
                className={`btn btn-sm ${complaintChefFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                style={{ borderRadius: 'var(--radius-full)', padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
              >
                All Chefs
              </button>
              {chefs.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setComplaintChefFilter(c.id.toString())}
                  className={`btn btn-sm ${complaintChefFilter === c.id.toString() ? 'btn-primary' : 'btn-outline'}`}
                  style={{ borderRadius: 'var(--radius-full)', padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Filter by Status Pill Bar */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {['all', 'Pending', 'In Review', 'Resolved', 'Rejected'].map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setComplaintStatusFilter(st)}
                className="btn btn-sm"
                style={{
                  background: complaintStatusFilter === st ? '#1e293b' : 'var(--bg-subtle)',
                  color: complaintStatusFilter === st ? '#ffffff' : 'var(--text-dark)',
                  border: '1px solid var(--border)',
                  fontSize: '0.78rem',
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                {st === 'all' ? 'All Statuses' : st}
              </button>
            ))}
          </div>

          {/* Complaints List */}
          {loadingComplaints ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
              <p>Loading chef complaints...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: '2.5rem', color: '#10b981', marginBottom: '0.75rem' }}></i>
              <h4 style={{ margin: 0 }}>No Complaints Found</h4>
              <p style={{ fontSize: '0.85rem' }}>No grievances recorded for this chef and status filter.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filteredComplaints.map(c => {
                const isResolved = c.status === 'Resolved';
                const isPending = c.status === 'Pending';
                const isInReview = c.status === 'In Review';

                return (
                  <div
                    key={c.id}
                    style={{
                      padding: '1.25rem',
                      background: '#ffffff',
                      border: isPending ? '1.5px solid #fca5a5' : isResolved ? '1px solid #bbf7d0' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {/* Top Row: Ticket ID, Target Chef & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          background: '#f1f5f9',
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid #cbd5e1'
                        }}>
                          #{c.ticket_id}
                        </span>

                        {/* TARGET CHEF IDENTIFIER (Crucial Requirement) */}
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
                          Directed to Chef: <strong>{c.chef_name}</strong>
                        </span>

                        <span style={{
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)'
                        }}>
                          Category: {c.category}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <span style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: isResolved ? '#dcfce7' : isPending ? '#fee2e2' : '#fef3c7',
                        color: isResolved ? '#166534' : isPending ? '#991b1b' : '#b45309',
                        border: isResolved ? '1px solid #bbf7d0' : isPending ? '1px solid #fecaca' : '1px solid #fde68a'
                      }}>
                        {c.status}
                      </span>
                    </div>

                    {/* Student Info & Date */}
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
                      <span><strong>Submitted by:</strong> {c.student_name}</span>
                      <span>•</span>
                      <span>{new Date(c.created_at).toLocaleString()}</span>
                    </div>

                    {/* Complaint Body */}
                    <div style={{
                      background: 'var(--bg-subtle)',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      color: 'var(--text-dark)',
                      borderLeft: '3px solid #dc2626'
                    }}>
                      {c.message}
                    </div>

                    {/* Resolution Note if any */}
                    {c.resolution_note && (
                      <div style={{
                        fontSize: '0.825rem',
                        color: '#15803d',
                        background: '#f0fdf4',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #bbf7d0'
                      }}>
                        <strong>Admin / Chef Resolution Note:</strong> {c.resolution_note}
                      </div>
                    )}

                    {/* Status Changer Actions */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid var(--border)'
                    }}>
                      <input
                        type="text"
                        placeholder="Optional resolution note for student / chef..."
                        value={resolutionNotes[c.id] || ''}
                        onChange={(e) => setResolutionNotes({ ...resolutionNotes, [c.id]: e.target.value })}
                        style={{
                          flex: 1,
                          minWidth: '220px',
                          fontSize: '0.8rem',
                          padding: '0.35rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)'
                        }}
                      />

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {c.status !== 'In Review' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateComplaintStatus(c.id, 'In Review')}
                            className="btn btn-sm"
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.35rem 0.65rem',
                              background: '#fef3c7',
                              border: '1px solid #fde68a',
                              color: '#92400e'
                            }}
                          >
                            Mark In Review
                          </button>
                        )}

                        {c.status !== 'Resolved' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateComplaintStatus(c.id, 'Resolved')}
                            className="btn btn-sm"
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.35rem 0.65rem',
                              background: '#dcfce7',
                              border: '1px solid #bbf7d0',
                              color: '#166534',
                              fontWeight: 700
                            }}
                          >
                            <i className="fa-solid fa-check"></i> Mark Resolved
                          </button>
                        )}

                        {c.status !== 'Rejected' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateComplaintStatus(c.id, 'Rejected')}
                            className="btn btn-sm"
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.35rem 0.65rem',
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              color: '#64748b'
                            }}
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
