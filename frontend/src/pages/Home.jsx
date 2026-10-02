import React from 'react';
import { Link } from 'react-router-dom';
import useMealSchedule, { MEAL_THEME_IMAGES } from '../utils/mealTimings';

export default function Home() {
  const { meals, activeMeal, nextUpcomingMeal } = useMealSchedule();

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(240, 253, 244, 0.94) 0%, rgba(255, 255, 255, 0.91) 50%, rgba(236, 253, 245, 0.95) 100%), url(/images/menu/hero_dining.jpg) center/cover no-repeat',
        padding: '4.5rem 0 3.5rem',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'center'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.85rem',
                background: 'var(--primary-soft)',
                color: 'var(--primary-dark)',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '1rem',
                border: '1px solid rgba(5, 150, 105, 0.2)'
              }}>
                <i className="fa-solid fa-sparkles"></i> React + Django REST Architecture
              </div>
              <h1 style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem' }}>
                Fresh Meals, Zero Queue Confusion, <span style={{ color: 'var(--primary)' }}>Better Dining.</span>
              </h1>
              <p className="lead">
                MessMate connects hostel residents with the catering committee. Check what's cooking today, rate your daily meals, review chefs, and submit grievances directly.
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                <Link to="/today-menu" className="btn btn-primary btn-lg">
                  <i className="fa-solid fa-utensils"></i> View Today's Menu
                </Link>
                <Link to="/dashboard" className="btn btn-outline btn-lg">
                  <i className="fa-solid fa-user-graduate"></i> Student Portal
                </Link>
                <Link to="/admin" className="btn btn-outline btn-lg" style={{ color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-user-shield"></i> Admin View
                </Link>
              </div>
            </div>

            {/* Quick Status Widget */}
            <div>
              <div style={{
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  {activeMeal ? (
                    <span className="badge badge-live">Live Serving Now</span>
                  ) : nextUpcomingMeal ? (
                    <span className="status-badge status-in-progress">Kitchen Prep</span>
                  ) : (
                    <span className="status-badge status-resolved">All Served Today</span>
                  )}
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <i className="fa-regular fa-clock"></i>{' '}
                    {activeMeal ? activeMeal.timeDisplay : nextUpcomingMeal ? nextUpcomingMeal.timeDisplay : '07:30 AM Tomorrow'}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>
                  {activeMeal
                    ? `${activeMeal.name} is Active! 🍲`
                    : nextUpcomingMeal
                    ? `Next Meal: ${nextUpcomingMeal.name} 🍲`
                    : 'All Meals Served for Today 🌙'}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  {activeMeal
                    ? `Serving fresh hot ${activeMeal.name.toLowerCase()} in Mess Hall A & B. High protein and veg counters open.`
                    : nextUpcomingMeal
                    ? `Kitchen team is preparing fresh ${nextUpcomingMeal.name.toLowerCase()}. Serving opens at ${nextUpcomingMeal.startTimeStr} in Mess Hall A & B.`
                    : 'All scheduled meals for today have concluded. Breakfast serving resumes tomorrow at 07:30 AM.'}
                </p>

                {(() => {
                  const displayMeal = activeMeal || nextUpcomingMeal || meals[0];
                  return (
                    <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.4rem' }}>
                        {activeMeal ? "Today's Special" : nextUpcomingMeal ? "Upcoming Special" : "Tomorrow's Breakfast Special"}
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <i className={`fa-solid ${displayMeal.dishIcon || 'fa-bowl-rice'}`} style={{ color: 'var(--primary)' }}></i>{' '}
                        {displayMeal.specialDish}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {displayMeal.specialDesc}
                      </div>
                    </div>
                  );
                })()}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link to="/feedback" className="btn btn-outline-primary btn-sm btn-block">
                    <i className="fa-regular fa-star"></i> Rate This Meal
                  </Link>
                  <Link to="/today-menu" className="btn btn-primary btn-sm btn-block">
                    Details <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="container" style={{ padding: '3.5rem 1.5rem' }}>
        {/* Today's 4 Meals Preview */}
        <section style={{
          marginBottom: 0,
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          padding: '2.25rem 1.75rem',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 244, 0.92) 100%), url(/images/menu/today_section_bg.jpg) center/cover no-repeat',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Daily Schedule</span>
              <h2>Today's Meal Timings & Highlights</h2>
              <p className="lead" style={{ fontSize: '0.95rem', margin: 0 }}>Timings adhere strictly to College Hostel Regulations.</p>
            </div>
            <Link to="/today-menu" className="btn btn-outline-primary btn-sm">
              Full Nutrition Details <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {meals.map((meal) => {
              const isActive = meal.status === 'Active';
              const isServed = meal.status === 'Served';
              const mealImg = meal.themeImage || MEAL_THEME_IMAGES[meal.id] || MEAL_THEME_IMAGES[meal.name] || MEAL_THEME_IMAGES.lunch;
              const emojis = { Breakfast: '🍳', Lunch: '🍛', Snacks: '🥤', Dinner: '🍽️' };

              return (
                <div
                  key={meal.id}
                  className="card interactive-card"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#ffffff',
                    borderRadius: 'var(--radius-lg)',
                    border: isActive ? '2px solid var(--primary)' : '1px solid var(--border)',
                    boxShadow: isActive ? '0 8px 20px -2px rgba(16, 185, 129, 0.18)' : 'var(--shadow-sm)'
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
                      src={mealImg}
                      alt={meal.name}
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
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.72) 0%, rgba(15, 23, 42, 0.15) 60%, transparent 100%)'
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '0.65rem',
                      left: '0.85rem',
                      right: '0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        textShadow: '0 2px 4px rgba(0,0,0,0.6)'
                      }}>
                        <span>{emojis[meal.name] || '🍽️'}</span>
                        <span>{meal.name}</span>
                      </span>
                      {isActive ? (
                        <span className="badge badge-live" style={{ fontSize: '0.7rem' }}>Serving</span>
                      ) : isServed ? (
                        <span className="badge badge-served" style={{ fontSize: '0.7rem' }}>Served</span>
                      ) : (
                        <span className="badge badge-upcoming" style={{ fontSize: '0.7rem' }}>Upcoming</span>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: '1rem 1.15rem 1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <i className="fa-regular fa-clock" style={{ color: isActive ? 'var(--primary)' : 'var(--text-light)' }}></i>
                      <span>{meal.timeDisplay}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', margin: 0, color: 'var(--text-body)', lineHeight: 1.5, flex: 1 }}>
                      {meal.menuItems}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
