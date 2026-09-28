import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import useMealSchedule, { formatDateISO } from '../utils/mealTimings';

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

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      {/* Student Profile Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #065f46 0%, #047857 60%, #059669 100%)',
        color: '#ffffff',
        padding: '2.5rem',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '70px',
              height: '70px',
              background: '#ffffff',
              color: 'var(--primary-dark)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: 800,
              border: '3px solid rgba(255,255,255,0.4)'
            }}>
              RS
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h1 style={{ color: '#ffffff', fontSize: '1.75rem', margin: 0 }}>
                  Welcome, {user?.name || 'Rahul Sharma'}!
                </h1>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}>
                  Full Board Member
                </span>
              </div>
              <div style={{ color: '#d1fae5', fontSize: '0.9rem', marginTop: '0.35rem', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                <span><i className="fa-solid fa-id-badge"></i> Roll No: <strong>{user?.roll_number || '21BCSE104'}</strong></span>
                <span><i className="fa-solid fa-door-open"></i> Room: <strong>{user?.room_number || 'B-304'} ({user?.hostel_block || 'Block B'})</strong></span>
                <span><i className="fa-solid fa-bowl-food"></i> Mess: <strong>Central Dining Hall 2</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/feedback" className="btn btn-sm" style={{ background: '#ffffff', color: 'var(--primary-dark)', fontWeight: 700 }}>
              <i className="fa-solid fa-star"></i> Rate Food
            </Link>
            <Link to="/complaints" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}>
              <i className="fa-solid fa-triangle-exclamation"></i> Lodge Issue
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.75rem' }}>
        {/* Left Column */}
        <div>
          {/* Timeline */}
          <div className="card" style={{ marginBottom: '1.75rem' }}>
            <div className="card-header">
              <div className="card-title">
                <i className="fa-solid fa-clock-rotate-left" style={{ color: 'var(--primary)' }}></i>
                Today's Dining Schedule & Attendance
              </div>
              <span className="badge badge-primary">
                {new Date().toLocaleDateString('en-US', { weekday: 'long' })} Live
              </span>
            </div>

            <div style={{ padding: '0.5rem 0' }}>
              {meals.map((meal, index) => {
                const isLast = index === meals.length - 1;
                const dbMenu = todayDbMenus.find(m => m.meal_type?.toLowerCase() === meal.name.toLowerCase());
                const itemsStr = dbMenu && Array.isArray(dbMenu.items) && dbMenu.items.length > 0
                  ? dbMenu.items.map(i => i.name).join(', ')
                  : (loadingMenu ? 'Loading fresh menu from PostgreSQL...' : 'No menu items recorded for this meal.');

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
                      gap: '1rem',
                      paddingBottom: isLast ? '0' : '1.5rem',
                      borderLeft: isLast ? 'none' : '2px solid var(--border)',
                      marginLeft: '1rem',
                      paddingLeft: isLast ? '1.35rem' : '1.25rem',
                      position: 'relative'
                    }}
                  >
                    <i
                      className={`fa-solid ${attRecord ? 'fa-check-circle' : (isActive ? 'fa-utensils' : meal.icon)}`}
                      style={{
                        position: 'absolute',
                        left: isLast ? '-9px' : '-10px',
                        top: 0,
                        color: attRecord ? '#10b981' : (isActive ? 'var(--primary)' : 'var(--text-muted)'),
                        background: '#fff'
                      }}
                    ></i>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <h4 style={{ margin: 0, ...(isActive ? { color: 'var(--primary)' } : {}) }}>
                          {meal.name} ({timing})
                        </h4>

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {/* Real-time Dynamic Meal Status */}
                          {isActive ? (
                            <span className="badge badge-live">Serving Now</span>
                          ) : isServed ? (
                            <span className="status-badge status-resolved">Served</span>
                          ) : (
                            <span className="status-badge status-in-progress">Upcoming</span>
                          )}

                          {/* Attendance Status */}
                          {attRecord ? (
                            <span className="status-badge status-resolved">
                              ✓ Swiped In • {attRecord.swipe_time}
                            </span>
                          ) : (
                            <span className="status-badge" style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                              Not Swiped
                            </span>
                          )}
                        </div>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: isActive ? 'var(--text-body)' : 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                        <strong>Menu:</strong> {itemsStr}
                      </p>

                      {isActive && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <Link to="/feedback" className="btn btn-outline-primary btn-sm">Rate {meal.name}</Link>
                          <Link to="/today-menu" className="btn btn-outline btn-sm">Nutrition</Link>
                          {!attRecord && (
                            <button
                              onClick={() => handleSwipe(meal.name)}
                              className="btn btn-primary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
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

          {/* Active Tickets Snippet */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <i className="fa-solid fa-ticket" style={{ color: 'var(--danger)' }}></i>
                My Grievance Tickets (PostgreSQL)
              </div>
              <Link to="/complaints" className="btn btn-outline btn-sm">View All Tickets</Link>
            </div>

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
          </div>
        </div>

        {/* Right Column: Digital Mess Card & Shortcuts */}
        <div>
          <div className="card" style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mess Pass QR</span>
              <span className="badge badge-veg"><i className="fa-solid fa-circle"></i> Active Pass</span>
            </div>

            <div style={{
              width: '140px',
              height: '140px',
              margin: '1.25rem auto',
              background: 'repeating-conic-gradient(#0f172a 0% 25%, #ffffff 0% 50%) 50% / 20px 20px',
              border: '6px solid #0f172a',
              borderRadius: '8px'
            }}></div>

            <h4 style={{ marginBottom: '0.2rem' }}>{user?.name || 'Rahul Sharma'}</h4>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Token ID: {user?.mess_card_id || 'MM-2026-B304'}
            </div>

            <div style={{ background: 'var(--bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', textAlign: 'left', lineHeight: '1.5' }}>
              <div><strong>Pass Validity:</strong> Spring Semester 2026</div>
              <div><strong>Hostel Wing:</strong> {user?.hostel_block || 'Block B'}</div>
              <div><strong>Diet:</strong> {user?.diet_preference || 'Veg'}</div>
            </div>

            {activeMeal && (
              <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                {attendanceList.some(a => a.meal_type?.toLowerCase() === activeMeal.name.toLowerCase()) ? (
                  <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
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

          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ fontSize: '1rem' }}>
                <i className="fa-solid fa-compass" style={{ color: 'var(--primary)' }}></i> Quick Actions
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/weekly-menu" className="btn btn-outline btn-block" style={{ justifyContent: 'flex-start' }}>
                <i className="fa-solid fa-calendar-week" style={{ color: 'var(--primary)' }}></i> 7-Day Menu Schedule
              </Link>
              <Link to="/feedback" className="btn btn-outline btn-block" style={{ justifyContent: 'flex-start' }}>
                <i className="fa-solid fa-star" style={{ color: 'var(--accent)' }}></i> Rate Mess Catering
              </Link>
              <Link to="/chefs" className="btn btn-outline btn-block" style={{ justifyContent: 'flex-start' }}>
                <i className="fa-solid fa-kitchen-set" style={{ color: 'var(--info)' }}></i> Chefs & Kitchen Team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
