"use client";
// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const API_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')
  : 'http://localhost:8000';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // On mount, check for token and fetch user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setUser(data))
        .catch(() => setUser(null));
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    // Fetch user after login
    fetch(`${API_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}