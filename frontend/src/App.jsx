import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import LoginSelectionPage from './pages/LoginSelectionPage';
import AdminLoginPage from './pages/AdminLoginPage';
import UserLoginPage from './pages/UserLoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import OptimizationPage from './pages/OptimizationPage';
import LoadPredictionPage from './pages/LoadPredictionPage';
import EVManagementPage from './pages/EVManagementPage';
import StationManagementPage from './pages/StationManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* 1. Direct Default Login Portal (User / Driver) */}
            <Route path="/login" element={<UserLoginPage />} />
            <Route path="/login/user" element={<UserLoginPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* 2. Hidden Admin Login Portal (Direct URL Access Only) */}
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/login/admin" element={<AdminLoginPage />} />
            <Route path="/login-select" element={<Navigate to="/login" replace />} />

            {/* 3. Protected Dashboard Routes with Role Guards */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/optimization" element={<OptimizationPage />} />
              <Route path="/forecasting" element={<LoadPredictionPage />} />
              <Route path="/vehicles" element={<EVManagementPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              
              {/* Admin-Only Restricted Pages */}
              <Route 
                path="/stations" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <StationManagementPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login-select" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
