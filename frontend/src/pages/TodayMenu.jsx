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

  const mealIcons = {
    Breakfast: 'fa-mug-saucer',
    Lunch: 'fa-bowl-rice',
    Snacks: 'fa-cookie-bite',
    Dinner: 'fa-utensils',
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
              Live dining schedule, food items list, and nutrition from PostgreSQL Database
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/weekly-menu" className="btn btn-outline">
              <i className="fa-solid fa-calendar-days"></i> View Weekly Schedule
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
          background: activeServingMeal ? 'linear-gradient(90deg, #ecfdf5 0%, #f0fdf4 100%)' : 'var(--bg-subtle)',
          border: activeServingMeal ? '1px solid #bbf7d0' : '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: activeServingMeal ? '#166534' : 'var(--text-dark)' }}>
            <i className={`fa-solid ${activeServingMeal ? 'fa-fire-burner' : 'fa-clock'}`} style={{ color: 'var(--primary)', fontSize: '1.2rem' }}></i>
            <div>
              {activeServingMeal ? (
                <><strong>Live Service:</strong> {activeServingMeal.meal_type} is being served right now until {activeServingMeal.end_time}.</>
              ) : (
                <><strong>Dining Hall Status:</strong> Central Mess is operational. View the scheduled meal hours below.</>
              )}
            </div>
          </div>
          <span className={activeServingMeal ? 'badge badge-live' : 'badge'} style={{ background: activeServingMeal ? undefined : 'var(--primary-soft)', color: activeServingMeal ? undefined : 'var(--primary)' }}>
            {activeServingMeal ? 'Serving Now' : 'Dining Open'}
          </span>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary)' }}></i>
            <p style={{ fontSize: '1.1rem' }}>Loading today's fresh menu from PostgreSQL database...</p>
          </div>
        ) : menus.length === 0 ? (
          /* Empty State if no menu is added yet */
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{
              width: '72px',
              height: '72px',
              background: 'var(--primary-soft)',
              color: 'var(--primary)',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              marginBottom: '1.25rem'
            }}>
              <i className="fa-solid fa-utensils"></i>
            </div>
            <h2>No Menu Published Yet for Today</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '460px', margin: '0.5rem auto 1.75rem auto', lineHeight: '1.5' }}>
              The mess supervisor has not entered food items for today yet. Check back shortly or view the weekly schedule.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Link to="/weekly-menu" className="btn btn-outline">
                <i className="fa-solid fa-calendar-week"></i> Weekly Schedule
              </Link>
              <Link to="/admin" className="btn btn-primary">
                <i className="fa-solid fa-shield-halved"></i> Admin Console
              </Link>
            </div>
          </div>
        ) : (
          /* Dynamic Meals Grid from PostgreSQL */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
            {menus.map((menu) => {
              const isServing = menu.status === 'Serving Now';
              const isServed = menu.status === 'Served';

              return (
                <div
                  key={menu.id || menu.meal_type}
                  className="card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    background: '#ffffff',
                    border: isServing ? '2px solid var(--primary)' : '1px solid var(--border)',
                    boxShadow: isServing ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Subtle Food Visual Header */}
                  <div style={{
                    position: 'relative',
                    height: '115px',
                    overflow: 'hidden',
                    backgroundColor: 'var(--bg-subtle)'
                  }}>
                    <img
                      src={MEAL_THEME_IMAGES[menu.meal_type?.toLowerCase()] || MEAL_THEME_IMAGES[menu.meal_type]}
                      alt={menu.meal_type}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.65) 0%, rgba(15, 23, 42, 0.15) 55%, transparent 100%)'
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '0.6rem',
                      left: '0.85rem',
                      right: '0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        textShadow: '0 1px 3px rgba(0,0,0,0.7)'
                      }}>
                        <i className={`fa-solid ${mealIcons[menu.meal_type] || 'fa-utensils'}`}></i> {menu.meal_type}
                      </span>

                      {/* Dynamic Status Badge from PostgreSQL */}
                      {isServing ? (
                        <span className="badge badge-live" style={{ fontSize: '0.7rem' }}>Serving Now</span>
                      ) : isServed ? (
                        <span className="status-badge status-resolved" style={{ fontSize: '0.7rem' }}>Served</span>
                      ) : (
                        <span className="status-badge status-in-progress" style={{ fontSize: '0.7rem' }}>{menu.status || 'Upcoming'}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: '1rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <i className="fa-regular fa-clock"></i> {menu.start_time} – {menu.end_time}
                    </div>
                    {(!menu.items || menu.items.length === 0) ? (
                      <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        No dishes listed yet for this meal.
                      </div>
                    ) : (
                      menu.items.map((item) => (
                        <div
                          key={item.id || item.name}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.6rem 0.85rem',
                            borderRadius: 'var(--radius-sm)',
                            background: item.is_chef_special ? '#f0fdf4' : 'var(--bg-main)',
                            border: item.is_chef_special ? '1px solid #bbf7d0' : 'none'
                          }}
                        >
                          <span style={{ fontWeight: 600, fontSize: '0.925rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {item.is_chef_special ? (
                              <i className="fa-solid fa-crown" style={{ color: 'var(--accent)', fontSize: '0.85rem' }}></i>
                            ) : (
                              <i className="fa-solid fa-circle" style={{
                                color: item.category === 'Non-Veg' ? '#dc2626' :
                                       item.category === 'Beverage' ? '#0284c7' :
                                       item.category === 'Dessert' ? '#d97706' : '#15803d',
                                fontSize: '0.5rem'
                              }}></i>
                            )}
                            {item.name}
                          </span>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {item.calories > 0 && (
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.calories} kcal</span>
                            )}
                            <span className={`badge ${
                              item.is_chef_special ? 'badge-special' :
                              item.category === 'Non-Veg' ? 'badge-nonveg' :
                              item.category === 'Beverage' ? 'badge-info' :
                              item.category === 'Dessert' ? 'badge-special' : 'badge-veg'
                            }`}>
                              {item.category}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <Link to="/feedback" className={`btn ${isServing ? 'btn-primary' : 'btn-outline'} btn-sm btn-block`}>
                      <i className="fa-regular fa-star"></i> Rate {menu.meal_type}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quality Standards Card */}
        <div className="card" style={{ marginTop: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', background: 'var(--primary-soft)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                <i className="fa-solid fa-shield-virus"></i>
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.2rem 0' }}>Kitchen Hygiene & Food Safety Standards</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  All ingredients prepared fresh daily. Certified hygienic cooking & FSSAI audit compliance.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="badge" style={{ background: 'var(--bg-subtle)' }}>Audited Today</span>
              <span className="badge badge-veg"><i className="fa-solid fa-check"></i> FSSAI Certified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
