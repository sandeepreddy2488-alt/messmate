/**
 * MessMate - Main Express Server & REST API
 * Clean, well-commented backend for beginners
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

/* ==========================================================================
   1. Complaints API Routes
   ========================================================================== */

// GET /api/complaints - Fetch all grievances
app.get('/api/complaints', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM complaints ORDER BY id DESC');
    const complaints = stmt.all();
    res.json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ success: false, error: 'Database read error' });
  }
});

// POST /api/complaints - Submit a new grievance ticket
app.post('/api/complaints', (req, res) => {
  try {
    const {
      category,
      meal = 'General',
      hall = 'Central Mess Hall 2 (Block B)',
      priority = 'medium',
      description,
      student_name = 'Rahul Sharma',
      room = 'Room B-304'
    } = req.body;

    if (!category || !description) {
      return res.status(400).json({ success: false, error: 'Category and description are required' });
    }

    const ticket_id = 'CMP-' + Math.floor(1000 + Math.random() * 9000);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const insert = db.prepare(`
      INSERT INTO complaints (ticket_id, student_name, room, category, meal, hall, priority, description, status, resolution_note, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', '', ?)
    `);

    insert.run(ticket_id, student_name, room, category, meal, hall, priority, description, now);

    const newTicket = db.prepare('SELECT * FROM complaints WHERE ticket_id = ?').get(ticket_id);
    console.log(`[API] New grievance logged: ${ticket_id} by ${student_name}`);

    res.status(201).json({
      success: true,
      message: 'Grievance ticket created successfully',
      ticket: newTicket
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ success: false, error: 'Failed to record grievance' });
  }
});

// PATCH /api/complaints/:ticket_id/status - Admin updates grievance status & notes
app.patch('/api/complaints/:ticket_id/status', (req, res) => {
  try {
    const { ticket_id } = req.params;
    const { status = 'Resolved', resolution_note = '' } = req.body;

    const update = db.prepare(`
      UPDATE complaints
      SET status = ?, resolution_note = ?
      WHERE ticket_id = ?
    `);

    const result = update.run(status, resolution_note, ticket_id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Ticket ID not found' });
    }

    console.log(`[API] Ticket ${ticket_id} marked as ${status}`);
    res.json({ success: true, message: `Ticket ${ticket_id} updated to ${status}` });
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ success: false, error: 'Failed to update ticket status' });
  }
});

/* ==========================================================================
   2. Food Ratings & Feedback API Routes
   ========================================================================== */

// GET /api/feedback - Fetch recent reviews & average metrics
app.get('/api/feedback', (req, res) => {
  try {
    const reviewsStmt = db.prepare('SELECT * FROM feedback ORDER BY id DESC LIMIT 20');
    const reviews = reviewsStmt.all();

    const statsStmt = db.prepare(`
      SELECT 
        COUNT(*) as total_reviews,
        ROUND(AVG(overall_rating), 1) as avg_rating,
        ROUND(AVG(taste_rating), 1) as avg_taste,
        ROUND(AVG(hygiene_rating), 1) as avg_hygiene,
        ROUND(AVG(temperature_rating), 1) as avg_temperature,
        ROUND(AVG(portion_rating), 1) as avg_portion
      FROM feedback
    `);
    const stats = statsStmt.get();

    res.json({ success: true, stats, reviews });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ success: false, error: 'Failed to load ratings' });
  }
});

// POST /api/feedback - Submit meal rating & comment
app.post('/api/feedback', (req, res) => {
  try {
    const {
      meal = 'lunch',
      overall_rating = 5,
      taste_rating = 4,
      hygiene_rating = 5,
      temperature_rating = 4,
      portion_rating = 4,
      comment = '',
      tags = '',
      anonymous = 1,
      student_info = 'Hostel Resident'
    } = req.body;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const insert = db.prepare(`
      INSERT INTO feedback (meal, overall_rating, taste_rating, hygiene_rating, temperature_rating, portion_rating, comment, tags, anonymous, student_info, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      meal,
      overall_rating,
      taste_rating,
      hygiene_rating,
      temperature_rating,
      portion_rating,
      comment,
      tags,
      anonymous ? 1 : 0,
      anonymous ? 'Anonymous Resident' : student_info,
      now
    );

    console.log(`[API] New feedback recorded for meal: ${meal} (${overall_rating} stars)`);
    res.status(201).json({ success: true, message: 'Feedback recorded successfully' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ success: false, error: 'Failed to save feedback' });
  }
});

/* ==========================================================================
   3. Announcements API Routes
   ========================================================================== */

// GET /api/announcements - Fetch all notices (pinned first)
app.get('/api/announcements', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM announcements ORDER BY pinned DESC, id DESC');
    const notices = stmt.all();
    res.json({ success: true, count: notices.length, data: notices });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, error: 'Failed to load announcements' });
  }
});

// POST /api/announcements - Publish a new announcement (Admin)
app.post('/api/announcements', (req, res) => {
  try {
    const {
      title,
      category = 'events',
      content,
      pinned = 0,
      author = 'Mess Supervisor'
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Title and content are required' });
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const insert = db.prepare(`
      INSERT INTO announcements (title, category, content, pinned, author, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insert.run(title, category, content, pinned ? 1 : 0, author, now);
    console.log(`[API] New announcement published: "${title}"`);

    res.status(201).json({ success: true, message: 'Notice published successfully' });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ success: false, error: 'Failed to publish announcement' });
  }
});

/* ==========================================================================
   4. Overall Statistics API Route
   ========================================================================== */

// GET /api/stats - High-level metrics for admin & student dashboards
app.get('/api/stats', (req, res) => {
  try {
    const complaintsStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
      FROM complaints
    `).get();

    const ratingStats = db.prepare(`
      SELECT 
        COUNT(*) as total_feedback,
        ROUND(AVG(overall_rating), 1) as avg_rating
      FROM feedback
    `).get();

    const noticesCount = db.prepare('SELECT COUNT(*) as total FROM announcements').get();

    res.json({
      success: true,
      data: {
        complaints: complaintsStats,
        ratings: ratingStats,
        announcements: noticesCount.total,
        meals_served_today: 842,
        total_capacity: 1050
      }
    });
  } catch (error) {
    console.error('Error loading stats:', error);
    res.status(500).json({ success: false, error: 'Failed to load stats' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`
  =============================================================
  🚀 MessMate Full-Stack Web App is Running!
  -------------------------------------------------------------
  🌐 Local URL:  http://localhost:${PORT}
  📁 Database:   SQLite (database/messmate.db)
  ⚡ Backend:    Node.js + Express
  -------------------------------------------------------------
  Press Ctrl + C in the terminal to stop the server anytime.
  =============================================================
  `);
});
