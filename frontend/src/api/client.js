import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

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
  getTodayMenu: (params) => client.get('/menus/today/', { params }),
  getWeeklyMenu: () => client.get('/menus/weekly/'),
  getMenus: (params) => client.get('/menus/', { params }),
  createMenu: (data) => client.post('/menus/', data),
  updateMenu: (id, data) => client.patch(`/menus/${id}/`, data),
  deleteMenu: (id) => client.delete(`/menus/${id}/`),
  clearDemoMenus: () => client.post('/menus/clear-demo/'),

  // Attendance
  getAttendance: (params) => client.get('/attendance/', { params }),
  swipeMeal: (data) => client.post('/attendance/swipe/', data),

  // Food Items
  createFoodItem: (data) => client.post('/food-items/', data),
  updateFoodItem: (id, data) => client.patch(`/food-items/${id}/`, data),
  deleteFoodItem: (id) => client.delete(`/food-items/${id}/`),
  
  // Complaints
  getComplaints: () => client.get('/complaints/'),
  createComplaint: (data) => client.post('/complaints/', data),
  updateComplaintStatus: (ticketId, status, resolutionNote = '') =>
    client.patch(`/complaints/update-status/${ticketId}/`, {
      status,
      resolution_note: resolutionNote,
    }),

  // Feedback & Ratings
  getFeedback: () => client.get('/feedback/'),
  submitFeedback: (data) => client.post('/feedback/', data),
  submitRating: (data) => client.post('/ratings/', data),

  // Chefs
  getChefs: (params) => client.get('/chefs/', { params }),
  createChef: (data) => client.post('/chefs/', data),
  updateChef: (id, data) => client.patch(`/chefs/${id}/`, data),
  deleteChef: (id) => client.delete(`/chefs/${id}/`),

  // Chef Reviews
  getChefReviews: (params) => client.get('/chef-reviews/', { params }),
  submitChefReview: (data) => client.post('/chef-reviews/', data),
  getChefRatings: (chefId, params) => chefId ? client.get(`/chefs/${chefId}/ratings/`, { params }) : client.get('/chef-reviews/', { params }),
  submitChefRating: (chefId, data) => client.post(`/chefs/${chefId}/ratings/`, data),

  // Chef Complaints
  getChefComplaints: (chefIdOrParams, params) => {
    if (typeof chefIdOrParams === 'object' && chefIdOrParams !== null) {
      return client.get('/chef-complaints/', { params: chefIdOrParams });
    }
    return chefIdOrParams ? client.get(`/chefs/${chefIdOrParams}/complaints/`, { params }) : client.get('/chef-complaints/', { params });
  },
  submitChefComplaint: (chefId, data) => client.post(`/chefs/${chefId}/complaints/`, data),
  submitChefComplaintDirect: (data) => client.post('/chef-complaints/', data),
  updateChefComplaint: (id, data, role = 'admin') => client.patch(`/chef-complaints/${id}/`, getAdminPayload(data, role), {
    headers: { 'X-User-Role': role }
  }),
  acceptChefComplaint: (id, data = {}, role = 'admin') => client.post(`/chef-complaints/${id}/accept/`, getAdminPayload(data, role), {
    headers: { 'X-User-Role': role }
  }),
  rejectChefComplaint: (id, data = {}, role = 'admin') => client.post(`/chef-complaints/${id}/reject/`, getAdminPayload(data, role), {
    headers: { 'X-User-Role': role }
  }),
  resolveChefComplaint: (id, data = {}, role = 'admin') => client.post(`/chef-complaints/${id}/resolve/`, getAdminPayload(data, role), {
    headers: { 'X-User-Role': role }
  }),

  // Dashboard Stats
  getStats: () => client.get('/stats/'),

  // Auth
  login: (credentials) => client.post('/auth/login/', credentials),
  setupAdmin: (data) => client.post('/auth/setup-admin/', data),
};

export default client;
