import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  DollarSign, 
  Plus, 
  Edit2, 
  Trash2, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  Cpu,
  Sparkles
} from 'lucide-react';
import { SmartEVApi } from '../services/api';
import Modal from '../components/Modal';

export const SettingsPage = () => {
  const [tariffs, setTariffs] = useState([]);
  const [currentTariff, setCurrentTariff] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTariff, setEditingTariff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    tariff_type: 'NORMAL',
    price_per_kwh: 0.20,
    start_hour: 6,
    end_hour: 17,
    is_active: true
  });

  const fetchTariffs = async () => {
    try {
      setLoading(true);
      const [tRes, curRes] = await Promise.all([
        SmartEVApi.getTariffs(),
        SmartEVApi.getCurrentTariff(),
      ]);
      setTariffs(tRes.data);
      setCurrentTariff(curRes.data);
    } catch (err) {
      console.error('Error fetching tariffs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTariffs();
  }, []);

  const openAddModal = () => {
    setEditingTariff(null);
    setFormData({
      name: '',
      tariff_type: 'NORMAL',
      price_per_kwh: 0.20,
      start_hour: 0,
      end_hour: 24,
      is_active: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingTariff(t);
    setFormData({
      name: t.name,
      tariff_type: t.tariff_type,
      price_per_kwh: t.price_per_kwh,
      start_hour: t.start_hour,
      end_hour: t.end_hour,
      is_active: t.is_active
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTariff) {
        await SmartEVApi.updateTariff(editingTariff.id, formData);
      } else {
        await SmartEVApi.createTariff(formData);
      }
      setIsModalOpen(false);
      fetchTariffs();
    } catch (err) {
      alert('Failed to save tariff tier.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tariff tier?')) return;
    try {
      await SmartEVApi.deleteTariff(id);
      fetchTariffs();
    } catch (err) {
      alert('Failed to delete tariff.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-[#E2E8F0]">
        <h1 className="text-2xl font-extrabold text-[#2E3A8C] tracking-tight">Tariff Settings & System Config</h1>
        <p className="text-xs text-slate-500 mt-1 font-body">
          Configure dynamic Time-of-Use electricity pricing curves and view system architectural references.
        </p>
      </div>

      {/* Time of Use Tariffs */}
      <div className="saas-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#2E3A8C] flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-[#00C2A8]" />
              <span>Time-of-Use (ToU) Electricity Rates</span>
            </h2>
            <p className="text-xs text-slate-500">
              The LP optimization solver uses these price tiers to compute cost-optimal dispatch schedules.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {currentTariff && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E6FAF7] text-[#008472] border border-[#00C2A8]/30 font-mono">
                Active Now ({currentTariff.current_hour}:00): ${currentTariff.rate_per_kwh}/kWh
              </span>
            )}
            <button
              onClick={openAddModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold bg-[#00C2A8] hover:bg-[#00A38D] text-white rounded-xl shadow-teal-glow transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tariff Tier</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tariffs.map((t) => (
            <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#2E3A8C] text-sm">{t.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                    t.tariff_type === 'PEAK' 
                      ? 'bg-amber-100 text-amber-800' 
                      : t.tariff_type === 'OFF_PEAK' 
                      ? 'bg-[#E6FAF7] text-[#008472]' 
                      : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {t.tariff_type}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1.5 my-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono">Rate:</span>
                    <strong className="text-[#008472] font-mono text-sm">${t.price_per_kwh} / kWh</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono">Active Hours:</span>
                    <strong className="text-slate-800 font-mono">{t.start_hour}:00 &rarr; {t.end_hour}:00</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200/80">
                <button
                  onClick={() => openEditModal(t)}
                  className="p-1 text-slate-500 hover:text-[#2E3A8C] hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-1 text-slate-400 hover:text-coral-600 hover:bg-coral-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Specifications Documentation */}
      <div className="saas-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-[#00C2A8]" />
            <h2 className="text-sm font-bold text-[#2E3A8C]">EV Charging Optimization Platform Specifications</h2>
          </div>
          <a
            href="https://github.com/06krish/Smart-EV-LoadOptimization/blob/main/EV_Charging_Optimization_Master_Plan%20(1).md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#008472] hover:underline font-bold flex items-center space-x-1"
          >
            <span>View GitHub Master Plan</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
          <p>
            Operating strictly according to the architectural master plan:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>
              <strong>Stage 1 Priority Scoring:</strong> Normalized score:
              <br />
              <code className="text-[11px] font-mono text-[#008472] bg-[#E6FAF7] px-2 py-0.5 rounded">
                Score = 0.4 &times; norm(SOC_Deficit) + 0.4 &times; norm(Urgency) + 0.2 &times; norm(Energy_Needed)
              </code>
            </li>
            <li>
              <strong>Stage 2 Greedy Allocator:</strong> Allocates power in priority order with fairness redistribution.
            </li>
            <li>
              <strong>Stage 3 Linear Programming Solver:</strong> SciPy HiGHS simplex/interior-point engine optimizing multi-horizon energy dispatch while enforcing transformer physical bounds.
            </li>
          </ul>
        </div>
      </div>

      {/* Edit Tariff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTariff ? 'Edit Tariff Tier' : 'Add Tariff Tier'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tariff Label</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Night Off-Peak Eco Rate"
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tier Classification</label>
            <select
              value={formData.tariff_type}
              onChange={(e) => setFormData({ ...formData, tariff_type: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
            >
              <option value="OFF_PEAK">Off-Peak (Eco Discount)</option>
              <option value="NORMAL">Standard Normal</option>
              <option value="PEAK">Peak Demand Surcharge</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Price per kWh ($ USD)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price_per_kwh}
              onChange={(e) => setFormData({ ...formData, price_per_kwh: parseFloat(e.target.value) || 0 })}
              required
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Hour (0-23)</label>
              <input
                type="number"
                min="0"
                max="23"
                value={formData.start_hour}
                onChange={(e) => setFormData({ ...formData, start_hour: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Hour (1-24)</label>
              <input
                type="number"
                min="1"
                max="24"
                value={formData.end_hour}
                onChange={(e) => setFormData({ ...formData, end_hour: parseInt(e.target.value) || 24 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none"
              />
            </div>
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
              className="px-5 py-2 text-xs font-bold bg-[#00C2A8] hover:bg-[#00A38D] text-white rounded-xl shadow-teal-glow transition-colors"
            >
              {editingTariff ? 'Update Tariff' : 'Save Tariff'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SettingsPage;
