import { useState, useEffect } from 'react';
import { budgetAPI, alertAPI, costAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import { HiOutlineBell, HiOutlineExclamationCircle, HiOutlineInformationCircle, HiOutlineShieldCheck } from 'react-icons/hi';

const THRESHOLDS = [50, 70, 80, 90];

const SEVERITY_CONFIG = {
  critical: { icon: HiOutlineExclamationCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' },
  warning: { icon: HiOutlineExclamationCircle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' },
  info: { icon: HiOutlineInformationCircle, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' },
};

export default function Budget() {
  const { convertCost } = useApp();
  const [budget, setBudget] = useState({ monthlyBudget: 12000, alertThreshold: 80 });
  const [budgetInput, setBudgetInput] = useState(12000);
  const [threshold, setThreshold] = useState(80);
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [budRes, alRes, sumRes] = await Promise.all([
          budgetAPI.get(),
          alertAPI.list(),
          costAPI.summary(),
        ]);
        setBudget(budRes.data);
        setBudgetInput(budRes.data.monthlyBudget);
        setThreshold(budRes.data.alertThreshold);
        setAlerts(alRes.data);
        setSummary(sumRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      const res = await budgetAPI.update({ monthlyBudget: budgetInput, alertThreshold: threshold });
      setBudget({ monthlyBudget: budgetInput, alertThreshold: threshold });
      toast.success('Budget settings saved!');
    } catch {
      toast.error('Failed to save');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const percentUsed = summary ? ((summary.totalCost / budgetInput) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget & Alerts</h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Manage your monthly budget and alert thresholds
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Settings */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-6 shadow-card">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-5">Budget Settings</h3>

          {/* Monthly Budget Input */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Monthly Budget ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                value={budgetInput}
                onChange={e => setBudgetInput(Number(e.target.value))}
                className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
              />
            </div>
          </div>

          {/* Alert Threshold Slider */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Alert Threshold: <span className="text-[#1a73e8] font-bold">{threshold}%</span>
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-dark-border rounded-lg appearance-none cursor-pointer accent-[#1a73e8]"
            />
            <div className="flex justify-between mt-1">
              {THRESHOLDS.map(t => (
                <button
                  key={t}
                  onClick={() => setThreshold(t)}
                  className={`text-xs px-2 py-0.5 rounded ${threshold === t ? 'bg-[#1a73e8] text-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {t}%
                </button>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-dark-muted">Current Usage vs Budget</span>
              <span className={`text-sm font-bold ${percentUsed > 80 ? 'text-red-500' : 'text-emerald-500'}`}>{percentUsed}%</span>
            </div>
            <div className="w-full h-4 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(percentUsed, 100)}%`,
                  background: percentUsed > 80 ? 'linear-gradient(90deg, #ef4444, #dc2626)' : 'linear-gradient(90deg, #10b981, #059669)',
                }}
              />
              {/* Threshold marker */}
              <div
                className="absolute top-0 h-full w-0.5 bg-amber-500"
                style={{ left: `${threshold}%` }}
                title={`Threshold: ${threshold}%`}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {convertCost(summary?.totalCost || 0)} of {convertCost(budgetInput)} used
            </p>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-[#1a73e8] hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
          >
            Save Settings
          </button>
        </div>

        {/* Alert History Table */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-6 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineBell className="w-5 h-5 text-[#1a73e8]" />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Alert History</h3>
          </div>

          <div className="space-y-3">
            {alerts.map(alert => {
              const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
              const Icon = cfg.icon;
              return (
                <div key={alert.id} className={`rounded-lg border p-4 ${cfg.bg}`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.color}`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 dark:text-white font-medium">{alert.message}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-gray-500 dark:text-dark-muted">{alert.date}</span>
                        <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${
                          alert.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          alert.severity === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
