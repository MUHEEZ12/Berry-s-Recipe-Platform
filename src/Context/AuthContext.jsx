import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { showToast } from '../utils/helpers';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem('auth');
      return saved ? JSON.parse(saved) : { user: null, token: null };
    } catch {
      return { user: null, token: null };
    }
  });

  const [loading, setLoading] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(auth));
  }, [auth]);

  // Login
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login({ email, password });
      setAuth({ user: response.data.user, token: response.data.token });
      showToast('🎉 Logged in successfully!', 'success');
      return { ok: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      showToast(message, 'error');
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Register
  const signup = async (email, password, name) => {
    try {
      setLoading(true);
      const response = await authAPI.register({ name, email, password });
      setAuth({ user: response.data.user, token: response.data.token });
      showToast('🎉 Account created successfully!', 'success');
      return { ok: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      showToast(message, 'error');
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Register alias
  const register = signup;

  // Logout
  const logout = () => {
    setAuth({ user: null, token: null });
    showToast('👋 Logged out', 'info');
  };

  return (
    <AuthContext.Provider value={{ user: auth.user, token: auth.token, login, signup, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
