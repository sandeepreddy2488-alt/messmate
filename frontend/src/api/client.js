import axios from 'axios';
import {
  INITIAL_TODAY_MENUS,
  INITIAL_CHEFS,
  INITIAL_COMPLAINTS,
  INITIAL_FEEDBACK,
  INITIAL_STATS
} from './mockData';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 3500, // Quick timeout so fallback kicks in without waiting long
});

// Helper for local storage persistence in mock mode
const getStore = (key, initial) => {
  try {
    const val = localStorage.getItem(`messmate_${key}`);
    return val ? JSON.parse(val) : initial;
  } catch (e) {
    return initial;
  }
};

const setStore = (key, val) => {
  try {
    localStorage.setItem(`messmate_${key}`, JSON.stringify(val));
  } catch (e) {}
};

// Automatically attach authenticated user role and identity to all requests
client.interceptors.request.use((config) => {
  try {
    const saved = localStorage.getItem('messmate_user');
    if (saved) {
      const user = JSON.parse(saved);
      if (user?.role === 'admin') {
        config.headers['X-User-Role'] = 'admin';
        config.headers['X-Admin-Username'] = user.username || user.name || 'Sandeep';
        config.headers['X-Admin-Email'] = user.email || 'messmate.admin@gmail.com';
      }
    }
  } catch (e) {
    // ignore
  }
  return config;
});

// Safe request wrapper that falls back to interactive mock data when API is unreachable
const safeCall = async (apiPromise, fallbackFn) => {
  try {
    return await apiPromise();
  } catch (err) {
    console.info('MessMate: Switching to interactive offline/cloud demo mode for this action.');
    return { data: fallbackFn() };
  }
};

const getAdminPayload = (data = {}, role = 'admin') => {
  try {
    const saved = localStorage.getItem('messmate_user');
    if (saved) {
      const user = JSON.parse(saved);
      if (user?.role === 'admin') {
        return {
          ...data,
          role: 'admin',
          admin_username: user.username || user.name || 'Sandeep',
          admin_email: user.email || 'messmate.admin@gmail.com',
        };
      }
    }
  } catch (e) {}
  return { ...data, role };
};

