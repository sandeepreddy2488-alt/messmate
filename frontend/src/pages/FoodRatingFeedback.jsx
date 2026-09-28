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

      setToastMessage('Feedback and ratings recorded in PostgreSQL database!');
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

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="container page-header-content">
          <div>
            <div className="breadcrumb">
              <Link to="/">Home</Link>
              <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
              <span>Food Rating & Feedback</span>
            </div>
            <h1>Daily Food Rating & Feedback</h1>
            <p className="lead" style={{ margin: 0 }}>Every review directly shapes the mess contractor scorecards</p>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '3.5rem' }}>
        {toastMessage && (
          <div className="toast-fixed">
            <i className="fa-solid fa-circle-check" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}></i>
            <div>
              <h4 style={{ fontSize: '0.9rem', margin: 0 }}>Success</h4>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>{toastMessage}</p>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
          {/* Form */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <i className="fa-solid fa-pen-to-square" style={{ color: 'var(--primary)' }}></i>
                Submit Meal Feedback
              </div>
              <span className="badge badge-primary">Django REST Form</span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Which meal are you reviewing?</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMeal(m)}
                      className={`btn ${meal === m ? 'btn-primary' : 'btn-outline'} btn-sm`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Overall Star Rating */}
              <div style={{ background: 'var(--bg-main)', padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                  Overall Meal Satisfaction
                </label>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <StarRating value={overallRating} onChange={setOverallRating} size="2.2rem" />
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, marginTop: '0.4rem' }}>
                  {overallRating}/5 Stars
                </div>
              </div>

              {/* Specific Dimensions */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Rate Specific Quality Aspects</label>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px dashed var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Taste & Flavor</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Spices and cooking freshness</div>
                  </div>
                  <StarRating value={tasteRating} onChange={setTasteRating} size="1.2rem" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px dashed var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Hygiene & Cleanliness</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Counters and clean plates</div>
                  </div>
                  <StarRating value={hygieneRating} onChange={setHygieneRating} size="1.2rem" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px dashed var(--border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Serving Temperature</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Hot rotis and warm curries</div>
                  </div>
                  <StarRating value={tempRating} onChange={setTempRating} size="1.2rem" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Portion & Refill Speed</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Availability of prompt second helpings</div>
                  </div>
                  <StarRating value={portionRating} onChange={setPortionRating} size="1.2rem" />
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
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.825rem',
                        cursor: 'pointer',
                        fontWeight: selectedTags.includes(tag) ? 600 : 400
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
            <div className="card" style={{ marginBottom: '1.75rem' }}>
              <div className="card-header">
                <div className="card-title">
                  <i className="fa-solid fa-chart-simple" style={{ color: 'var(--primary)' }}></i>
                  Mess Quality Scorecard
                </div>
                <span className="badge badge-primary">PostgreSQL Live</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1 }}>
                    {reviewsData.stats?.avg_rating || 4.3}
                  </div>
                  <div style={{ color: 'var(--accent)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                    <StarRating value={Math.round(reviewsData.stats?.avg_rating || 4.3)} readOnly size="0.95rem" />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Based on {reviewsData.stats?.total_reviews || 4} verified student ratings
                  </div>
                </div>

                <div style={{ flex: 1, fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div>Taste: <strong>{reviewsData.stats?.avg_taste || 4.4} / 5.0</strong></div>
                  <div>Hygiene: <strong>{reviewsData.stats?.avg_hygiene || 4.7} / 5.0</strong></div>
                  <div>Temperature: <strong>{reviewsData.stats?.avg_temperature || 4.1} / 5.0</strong></div>
                  <div>Refill Speed: <strong>{reviewsData.stats?.avg_portion || 4.2} / 5.0</strong></div>
                </div>
              </div>
            </div>

            {/* Community Reviews List */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <i className="fa-solid fa-comments" style={{ color: 'var(--primary)' }}></i>
                  Recent Resident Reviews
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(reviewsData.reviews || []).map((r) => (
                  <div key={r.id} style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        <i className="fa-solid fa-user-circle" style={{ color: 'var(--primary)' }}></i> {r.student_info || 'Hostel Resident'}
                      </span>
                      <StarRating value={r.rating || 5} readOnly size="0.8rem" />
                    </div>
                    <p style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      "{r.comment}"
                    </p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {r.meal_type} • {r.created_at ? r.created_at.split('T')[0] : 'Today'}
                    </div>

                    {r.supervisor_reply && (
                      <div style={{ background: 'var(--bg-main)', borderLeft: '3px solid var(--primary)', padding: '0.65rem 0.85rem', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', fontSize: '0.825rem', marginTop: '0.75rem' }}>
                        <strong><i className="fa-solid fa-reply"></i> Mess Supervisor:</strong> {r.supervisor_reply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
