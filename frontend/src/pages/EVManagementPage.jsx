import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Battery, 
  Zap, 
  Clock, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { SmartEVApi } from '../services/api';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

export const EVManagementPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    identifier: '',
    make: 'Tesla',
    model: 'Model 3',
    battery_capacity_kwh: 60.0,
    max_charge_power_kw: 22.0,
    current_soc: 25.0,
    target_soc: 85.0,
    priority: 2,
    owner_name: 'Fleet Logistics'
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await SmartEVApi.getVehicles();
      setVehicles(res.data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const openAddModal = () => {
    setEditingVehicle(null);
    setFormData(initialForm);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (v) => {
    setEditingVehicle(v);
    setFormData({
      identifier: v.identifier,
      make: v.make,
      model: v.model,
      battery_capacity_kwh: v.battery_capacity_kwh,
      max_charge_power_kw: v.max_charge_power_kw,
      current_soc: v.current_soc,
      target_soc: v.target_soc,
      priority: v.priority,
      owner_name: v.owner_name
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!formData.identifier.trim()) errors.identifier = 'Vehicle Identifier is required.';
    if (formData.battery_capacity_kwh <= 0) errors.battery_capacity_kwh = 'Battery capacity must be positive.';
    if (formData.max_charge_power_kw <= 0) errors.max_charge_power_kw = 'Max charge power must be positive.';
    if (formData.current_soc < 0 || formData.current_soc > 100) errors.current_soc = 'SOC must be 0-100%.';
    if (formData.target_soc < 0 || formData.target_soc > 100) errors.target_soc = 'Target SOC must be 0-100%.';
    if (formData.current_soc > formData.target_soc) errors.target_soc = 'Target SOC cannot be less than Current SOC.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      if (editingVehicle) {
        await SmartEVApi.updateVehicle(editingVehicle.id, formData);
      } else {
        await SmartEVApi.createVehicle(formData);
      }
      setIsModalOpen(false);
      fetchVehicles();
    } catch (err) {
      const serverErrors = err.response?.data || {};
      setFormErrors(serverErrors);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await SmartEVApi.deleteVehicle(id);
      setDeleteConfirmId(null);
      fetchVehicles();
    } catch (err) {
      alert('Failed to delete vehicle.');
    }
  };

  const filtered = vehicles.filter((v) => {
    const matchesSearch = 
      v.identifier.toLowerCase().includes(search.toLowerCase()) ||
      v.make.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.owner_name.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || v.priority === parseInt(priorityFilter);
    return matchesSearch && matchesPriority;
  });

  const previewEnergyNeeded = Math.max(
    0, 
    formData.battery_capacity_kwh * ((formData.target_soc - formData.current_soc) / 100.0)
  ).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2E3A8C] tracking-tight">Fleet EV Registry</h1>
          <p className="text-xs text-slate-500 mt-1 font-body">
            Registered vehicle fleet, battery telemetry, target SOC thresholds, and charging priority levels.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#00C2A8] hover:bg-[#00A38D] text-white text-xs font-bold shadow-teal-glow transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Register New EV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="saas-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, make, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00C2A8] focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">Priority Filter:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="4">Critical (4)</option>
            <option value="3">High (3)</option>
            <option value="2">Medium (2)</option>
            <option value="1">Low (1)</option>
          </select>
        </div>
      </div>

      {/* EV Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs">Loading fleet telemetry...</div>
      ) : filtered.length === 0 ? (
        <div className="saas-card p-12 text-center">
          <Car className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-[#2E3A8C]">No vehicles match your filter</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting the search or register a new EV above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((v) => (
            <div key={v.id} className="saas-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-extrabold text-[#2E3A8C] text-base">{v.identifier}</h3>
                    <p className="text-xs text-slate-500 font-medium">{v.make} {v.model}</p>
                  </div>
                  <StatusBadge status={v.priority} type="priority" />
                </div>

                {/* Battery SOC Progress */}
                <div className="my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span className="flex items-center space-x-1 text-slate-600">
                      <Battery className="w-3.5 h-3.5 text-[#00C2A8]" />
                      <span>Battery SOC:</span>
                    </span>
                    <span className="font-mono text-[#008472]">{v.current_soc}% &rarr; {v.target_soc}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#00C2A8] to-[#A3E635] h-2 rounded-full transition-all"
                      style={{ width: `${v.current_soc}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-mono">
                    <span>Required Energy:</span>
                    <strong className="text-slate-800 font-bold">{v.required_energy_kwh} kWh</strong>
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono">Capacity:</span>
                    <span className="font-bold text-slate-800 font-mono">{v.battery_capacity_kwh} kWh</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono">Max Acceptance:</span>
                    <span className="font-bold text-slate-800 font-mono">{v.max_charge_power_kw} kW</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono">Est. Departure:</span>
                    <span className="font-bold text-slate-800 font-mono">{v.time_to_departure_hours} hrs</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono">Owner / Fleet:</span>
                    <span className="font-semibold text-slate-700 truncate block">{v.owner_name}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => openEditModal(v)}
                  className="p-1.5 text-slate-500 hover:text-[#2E3A8C] hover:bg-slate-100 rounded-lg transition-colors"
                  title="Edit EV"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(v.id)}
                  className="p-1.5 text-slate-400 hover:text-coral-600 hover:bg-coral-50 rounded-lg transition-colors"
                  title="Delete EV"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit EV Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVehicle ? 'Edit Vehicle Parameters' : 'Register Fleet EV'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Vehicle Identifier / Plate Number *
              </label>
              <input
                type="text"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                placeholder="e.g. EV-05-DELTA"
                className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:ring-2 focus:ring-[#00C2A8] focus:outline-none ${formErrors.identifier ? 'border-coral-300' : 'border-slate-200'}`}
              />
              {formErrors.identifier && <p className="text-[11px] text-coral-600 mt-0.5">{formErrors.identifier}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Make</label>
              <input
                type="text"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Battery Capacity (kWh)</label>
              <input
                type="number"
                step="0.5"
                value={formData.battery_capacity_kwh}
                onChange={(e) => setFormData({ ...formData, battery_capacity_kwh: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Power Draw (kW)</label>
              <input
                type="number"
                step="1.0"
                value={formData.max_charge_power_kw}
                onChange={(e) => setFormData({ ...formData, max_charge_power_kw: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current SOC (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.current_soc}
                onChange={(e) => setFormData({ ...formData, current_soc: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target SOC (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.target_soc}
                onChange={(e) => setFormData({ ...formData, target_soc: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Charging Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
              >
                <option value={1}>Low Priority (1)</option>
                <option value={2}>Medium Priority (2)</option>
                <option value={3}>High Priority (3)</option>
                <option value={4}>Critical Priority (4)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fleet Owner</label>
              <input
                type="text"
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#E6FAF7] border border-[#00C2A8]/30 text-xs flex items-center justify-between">
            <span className="text-[#004A41] font-bold">Energy Required to Reach Target:</span>
            <span className="font-extrabold text-[#008472] font-mono text-sm">{previewEnergyNeeded} kWh</span>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold bg-[#00C2A8] hover:bg-[#00A38D] text-white rounded-xl shadow-teal-glow transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Fleet Deletion"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to remove this EV from the fleet? This will cancel any active reservations and charging sessions.
          </p>
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteConfirmId)}
              className="px-4 py-1.5 text-xs font-bold bg-coral-600 hover:bg-coral-700 text-white rounded-xl shadow-xs transition-colors"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EVManagementPage;
