import React, { createContext, useContext, useState, useEffect } from 'react';
import { SmartEVApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smartev_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('smartev_access_token'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('smartev_refresh_token'));

  useEffect(() => {
    if (user) {
      localStorage.setItem('smartev_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('smartev_user');
    }
  }, [user]);

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('smartev_access_token', accessToken);
    } else {
      localStorage.removeItem('smartev_access_token');
    }
  }, [accessToken]);

  useEffect(() => {
    if (refreshToken) {
      localStorage.setItem('smartev_refresh_token', refreshToken);
    } else {
      localStorage.removeItem('smartev_refresh_token');
    }
  }, [refreshToken]);

  const login = async (emailOrUsername, password, rememberMe = true) => {
    try {
      const res = await SmartEVApi.login({ email: emailOrUsername, password });
      const { user: userData, access, refresh, role } = res.data;
      const combinedUser = { ...userData, role: role || 'Grid Operator' };
      
      setUser(combinedUser);
      setAccessToken(access);
      setRefreshToken(refresh);

      if (rememberMe) {
        localStorage.setItem('smartev_remembered_email', emailOrUsername);
      } else {
        localStorage.removeItem('smartev_remembered_email');
      }

      return { success: true, user: combinedUser };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 
                       err.response?.data?.detail || 
                       'Invalid email or password. Please try again.';
      return { success: false, error: errorMsg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await SmartEVApi.register(userData);
      const { user: newUser, access, refresh, role } = res.data;
      const combinedUser = { ...newUser, role: role || 'Fleet Manager' };
      setUser(combinedUser);
      setAccessToken(access);
      setRefreshToken(refresh);
      return { success: true, user: combinedUser };
    } catch (err) {
      const errorMsg = err.response?.data?.username?.[0] || 
                       err.response?.data?.email?.[0] || 
                       err.response?.data?.password?.[0] || 
                       err.response?.data?.error || 
                       'Registration failed. Please check your details.';
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('smartev_user');
    localStorage.removeItem('smartev_access_token');
    localStorage.removeItem('smartev_refresh_token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      accessToken, 
      refreshToken, 
      isAuthenticated: !!user, 
      login, 
      register, 
      logout 
    }}>
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
