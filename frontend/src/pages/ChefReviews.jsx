import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ChefReviews() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialChef = searchParams.get('chef') || 'all';

  const [reviews, setReviews] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [selectedChef, setSelectedChef] = useState(initialChef);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Rate Chef Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalChefId, setModalChefId] = useState('');
  const [selectedStars, setSelectedStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(0);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [studentName, setStudentName] = useState(user?.name || user?.username || 'Hostel Student');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchChefs();
  }, []);

  useEffect(() => {
    fetchReviews(selectedChef);
  }, [selectedChef]);

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

  const fetchReviews = async (chefFilter) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (chefFilter && chefFilter !== 'all') {
        params.chef = chefFilter;
      }
      const res = await api.getChefReviews(params);
      const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setReviews(data);
    } catch (err) {
      console.error('Failed to load chef reviews:', err);
      setError('Could not load chef reviews from database.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleOpenRateModal = (chefIdToPreselect) => {
    const idToUse = chefIdToPreselect || modalChefId || (chefs[0]?.id?.toString() || '1');
    setModalChefId(idToUse.toString());
    setSelectedStars(5);
    setHoverStars(0);
    setComment('');
    setIsAnonymous(false);
    setStudentName(user?.name || user?.username || 'Hostel Student');
    setIsModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!modalChefId) {
      showToast('Please select a chef to review.');
      return;
    }

    setSubmitting(true);
    try {
      const targetChef = chefs.find(c => c.id.toString() === modalChefId.toString());
      const chefName = targetChef ? targetChef.name : 'Chef';
      const studentDisplayName = isAnonymous ? 'Anonymous Student' : (studentName.trim() || 'Hostel Student');

      await api.submitChefReview({
        chef: parseInt(modalChefId, 10),
        rating: selectedStars,
        comment: comment.trim(),
        student_name: studentDisplayName
      });

      showToast(`Thank you! Your ${selectedStars}-star review for Chef ${chefName} was submitted successfully.`);
      setIsModalOpen(false);
      setComment('');
      fetchReviews(selectedChef);
    } catch (err) {
      console.error('Error submitting chef review:', err);
      showToast('Failed to submit chef review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics calculation
  const totalReviewsCount = reviews.length;
  const avgRating = totalReviewsCount > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviewsCount).toFixed(1)
    : '5.0';

  const fiveStarCount = reviews.filter(r => r.rating === 5).length;
  const fourStarCount = reviews.filter(r => r.rating === 4).length;

  return (
    <div style={{ backgroundColor: 'var(--bg-body)', minHeight: '85vh', paddingBottom: '4rem' }}>
      {/* Page Header */}
      <div className="page-header" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', borderBottom: '1px solid #d1fae5' }}>
        <div className="container page-header-content">
          <div>
            <div className="breadcrumb">
              <Link to="/">Home</Link>
              <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
              <Link to="/chefs">Chefs</Link>
              <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
              <span>Chef Reviews</span>
            </div>
            <h1 style={{ color: '#065f46' }}>Chef Reviews</h1>
            <p className="lead" style={{ margin: 0, color: '#047857' }}>
              Student ratings, reviews & culinary feedback exclusively for our hostel mess chefs
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleOpenRateModal()}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 700,
                boxShadow: 'var(--shadow-md)',
                padding: '0.65rem 1.25rem'
              }}
            >
              <i className="fa-solid fa-star" style={{ color: '#fde047' }}></i>
              Rate Chef
            </button>
            <Link to="/chef-complaints" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
              <i className="fa-solid fa-shield-halved"></i> Go to Chef Complaints
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '2rem' }}>
        {/* Toast Alert */}
        {toastMessage && (
          <div className="toast-fixed" style={{ zIndex: 1300 }}>
            <i className="fa-solid fa-circle-check" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}></i>
            <div>
              <h4 style={{ fontSize: '0.9rem', margin: 0 }}>Chef Reviews Notice</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>{toastMessage}</p>
            </div>
          </div>
        )}

        {/* Top Summary KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-soft)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              <i className="fa-solid fa-star"></i>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-dark)' }}>{avgRating} ★</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Average Chef Rating</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              background: '#eff6ff',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              <i className="fa-solid fa-comments"></i>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-dark)' }}>{totalReviewsCount}</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Total Student Reviews</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              <i className="fa-solid fa-award"></i>
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#b45309' }}>{fiveStarCount + fourStarCount}</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>4★ & 5★ Ratings</div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="card" style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-dark)', marginRight: '0.25rem' }}>
              <i className="fa-solid fa-filter" style={{ marginRight: '0.4rem', color: 'var(--primary)' }}></i>
              Filter by Chef:
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

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Showing <strong>{reviews.length}</strong> review{reviews.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
            <h4 style={{ margin: 0 }}>Loading Chef Reviews...</h4>
          </div>
        ) : error ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger)' }}>
            <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}></i>
            <h4>{error}</h4>
            <button onClick={() => fetchReviews(selectedChef)} className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>
              Retry
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto 1.25rem auto'
            }}>
              <i className="fa-solid fa-star-half-stroke"></i>
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-dark)' }}>No Reviews Found</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
              No reviews have been submitted yet for {selectedChef === 'all' ? 'any mess chef' : selectedChef}. Be the first student to review!
            </p>
            <button onClick={() => handleOpenRateModal()} className="btn btn-primary" style={{ fontWeight: 700 }}>
              <i className="fa-solid fa-star" style={{ marginRight: '0.4rem' }}></i> Rate Chef Now
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
            {reviews.map(review => (
              <div
                key={review.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border)'
                }}
              >
                {/* Review Header: Chef Name & Star Rating */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'var(--primary-soft)',
                      color: 'var(--primary)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      marginBottom: '0.35rem'
                    }}>
                      <i className="fa-solid fa-kitchen-set"></i>
                      Chef: {review.chef_name}
                    </span>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-dark)' }}>
                      {review.student_name || 'Anonymous Student'}
                    </div>
                  </div>

                  {/* Stars */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#f59e0b', fontSize: '1.1rem', letterSpacing: '2px' }}>
                      {'★'.repeat(review.rating || 5)}{'☆'.repeat(5 - (review.rating || 5))}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309' }}>
                      {review.rating}/5 Stars
                    </span>
                  </div>
                </div>

                {/* Comment / Review */}
                <div style={{
                  background: 'var(--bg-subtle)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.88rem',
                  lineHeight: '1.5',
                  color: 'var(--text-body)',
                  fontStyle: review.comment ? 'normal' : 'italic',
                  flex: 1
                }}>
                  {review.comment ? `"${review.comment}"` : 'No written comment provided. Left star rating.'}
                </div>

                {/* Footer: Date */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '0.5rem'
                }}>
                  <span>
                    <i className="fa-regular fa-clock" style={{ marginRight: '0.3rem' }}></i>
                    {review.created_at ? new Date(review.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'Recently'}
                  </span>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    Verified Mess Dining
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= RATE CHEF MODAL ================= */}
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
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fa-solid fa-star" style={{ color: '#f59e0b' }}></i>
                  Rate a Mess Chef
                </h3>
                <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Submit star rating and culinary feedback for the chef
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

            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Select Chef */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  Select Chef *
                </label>
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
              </div>

              {/* Star Rating Selector */}
              <div style={{ textAlign: 'center', padding: '0.85rem 0', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
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
                  {selectedStars} Star{selectedStars > 1 ? 's' : ''} {selectedStars === 5 ? '(Excellent)' : selectedStars === 4 ? '(Very Good)' : selectedStars === 3 ? '(Good)' : selectedStars === 2 ? '(Fair)' : '(Needs Improvement)'}
                </div>
              </div>

              {/* Student Identity */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    Student Name
                  </label>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                    />
                    Submit as Anonymous
                  </label>
                </div>
                <input
                  type="text"
                  className="input-field"
                  value={isAnonymous ? 'Anonymous Student' : studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  disabled={isAnonymous}
                  placeholder="e.g. Rahul Sharma (B-304)"
                  required={!isAnonymous}
                />
              </div>

              {/* Review Comment */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  Review / Feedback Comments (Optional)
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share feedback on meal taste, spice balance, cooking quality, or special dishes..."
                />
              </div>

              {/* Submit / Cancel Buttons */}
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
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  {submitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i> Submit Review
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
