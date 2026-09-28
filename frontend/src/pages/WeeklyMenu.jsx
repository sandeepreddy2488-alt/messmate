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

  // Find meals matching the selected day's actual date (or matching day_of_week as fallback)
  const mealsForSelectedDay = dbMenus.filter(m => 
    (m.date && m.date === selectedDayObj.date) || 
    (!m.date && m.day_of_week?.toLowerCase() === selectedDayObj.day.toLowerCase())
  );

  const mealTypesList = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
  const mealIcons = {
    Breakfast: 'fa-mug-saucer',
    Lunch: 'fa-bowl-rice',
    Snacks: 'fa-cookie-bite',
    Dinner: 'fa-utensils',
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
              Revolving catering schedule stored in PostgreSQL Database (Semester Spring 2026)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
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
        {/* Day Selector Tabs: Strictly Sunday to Saturday */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
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
                  background: isActive ? 'var(--primary)' : '#ffffff',
                  color: isActive ? '#ffffff' : 'var(--text-body)',
                  border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1.4rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '110px',
                  boxShadow: isActive ? '0 4px 10px rgba(5, 150, 105, 0.3)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{item.day}</span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: isActive ? '#d1fae5' : 'var(--text-muted)',
                  marginTop: '0.2rem'
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
          border: '1px solid var(--border)'
        }}>
          <div className="card-header" style={{ borderBottomColor: 'rgba(226, 232, 240, 0.8)' }}>
            <div className="card-title">
              <i className="fa-solid fa-calendar-day" style={{ color: 'var(--primary)' }}></i>
              {selectedDayObj.day} — {selectedDayObj.date} Full Dining Schedule
            </div>
            <span className="badge badge-primary">
              Live PostgreSQL Menu
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
            {mealTypesList.map((type) => {
              const liveMeal = mealsForSelectedDay.find(m => m.meal_type?.toLowerCase() === type.toLowerCase());

              // Food items come directly from the PostgreSQL records for that exact date and meal
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
              const mealImg = MEAL_THEME_IMAGES[type.toLowerCase()] || MEAL_THEME_IMAGES[type];

              return (
                <div
                  key={type}
                  style={{
                    background: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    border: isMealActive ? '2px solid var(--primary)' : '1px solid var(--border)',
                    boxShadow: isMealActive ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}
                >
                  {/* Subtle Food Visual Header */}
                  <div style={{
                    position: 'relative',
                    height: '105px',
                    overflow: 'hidden',
                    backgroundColor: 'var(--bg-subtle)'
                  }}>
                    <img
                      src={mealImg}
                      alt={type}
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
                      bottom: '0.5rem',
                      left: '0.75rem',
                      right: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        textShadow: '0 1px 3px rgba(0,0,0,0.7)'
                      }}>
                        <i className={`fa-solid ${mealIcons[type]}`}></i>
                        <span>{type}</span>
                      </div>

                      {isMealActive ? (
                        <span className="badge badge-live" style={{ fontSize: '0.7rem' }}>Active</span>
                      ) : isMealServed ? (
                        <span className="status-badge status-resolved" style={{ fontSize: '0.7rem' }}>Served</span>
                      ) : (
                        <span className="status-badge status-in-progress" style={{ fontSize: '0.7rem' }}>Upcoming</span>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: '0.85rem 1rem 1.15rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <i className="fa-regular fa-clock"></i> {timing}
                    </div>

                    {itemsToRender.length > 0 ? (
                      <ul style={{ fontSize: '0.875rem', lineHeight: '1.9', paddingLeft: '1.2rem', margin: 0 }}>
                        {itemsToRender.map((itemName, idx) => (
                          <li key={idx} style={{ fontWeight: 500 }}>{itemName}</li>
                        ))}
                      </ul>
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem', padding: '0.5rem 0' }}>
                        {loading ? 'Loading PostgreSQL menu...' : 'No food items recorded for this meal.'}
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
