import { useState, useEffect } from 'react';
import { costAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import {
  HiOutlineFilter, HiOutlinePlus, HiOutlineTrash, HiOutlineX, HiOutlinePencil
} from 'react-icons/hi';

const TYPE_FILTERS = ['All', 'Compute', 'Storage', 'Database', 'Network'];
const SERVICE_TYPES = ['Compute', 'Storage', 'Database', 'Network'];

function getRowColor(svc) {
  if (svc.status !== 'active') return 'bg-gray-50 dark:bg-gray-800/30 opacity-60';
  if (svc.percentOfTotal >= 25) return 'bg-red-50 dark:bg-red-900/10';
  if (svc.percentOfTotal >= 15) return 'bg-yellow-50 dark:bg-yellow-900/10';
  return 'bg-green-50 dark:bg-green-900/5';
}

function getBadgeColor(percentOfTotal) {
  if (percentOfTotal >= 25) return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
  if (percentOfTotal >= 15) return 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30';
  return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
}

export default function Services() {
  const { convertCost } = useApp();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'Compute', cost: '', usage: '', limit: '' });

  const fetchServices = () => {
    setLoading(true);
    costAPI.services()
      .then(res => setServices(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchServices(); }, []);

  // Add service
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.type) return toast.error('Name and type are required');
    try {
      await costAPI.addService({
        name: form.name,
        type: form.type,
        cost: Number(form.cost) || 0,
        usage: form.usage || '0',
        limit: form.limit || 'No limit',
      });
      toast.success(`${form.name} service added!`);
      setForm({ name: '', type: 'Compute', cost: '', usage: '', limit: '' });
      setShowAddForm(false);
      fetchServices();
    } catch {
      toast.error('Failed to add service');
    }
  };

  // Edit service
  const startEdit = (svc) => {
    setEditingId(svc.id);
    setForm({ name: svc.name, type: svc.type, cost: svc.cost, usage: svc.usage, limit: svc.limit });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await costAPI.updateService(editingId, {
        name: form.name,
        type: form.type,
        cost: Number(form.cost),
        usage: form.usage,
        limit: form.limit,
      });
      toast.success('Service updated!');
      setEditingId(null);
      setForm({ name: '', type: 'Compute', cost: '', usage: '', limit: '' });
      fetchServices();
    } catch {
      toast.error('Failed to update');
    }
  };

  // Toggle active/inactive
  const handleToggle = async (svc) => {
    const newStatus = svc.status === 'active' ? 'inactive' : 'active';
    try {
      await costAPI.updateService(svc.id, { status: newStatus });
      toast.success(`${svc.name} ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
      fetchServices();
    } catch {
      toast.error('Failed to update status');
    }
  };

  // Remove service
  const handleRemove = async (svc) => {
    if (!confirm(`Remove ${svc.name}? This cannot be undone.`)) return;
    try {
      await costAPI.removeService(svc.id);
      toast.success(`${svc.name} removed`);
      fetchServices();
    } catch {
      toast.error('Failed to remove');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = filter === 'All' ? services : services.filter(s => s.type === filter);
  const activeCount = services.filter(s => s.status === 'active').length;
  const inactiveCount = services.filter(s => s.status !== 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Services</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            {activeCount} active · {inactiveCount} inactive · {services.length} total
          </p>
        </div>
        <button
          onClick={() => { 
            setShowAddForm(!showAddForm); 
            setEditingId(null); 
            setForm({ name: '', type: 'Compute', cost: '', usage: '', limit: '' }); 
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309] text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-glow hover:shadow-glow-lg transform hover:scale-[1.02] active:scale-100"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {/* Add / Edit Form */}
      {(showAddForm || editingId) && (
        <form onSubmit={editingId ? handleEdit : handleAdd} className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
              {editingId ? 'Edit Service' : 'Add New Service'}
            </h3>
            <button type="button" onClick={() => { setShowAddForm(false); setEditingId(null); }}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-border">
              <HiOutlineX className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-dark-muted mb-1">Service Name *</label>
              <input
                type="text" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. ElastiCache"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-dark-muted mb-1">Type *</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8]">
                {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-dark-muted mb-1">Monthly Cost ($)</label>
              <input
                type="number" value={form.cost}
                onChange={e => setForm({ ...form, cost: e.target.value })}
                placeholder="500"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-dark-muted mb-1">Usage</label>
              <input
                type="text" value={form.usage}
                onChange={e => setForm({ ...form, usage: e.target.value })}
                placeholder="e.g. 100 GB"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-dark-muted mb-1">Spending Limit</label>
              <div className="flex gap-2">
                <input
                  type="text" value={form.limit}
                  onChange={e => setForm({ ...form, limit: e.target.value })}
                  placeholder="$2,000/mo"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                />
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309] text-white text-sm font-semibold rounded-lg shrink-0 transition-all duration-200">
                  {editingId ? 'Save' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Filter buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <HiOutlineFilter className="w-4 h-4 text-gray-400" />
        {TYPE_FILTERS.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              filter === t
                ? 'bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white shadow-sm'
                : 'bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-dark-muted hover:bg-gray-200 dark:hover:bg-dark-border'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Services Table */}
      <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-dark-border/30">
              <tr>
                <th className="text-left py-3 px-4 text-gray-500 dark:text-dark-muted font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 dark:text-dark-muted font-medium">Service Name</th>
                <th className="text-left py-3 px-4 text-gray-500 dark:text-dark-muted font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-500 dark:text-dark-muted font-medium">Usage</th>
                <th className="text-right py-3 px-4 text-gray-500 dark:text-dark-muted font-medium">Cost</th>
                <th className="text-right py-3 px-4 text-gray-500 dark:text-dark-muted font-medium">Limit</th>
                <th className="text-right py-3 px-4 text-gray-500 dark:text-dark-muted font-medium">% of Total</th>
                <th className="text-center py-3 px-4 text-gray-500 dark:text-dark-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className={`border-t border-gray-100 dark:border-dark-border/50 ${getRowColor(s)} transition-all duration-200`}>
                  {/* Toggle switch */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggle(s)}
                      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                        s.status === 'active' ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-dark-border'
                      }`}
                      title={s.status === 'active' ? 'Click to disable' : 'Click to enable'}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                          s.status === 'active' ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${s.status === 'active' ? 'text-gray-900 dark:text-white' : 'text-gray-400 line-through'}`}>
                      {s.name}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-[#1a73e8] dark:bg-blue-900/30 dark:text-blue-400">
                      {s.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-dark-muted">{s.usage}</td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">
                    {s.status === 'active' ? convertCost(s.cost) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-500 dark:text-dark-muted text-xs">
                    {s.limit}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {s.status === 'active' ? (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${getBadgeColor(s.percentOfTotal)}`}>
                        {s.percentOfTotal}%
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => startEdit(s)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-[#1a73e8] transition-colors"
                        title="Edit"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemove(s)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 dark:text-dark-muted">No services found for this filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
