import { useState, useEffect } from 'react';
import { budgetAPI, costAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import { HiOutlineBell, HiOutlineExclamationCircle, HiOutlineInformationCircle } from 'react-icons/hi';

const THRESHOLDS = [50, 70, 80, 90];

export default function Budget() {
  const { convertCost } = useApp();
  const [budget, setBudget] = useState({ monthlyBudget: 12000, alertThreshold: 80 });
  const [budgetInput, setBudgetInput] = useState(12000);
  const [threshold, setThreshold] = useState(80);
  const [summary, setSummary] = useState(null);
  const [services, setServices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [budRes, sumRes, svcRes] = await Promise.all([
          budgetAPI.get(),
          costAPI.summary(),
          costAPI.services(),
        ]);
        setBudget(budRes.data);
        setBudgetInput(budRes.data.monthlyBudget);
        setThreshold(budRes.data.alertThreshold);
        setSummary(sumRes.data);
        setServices(svcRes.data);

        // Generate service-specific alerts
        const generatedAlerts = [];
        const totalCost = sumRes.data.totalCost;
        const budgetThreshold = budRes.data.monthlyBudget * (budRes.data.alertThreshold / 100);

        // Overall budget alert
        if (totalCost >= budgetThreshold) {
          generatedAlerts.push({
            id: 'budget-overall',
            severity: totalCost >= budRes.data.monthlyBudget ? 'critical' : 'warning',
            message: `Total spending (${convertCost(totalCost)}) has ${totalCost >= budRes.data.monthlyBudget ? 'exceeded' : 'reached'} ${Math.round((totalCost / budRes.data.monthlyBudget) * 100)}% of your monthly budget`,
            service: 'Overall Budget',
            date: new Date().toLocaleDateString(),
          });
        }

        // Service-specific alerts (high cost services)
        svcRes.data.forEach(service => {
          if (service.percentOfTotal >= 25) {
            generatedAlerts.push({
              id: `service-${service.id}`,
              severity: service.percentOfTotal >= 40 ? 'critical' : 'warning',
              message: `${service.name} (${service.type}) is consuming ${service.percentOfTotal}% of your total budget (${convertCost(service.cost)}/month)`,
              service: service.name,
              date: new Date().toLocaleDateString(),
            });
          }
        });

        // Cost spike alerts (services with high costs)
        svcRes.data.forEach(service => {
          if (service.cost > 1000) {
            generatedAlerts.push({
              id: `spike-${service.id}`,
              severity: 'info',
              message: `${service.name} has high monthly cost of ${convertCost(service.cost)}. Consider optimization opportunities.`,
              service: service.name,
              date: new Date().toLocaleDateString(),
            });
          }
        });

        setAlerts(generatedAlerts);
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
      await budgetAPI.update({ monthlyBudget: budgetInput, alertThreshold: threshold });
      setBudget({ monthlyBudget: budgetInput, alertThreshold: threshold });
      toast.success('Budget settings saved!');
      window.location.reload(); // Reload to regenerate alerts
    } catch {
      toast.error('Failed to save');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-[#f59e0b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const percentUsed = summary ? ((summary.totalCost / budgetInput) * 100).toFixed(1) : 0;

  const getSeverityConfig = (severity) => {
    const configs = {
      critical: { 
        icon: HiOutlineExclamationCircle, 
        color: 'text-red-500', 
        bg: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800',
        badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      },
      warning: { 
        icon: HiOutlineExclamationCircle, 
        color: 'text-amber-500', 
        bg: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800',
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      },
      info: { 
        icon: HiOutlineInformationCircle, 
        color: 'text-blue-500', 
        bg: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      },
    };
    return configs[severity] || configs.info;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget & Alerts</h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Manage your monthly budget and view service-specific alerts
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
                className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
              />
            </div>
          </div>

          {/* Alert Threshold Slider */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Alert Threshold: <span className="text-[#f59e0b] font-bold">{threshold}%</span>
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-dark-border rounded-lg appearance-none cursor-pointer accent-[#f59e0b]"
            />
            <div className="flex justify-between mt-1">
              {THRESHOLDS.map(t => (
                <button
                  key={t}
                  onClick={() => setThreshold(t)}
                  className={`text-xs px-2 py-0.5 rounded ${threshold === t ? 'bg-[#f59e0b] text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
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
            className="w-full bg-gradient-to-r from-[#f59e0b] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309] text-white font-semibold py-2.5 rounded-lg text-sm transition-all duration-200"
          >
            Save Settings
          </button>
        </div>

        {/* Service-Specific Alerts */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-6 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <HiOutlineBell className="w-5 h-5 text-[#f59e0b]" />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Service Alerts</h3>
            <span className="ml-auto text-xs text-gray-500 dark:text-dark-muted">{alerts.length} active</span>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <HiOutlineBell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-dark-muted">No alerts at this time</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Alerts will appear when services exceed thresholds</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {alerts.map(alert => {
                const cfg = getSeverityConfig(alert.severity);
                const Icon = cfg.icon;
                return (
                  <div key={alert.id} className={`rounded-lg border p-4 ${cfg.bg}`}>
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
                            {alert.service}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-dark-muted">{alert.date}</span>
                        </div>
                        <p className="text-sm text-gray-800 dark:text-white">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
