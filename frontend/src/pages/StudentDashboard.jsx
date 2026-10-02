import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import useMealSchedule, { formatDateISO, MEAL_THEME_IMAGES } from '../utils/mealTimings';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [todayDbMenus, setTodayDbMenus] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);

  // Real-time automatic meal timings & statuses hook based on current local time
  const { meals, activeMeal } = useMealSchedule();
  const todayStr = formatDateISO(new Date());

  useEffect(() => {
    // 1. Load Grievances
    api.getComplaints()
      .then(res => {
        if (Array.isArray(res.data)) {
          setTickets(res.data);
        } else if (res.data?.data) {
          setTickets(res.data.data);
        }
      })
      .catch(err => console.warn('Could not load complaints for student dashboard:', err));

    // 2. Load today's fresh menu from PostgreSQL
    api.getTodayMenu({ date: todayStr })
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setTodayDbMenus(data);
      })
      .catch(err => console.warn('Could not load today menu in student dashboard:', err))
      .finally(() => setLoadingMenu(false));

    // 3. Load attendance records from PostgreSQL
    api.getAttendance({ date: todayStr, roll_number: user?.roll_number || '21BCSE104' })
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setAttendanceList(data);
      })
      .catch(err => console.warn('Could not load student attendance in student dashboard:', err));
  }, [todayStr, user?.roll_number]);

  const handleSwipe = async (mealType) => {
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      const res = await api.swipeMeal({
        roll_number: user?.roll_number || '21BCSE104',
        meal_type: mealType,
        date: todayStr,
        swipe_time: timeStr
      });
      if (res.data) {
        setAttendanceList(prev => [
          ...prev.filter(a => a.meal_type?.toLowerCase() !== mealType.toLowerCase()),
          res.data
        ]);
      }
    } catch (err) {
      console.warn('Could not record swipe:', err);
    }
  };

  const mealMeta = {
    Breakfast: {
      emoji: '🍳',
      accent: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
      bgSoft: 'var(--yellow-soft)',
      borderSoft: 'var(--yellow-border)',
      img: MEAL_THEME_IMAGES.breakfast
    },
    Lunch: {
      emoji: '🍛',
      accent: 'linear-gradient(90deg, #059669, #10b981)',
      bgSoft: 'var(--primary-soft)',
      borderSoft: 'var(--primary-border)',
      img: MEAL_THEME_IMAGES.lunch
    },
    Snacks: {
      emoji: '🥤',
      accent: 'linear-gradient(90deg, #ea580c, #f97316)',
      bgSoft: 'var(--orange-soft)',
      borderSoft: 'var(--orange-border)',
      img: MEAL_THEME_IMAGES.snacks
    },
    Dinner: {
      emoji: '🍽️',
      accent: 'linear-gradient(90deg, #2563eb, #3b82f6)',
      bgSoft: 'var(--blue-soft)',
      borderSoft: 'var(--blue-border)',
      img: MEAL_THEME_IMAGES.dinner
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 3.5rem 1.5rem' }}>
      {/* Student Profile Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #065f46 0%, #047857 55%, #0d9488 100%)',
        color: '#ffffff',
        padding: '2.5rem',
        borderRadius: 'var(--radius-xl)',
        marginBottom: '2.25rem',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative glow */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '240px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}></div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.4rem' }}>
            <div style={{
              width: '74px',
              height: '74px',
              background: '#ffffff',
              color: 'var(--primary-dark)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.85rem',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
              border: '3px solid rgba(255,255,255,0.85)'
            }}>
              {user?.name ? user.name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase() : 'RS'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <h1 style={{ color: '#ffffff', fontSize: '1.8rem', margin: 0, letterSpacing: '-0.02em' }}>
                  Welcome, {user?.name || 'Rahul Sharma'}!
                </h1>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.22)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(4px)' }}>
                  <i className="fa-solid fa-circle-check"></i> Active Meal Plan
                </span>
              </div>
              <div style={{ color: '#d1fae5', fontSize: '0.92rem', marginTop: '0.45rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <span><i className="fa-solid fa-id-badge"></i> Roll No: <strong>{user?.roll_number || '21BCSE104'}</strong></span>
                <span><i className="fa-solid fa-door-open"></i> Room: <strong>{user?.room_number || 'B-304'} ({user?.hostel_block || 'Block B'})</strong></span>
                <span><i className="fa-solid fa-bowl-food"></i> Dining: <strong>Central Mess Hall 2</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/feedback" className="btn btn-sm" style={{ background: '#ffffff', color: 'var(--primary-dark)', fontWeight: 700, boxShadow: 'var(--shadow-sm)' }}>
              <i className="fa-solid fa-star" style={{ color: 'var(--accent)' }}></i> Rate Food
            </Link>
            <Link to="/complaints" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.18)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(4px)' }}>
              <i className="fa-solid fa-circle-exclamation"></i> Lodge Issue
            </Link>
            <Link to="/today-menu" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.18)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(4px)' }}>
              <i className="fa-solid fa-utensils"></i> Full Menu
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Interactive Dashboard Meal Cards (Per Requirement 3 & 5) */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>
              Today's Meal Board
            </h2>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Live status, dining times, and dining hall attendance tracking
            </p>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            <i className="fa-regular fa-calendar-check" style={{ color: 'var(--primary)' }}></i> {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem'
        }}>
          {meals.map((meal) => {
            const meta = mealMeta[meal.name] || {
              emoji: '🍽️',
              accent: 'linear-gradient(90deg, #059669, #10b981)',
              img: MEAL_THEME_IMAGES[meal.name.toLowerCase()]
            };

            const dbMenu = todayDbMenus.find(m => m.meal_type?.toLowerCase() === meal.name.toLowerCase());
            const itemsStr = dbMenu && Array.isArray(dbMenu.items) && dbMenu.items.length > 0
              ? dbMenu.items.map(i => i.name).join(', ')
              : (loadingMenu ? 'Loading fresh menu items...' : meal.menuItems || 'Chef specials scheduled.');

            const timing = dbMenu && dbMenu.start_time && dbMenu.end_time
              ? `${dbMenu.start_time} – ${dbMenu.end_time}`
              : meal.timeDisplay;

            const isActive = meal.status === 'Active';
            const isServed = meal.status === 'Served';
            const isUpcoming = !isActive && !isServed;

            const attRecord = attendanceList.find(a => a.meal_type?.toLowerCase() === meal.name.toLowerCase());

            return (
              <div
                key={meal.name}
                className="interactive-card meal-dashboard-card"
                style={{
                  border: isActive ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: '#ffffff',
                  boxShadow: isActive ? '0 8px 20px -2px rgba(16, 185, 129, 0.18)' : 'var(--shadow-sm)'
                }}
              >
                {/* Gradient Accent Bar */}
                <div style={{ height: '4px', background: meta.accent, width: '100%' }}></div>

                {/* Card Image Banner */}
                <div style={{
                  position: 'relative',
                  height: '110px',
                  overflow: 'hidden',
                  background: 'var(--bg-subtle)'
                }}>
                  <img
                    src={meta.img}
                    alt={meal.name}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {/* Subtle dark gradient overlay */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)'
                  }}></div>

                  {/* Meal Name & Emoji Overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: '0.65rem',
                    left: '0.85rem',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1.4rem' }}>{meta.emoji}</span>
                    <span style={{ fontWeight: 800, fontSize: '1.15rem', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                      {meal.name}
                    </span>
                  </div>

                  {/* Status Badge in top corner */}
                  <div style={{ position: 'absolute', top: '0.65rem', right: '0.65rem' }}>
                    {isActive ? (
                      <span className="badge badge-live" style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}>
                        Available
                      </span>
                    ) : isUpcoming ? (
                      <span className="badge badge-upcoming" style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}>
                        Upcoming
                      </span>
                    ) : (
                      <span className="badge badge-served" style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}>
                        Served
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content Body */}
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    {/* Time Window */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      <i className="fa-regular fa-clock" style={{ color: isActive ? 'var(--primary)' : 'var(--text-light)' }}></i>
                      <span>{timing}</span>
                    </div>

                    {/* Food Items Preview */}
                    <p style={{
                      fontSize: '0.83rem',
                      lineHeight: '1.45',
                      color: 'var(--text-body)',
                      marginBottom: '0.85rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {itemsStr}
                    </p>
                  </div>

                  {/* Attendance & Action Footer */}
                  <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    {attRecord ? (
                      <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <i className="fa-solid fa-circle-check"></i> Swiped In
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <i className="fa-regular fa-circle"></i> Not Swiped
                      </span>
                    )}

                    {isActive && !attRecord ? (
                      <button
                        onClick={() => handleSwipe(meal.name)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                      >
                        <i className="fa-solid fa-qrcode"></i> Swipe
                      </button>
                    ) : (
                      <Link
                        to="/today-menu"
                        style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}
                      >
                        Details <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.65rem' }}></i>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Timeline & Tickets, Right Mess Pass */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.75rem' }}>
        {/* Left Column */}
        <div>
          {/* Detailed Dining Timeline */}
          <div className="card" style={{ marginBottom: '1.75rem' }}>
            <div className="card-header">
              <div className="card-title">
                <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--primary)' }}></i>
                Dining Schedule & Service Progress
              </div>
              <span className="badge badge-primary">
                {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
              </span>
            </div>

            <div style={{ padding: '0.5rem 0' }}>
              {meals.map((meal, index) => {
                const isLast = index === meals.length - 1;
                const dbMenu = todayDbMenus.find(m => m.meal_type?.toLowerCase() === meal.name.toLowerCase());
                const itemsStr = dbMenu && Array.isArray(dbMenu.items) && dbMenu.items.length > 0
                  ? dbMenu.items.map(i => i.name).join(', ')
                  : (loadingMenu ? 'Loading fresh menu...' : meal.menuItems || 'Scheduled meal items.');

                const timing = dbMenu && dbMenu.start_time && dbMenu.end_time
                  ? `${dbMenu.start_time} – ${dbMenu.end_time}`
                  : meal.timeDisplay;

                const isActive = meal.status === 'Active';
                const isServed = meal.status === 'Served';
                const attRecord = attendanceList.find(a => a.meal_type?.toLowerCase() === meal.name.toLowerCase());

                return (
                  <div
                    key={meal.id || meal.name}
                    style={{
                      display: 'flex',
                      gap: '1.15rem',
                      paddingBottom: isLast ? '0' : '1.75rem',
                      borderLeft: isLast ? 'none' : '2px dashed var(--border)',
                      marginLeft: '1rem',
                      paddingLeft: isLast ? '1.45rem' : '1.35rem',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      left: isLast ? '-10px' : '-11px',
                      top: 0,
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: attRecord ? 'var(--primary)' : (isActive ? 'var(--primary)' : '#ffffff'),
                      color: attRecord || isActive ? '#ffffff' : 'var(--text-light)',
                      border: `2px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem'
                    }}>
                      <i className={`fa-solid ${attRecord ? 'fa-check' : (isActive ? 'fa-fire' : 'fa-circle')}`}></i>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <h4 style={{ margin: 0, color: isActive ? 'var(--primary-dark)' : 'var(--text-dark)' }}>
                            {meal.name}
                          </h4>
                          <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{timing}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {isActive ? (
                            <span className="badge badge-live">Serving Now</span>
                          ) : isServed ? (
                            <span className="badge badge-served">Served</span>
                          ) : (
                            <span className="badge badge-upcoming">Upcoming</span>
                          )}

                          {attRecord ? (
                            <span className="status-badge status-resolved">
                              ✓ Swiped {attRecord.swipe_time}
                            </span>
                          ) : (
                            <span className="status-badge" style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                              Not Swiped
                            </span>
                          )}
                        </div>
                      </div>

                      <p style={{ fontSize: '0.875rem', color: 'var(--text-body)', margin: '0.4rem 0 0 0', lineHeight: '1.5' }}>
                        <strong style={{ color: 'var(--text-dark)' }}>Menu:</strong> {itemsStr}
                      </p>

                      {isActive && (
                        <div style={{ marginTop: '0.65rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <Link to="/feedback" className="btn btn-outline-primary btn-sm">
                            <i className="fa-solid fa-star"></i> Rate {meal.name}
                          </Link>
                          <Link to="/today-menu" className="btn btn-outline btn-sm">
                            Nutrition & Allergens
                          </Link>
                          {!attRecord && (
                            <button
                              onClick={() => handleSwipe(meal.name)}
                              className="btn btn-primary btn-sm"
                            >
                              <i className="fa-solid fa-qrcode"></i> Swipe In
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Grievances / Tickets Snippet with Empty State */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <i className="fa-solid fa-ticket" style={{ color: 'var(--danger)' }}></i>
                My Grievance Tickets
              </div>
              <Link to="/complaints" className="btn btn-outline btn-sm">
                View All Tickets <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
              </Link>
            </div>

            {tickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'var(--primary-soft)',
                  color: 'var(--primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginBottom: '0.75rem'
                }}>
                  <i className="fa-solid fa-shield-check"></i>
                </div>
                <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>No Active Grievances</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '340px', margin: '0 auto 1rem auto' }}>
                  All clear! If you encounter hygiene, shortage, or dining issues, report them here.
                </p>
                <Link to="/complaints" className="btn btn-outline-primary btn-sm">
                  <i className="fa-solid fa-plus"></i> Lodge a Grievance
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.slice(0, 3).map((t) => (
                      <tr key={t.id || t.ticket_id}>
                        <td><strong>#{t.ticket_id}</strong></td>
                        <td>{t.category}</td>
                        <td>{t.created_at ? t.created_at.split('T')[0] : 'Today'}</td>
                        <td>
                          <span className={`status-badge ${t.status === 'Resolved' ? 'status-resolved' : t.status === 'In Progress' ? 'status-in-progress' : 'status-pending'}`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Digital Mess Card & Quick Actions */}
        <div>
          {/* Digital Mess Pass */}
          <div className="card interactive-card" style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Digital Mess Pass
              </span>
              <span className="badge badge-veg"><i className="fa-solid fa-circle" style={{ fontSize: '0.45rem' }}></i> Active Pass</span>
            </div>

            <div style={{
              width: '144px',
              height: '144px',
              margin: '1.35rem auto',
              background: 'repeating-conic-gradient(#0f172a 0% 25%, #ffffff 0% 50%) 50% / 18px 18px',
              border: '6px solid #0f172a',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}></div>

            <h4 style={{ marginBottom: '0.2rem', fontSize: '1.15rem' }}>{user?.name || 'Rahul Sharma'}</h4>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 500 }}>
              Token ID: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{user?.mess_card_id || 'MM-2026-B304'}</span>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', textAlign: 'left', lineHeight: '1.6', border: '1px solid var(--border)' }}>
              <div><strong>Pass Validity:</strong> Spring Semester 2026</div>
              <div><strong>Hostel Wing:</strong> {user?.hostel_block || 'Block B'}</div>
              <div><strong>Diet Preference:</strong> {user?.diet_preference || 'Veg'}</div>
            </div>

            {activeMeal && (
              <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border)' }}>
                {attendanceList.some(a => a.meal_type?.toLowerCase() === activeMeal.name.toLowerCase()) ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, padding: '0.5rem', background: 'var(--primary-soft)', borderRadius: 'var(--radius-md)' }}>
                    <i className="fa-solid fa-circle-check"></i> Swiped In for {activeMeal.name}
                  </div>
                ) : (
                  <button
                    onClick={() => handleSwipe(activeMeal.name)}
                    className="btn btn-primary btn-sm btn-block"
                  >
                    <i className="fa-solid fa-qrcode"></i> Swipe In for {activeMeal.name}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ fontSize: '1rem' }}>
                <i className="fa-solid fa-compass" style={{ color: 'var(--primary)' }}></i> Quick Mess Navigation
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/weekly-menu" className="btn btn-outline btn-block" style={{ justifyContent: 'flex-start', textAlign: 'left' }}>
                <i className="fa-solid fa-calendar-week" style={{ color: 'var(--primary)' }}></i> 7-Day Menu Schedule
              </Link>
              <Link to="/feedback" className="btn btn-outline btn-block" style={{ justifyContent: 'flex-start', textAlign: 'left' }}>
                <i className="fa-solid fa-star" style={{ color: 'var(--accent)' }}></i> Rate Mess Catering
              </Link>
              <Link to="/chefs" className="btn btn-outline btn-block" style={{ justifyContent: 'flex-start', textAlign: 'left' }}>
                <i className="fa-solid fa-kitchen-set" style={{ color: 'var(--blue)' }}></i> Chefs & Kitchen Team
              </Link>
              <Link to="/chef-complaints" className="btn btn-outline btn-block" style={{ justifyContent: 'flex-start', textAlign: 'left' }}>
                <i className="fa-solid fa-shield-halved" style={{ color: 'var(--purple)' }}></i> Chef Grievances
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
