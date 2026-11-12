import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 25000,
});

// Request interceptor to attach JWT Access Token
api.interceptors.request.use(
  (config) => {
    // Do not attach expired/invalid tokens to public authentication endpoints
    const isAuthEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');
    const token = localStorage.getItem('smartev_access_token');
    if (token && !isAuthEndpoint) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is invalid or expired (401), clean up stale credentials automatically
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('smartev_user');
      localStorage.removeItem('smartev_access_token');
      localStorage.removeItem('smartev_refresh_token');
    }

    const message = error.response?.data?.error || 
                    error.response?.data?.detail || 
                    error.message || 
                    'An unexpected network error occurred.';
    console.error('API Error:', message, error);
    return Promise.reject(error);
  }
);

export const SmartEVApi = {
  // Auth
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  getCurrentUser: () => api.get('/auth/me/'),

  // Dashboard Summary
  getDashboardSummary: () => api.get('/dashboard/summary/'),

  // Vehicles CRUD
  getVehicles: (params) => api.get('/vehicles/', { params }),
  createVehicle: (data) => api.post('/vehicles/', data),
  updateVehicle: (id, data) => api.put(`/vehicles/${id}/`, data),
  patchVehicle: (id, data) => api.patch(`/vehicles/${id}/`, data),
  deleteVehicle: (id) => api.delete(`/vehicles/${id}/`),

  // Stations & Chargers
  getStations: () => api.get('/stations/'),
  getStationLoad: (id) => api.get(`/stations/${id}/load/`),
  createStation: (data) => api.post('/stations/', data),
  updateStation: (id, data) => api.put(`/stations/${id}/`, data),
  deleteStation: (id) => api.delete(`/stations/${id}/`),
  getChargers: () => api.get('/stations/chargers/'),
  updateCharger: (id, data) => api.patch(`/stations/chargers/${id}/`, data),

  // Tariffs
  getTariffs: () => api.get('/tariffs/'),
  getCurrentTariff: () => api.get('/tariffs/current/'),
  createTariff: (data) => api.post('/tariffs/', data),
  updateTariff: (id, data) => api.put(`/tariffs/${id}/`, data),
  deleteTariff: (id) => api.delete(`/tariffs/${id}/`),

  // Charging Sessions
  getSessions: (params) => api.get('/charging/sessions/', { params }),
  updateSessionState: (id, status, reason) => api.post(`/charging/sessions/${id}/change_state/`, { status, reason }),

  // Load History & Forecasting
  getLoadHistory: (hours = 48) => api.get(`/load/history/?hours=${hours}`),
  getLoadForecast: (horizon = 24) => api.get(`/load/predict/?horizon=${horizon}`),

  // Optimization Core
  runOptimization: (params) => api.post('/optimization/run/', params),
  getOptimizationRuns: () => api.get('/optimization/runs/'),
  getSchedules: () => api.get('/optimization/schedules/'),
  createSchedule: (data) => api.post('/optimization/schedules/', data),

  // Simulator Controls
  simulatorReset: () => api.post('/simulator/reset/'),
  simulatorTick: (minutes = 15) => api.post('/simulator/tick/', { minutes }),
  simulatorFault: (chargerId) => api.post('/simulator/fault/', { charger_id: chargerId }),

  // Analytics & Reports
  getAnalyticsReport: () => api.get('/reports/analytics/'),
  getExportCSVUrl: () => `${api.defaults.baseURL}/reports/export/`,
};

export default api;

