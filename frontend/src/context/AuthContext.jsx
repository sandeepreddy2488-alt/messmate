import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const DEFAULT_STUDENT = {
  role: 'student',
  name: 'Rahul Sharma',
  roll_number: '21BCSE104',
  room_number: 'B-304',
  hostel_block: 'Block B',
  mess_card_id: 'MM-2026-B304',
  diet_preference: 'Veg'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('messmate_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved user from localStorage');
      }
    }
    // Default to student session on fresh launch
    return DEFAULT_STUDENT;
  });

  const login = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem('messmate_user', JSON.stringify(userData));
    } catch (e) {
      console.warn('Failed to persist user in localStorage');
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('messmate_user');
    } catch (e) {
      console.warn('Failed to remove user from localStorage');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || null,
      isAuthenticated: Boolean(user),
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
