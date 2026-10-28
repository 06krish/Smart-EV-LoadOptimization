import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 25000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || 
                    error.response?.data?.detail || 
                    error.message || 
                    'An unexpected network error occurred.';
    console.error('API Error:', message, error);
    return Promise.reject(error);
  }
);

export const SmartEVApi = {
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