export const api = {
  // Menus
  getTodayMenu: (params) =>
    safeCall(
      () => client.get('/menus/today/', { params }),
      () => getStore('today_menus', INITIAL_TODAY_MENUS)
    ),

  getWeeklyMenu: () =>
    safeCall(
      () => client.get('/menus/weekly/'),
      () => {
        const today = getStore('today_menus', INITIAL_TODAY_MENUS);
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const weekly = [];
        days.forEach((day, dIdx) => {
          today.forEach((m, mIdx) => {
            weekly.push({
              ...m,
              id: 100 + dIdx * 10 + mIdx,
              day_of_week: day,
              status: day === 'Friday' ? m.status : 'Upcoming',
            });
          });
        });
        return weekly;
      }
    ),

  getMenus: (params) =>
    safeCall(
      () => client.get('/menus/', { params }),
      () => getStore('today_menus', INITIAL_TODAY_MENUS)
    ),

  createMenu: (data) =>
    safeCall(
      () => client.post('/menus/', data),
      () => {
        const current = getStore('today_menus', INITIAL_TODAY_MENUS);
        const newMenu = { ...data, id: Date.now(), items: [] };
        const updated = [...current, newMenu];
        setStore('today_menus', updated);
        return newMenu;
      }
    ),

  updateMenu: (id, data) =>
    safeCall(
      () => client.patch(`/menus/${id}/`, data),
      () => {
        const current = getStore('today_menus', INITIAL_TODAY_MENUS);
        const updated = current.map(m => m.id === Number(id) ? { ...m, ...data } : m);
        setStore('today_menus', updated);
        return updated.find(m => m.id === Number(id));
      }
    ),

  deleteMenu: (id) =>
    safeCall(
      () => client.delete(`/menus/${id}/`),
      () => {
        const current = getStore('today_menus', INITIAL_TODAY_MENUS);
        setStore('today_menus', current.filter(m => m.id !== Number(id)));
        return { success: true };
      }
    ),

  clearDemoMenus: () =>
    safeCall(
      () => client.post('/menus/clear-demo/'),
      () => {
        setStore('today_menus', []);
        return { message: 'Demo menus cleared.' };
      }
    ),

  // Attendance
  getAttendance: (params) =>
    safeCall(
      () => client.get('/attendance/', { params }),
      () => getStore('attendance', [
        { id: 1, meal_type: 'Breakfast', date: new Date().toISOString().split('T')[0], status: 'Present', student_roll_number: '21B91A0501' },
        { id: 2, meal_type: 'Lunch', date: new Date().toISOString().split('T')[0], status: 'Present', student_roll_number: '21B91A0501' },
      ])
    ),

  swipeMeal: (data) =>
    safeCall(
      () => client.post('/attendance/swipe/', data),
      () => {
        const current = getStore('attendance', []);
        const entry = {
          id: Date.now(),
          ...data,
          date: new Date().toISOString().split('T')[0],
          status: 'Present',
          timestamp: new Date().toLocaleTimeString(),
        };
        setStore('attendance', [entry, ...current]);
        return { success: true, message: `Attendance verified for ${data.meal_type || 'meal'}` };
      }
    ),

  // Food Items
  createFoodItem: (data) =>
    safeCall(
      () => client.post('/food-items/', data),
      () => ({ id: Date.now(), ...data })
    ),
  updateFoodItem: (id, data) =>
    safeCall(
      () => client.patch(`/food-items/${id}/`, data),
      () => ({ id, ...data })
    ),
  deleteFoodItem: (id) =>
    safeCall(
      () => client.delete(`/food-items/${id}/`),
      () => ({ success: true })
    ),

  // Complaints
  getComplaints: () =>
    safeCall(
      () => client.get('/complaints/'),
      () => getStore('complaints', INITIAL_COMPLAINTS)
    ),

  createComplaint: (data) =>
    safeCall(
      () => client.post('/complaints/', data),
      () => {
        const current = getStore('complaints', INITIAL_COMPLAINTS);
        const ticketId = 'CMP-' + Math.floor(1000 + Math.random() * 9000);
        const newComplaint = {
          id: Date.now(),
          ticket_id: ticketId,
          status: 'Pending',
          resolution_note: '',
          created_at: new Date().toISOString(),
          ...data,
        };
        const updated = [newComplaint, ...current];
        setStore('complaints', updated);
        return newComplaint;
      }
    ),

  updateComplaintStatus: (ticketId, status, resolutionNote = '') =>
    safeCall(
      () => client.patch(`/complaints/update-status/${ticketId}/`, { status, resolution_note: resolutionNote }),
      () => {
        const current = getStore('complaints', INITIAL_COMPLAINTS);
        const updated = current.map(c =>
          c.ticket_id === ticketId || c.id === ticketId
            ? { ...c, status, resolution_note: resolutionNote }
            : c
        );
        setStore('complaints', updated);
        return { success: true, message: `Status updated to ${status}` };
      }
    ),

  // Feedback & Ratings
  getFeedback: () =>
    safeCall(
      () => client.get('/feedback/'),
      () => getStore('feedback', INITIAL_FEEDBACK)
    ),

  submitFeedback: (data) =>
    safeCall(
      () => client.post('/feedback/', data),
      () => {
        const current = getStore('feedback', INITIAL_FEEDBACK);
        const newFeedback = {
          id: Date.now(),
          created_at: new Date().toISOString(),
          ...data,
        };
        setStore('feedback', [newFeedback, ...current]);
        return { success: true, data: newFeedback, message: 'Thank you! Food feedback recorded successfully.' };
      }
    ),

  submitRating: (data) =>
    safeCall(
      () => client.post('/ratings/', data),
      () => ({ success: true, message: 'Rating submitted successfully.' })
    ),

  // Chefs
  getChefs: (params) =>
    safeCall(
      () => client.get('/chefs/', { params }),
      () => getStore('chefs', INITIAL_CHEFS)
    ),

  createChef: (data) =>
    safeCall(
      () => client.post('/chefs/', data),
      () => {
        const current = getStore('chefs', INITIAL_CHEFS);
        const newChef = { id: Date.now(), avg_rating: 0, total_ratings: 0, is_active: true, ...data };
        setStore('chefs', [...current, newChef]);
        return newChef;
      }
    ),

  updateChef: (id, data) =>
    safeCall(
      () => client.patch(`/chefs/${id}/`, data),
      () => {
        const current = getStore('chefs', INITIAL_CHEFS);
        const updated = current.map(c => c.id === Number(id) ? { ...c, ...data } : c);
        setStore('chefs', updated);
        return updated.find(c => c.id === Number(id));
      }
    ),

  deleteChef: (id) =>
    safeCall(
      () => client.delete(`/chefs/${id}/`),
      () => {
        const current = getStore('chefs', INITIAL_CHEFS);
        setStore('chefs', current.filter(c => c.id !== Number(id)));
        return { success: true };
      }
    ),

  // Chef Reviews
  getChefReviews: (params) =>
    safeCall(
      () => client.get('/chef-reviews/', { params }),
      () => getStore('chef_reviews', [
        { id: 1, chef_name: 'SATTIBABU', student_name: 'Rahul Sharma', rating: 5, comments: 'Best biryani and chicken curry in town!', created_at: new Date().toISOString() },
        { id: 2, chef_name: 'GOPI', student_name: 'Ananya Patel', rating: 5, comments: 'Breakfast sambar is authentic and delicious.', created_at: new Date().toISOString() },
      ])
    ),

  submitChefReview: (data) =>
    safeCall(
      () => client.post('/chef-reviews/', data),
      () => {
        const current = getStore('chef_reviews', []);
        const newReview = { id: Date.now(), created_at: new Date().toISOString(), ...data };
        setStore('chef_reviews', [newReview, ...current]);
        return { success: true, message: 'Chef review saved.' };
      }
    ),

  getChefRatings: (chefId, params) =>
    safeCall(
      () => chefId ? client.get(`/chefs/${chefId}/ratings/`, { params }) : client.get('/chef-reviews/', { params }),
      () => getStore('chef_reviews', [])
    ),

  submitChefRating: (chefId, data) =>
    safeCall(
      () => client.post(`/chefs/${chefId}/ratings/`, data),
      () => ({ success: true, message: 'Chef rating submitted.' })
    ),

  // Chef Complaints
  getChefComplaints: (chefIdOrParams, params) =>
    safeCall(
      () => {
        if (typeof chefIdOrParams === 'object' && chefIdOrParams !== null) {
          return client.get('/chef-complaints/', { params: chefIdOrParams });
        }
        return chefIdOrParams ? client.get(`/chefs/${chefIdOrParams}/complaints/`, { params }) : client.get('/chef-complaints/', { params });
      },
      () => getStore('chef_complaints', [
        { id: 1, chef_name: 'SATTIBABU', category: 'Taste & Spiciness', description: 'Curry was slightly more spicy than usual on Thursday.', status: 'Resolved', student_name: 'Rahul Sharma', created_at: new Date().toISOString() }
      ])
    ),

  submitChefComplaint: (chefId, data) =>
    safeCall(
      () => client.post(`/chefs/${chefId}/complaints/`, data),
      () => ({ success: true, message: 'Grievance submitted.' })
    ),

  submitChefComplaintDirect: (data) =>
    safeCall(
      () => client.post('/chef-complaints/', data),
      () => {
        const current = getStore('chef_complaints', []);
        const newGrievance = { id: Date.now(), status: 'Pending', created_at: new Date().toISOString(), ...data };
        setStore('chef_complaints', [newGrievance, ...current]);
        return newGrievance;
      }
    ),

  updateChefComplaint: (id, data, role = 'admin') =>
    safeCall(
      () => client.patch(`/chef-complaints/${id}/`, getAdminPayload(data, role), { headers: { 'X-User-Role': role } }),
      () => ({ success: true })
    ),
  acceptChefComplaint: (id, data = {}, role = 'admin') =>
    safeCall(
      () => client.post(`/chef-complaints/${id}/accept/`, getAdminPayload(data, role), { headers: { 'X-User-Role': role } }),
      () => ({ success: true, message: 'Complaint accepted.' })
    ),
  rejectChefComplaint: (id, data = {}, role = 'admin') =>
    safeCall(
      () => client.post(`/chef-complaints/${id}/reject/`, getAdminPayload(data, role), { headers: { 'X-User-Role': role } }),
      () => ({ success: true, message: 'Complaint rejected.' })
    ),
  resolveChefComplaint: (id, data = {}, role = 'admin') =>
    safeCall(
      () => client.post(`/chef-complaints/${id}/resolve/`, getAdminPayload(data, role), { headers: { 'X-User-Role': role } }),
      () => ({ success: true, message: 'Complaint resolved.' })
    ),

  // Dashboard Stats
  getStats: () =>
    safeCall(
      () => client.get('/stats/'),
      () => ({ success: true, data: INITIAL_STATS })
    ),

  // Auth & Student Operations
  login: (credentials) =>
    safeCall(
      () => client.post('/auth/login/', credentials),
      () => {
        const username = credentials?.username || credentials?.identifier || 'User';
        const isAdmin = username.toLowerCase().includes('admin') || credentials?.role === 'admin';
        const user = {
          id: isAdmin ? 1 : 101,
          name: isAdmin ? 'Admin Sandeep' : (credentials.name || username),
          username: username,
          role: isAdmin ? 'admin' : 'student',
          email: isAdmin ? 'messmate.admin@gmail.com' : `${username.toLowerCase()}@college.edu`,
          roll_number: isAdmin ? 'ADMIN-01' : (credentials.roll_number || '21B91A0501'),
          room: 'B-304',
          hostel_block: 'Block B',
        };
        return { success: true, user, role: user.role, token: 'mock-session-jwt-token' };
      }
    ),

  registerStudent: (data) =>
    safeCall(
      () => client.post('/student/register/', data),
      () => {
        const newStudent = {
          id: Date.now(),
          name: data.name || 'New Student',
          username: data.roll_number || data.name,
          roll_number: data.roll_number || '21B91A0599',
          email: data.email || 'student@college.edu',
          phone_number: data.phone_number || '9876543210',
          room: data.room || 'B-304',
          hostel_block: data.hostel_block || 'Block B',
          role: 'student',
        };
        const current = getStore('registered_students', []);
        setStore('registered_students', [...current, newStudent]);
        return { success: true, user: newStudent, role: 'student', message: 'Student registered successfully!' };
      }
    ),

  setupAdmin: (data) =>
    safeCall(
      () => client.post('/auth/setup-admin/', data),
      () => ({ success: true, message: 'Admin configured.' })
    ),
};

export default client;
