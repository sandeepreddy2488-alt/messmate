import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import useMealSchedule, { getCurrentWeekDates, getMealStatusForDate, MEAL_THEME_IMAGES } from '../utils/mealTimings';

export default function WeeklyMenu() {
  const weekDays = getCurrentWeekDates();
  const todayItem = weekDays.find(d => d.isToday) || weekDays[0];
  const [selectedDay, setSelectedDay] = useState(todayItem.day);
  const [dbMenus, setDbMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hook provides reactive real-time ticking for meal statuses
  useMealSchedule();

  const fetchWeeklyMenu = () => {
    setLoading(true);
    api.getWeeklyMenu()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setDbMenus(data);
      })
      .catch(err => console.warn('Could not fetch weekly menu from PostgreSQL backend:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWeeklyMenu();
  }, []);

  const selectedDayObj = weekDays.find(d => d.day === selectedDay) || weekDays[0];

  const mealsForSelectedDay = dbMenus.filter(m => 
    (m.date && m.date === selectedDayObj.date) || 
    (!m.date && m.day_of_week?.toLowerCase() === selectedDayObj.day.toLowerCase())
  );

  const mealTypesList = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
  const mealMeta = {
    Breakfast: { icon: 'fa-mug-saucer', emoji: '🍳' },
    Lunch: { icon: 'fa-bowl-rice', emoji: '🍛' },
    Snacks: { icon: 'fa-cookie-bite', emoji: '🥤' },
    Dinner: { icon: 'fa-utensils', emoji: '🍽️' },
  };

  return (
    <div>
      <div className="page-header" style={{
        background: 'linear-gradient(135deg, rgba(240, 253, 244, 0.95) 0%, rgba(255, 255, 255, 0.92) 100%), url(/images/menu/hero_dining.jpg) center/cover no-repeat'
      }}>
        <div className="container page-header-content">
          <div>
            <div className="breadcrumb">
              <Link to="/">Home</Link>
              <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
              <span>Weekly Menu</span>
            </div>
            <h1>7-Day Mess Schedule</h1>
            <p className="lead" style={{ margin: 0 }}>
              Full weekly revolving catering schedule (Spring Semester 2026)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-outline"
              onClick={() => alert('Official printable Mess Schedule PDF download triggered.')}
            >
              <i className="fa-solid fa-file-pdf" style={{ color: 'var(--danger)' }}></i> Download PDF Menu
            </button>
            <Link to="/today-menu" className="btn btn-primary">
              <i className="fa-solid fa-utensils"></i> View Today Only
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '3.5rem' }}>
        {/* Day Selector Tabs: Sunday to Saturday */}
        <div style={{
          display: 'flex',
          gap: '0.6rem',
          overflowX: 'auto',
          paddingBottom: '0.85rem',
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border)'
        }}>
          {weekDays.map((item) => {
            const isActive = selectedDay === item.day;
            return (
              <button
                key={item.day}
                onClick={() => setSelectedDay(item.day)}
                style={{
                  background: isActive ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' : '#ffffff',
                  color: isActive ? '#ffffff' : 'var(--text-body)',
                  border: isActive ? '1px solid var(--primary-dark)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '0.85rem 1.4rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '115px',
                  boxShadow: isActive ? '0 6px 16px rgba(5, 150, 105, 0.28)' : 'var(--shadow-xs)',
                  transition: 'var(--transition)'
                }}
              >
                <span>{item.day}</span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: isActive ? '#d1fae5' : 'var(--text-muted)',
                  marginTop: '0.25rem'
                }}>
                  {item.date} {item.isToday && '• Today'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Day Content Card */}
        <div className="card" style={{
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 253, 244, 0.94) 100%), url(/images/menu/schedule_bg.jpg) center/cover no-repeat',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)'
        }}>
          <div className="card-header" style={{ borderBottomColor: 'rgba(226, 232, 240, 0.8)' }}>
            <div className="card-title">
              <i className="fa-solid fa-calendar-day" style={{ color: 'var(--primary)' }}></i>
              {selectedDayObj.day} ({selectedDayObj.date}) Full Dining Schedule
            </div>
            <span className="badge badge-primary">
              Central Mess Schedule
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
            {mealTypesList.map((type) => {
              const liveMeal = mealsForSelectedDay.find(m => m.meal_type?.toLowerCase() === type.toLowerCase());

              const itemsToRender = liveMeal && Array.isArray(liveMeal.items)
                ? liveMeal.items.map(i => i.name)
                : [];

              const timing = liveMeal ? `${liveMeal.start_time} - ${liveMeal.end_time}` : (
                type === 'Breakfast' ? '07:30 - 09:30 AM' :
                type === 'Lunch' ? '12:30 - 02:30 PM' :
                type === 'Snacks' ? '05:00 - 06:00 PM' : '07:30 - 09:30 PM'
              );

              // Dynamic real-time meal status
              const mealStatus = getMealStatusForDate(type, selectedDayObj.date);
              const isMealActive = mealStatus === 'Active';
              const isMealServed = mealStatus === 'Served';
              const mealImg = MEAL_THEME_IMAGES[type.toLowerCase()] || MEAL_THEME_IMAGES[type] || MEAL_THEME_IMAGES.lunch;
              const meta = mealMeta[type] || { icon: 'fa-utensils', emoji: '🍽️' };

              return (
                <div
                  key={type}
                  className="interactive-card"
                  style={{
                    background: '#ffffff',
                    borderRadius: 'var(--radius-lg)',
                    border: isMealActive ? '2px solid var(--primary)' : '1px solid var(--border)',
                    boxShadow: isMealActive ? '0 8px 20px -2px rgba(16, 185, 129, 0.18)' : 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
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
                      alt={type}
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
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.15) 60%, transparent 100%)'
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
                      <div style={{
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        textShadow: '0 2px 4px rgba(0,0,0,0.6)'
                      }}>
                        <span>{meta.emoji}</span>
                        <span>{type}</span>
                      </div>

                      {/* Status badge matching Requirement 5 */}
                      {isMealActive ? (
                        <span className="badge badge-live" style={{ fontSize: '0.7rem' }}>Serving</span>
                      ) : isMealServed ? (
                        <span className="badge badge-served" style={{ fontSize: '0.7rem' }}>Served</span>
                      ) : (
                        <span className="badge badge-upcoming" style={{ fontSize: '0.7rem' }}>Upcoming</span>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: '1rem 1.15rem 1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <i className="fa-regular fa-clock" style={{ color: isMealActive ? 'var(--primary)' : 'var(--text-light)' }}></i>
                      <span>{timing}</span>
                    </div>

                    {itemsToRender.length > 0 ? (
                      <ul style={{ fontSize: '0.875rem', lineHeight: '1.85', paddingLeft: '1.2rem', margin: 0, color: 'var(--text-body)' }}>
                        {itemsToRender.map((itemName, idx) => (
                          <li key={idx} style={{ fontWeight: 500 }}>{itemName}</li>
                        ))}
                      </ul>
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem', padding: '0.5rem 0' }}>
                        {loading ? 'Loading scheduled menu...' : 'No food items recorded for this meal.'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
