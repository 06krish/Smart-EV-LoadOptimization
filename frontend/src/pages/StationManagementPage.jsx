import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  Zap, 
  MapPin, 
  ShieldAlert, 
  Gauge, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { SmartEVApi } from '../services/api';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

export const StationManagementPage = () => {
  const [stations, setStations] = useState([]);
  const [chargers, setChargers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [stationForm, setStationForm] = useState({
    name: '',
    location: '',
    grid_capacity_kw: 100.0,
    base_load_kw: 10.0,
  });
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Charger edit state
  const [isChargerModalOpen, setIsChargerModalOpen] = useState(false);
  const [editingCharger, setEditingCharger] = useState(null);
  const [chargerForm, setChargerForm] = useState({
    identifier: '',
    connector_type: 'CCS2',
    max_power_kw: 30.0,
    status: 'AVAILABLE'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stRes, chRes] = await Promise.all([
        SmartEVApi.getStations(),
        SmartEVApi.getChargers(),
      ]);
      setStations(stRes.data);
      setChargers(chRes.data);
    } catch (err) {
      console.error('Error fetching stations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddStation = () => {
    setEditingStation(null);
    setStationForm({
      name: '',
      location: '',
      grid_capacity_kw: 100.0,
      base_load_kw: 10.0,
    });
    setFormErrors({});
    setIsStationModalOpen(true);
  };

  const openEditStation = (st) => {
    setEditingStation(st);
    setStationForm({
      name: st.name,
      location: st.location,
      grid_capacity_kw: st.grid_capacity_kw,
      base_load_kw: st.base_load_kw,
    });
    setFormErrors({});
    setIsStationModalOpen(true);
  };

  const handleStationSubmit = async (e) => {
    e.preventDefault();
    if (stationForm.base_load_kw >= stationForm.grid_capacity_kw) {
      setFormErrors({ base_load_kw: 'Base load cannot equal or exceed total grid capacity.' });
      return;
    }
    if (stationForm.grid_capacity_kw <= 0) {
      setFormErrors({ grid_capacity_kw: 'Grid capacity must be positive.' });
      return;
    }

    try {
      if (editingStation) {
        await SmartEVApi.updateStation(editingStation.id, stationForm);
      } else {
        await SmartEVApi.createStation(stationForm);
      }
      setIsStationModalOpen(false);
      fetchData();
    } catch (err) {
      setFormErrors(err.response?.data || {});
    }
  };

  const handleDeleteStation = async (id) => {
    try {
      await SmartEVApi.deleteStation(id);
      setDeleteConfirmId(null);
      fetchData();
    } catch (err) {
      alert('Cannot delete primary station while active sessions exist.');
    }
  };

  const openEditCharger = (ch) => {
    setEditingCharger(ch);
    setChargerForm({
      identifier: ch.identifier,
      connector_type: ch.connector_type,
      max_power_kw: ch.max_power_kw,
      status: ch.status
    });
    setIsChargerModalOpen(true);
  };

  const handleChargerSubmit = async (e) => {
    e.preventDefault();
    if (chargerForm.max_power_kw <= 0 || chargerForm.max_power_kw > 350) {
      alert('Charger rating must be between 1 kW and 350 kW.');
      return;
    }
    try {
      await SmartEVApi.updateCharger(editingCharger.id, chargerForm);
      setIsChargerModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to update charger.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2E3A8C] tracking-tight">Charging Stations & Infrastructure</h1>
          <p className="text-xs text-slate-500 mt-1 font-body">
            Configure transformer capacities, non-EV facility base loads, and charging bay specifications.
          </p>
        </div>

        <button
          onClick={openAddStation}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#00C2A8] hover:bg-[#00A38D] text-white text-xs font-bold shadow-teal-glow transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Charging Hub</span>
        </button>
      </div>

      {/* Stations List */}
      <div className="space-y-6">
        {stations.map((st) => {
          const stChargers = chargers.filter(c => c.station === st.id);
          const totalPowerCapacity = stChargers.reduce((acc, c) => acc + c.max_power_kw, 0);
          const currentLoad = st.current_load_kw || 0;
          const isOverprovisioned = totalPowerCapacity > st.grid_capacity_kw;

          return (
            <div key={st.id} className="saas-card p-6 space-y-6">
              {/* Station Head */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-bold text-[#2E3A8C]">{st.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E6FAF7] text-[#008472] border border-[#00C2A8]/30 font-mono">
                      Online & Optimal
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{st.location}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditStation(st)}
                    className="p-2 text-[#2E3A8C] hover:bg-slate-100 rounded-xl transition-colors text-xs font-semibold flex items-center space-x-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Specs</span>
                  </button>
                  {stations.length > 1 && (
                    <button
                      onClick={() => setDeleteConfirmId(st.id)}
                      className="p-2 text-coral-500 hover:text-coral-700 hover:bg-coral-50 rounded-xl transition-colors text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Station Metrics Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Grid Ceiling</span>
                  <span className="text-xl font-bold text-[#2E3A8C] font-mono mt-1 block">{st.grid_capacity_kw} kW</span>
                  <span className="text-[10px] text-slate-500">Transformer Max</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Facility Base Load</span>
                  <span className="text-xl font-bold text-[#2E3A8C] font-mono mt-1 block">{st.base_load_kw} kW</span>
                  <span className="text-[10px] text-slate-500">Non-EV auxiliary draw</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Current Live Load</span>
                  <span className="text-xl font-bold text-[#008472] font-mono mt-1 block">{currentLoad} kW</span>
                  <span className="text-[10px] text-slate-500">Headroom: {st.available_capacity_kw} kW</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Port Provisioning</span>
                  <span className="text-xl font-bold text-[#2E3A8C] font-mono mt-1 block">{totalPowerCapacity} kW</span>
                  <span className={`text-[10px] font-semibold ${isOverprovisioned ? 'text-amber-600' : 'text-slate-500'}`}>
                    {isOverprovisioned ? 'Overprovisioned (Optimizer active)' : 'Within bounds'}
                  </span>
                </div>
              </div>

              {/* Bays */}
              <div>
                <h3 className="text-xs font-bold text-[#2E3A8C] uppercase tracking-wider mb-3 font-mono">
                  Station Charging Ports ({stChargers.length} Bays)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stChargers.map((ch) => (
                    <div key={ch.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#00C2A8]/40 transition-colors flex flex-col justify-between shadow-2xs">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-[#2E3A8C] text-sm">{ch.identifier}</span>
                          <StatusBadge status={ch.status} type="charger" />
                        </div>
                        <div className="text-xs text-slate-600 space-y-1 my-2">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Standard:</span>
                            <strong className="text-slate-800">{ch.connector_type}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Power Rating:</span>
                            <strong className="text-slate-800 font-mono">{ch.max_power_kw} kW</strong>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => openEditCharger(ch)}
                        className="mt-3 w-full py-1.5 text-xs font-semibold text-[#2E3A8C] hover:text-[#00C2A8] bg-slate-50 hover:bg-[#E6FAF7] rounded-lg transition-colors border border-slate-200"
                      >
                        Configure Bay
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Station Modal */}
      <Modal
        isOpen={isStationModalOpen}
        onClose={() => setIsStationModalOpen(false)}
        title={editingStation ? 'Configure Charging Hub' : 'Register New Hub'}
      >
        <form onSubmit={handleStationSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Station Name</label>
            <input
              type="text"
              value={stationForm.name}
              onChange={(e) => setStationForm({ ...stationForm, name: e.target.value })}
              placeholder="e.g. Metro Central EV Hub"
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00C2A8] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Address</label>
            <input
              type="text"
              value={stationForm.location}
              onChange={(e) => setStationForm({ ...stationForm, location: e.target.value })}
              placeholder="e.g. Sector 62, Innovation Corridor"
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00C2A8] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Grid Capacity Ceiling (kW)
              </label>
              <input
                type="number"
                step="5"
                value={stationForm.grid_capacity_kw}
                onChange={(e) => setStationForm({ ...stationForm, grid_capacity_kw: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-[#00C2A8] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Facility Base Load (kW)
              </label>
              <input
                type="number"
                step="1"
                value={stationForm.base_load_kw}
                onChange={(e) => setStationForm({ ...stationForm, base_load_kw: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-[#00C2A8] focus:outline-none"
              />
            </div>
          </div>

          {formErrors.base_load_kw && (
            <p className="text-xs text-coral-600">{formErrors.base_load_kw}</p>
          )}

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsStationModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#00C2A8] hover:bg-[#00A38D] text-white rounded-xl shadow-teal-glow transition-colors"
            >
              {editingStation ? 'Update Station' : 'Create Station'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Charger Modal */}
      <Modal
        isOpen={isChargerModalOpen}
        onClose={() => setIsChargerModalOpen(false)}
        title={`Configure Charger: ${editingCharger?.identifier}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleChargerSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Bay Identifier</label>
            <input
              type="text"
              value={chargerForm.identifier}
              onChange={(e) => setChargerForm({ ...chargerForm, identifier: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Connector Standard</label>
            <select
              value={chargerForm.connector_type}
              onChange={(e) => setChargerForm({ ...chargerForm, connector_type: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
            >
              <option value="CCS2">CCS Type 2 (DC Fast)</option>
              <option value="CHAdeMO">CHAdeMO (DC)</option>
              <option value="Type2">AC Type 2</option>
              <option value="GB/T">GB/T Fast DC</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Max Power Output (kW)</label>
            <input
              type="number"
              step="5"
              min="3"
              max="350"
              value={chargerForm.max_power_kw}
              onChange={(e) => setChargerForm({ ...chargerForm, max_power_kw: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Operational State</label>
            <select
              value={chargerForm.status}
              onChange={(e) => setChargerForm({ ...chargerForm, status: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
            >
              <option value="AVAILABLE">Available</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="CHARGING">Charging</option>
              <option value="FAULT">Fault / Offline</option>
            </select>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsChargerModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#00C2A8] hover:bg-[#00A38D] text-white rounded-xl shadow-teal-glow transition-colors"
            >
              Save Bay Settings
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StationManagementPage;
