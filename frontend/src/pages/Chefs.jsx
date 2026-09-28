import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Chefs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState('All');
  const [toastMessage, setToastMessage] = useState('');

  // Rating Modal state
  const [ratingChef, setRatingChef] = useState(null);
  const [selectedStars, setSelectedStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingStudentName, setRatingStudentName] = useState(user?.name || user?.username || 'Student Resident');
  const [submittingRating, setSubmittingRating] = useState(false);

  // Complaint Modal state
  const [complaintChef, setComplaintChef] = useState(null);
  const [complaintCategory, setComplaintCategory] = useState('Food Quality');
  const [complaintMessage, setComplaintMessage] = useState('');
  const [complaintStudentName, setComplaintStudentName] = useState(user?.name || user?.username || 'Student Resident');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  useEffect(() => {
    fetchChefs();
  }, []);

  const fetchChefs = () => {
    setLoading(true);
    setError(null);
    api.getChefs({ active: true })
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setChefs(data);
      })
      .catch(err => {
        console.error('Failed to load chefs:', err);
        setError('Could not load chef profiles from PostgreSQL database.');
      })
      .finally(() => setLoading(false));
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const getInitials = (name) => {
    if (!name) return 'CH';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Open Rating Modal
  const handleOpenRating = (chef) => {
    setRatingChef(chef);
    setSelectedStars(5);
    setHoverStars(0);
    setRatingComment('');
    setRatingStudentName(user?.name || user?.username || 'Student Resident');
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!ratingChef) return;

    setSubmittingRating(true);
    try {
      const chefTargetName = ratingChef.name;
      await api.submitChefRating(ratingChef.id, {
        rating: selectedStars,
        comment: ratingComment.trim(),
        student_name: ratingStudentName.trim() || 'Hostel Student'
      });
      showToast(`Thank you! Your ${selectedStars}-star review for Chef ${chefTargetName} was saved. Redirecting to Chef Reviews...`);
      setRatingChef(null);
      fetchChefs();
      setTimeout(() => {
        navigate(`/chef-reviews?chef=${encodeURIComponent(chefTargetName)}`);
      }, 1000);
    } catch (err) {
      console.error('Error submitting rating:', err);
      showToast('Failed to submit chef rating. Please try again.');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Open Complaint Modal
  const handleOpenComplaint = (chef) => {
    setComplaintChef(chef);
    setComplaintCategory('Food Quality');
    setComplaintMessage('');
    setComplaintStudentName(user?.name || user?.username || 'Student Resident');
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!complaintChef || !complaintMessage.trim()) return;

    setSubmittingComplaint(true);
    try {
      const chefTargetName = complaintChef.name;
      const res = await api.submitChefComplaint(complaintChef.id, {
        category: complaintCategory,
        message: complaintMessage.trim(),
        student_name: complaintStudentName.trim() || 'Hostel Student'
      });
      const ticketId = res.data?.ticket_id || 'CH-CMP';
      showToast(`Complaint #${ticketId} submitted directly to Chef ${chefTargetName}. Redirecting to Chef Complaints...`);
      setComplaintChef(null);
      setTimeout(() => {
        navigate(`/chef-complaints?chef=${encodeURIComponent(chefTargetName)}`);
      }, 1000);
    } catch (err) {
      console.error('Error submitting complaint:', err);
      showToast('Failed to submit complaint. Please try again.');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  // Filter chefs based on role category tab
  const filteredChefs = selectedRole === 'All' 
    ? chefs 
    : chefs.filter(c => c.role?.toLowerCase().includes(selectedRole.toLowerCase()));

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="container page-header-content">
          <div>
            <div className="breadcrumb">
              <Link to="/">Home</Link>
              <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
              <span>Chefs</span>
            </div>
            <h1>Meet Our Mess Culinary Team</h1>
            <p className="lead" style={{ margin: 0 }}>
              The dedicated master chefs & cooks preparing wholesome, hygienic, and authentic hostel meals every day
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <Link to="/chef-reviews" className="btn btn-outline" style={{ fontWeight: 600 }}>
              <i className="fa-solid fa-comment-dots"></i> Chef Reviews
            </Link>
            <Link to="/chef-complaints" className="btn btn-outline" style={{ fontWeight: 600 }}>
              <i className="fa-solid fa-shield-halved"></i> Chef Complaints
            </Link>
            <Link to="/weekly-menu" className="btn btn-primary" style={{ fontWeight: 600 }}>
              <i className="fa-solid fa-calendar-week"></i> Weekly Menu
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '4rem' }}>
        {/* Toast Notification */}
        {toastMessage && (
          <div className="toast-fixed" style={{ zIndex: 1100 }}>
            <i className="fa-solid fa-circle-check" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}></i>
            <div>
              <h4 style={{ fontSize: '0.9rem', margin: 0 }}>Mess Notification</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>{toastMessage}</p>
            </div>
          </div>
        )}

        {/* 3 Information / Highlight Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}>
          {/* Card 1 */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-soft)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem'
            }}>
              <i className="fa-solid fa-kitchen-set"></i>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>Hygienic Kitchen</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Clean & hygienic food preparation</div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-soft)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem'
            }}>
              <i className="fa-solid fa-award"></i>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>Experienced Culinary Staff</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Skilled chefs & cooks preparing quality meals</div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem'
            }}>
              <i className="fa-solid fa-heart-pulse"></i>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>Fresh & Nutritious Meals</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Fresh and balanced meals prepared every day</div>
            </div>
          </div>
        </div>

        {/* Filter Pills & Directory Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border)'
        }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>
              Hostel Mess Chefs Directory
            </h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Showing {filteredChefs.length} active culinary professionals
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['All', 'Head Chef', 'Assistant'].map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`btn btn-sm ${selectedRole === role ? 'btn-primary' : 'btn-outline'}`}
                style={{ borderRadius: 'var(--radius-full)', padding: '0.4rem 1rem' }}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary)' }}></i>
            <p style={{ fontSize: '1.1rem' }}>Loading chef profiles from PostgreSQL database...</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', border: '1px solid #fecaca', background: '#fef2f2' }}>
            <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '2.5rem', color: '#dc2626', marginBottom: '1rem' }}></i>
            <h3 style={{ color: '#991b1b', marginBottom: '0.5rem' }}>Could Not Load Chefs</h3>
            <p style={{ color: '#7f1d1d', marginBottom: '1.5rem' }}>{error}</p>
            <button onClick={fetchChefs} className="btn btn-outline" style={{ background: '#fff' }}>
              <i className="fa-solid fa-rotate-right"></i> Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredChefs.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'var(--primary-soft)',
              color: 'var(--primary)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              margin: '0 auto 1.5rem auto'
            }}>
              <i className="fa-solid fa-kitchen-set"></i>
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No Chefs Listed Yet</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
              The mess administration has not added any chef profiles for this category yet.
            </p>
          </div>
        )}

        {/* Chefs Cards Grid */}
        {!loading && !error && filteredChefs.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.75rem'
          }}>
            {filteredChefs.map(chef => {
              const isHeadChef = chef.role?.toLowerCase().includes('head');
              return (
                <div
                  key={chef.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 0,
                    overflow: 'hidden',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    border: isHeadChef ? '1.5px solid rgba(5, 150, 105, 0.4)' : '1px solid var(--border)'
                  }}
                >
                  {/* Card Top Banner / Photo Header */}
                  <div style={{
                    position: 'relative',
                    background: isHeadChef
                      ? 'linear-gradient(135deg, #064e3b 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    height: '100px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-end',
                    padding: '0.85rem 1rem'
                  }}>
                    {/* Role Badge */}
                    <span style={{
                      background: isHeadChef ? 'rgba(251, 191, 36, 0.95)' : 'rgba(255, 255, 255, 0.9)',
                      color: isHeadChef ? '#78350f' : '#0f172a',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      padding: '0.3rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <i className={`fa-solid ${isHeadChef ? 'fa-crown' : 'fa-utensils'}`}></i>
                      {chef.role}
                    </span>
                  </div>

                  {/* Profile Image & Body Content */}
                  <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Avatar Offset */}
                    <div style={{
                      marginTop: '-38px',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      position: 'relative',
                      zIndex: 2
                    }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        minWidth: '80px',
                        minHeight: '80px',
                        borderRadius: '50%',
                        border: '3px solid #ffffff',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.12)',
                        overflow: 'hidden',
                        background: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 2
                      }}>
                        {chef.photo ? (
                          <img
                            src={chef.photo}
                            alt={chef.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'center',
                              display: 'block'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `
                                <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--primary-soft);color:var(--primary);font-weight:800;font-size:1.4rem;">
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
                            fontWeight: 800,
                            fontSize: '1.4rem'
                          }}>
                            {getInitials(chef.name)}
                          </div>
                        )}
                      </div>

                      {/* On Duty Status Badge */}
                      <span className="badge badge-live" style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}>
                        <i className="fa-solid fa-circle" style={{ fontSize: '0.4rem', marginRight: '0.3rem' }}></i>
                        Active on Duty
                      </span>
                    </div>

                    {/* Name & Designation */}
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.2rem 0', color: 'var(--text-dark)' }}>
                      {chef.name}
                    </h3>
                    <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.85rem' }}>
                      {chef.role} • Central Hostel Kitchen
                    </div>

                    {/* Description */}
                    <p style={{
                      fontSize: '0.85rem',
                      lineHeight: '1.5',
                      color: 'var(--text-body)',
                      marginBottom: '1rem',
                      flex: 1
                    }}>
                      {chef.description || 'Experienced mess culinary team member dedicated to quality student dining.'}
                    </p>

                    {/* Key Attributes Grid */}
                    <div style={{
                      background: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem 0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      border: '1px solid var(--border)',
                      fontSize: '0.825rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <i className="fa-solid fa-stopwatch" style={{ color: 'var(--primary)' }}></i> Experience:
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>
                          {chef.experience}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <i className="fa-solid fa-fire-burner" style={{ color: '#d97706' }}></i> Speciality:
                        </span>
                        <span style={{
                          fontWeight: 700,
                          color: '#b45309',
                          background: '#fef3c7',
                          padding: '0.1rem 0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.78rem'
                        }}>
                          {chef.speciality}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <i className="fa-solid fa-calendar-days" style={{ color: '#2563eb' }}></i> Working Days:
                        </span>
                        <span style={{ fontWeight: 700, color: chef.working_days === 'Sunday Only' ? '#dc2626' : 'var(--text-dark)' }}>
                          {chef.working_days}
                          {chef.working_days === 'Sunday Only' && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '0.3rem' }}>(Sunday Special)</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Rating Overview */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0',
                      borderTop: '1px solid var(--border)',
                      marginBottom: '0.65rem'
                    }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem' }}>
                        <i className="fa-solid fa-star" style={{ color: '#f59e0b' }}></i>
                        {chef.avg_rating > 0 ? chef.avg_rating.toFixed(1) : 'New'}
                        <span style={{ fontWeight: 500, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          ({chef.total_ratings || 0} {chef.total_ratings === 1 ? 'Rating' : 'Ratings'})
                        </span>
                      </span>

                      {chef.avg_rating >= 4.5 && (
                        <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#059669', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                          ⭐ Top Rated
                        </span>
                      )}
                    </div>

                    {/* Action Buttons: Rate Chef & Complaint to Chef */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenRating(chef)}
                        className="btn btn-outline btn-sm"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          padding: '0.45rem 0.5rem'
                        }}
                      >
                        <i className="fa-solid fa-star" style={{ color: '#f59e0b' }}></i> Rate Chef
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenComplaint(chef)}
                        className="btn btn-sm"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#dc2626',
                          padding: '0.45rem 0.5rem'
                        }}
                      >
                        <i className="fa-solid fa-triangle-exclamation"></i> Complaint to Chef
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= RATING MODAL ================= */}
      {ratingChef && (
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
          <div className="card" style={{ maxWidth: '460px', width: '100%', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-dark)' }}>
                  Rate Chef: {ratingChef.name}
                </h3>
                <div style={{ fontSize: '0.825rem', color: 'var(--primary)', fontWeight: 600 }}>
                  {ratingChef.role} • {ratingChef.speciality}
                </div>
              </div>
              <button
                onClick={() => setRatingChef(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSubmitRating} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Star Rating Selector */}
              <div style={{ textAlign: 'center', padding: '0.75rem 0', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  Select Rating (1 to 5 Stars) *
                </label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem' }}>
                  {[1, 2, 3, 4, 5].map(star => {
                    const active = (hoverStars || selectedStars) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedStars(star)}
                        onMouseEnter={() => setHoverStars(star)}
                        onMouseLeave={() => setHoverStars(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '2rem',
                          color: active ? '#f59e0b' : '#cbd5e1',
                          padding: '0.2rem',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>
                <div style={{ fontWeight: 700, color: '#b45309', fontSize: '0.9rem', marginTop: '0.35rem' }}>
                  {selectedStars} Star{selectedStars > 1 ? 's' : ''} {selectedStars === 5 ? '(Excellent)' : selectedStars === 4 ? '(Very Good)' : selectedStars === 3 ? '(Good)' : selectedStars === 2 ? '(Fair)' : '(Poor)'}
                </div>
              </div>

              {/* Student Name */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  Your Name / Identity
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={ratingStudentName}
                  onChange={(e) => setRatingStudentName(e.target.value)}
                  placeholder="e.g. Rahul Sharma (B-304)"
                />
              </div>

              {/* Comment */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  Comments / Dish Feedback (Optional)
                </label>
                <textarea
                  className="input-field"
                  rows="3"
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder='e.g. "Sunday biryani was very good." or "Dosas are crispy and fresh."'
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={submittingRating}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <i className="fa-solid fa-star"></i>
                  <span>{submittingRating ? 'Saving...' : 'Submit Rating'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRatingChef(null)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DIRECT COMPLAINT MODAL ================= */}
      {complaintChef && (
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
          <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#fef2f2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem'
                }}>
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#991b1b' }}>
                    Direct Chef Complaint
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Sent specifically to {complaintChef.name} & Mess Supervisor
                  </div>
                </div>
              </div>
              <button
                onClick={() => setComplaintChef(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSubmitComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Selected Chef Banner (Automatic) */}
              <div style={{
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem 1rem',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <i className="fa-solid fa-kitchen-set" style={{ color: 'var(--primary)', fontSize: '1.2rem' }}></i>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Complaint Directed To:
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '0.95rem' }}>
                    {complaintChef.name} ({complaintChef.role})
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  Issue Category *
                </label>
                <select
                  className="input-field"
                  value={complaintCategory}
                  onChange={(e) => setComplaintCategory(e.target.value)}
                  required
                >
                  <option value="Food Quality">Food Quality</option>
                  <option value="Taste">Taste</option>
                  <option value="Hygiene">Hygiene</option>
                  <option value="Quantity">Quantity</option>
                  <option value="Behaviour">Behaviour</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Student Name */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  Student Name / Hostel Room
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={complaintStudentName}
                  onChange={(e) => setComplaintStudentName(e.target.value)}
                  placeholder="e.g. Rahul Sharma (B-304)"
                />
              </div>

              {/* Message */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  Complaint Details *
                </label>
                <textarea
                  className="input-field"
                  rows="4"
                  value={complaintMessage}
                  onChange={(e) => setComplaintMessage(e.target.value)}
                  placeholder={`Describe the exact issue with dishes prepared by Chef ${complaintChef.name}...`}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={submittingComplaint}
                  className="btn btn-sm"
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    background: '#dc2626',
                    color: '#ffffff',
                    fontWeight: 700,
                    padding: '0.65rem'
                  }}
                >
                  <i className="fa-solid fa-paper-plane"></i>
                  <span>{submittingComplaint ? 'Submitting...' : 'Submit Complaint'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setComplaintChef(null)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
