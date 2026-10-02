import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TodayMenu from './pages/TodayMenu';
import WeeklyMenu from './pages/WeeklyMenu';
import FoodRatingFeedback from './pages/FoodRatingFeedback';
import Complaints from './pages/Complaints';
import AdminDashboard from './pages/AdminDashboard';
import Chefs from './pages/Chefs';
import ChefReviews from './pages/ChefReviews';
import ChefComplaints from './pages/ChefComplaints';
import StudentRegister from './pages/StudentRegister';

export default function App() {
  return (
    <AuthProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<StudentRegister />} />
              <Route path="/student-register" element={<StudentRegister />} />
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/today-menu" element={<TodayMenu />} />
              <Route path="/weekly-menu" element={<WeeklyMenu />} />
              <Route path="/feedback" element={<FoodRatingFeedback />} />
              <Route path="/complaints" element={<Complaints />} />
              <Route path="/announcements" element={<Navigate to="/" replace />} />
              <Route path="/chefs" element={<Chefs />} />
              <Route path="/chef-reviews" element={<ChefReviews />} />
              <Route path="/chef-complaints" element={<ChefComplaints />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
