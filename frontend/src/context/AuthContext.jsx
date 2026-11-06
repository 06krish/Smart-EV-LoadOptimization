import React, { createContext, useContext, useState, useEffect } from 'react';
import { SmartEVApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smartev_user');
    return saved ? JSON.parse(saved) : {
      username: 'operator',
      first_name: 'Alex',
      last_name: 'Morgan',
      email: 'operator@smartev.io',
      role: 'Grid Operator'
    };
  });
  const [token, setToken] = useState(() => localStorage.getItem('smartev_token'));

  useEffect(() => {
    if (user) {
      localStorage.setItem('smartev_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('smartev_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('smartev_token', token);
    } else {
      localStorage.removeItem('smartev_token');
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      const res = await SmartEVApi.login({ username, password });
      const { user: userData, token: userToken, role } = res.data;
      const combinedUser = { ...userData, role: role || 'Grid Operator' };
      setUser(combinedUser);
      setToken(userToken);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Invalid credentials.';
      return { success: false, error: errorMsg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await SmartEVApi.register(userData);
      const { user: newUser, token: userToken, role } = res.data;
      const combinedUser = { ...newUser, role: role || 'Fleet Manager' };
      setUser(combinedUser);
      setToken(userToken);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.username?.[0] || 
                       err.response?.data?.password?.[0] || 
                       err.response?.data?.error || 
                       'Registration failed.';
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smartev_user');
    localStorage.removeItem('smartev_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
