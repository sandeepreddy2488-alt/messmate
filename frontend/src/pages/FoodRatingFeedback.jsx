import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import StarRating from '../components/StarRating';

export default function FoodRatingFeedback() {
  const [meal, setMeal] = useState('Lunch');
  const [overallRating, setOverallRating] = useState(5);
  const [tasteRating, setTasteRating] = useState(4);
  const [hygieneRating, setHygieneRating] = useState(5);
  const [tempRating, setTempRating] = useState(4);
  const [portionRating, setPortionRating] = useState(4);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [selectedTags, setSelectedTags] = useState(['Delicious Gravy', 'Soft Phulkas']);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [reviewsData, setReviewsData] = useState({
    stats: { total_reviews: 4, avg_rating: 4.3, avg_taste: 4.4, avg_hygiene: 4.7, avg_temperature: 4.1, avg_portion: 4.2 },
    reviews: []
  });

  const availableTags = [
    '😋 Delicious Gravy', '🫓 Soft Phulkas', '🧂 Needs More Salt',
    '🌶️ Too Spicy', '⏳ Counter Queue Delay', '🍨 Great Dessert'
  ];

  const fetchFeedback = () => {
    api.getFeedback()
      .then(res => {
        if (res.data) setReviewsData(res.data);
      })
      .catch(err => console.warn('Could not load feedback:', err));
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.submitFeedback({
        meal_type: meal,
        overall_rating: overallRating,
        comment: comment || `Rated ${overallRating} stars for ${meal}`,
        is_anonymous: isAnonymous,
        student_info: isAnonymous ? 'Anonymous Resident' : 'Rahul Sharma (Block B)'
      });

      await api.submitRating({
        meal_type: meal,
        overall_rating: overallRating,
        taste_rating: tasteRating,
        hygiene_rating: hygieneRating,
        temperature_rating: tempRating,
        portion_rating: portionRating,
        tags: selectedTags.join(', ')
      });

      setToastMessage('Feedback and ratings recorded in database!');
      setComment('');
      fetchFeedback();
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setToastMessage('Error submitting feedback to server.');
      setTimeout(() => setToastMessage(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const mealButtons = [
    { name: 'Breakfast', emoji: '🍳' },
    { name: 'Lunch', emoji: '🍛' },
    { name: 'Snacks', emoji: '🥤' },
    { name: 'Dinner', emoji: '🍽️' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{
        background: 'linear-gradient(135deg, rgba(240, 253, 244, 0.95) 0%, rgba(255, 255, 255, 0.92) 100%), url(/images/menu/hero_dining.jpg) center/cover no-repeat'
      }}>
        <div className="container page-header-content">
          <div>
            <div className="breadcrumb">
              <Link to="/">Home</Link>
              <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
              <span>Food Rating & Feedback</span>
            </div>
            <h1>Daily Food Rating & Reviews</h1>
            <p className="lead" style={{ margin: 0 }}>Every review directly shapes the mess contractor scorecards</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/today-menu" className="btn btn-outline">
              <i className="fa-solid fa-utensils"></i> View Today's Menu
            </Link>
            <Link to="/chefs" className="btn btn-outline-primary">
              <i className="fa-solid fa-kitchen-set"></i> Kitchen Chefs
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '3.5rem' }}>
        {toastMessage && (
          <div className="toast-fixed">
            <i className="fa-solid fa-circle-check" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}></i>
            <div>
              <h4 style={{ fontSize: '0.9rem', margin: 0 }}>Review Submitted</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>{toastMessage}</p>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '2rem' }}>
          {/* Form */}
          <div className="card" style={{ borderRadius: 'var(--radius-xl)' }}>
            <div className="card-header">
              <div className="card-title">
                <i className="fa-solid fa-pen-to-square" style={{ color: 'var(--primary)' }}></i>
                Submit Meal Feedback
              </div>
              <span className="badge badge-primary">Student Review</span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Which meal are you reviewing?</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {mealButtons.map((m) => (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => setMeal(m.name)}
                      className={`btn ${meal === m.name ? 'btn-primary' : 'btn-outline'} btn-sm`}
                      style={{ padding: '0.55rem 0.4rem', fontSize: '0.85rem' }}
                    >
                      <span style={{ marginRight: '0.25rem' }}>{m.emoji}</span>
                      <span>{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Overall Star Rating */}
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                marginBottom: '1.5rem',
                border: '1px solid var(--primary-border)'
              }}>
                <label className="form-label" style={{ fontSize: '1.05rem', marginBottom: '0.5rem', color: 'var(--primary-dark)' }}>
                  Overall Meal Satisfaction
                </label>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <StarRating value={overallRating} onChange={setOverallRating} size="2.4rem" />
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--primary-dark)', fontWeight: 700, marginTop: '0.5rem' }}>
                  {overallRating} of 5 Stars
                </div>
              </div>

              {/* Specific Dimensions */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Rate Specific Quality Aspects</label>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: '1px dashed var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Taste & Flavor</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Spices and fresh cooking</div>
                  </div>
                  <StarRating value={tasteRating} onChange={setTasteRating} size="1.25rem" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: '1px dashed var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Hygiene & Cleanliness</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Serving counters and plates</div>
                  </div>
                  <StarRating value={hygieneRating} onChange={setHygieneRating} size="1.25rem" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0', borderBottom: '1px dashed var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Serving Temperature</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Hot phulkas and warm curries</div>
                  </div>
                  <StarRating value={tempRating} onChange={setTempRating} size="1.25rem" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Portion & Refill Speed</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Promptness of second helpings</div>
                  </div>
                  <StarRating value={portionRating} onChange={setPortionRating} size="1.25rem" />
                </div>
              </div>

              {/* Quick Tags */}
              <div className="form-group">
                <label className="form-label">Quick Quality Tags</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      style={{
                        background: selectedTags.includes(tag) ? 'var(--primary-soft)' : 'var(--bg-subtle)',
                        border: selectedTags.includes(tag) ? '1px solid var(--primary)' : '1px solid var(--border)',
                        color: selectedTags.includes(tag) ? 'var(--primary-dark)' : 'var(--text-body)',
                        padding: '0.4rem 0.85rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.825rem',
                        cursor: 'pointer',
                        fontWeight: selectedTags.includes(tag) ? 600 : 400,
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Written Comments / Suggestions</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Share details on what was cooked well or what needs improvement..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  id="anon-check"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <label htmlFor="anon-check" style={{ cursor: 'pointer' }}>Submit anonymously to Mess Committee</label>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
                <i className="fa-solid fa-paper-plane"></i> {submitting ? 'Saving to Database...' : 'Submit Meal Feedback'}
              </button>
            </form>
          </div>

          {/* Reviews Feed Column */}
          <div>
            {/* Scorecard */}
            <div className="card" style={{ marginBottom: '1.75rem', borderRadius: 'var(--radius-xl)' }}>
              <div className="card-header">
                <div className="card-title">
                  <i className="fa-solid fa-chart-simple" style={{ color: 'var(--primary)' }}></i>
                  Mess Quality Scorecard
                </div>
                <span className="badge badge-primary">Live Ratings</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1 }}>
                    {reviewsData.stats?.avg_rating || 4.3}
                  </div>
                  <div style={{ color: 'var(--accent)', fontSize: '1rem', marginTop: '0.35rem' }}>
                    <StarRating value={Math.round(reviewsData.stats?.avg_rating || 4.3)} readOnly size="1rem" />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Based on {reviewsData.stats?.total_reviews || 4} student reviews
                  </div>
                </div>

                <div style={{ flex: 1, fontSize: '0.825rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '160px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Taste:</span> <strong>{reviewsData.stats?.avg_taste || 4.4} / 5.0</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Hygiene:</span> <strong>{reviewsData.stats?.avg_hygiene || 4.7} / 5.0</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Temperature:</span> <strong>{reviewsData.stats?.avg_temperature || 4.1} / 5.0</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Refill Speed:</span> <strong>{reviewsData.stats?.avg_portion || 4.2} / 5.0</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Community Reviews List with Empty State */}
            <div className="card" style={{ borderRadius: 'var(--radius-xl)' }}>
              <div className="card-header">
                <div className="card-title">
                  <i className="fa-solid fa-comments" style={{ color: 'var(--primary)' }}></i>
                  Recent Resident Reviews
                </div>
              </div>

              {(!reviewsData.reviews || reviewsData.reviews.length === 0) ? (
                /* Empty state per Requirement 10 */
                <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--yellow-soft)',
                    color: 'var(--yellow)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem',
                    marginBottom: '1rem'
                  }}>
                    <i className="fa-solid fa-star-half-stroke"></i>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>No Reviews Yet</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '300px', margin: '0 auto' }}>
                    Be the first resident to submit today's meal review using the form on the left!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reviewsData.reviews.map((r) => (
                    <div
                      key={r.id}
                      className="interactive-card"
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1.15rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <i className="fa-solid fa-circle-user" style={{ color: 'var(--primary)' }}></i>
                          <span>{r.student_info || 'Hostel Resident'}</span>
                        </span>
                        <StarRating value={r.rating || 5} readOnly size="0.85rem" />
                      </div>
                      <p style={{ fontSize: '0.875rem', marginBottom: '0.35rem', color: 'var(--text-body)', fontStyle: 'italic' }}>
                        "{r.comment}"
                      </p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {r.meal_type} • {r.created_at ? r.created_at.split('T')[0] : 'Today'}
                      </div>

                      {r.supervisor_reply && (
                        <div style={{
                          background: 'var(--primary-soft)',
                          borderLeft: '3px solid var(--primary)',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                          fontSize: '0.825rem',
                          marginTop: '0.75rem'
                        }}>
                          <strong><i className="fa-solid fa-reply"></i> Supervisor:</strong> {r.supervisor_reply}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
