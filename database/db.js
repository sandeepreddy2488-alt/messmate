/**
 * MessMate Database Layer
 * Uses Node.js built-in SQLite (node:sqlite) - zero external drivers needed!
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'messmate.db');
const db = new DatabaseSync(dbPath);

console.log(`[Database] Connected to SQLite database at: ${dbPath}`);

/**
 * Initialize Database Tables
 */
function initDb() {
  // 1. Complaints Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id TEXT UNIQUE NOT NULL,
      student_name TEXT NOT NULL,
      room TEXT NOT NULL,
      category TEXT NOT NULL,
      meal TEXT,
      hall TEXT,
      priority TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      resolution_note TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );
  `);

  // 2. Feedback Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meal TEXT NOT NULL,
      overall_rating INTEGER NOT NULL,
      taste_rating INTEGER,
      hygiene_rating INTEGER,
      temperature_rating INTEGER,
      portion_rating INTEGER,
      comment TEXT,
      tags TEXT,
      anonymous INTEGER DEFAULT 1,
      student_info TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 3. Announcements Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      pinned INTEGER DEFAULT 0,
      author TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Seed sample data if empty
  seedData();
}

/**
 * Seed Realistic Initial Sample Data
 */
function seedData() {
  // Check if complaints table is empty
  const countComplaints = db.prepare('SELECT COUNT(*) as count FROM complaints').get();
  if (countComplaints.count === 0) {
    console.log('[Database] Seeding initial complaints data...');
    const insertComplaint = db.prepare(`
      INSERT INTO complaints (ticket_id, student_name, room, category, meal, hall, priority, description, status, resolution_note, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertComplaint.run(
      'CMP-4921',
      'Rahul Sharma',
      'Room B-304',
      'water',
      'lunch',
      'Central Mess Hall 2 (Block B)',
      'high',
      'The RO purifier tap on the second floor of Central Mess Hall 2 had muddy sediment and weak flow.',
      'Resolved',
      'Pre-filter candle and sediment cartridge replaced on Sept 20, 09:30 AM. TDS tested at 85 ppm (optimal). Tap functioning normally.',
      '2026-09-19 13:15:00'
    );

    insertComplaint.run(
      'CMP-5014',
      'Rahul Sharma',
      'Room B-304',
      'quality',
      'dinner',
      'Central Mess Hall 2 (Block B)',
      'medium',
      'Chapati container was empty at 8:40 PM during dinner, and subsequent rotis brought out were cold and hard.',
      'In Progress',
      'Investigated with head chef. Electric casserole heating element was found switched off. Written warning issued to the buffet station attendant.',
      '2026-09-18 21:05:00'
    );

    insertComplaint.run(
      'CMP-5088',
      'Ananya Patel',
      'Room C-112',
      'hygiene',
      'lunch',
      'Central Mess Hall 1 (Block A)',
      'urgent',
      'Large curry spill on dining table 14 was left unattended for 20 minutes attracting houseflies.',
      'Pending',
      '',
      '2026-09-20 12:45:00'
    );
  }

  // Check if feedback table is empty
  const countFeedback = db.prepare('SELECT COUNT(*) as count FROM feedback').get();
  if (countFeedback.count === 0) {
    console.log('[Database] Seeding initial feedback data...');
    const insertFeedback = db.prepare(`
      INSERT INTO feedback (meal, overall_rating, taste_rating, hygiene_rating, temperature_rating, portion_rating, comment, tags, anonymous, student_info, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertFeedback.run(
      'lunch',
      5,
      5,
      5,
      4,
      5,
      'Paneer butter masala today was really rich and not overly oily. Rotis were served piping hot from the tawa!',
      'Delicious Gravy, Soft Phulkas, Gulab Jamun was great',
      0,
      '3rd Year B.Tech (Block B)',
      '2026-09-20 13:30:00'
    );

    insertFeedback.run(
      'snacks',
      3,
      3,
      4,
      4,
      3,
      'The evening tea sugar level was high yesterday. Can we have separate sugar sachets or lower base sweetness?',
      'Too Sweet',
      0,
      'M.Tech Resident (Block A)',
      '2026-09-19 17:45:00'
    );

    insertFeedback.run(
      'breakfast',
      5,
      5,
      5,
      5,
      4,
      'Poha was fresh and light this morning. The peanuts were crunchy. Good job kitchen staff!',
      'Delicious, Hot Food',
      0,
      '2nd Year MBBS (Wing C)',
      '2026-09-20 08:45:00'
    );
  }

  // Check if announcements table is empty
  const countAnnouncements = db.prepare('SELECT COUNT(*) as count FROM announcements').get();
  if (countAnnouncements.count === 0) {
    console.log('[Database] Seeding initial announcements data...');
    const insertAnnouncement = db.prepare(`
      INSERT INTO announcements (title, category, content, pinned, author, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertAnnouncement.run(
      '🎉 Grand Annual Fest Feast & Special Dinner — Coming this Sunday!',
      'events',
      'On the joyous occasion of the Annual Inter-College Technical & Cultural Fest, Central Mess Halls 1 & 2 will host a Grand Banquet Dinner on Sunday, September 27. Serving timings will be extended from 7:00 PM to 10:30 PM. Menu includes Paneer Tikka, Chicken Biryani, Butter Naan, and Malpua with Rabdi.',
      1,
      'Mess Secretary',
      '2026-09-20 10:00:00'
    );

    insertAnnouncement.run(
      'Mess Rebate Applications Open for Mid-Semester Break',
      'rebate',
      'Students leaving campus for the upcoming vacation are requested to apply for their mess fee rebate in advance. Under hostel rules, students absent for minimum 3 consecutive days are entitled to 80% daily meal rebate. Last date to submit leave slip: September 24, 2026 (5:00 PM).',
      0,
      'Hostel Office',
      '2026-09-18 14:00:00'
    );

    insertAnnouncement.run(
      'Tea Station Revisions: Separate Sugar-Free Pot & Herbal Green Tea Added',
      'menu',
      'In response to student feedback regarding sweetness in morning tea, the caterer has installed separate dispensers: Pot A (Masala Milk Tea), Pot B (No-Sugar Milk Tea), and Pot C (Hot Water with Green Tea & Herbal bags).',
      0,
      'Mess Committee',
      '2026-09-16 09:30:00'
    );

    insertAnnouncement.run(
      'Prohibition: Removal of Mess Utensils to Hostel Rooms',
      'rules',
      'Over 200 stainless steel plates, bowls, and spoons were found abandoned in floor corridors this week. Please be reminded that removing mess utensils outside dining halls is strictly against hostel disciplinary codes.',
      0,
      'Chief Warden',
      '2026-09-12 16:00:00'
    );
  }
}

// Run table initialization
initDb();

module.exports = db;
