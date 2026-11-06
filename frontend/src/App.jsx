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
            {/* 1. Login Selection Hub */}
            <Route path="/login-select" element={<LoginSelectionPage />} />
            
            {/* 2. Admin & User Dedicated Portals */}
            <Route path="/login/admin" element={<AdminLoginPage />} />
            <Route path="/login/user" element={<UserLoginPage />} />
            <Route path="/login" element={<Navigate to="/login-select" replace />} />
            <Route path="/" element={<Navigate to="/login-select" replace />} />

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
