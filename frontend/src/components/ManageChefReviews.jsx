import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function ManageChefReviews({ onNotify }) {
  const [reviews, setReviews] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [selectedChef, setSelectedChef] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChefs();
  }, []);

  useEffect(() => {
    fetchReviews(selectedChef);
  }, [selectedChef]);

  const fetchChefs = async () => {
    try {
      const res = await api.getChefs();
      const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setChefs(data);
    } catch (err) {
      console.error('Error fetching chefs:', err);
    }
  };

  const fetchReviews = async (chefFilter) => {
    setLoading(true);
    try {
      const params = {};
      if (chefFilter && chefFilter !== 'all') {
        params.chef = chefFilter;
      }
      const res = await api.getChefReviews(params);
      const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setReviews(data);
    } catch (err) {
      console.error('Error fetching chef reviews:', err);
      if (onNotify) onNotify('Failed to load chef reviews from database.');
    } finally {
      setLoading(false);
    }
  };

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviews).toFixed(1)
    : '0.0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner */}
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
            <i className="fa-solid fa-comment-dots"></i>
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#166534', fontSize: '1.25rem' }}>
              Manage Chef Reviews
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#15803d' }}>
              Independent audit section for student ratings and qualitative comments submitted for mess chefs
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <span className="badge" style={{ background: '#ffffff', color: '#166534', border: '1px solid #bbf7d0', fontSize: '0.85rem' }}>
            <i className="fa-solid fa-star" style={{ color: '#f59e0b', marginRight: '0.35rem' }}></i>
            Average: {avgRating} ★
          </span>
          <span className="badge badge-live" style={{ fontSize: '0.85rem' }}>
            {totalReviews} Total Reviews
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{
        padding: '1.25rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-dark)', marginRight: '0.25rem' }}>
            <i className="fa-solid fa-filter" style={{ marginRight: '0.4rem', color: 'var(--primary)' }}></i>
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
          onClick={() => fetchReviews(selectedChef)}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <i className="fa-solid fa-arrows-rotate"></i> Refresh Reviews
        </button>
      </div>

      {/* Reviews Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1rem' }}></i>
            <h4>Loading Chef Reviews...</h4>
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-star" style={{ fontSize: '2.5rem', color: '#cbd5e1', marginBottom: '0.75rem' }}></i>
            <h4 style={{ margin: 0 }}>No Chef Reviews Found</h4>
            <p style={{ fontSize: '0.85rem' }}>No student reviews match the selected chef filter ({selectedChef}).</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: 'var(--text-dark)' }}>Chef Name</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: 'var(--text-dark)' }}>Student</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: 'var(--text-dark)' }}>Rating</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: 'var(--text-dark)', width: '40%' }}>Review / Comment</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: 'var(--text-dark)' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((rev, idx) => (
                  <tr
                    key={rev.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: idx % 2 === 0 ? '#ffffff' : 'var(--bg-subtle)'
                    }}
                  >
                    {/* Chef Name */}
                    <td style={{ padding: '0.85rem 1.25rem', verticalAlign: 'top' }}>
                      <span style={{
                        background: 'var(--primary-soft)',
                        color: 'var(--primary)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 700,
                        fontSize: '0.825rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}>
                        <i className="fa-solid fa-kitchen-set"></i>
                        {rev.chef_name}
                      </span>
                    </td>

                    {/* Student */}
                    <td style={{ padding: '0.85rem 1.25rem', verticalAlign: 'top', fontWeight: 600, color: 'var(--text-dark)' }}>
                      {rev.student_name || 'Anonymous Student'}
                    </td>

                    {/* Rating */}
                    <td style={{ padding: '0.85rem 1.25rem', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                      <span style={{ color: '#f59e0b', fontSize: '1rem', letterSpacing: '1px' }}>
                        {'★'.repeat(rev.rating || 5)}{'☆'.repeat(5 - (rev.rating || 5))}
                      </span>
                      <span style={{ marginLeft: '0.4rem', fontWeight: 700, fontSize: '0.8rem', color: '#b45309' }}>
                        ({rev.rating}/5)
                      </span>
                    </td>

                    {/* Review / Comment */}
                    <td style={{ padding: '0.85rem 1.25rem', verticalAlign: 'top', color: 'var(--text-body)', lineHeight: '1.5' }}>
                      {rev.comment ? (
                        <div style={{
                          background: '#ffffff',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          fontStyle: 'italic'
                        }}>
                          "{rev.comment}"
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No written comment</span>
                      )}
                    </td>

                    {/* Date */}
                    <td style={{ padding: '0.85rem 1.25rem', verticalAlign: 'top', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
