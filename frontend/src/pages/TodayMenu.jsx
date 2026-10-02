import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { MEAL_THEME_IMAGES } from '../utils/mealTimings';

export default function TodayMenu() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTodayMenu()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        const order = { Breakfast: 1, Lunch: 2, Snacks: 3, Dinner: 4 };
        data.sort((a, b) => (order[a.meal_type] || 99) - (order[b.meal_type] || 99));
        setMenus(data);
      })
      .catch(err => {
        console.warn('Could not load today menu from PostgreSQL API:', err);
        setMenus([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const mealMeta = {
    Breakfast: { icon: 'fa-mug-saucer', emoji: '🍳', color: 'var(--yellow)' },
    Lunch: { icon: 'fa-bowl-rice', emoji: '🍛', color: 'var(--primary)' },
    Snacks: { icon: 'fa-cookie-bite', emoji: '🥤', color: 'var(--orange)' },
    Dinner: { icon: 'fa-utensils', emoji: '🍽️', color: 'var(--blue)' },
  };

  const activeServingMeal = menus.find(m => m.status === 'Serving Now');

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
              <span>Today's Menu</span>
            </div>
            <h1>Today's Mess Menu</h1>
            <p className="lead" style={{ margin: 0 }}>
              Live dining schedule, chef specials, and nutritional information
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/weekly-menu" className="btn btn-outline">
              <i className="fa-solid fa-calendar-days" style={{ color: 'var(--primary)' }}></i> Weekly Schedule
            </Link>
            <Link to="/feedback" className="btn btn-primary">
              <i className="fa-solid fa-star"></i> Rate Today's Food
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '3.5rem' }}>
        {/* Live Service Status Banner */}
        <div style={{
          background: activeServingMeal ? 'linear-gradient(90deg, #ecfdf5 0%, #f0fdf4 100%)' : '#ffffff',
          border: activeServingMeal ? '1px solid #a7f3d0' : '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: activeServingMeal ? '#065f46' : 'var(--text-dark)' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: activeServingMeal ? 'var(--primary-soft)' : 'var(--bg-subtle)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem'
            }}>
              <i className={`fa-solid ${activeServingMeal ? 'fa-fire-burner' : 'fa-clock'}`}></i>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                {activeServingMeal ? `Live Dining Service: ${activeServingMeal.meal_type}` : 'Central Dining Hall Operational'}
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                {activeServingMeal
                  ? `Currently being served in Mess Hall A & B until ${activeServingMeal.end_time}.`
                  : 'Check scheduled meal timings below for breakfast, lunch, snacks, and dinner.'}
              </div>
            </div>
          </div>
          <span className={activeServingMeal ? 'badge badge-live' : 'badge badge-upcoming'}>
            {activeServingMeal ? 'Serving Now' : 'Dining Open'}
          </span>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary)' }}></i>
            <p style={{ fontSize: '1.1rem' }}>Loading today's fresh menu...</p>
          </div>
        ) : menus.length === 0 ? (
          /* Empty State if no menu is added yet (Per Requirement 10) */
          <div className="empty-state-box">
            <div className="empty-state-icon">
              <i className="fa-solid fa-bowl-rice"></i>
            </div>
            <h2 className="empty-state-title">No Menu Published Yet for Today</h2>
            <p className="empty-state-desc">
              The mess supervisor has not entered food items for today yet. Check back shortly or view the weekly rotating schedule.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/weekly-menu" className="btn btn-outline">
                <i className="fa-solid fa-calendar-week"></i> Weekly Schedule
              </Link>
              <Link to="/dashboard" className="btn btn-primary">
                <i className="fa-solid fa-gauge"></i> Student Portal
              </Link>
            </div>
          </div>
        ) : (
          /* Dynamic Meals Grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '1.75rem' }}>
            {menus.map((menu) => {
              const isServing = menu.status === 'Serving Now';
              const isServed = menu.status === 'Served';
              const meta = mealMeta[menu.meal_type] || { icon: 'fa-utensils', emoji: '🍽️', color: 'var(--primary)' };
              const mealImg = MEAL_THEME_IMAGES[menu.meal_type?.toLowerCase()] || MEAL_THEME_IMAGES[menu.meal_type] || MEAL_THEME_IMAGES.lunch;

              return (
                <div
                  key={menu.id || menu.meal_type}
                  className="interactive-card card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    background: '#ffffff',
                    border: isServing ? '2px solid var(--primary)' : '1px solid var(--border)',
                    boxShadow: isServing ? '0 10px 25px -4px rgba(5, 150, 105, 0.18)' : 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Food Image Banner */}
                  <div style={{
                    position: 'relative',
                    height: '135px',
                    overflow: 'hidden',
                    backgroundColor: 'var(--bg-subtle)'
                  }}>
                    <img
                      src={mealImg}
                      alt={menu.meal_type}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 0.4s ease'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.2) 60%, transparent 100%)'
                    }} />

                    {/* Meal Name & Emoji */}
                    <div style={{
                      position: 'absolute',
                      bottom: '0.75rem',
                      left: '1rem',
                      right: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontWeight: 800,
                        fontSize: '1.2rem',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        textShadow: '0 2px 4px rgba(0,0,0,0.6)'
                      }}>
                        <span>{meta.emoji}</span>
                        <span>{menu.meal_type}</span>
                      </span>

                      {/* Meal Status Badge (Per Requirement 5) */}
                      {isServing ? (
                        <span className="badge badge-live" style={{ fontSize: '0.72rem' }}>Serving Now</span>
                      ) : isServed ? (
                        <span className="badge badge-served" style={{ fontSize: '0.72rem' }}>Served</span>
                      ) : (
                        <span className="badge badge-upcoming" style={{ fontSize: '0.72rem' }}>{menu.status || 'Upcoming'}</span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '1.15rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{
                      fontSize: '0.825rem',
                      color: 'var(--text-muted)',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      fontWeight: 600
                    }}>
                      <i className="fa-regular fa-clock" style={{ color: isServing ? 'var(--primary)' : 'var(--text-light)' }}></i>
                      <span>{menu.start_time} – {menu.end_time}</span>
                      <span style={{ color: 'var(--text-light)', margin: '0 0.25rem' }}>•</span>
                      <span>Central Dining</span>
                    </div>

                    {/* Dishes list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem', flex: 1 }}>
                      {(!menu.items || menu.items.length === 0) ? (
                        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          No dishes recorded yet for this meal.
                        </div>
                      ) : (
                        menu.items.map((item) => (
                          <div
                            key={item.id || item.name}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.55rem 0.85rem',
                              borderRadius: 'var(--radius-sm)',
                              background: item.is_chef_special ? '#f0fdf4' : 'var(--bg-main)',
                              border: item.is_chef_special ? '1px solid #bbf7d0' : '1px solid var(--border-light)',
                              transition: 'var(--transition-fast)'
                            }}
                          >
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)' }}>
                              {item.is_chef_special ? (
                                <i className="fa-solid fa-crown" style={{ color: 'var(--accent)', fontSize: '0.8rem' }} title="Chef Special"></i>
                              ) : (
                                <i className="fa-solid fa-circle" style={{
                                  color: item.category === 'Non-Veg' ? '#dc2626' :
                                         item.category === 'Beverage' ? '#0284c7' :
                                         item.category === 'Dessert' ? '#d97706' : '#15803d',
                                  fontSize: '0.45rem'
                                }}></i>
                              )}
                              {item.name}
                            </span>
                            <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                              {item.calories > 0 && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.calories} kcal</span>
                              )}
                              <span className={`badge ${
                                item.is_chef_special ? 'badge-special' :
                                item.category === 'Non-Veg' ? 'badge-nonveg' :
                                item.category === 'Beverage' ? 'badge-info' :
                                item.category === 'Dessert' ? 'badge-special' : 'badge-veg'
                              }`} style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>
                                {item.category}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
                      <Link to="/feedback" className={`btn ${isServing ? 'btn-primary' : 'btn-outline'} btn-sm btn-block`}>
                        <i className="fa-regular fa-star"></i> Rate {menu.meal_type}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quality Standards Card */}
        <div className="card" style={{ marginTop: '2.5rem', background: '#ffffff', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
              <div style={{
                width: '52px',
                height: '52px',
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem'
              }}>
                <i className="fa-solid fa-shield-virus"></i>
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem' }}>Kitchen Hygiene & Nutrition Assurance</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Every item prepared with RO water, sanitized stainless utensils, and certified FSSAI kitchen audits.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'var(--bg-subtle)', color: 'var(--text-dark)' }}>Audited Today</span>
              <span className="badge badge-veg"><i className="fa-solid fa-check"></i> FSSAI Certified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
