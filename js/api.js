/**
 * MessMate Client API Helper
 * Clean, async fetch utility to communicate with the Node.js Express backend
 */

const MessMateAPI = {
  // Base URL (defaults to current origin, works seamlessly locally & in production)
  baseUrl: '',

  // 1. Complaints
  async getComplaints() {
    try {
      const res = await fetch(`${this.baseUrl}/api/complaints`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.warn('API unreachable, fallback to default state:', err);
      return [];
    }
  },

  async createComplaint(data) {
    const res = await fetch(`${this.baseUrl}/api/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async updateComplaintStatus(ticketId, status, resolutionNote = '') {
    const res = await fetch(`${this.baseUrl}/api/complaints/${ticketId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, resolution_note: resolutionNote })
    });
    return await res.json();
  },

  // 2. Feedback & Ratings
  async getFeedback() {
    try {
      const res = await fetch(`${this.baseUrl}/api/feedback`);
      return await res.json();
    } catch (err) {
      console.warn('API unreachable, fallback to default state:', err);
      return { success: false, reviews: [] };
    }
  },

  async submitFeedback(data) {
    const res = await fetch(`${this.baseUrl}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  // 3. Announcements
  async getAnnouncements() {
    try {
      const res = await fetch(`${this.baseUrl}/api/announcements`);
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.warn('API unreachable, fallback to default state:', err);
      return [];
    }
  },

  async createAnnouncement(data) {
    const res = await fetch(`${this.baseUrl}/api/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  // 4. Summary Stats
  async getStats() {
    try {
      const res = await fetch(`${this.baseUrl}/api/stats`);
      const json = await res.json();
      return json.success ? json.data : null;
    } catch (err) {
      console.warn('API unreachable, fallback to default state:', err);
      return null;
    }
  }
};
