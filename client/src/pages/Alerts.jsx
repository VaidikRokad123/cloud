import { useState, useEffect } from 'react';
import { alertAPI } from '../services/api';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineBell, HiOutlineExclamationCircle, HiOutlineCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'budget', provider: 'All', threshold: '' });

  const fetchAlerts = () => {
    setLoading(true);
    alertAPI.list()
      .then(res => setAlerts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.threshold) return toast.error('Fill in all fields');
    try {
      await alertAPI.create({ ...form, threshold: Number(form.threshold) });
      toast.success('Alert created');
      setShowForm(false);
      setForm({ name: '', type: 'budget', provider: 'All', threshold: '' });
      fetchAlerts();
    } catch {
      toast.error('Failed to create alert');
    }
  };

  const handleDelete = async (id) => {
    try {
      await alertAPI.remove(id);
      toast.success('Alert deleted');
      setAlerts(alerts.filter(a => a._id !== id));
    } catch {
      toast.error('Failed to delete alert');
    }
  };

  const triggered = alerts.filter(a => a.isTriggered);
  const safe = alerts.filter(a => !a.isTriggered);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Alerts</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            {triggered.length} triggered · {safe.length} within budget
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Create Alert
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-5 shadow-card">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">New Alert</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-dark-muted mb-1">Alert Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. AWS Monthly Budget"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-dark-muted mb-1">Type</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="budget">Budget</option>
                <option value="anomaly">Anomaly</option>
                <option value="threshold">Threshold</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-dark-muted mb-1">Provider</label>
              <select
                value={form.provider}
                onChange={e => setForm({ ...form, provider: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="All">All Providers</option>
                <option value="AWS">AWS</option>
                <option value="Azure">Azure</option>
                <option value="GCP">GCP</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-dark-muted mb-1">Threshold ($)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={form.threshold}
                  onChange={e => setForm({ ...form, threshold: e.target.value })}
                  placeholder="5000"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg shrink-0">
                  Save
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-[3px] border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16">
          <HiOutlineBell className="w-12 h-12 text-gray-300 dark:text-dark-border mx-auto mb-3" />
          <p className="text-gray-500 dark:text-dark-muted">No alerts configured yet</p>
          <p className="text-sm text-gray-400 mt-1">Create alerts to monitor your spending thresholds</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map(alert => {
            const pct = alert.threshold > 0 ? Math.min((alert.currentSpend / alert.threshold) * 100, 100) : 0;
            const isTriggered = alert.isTriggered;

            return (
              <div
                key={alert._id}
                className={`rounded-xl border p-5 shadow-card transition-all ${
                  isTriggered
                    ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                    : 'bg-white dark:bg-dark-card border-gray-100 dark:border-dark-border'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isTriggered ? (
                      <HiOutlineExclamationCircle className="w-5 h-5 text-red-500 shrink-0" />
                    ) : (
                      <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    )}
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{alert.name}</h3>
                  </div>
                  <button
                    onClick={() => handleDelete(alert._id)}
                    className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    ${alert.currentSpend.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-400 dark:text-dark-muted">
                    / ${alert.threshold.toLocaleString()}
                  </span>
                </div>

                <div className="w-full h-2 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden mt-2 mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: isTriggered ? '#ef4444' : pct > 80 ? '#f59e0b' : '#10b981'
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-dark-muted">
                  <span className="capitalize">{alert.type} · {alert.provider}</span>
                  <span>{pct.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
