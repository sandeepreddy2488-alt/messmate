# MessMate - Full-Stack Hostel Mess Management System

[![Live Demo](https://img.shields.io/badge/Live_Demo-Firebase_Hosting-brightgreen?style=for-the-badge&logo=firebase)](https://messmate-77b77.web.app)
[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Live-success?style=for-the-badge&logo=github)](https://sandeepreddy2488-alt.github.io/messmate/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/sandeepreddy2488-alt/messmate)

> 🚀 **Live Firebase URL:** **[https://messmate-77b77.web.app](https://messmate-77b77.web.app)**  
> 🌐 **GitHub Pages URL:** **[https://sandeepreddy2488-alt.github.io/messmate/](https://sandeepreddy2488-alt.github.io/messmate/)**  
> 🔗 **Alternative Mirror:** **[https://messmate-77b77.firebaseapp.com](https://messmate-77b77.firebaseapp.com)**

MessMate is a college and hostel mess management web application rebuilt with a decoupled **React.js** frontend, a **Python / Django + Django REST Framework** backend, and a **PostgreSQL** database.

---

## 🏛️ Project Architecture

```text
mess_mate/
├── backend/                       # Django + Django REST Framework REST API
│   ├── manage.py
│   ├── .env                       # Database credentials & settings
│   ├── requirements.txt           # Python dependencies
│   ├── messmate_core/             # Django root configuration
│   └── mess/                      # Models, Serializers, Views & Endpoints
│
└── frontend/                      # React.js Single Page Application (Vite)
    ├── package.json
    ├── vite.config.js
    └── src/                       # Components, Pages, Context, and API Client
```

---

## 🚀 Quick Start Guide

### 1. Start the Django Backend Server

1. Open your terminal and navigate to `backend`:
   ```powershell
   cd c:\Users\Lenovo\OneDrive\Desktop\mess_mate\backend
   ```
2. Run the database migrations & seed sample data (if not already run):
   ```powershell
   .\venv\Scripts\python.exe manage.py migrate
   .\venv\Scripts\python.exe manage.py seed_data
   ```
3. Set up your MessMate Admin credentials:
   ```powershell
   .\venv\Scripts\python.exe manage.py setup_admin
   ```
   *You can also specify username and email directly via flags, e.g.:*
   ```powershell
   .\venv\Scripts\python.exe manage.py setup_admin --username admin --email messmate.admin@gmail.com
   ```
   *You will be interactively prompted for your password securely (hidden while typing). Passwords are hashed with Django's PBKDF2 algorithm and are never stored in plain text.*

4. Start the Django development server:
   ```powershell
   .\venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
   ```
   *The REST API will be live at `http://127.0.0.1:8000/api/`*

### 2. Start the React Frontend

1. Open another terminal and navigate to `frontend`:
   ```powershell
   cd c:\Users\Lenovo\OneDrive\Desktop\mess_mate\frontend
   ```
2. Start the Vite dev server:
   ```powershell
   npm run dev
   ```
3. Open your browser at:
   **[http://localhost:5173](http://localhost:5173)**

---

## 🗄️ PostgreSQL Database Configuration

The backend is configured in `backend/.env`:
```ini
DB_NAME=messmate_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=127.0.0.1
DB_PORT=5432
USE_POSTGRES=True
```

- When PostgreSQL credentials are verified, Django automatically uses PostgreSQL 18.
- If PostgreSQL credentials are being configured, Django seamlessly falls back to SQLite so development never halts.

---

## 📡 Key REST API Endpoints

- `GET /api/menus/today/` — Today's meal menu & nutritional breakdown
- `GET /api/menus/weekly/` — 7-day schedule for Monday through Sunday
- `GET /api/complaints/` — List all student grievances
- `POST /api/complaints/` — Submit a new grievance ticket
- `PATCH /api/complaints/update-status/<ticket_id>/` — Admin status resolution
- `GET /api/feedback/` — List reviews & computed averages (taste, hygiene, temperature, portion)
- `POST /api/feedback/` — Submit food reviews
- `POST /api/ratings/` — Submit 5-star ratings
- `GET /api/announcements/` — List circulars (pinned feasts first)
- `POST /api/announcements/` — Admin publishes circulars
- `GET /api/stats/` — Live KPI metrics for dashboards
- `POST /api/auth/login/` — Authentication session endpoint
