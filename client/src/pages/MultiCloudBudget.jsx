import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineBell, HiOutlineExclamation } from 'react-icons/hi';

const PROVIDER_COLORS = {
  AWS: '#FF9900',
  Azure: '#0078D4',
  GCP: '#4285F4'
};

export default function MultiCloudBudget() {
  const [budgets, setBudgets] = useState([
    { id: 1, provider: 'AWS', name: 'Production AWS', limit: 5000, current: 3200, alerts: ['80%', '90%'] },
    { id: 2, provider: 'Azure', name: 'Development Azure', limit: 3000, current: 2100, alerts: ['75%', '90%'] },
    { id: 3, provider: 'GCP', name: 'Testing GCP', limit: 2000, current: 1500, alerts: ['80%'] }
  ]);

  const [alerts, setAlerts] = useState([
    { id: 1, provider: 'AWS', service: 'EC2', message: 'Spending exceeded 80% of budget', severity: 'warning', date: '2026-04-05' },
    { id: 2, provider: 'Azure', service: 'Virtual Machines', message: 'Unusual spike in costs detected', severity: 'high', date: '2026-04-04' },
    { id: 3, provider: 'GCP', service: 'Compute Engine', message: 'Approaching budget limit', severity: 'warning', date: '2026-04-03' }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newBudget, setNewBudget] = useState({
    provider: 'AWS',
    name: '',
    limit: '',
    alerts: ['80', '90']
  });

  const handleAddBudget = (e) => {
    e.preventDefault();
    const budget = {
      id: Date.now(),
      provider: newBudget.provider,
      name: newBudget.name,
      limit: parseFloat(newBudget.limit),
      current: 0,
      alerts: newBudget.alerts.map(a => `${a}%`)
    };
    setBudgets([...budgets, budget]);
    setShowAddModal(false);
    setNewBudget({ provider: 'AWS', name: '', limit: '', alerts: ['80', '90'] });
  };

  const handleDeleteBudget = (id) => {
    if (confirm('Delete this budget?')) {
      setBudgets(budgets.filter(b => b.id !== id));
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'warning': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Multi-Cloud Budget & Alerts</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Set budgets and alerts for each cloud provider
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Budget
        </button>
      </div>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map(budget => {
          const percentage = ((budget.current / budget.limit) * 100).toFixed(1);
          const isWarning = percentage >= 80;
          const isDanger = percentage >= 90;
          
          return (
            <div key={budget.id} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PROVIDER_COLORS[budget.provider] }} />
                  <span className="text-sm font-medium text-gray-500 dark:text-dark-muted">{budget.provider}</span>
                </div>
                <button
                  onClick={() => handleDeleteBudget(budget.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{budget.name}</h3>
              
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-dark-muted">Budget Usage</span>
                  <span className={`font-semibold ${isDanger ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-green-600'}`}>
                    {percentage}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      background: isDanger ? 'linear-gradient(90deg, #ef4444, #dc2626)' 
                        : isWarning ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                        : 'linear-gradient(90deg, #10b981, #059669)'
                    }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-dark-muted">
                  ${budget.current.toLocaleString()} / ${budget.limit.toLocaleString()}
                </span>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-border">
                <p className="text-xs text-gray-500 dark:text-dark-muted mb-1">Alert Thresholds:</p>
                <div className="flex gap-2">
                  {budget.alerts.map((alert, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-dark-border text-xs rounded">
                      {alert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Alerts */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <HiOutlineBell className="w-5 h-5 text-gray-700 dark:text-white" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Alerts</h3>
        </div>
        
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-dark-border/30 rounded-lg">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getSeverityColor(alert.severity)}`}>
                <HiOutlineExclamation className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PROVIDER_COLORS[alert.provider] }} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{alert.provider} - {alert.service}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{alert.message}</p>
                <p className="text-xs text-gray-400 dark:text-dark-muted mt-1">{alert.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Budget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Budget</h2>
            
            <form onSubmit={handleAddBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cloud Provider
                </label>
                <select
                  value={newBudget.provider}
                  onChange={(e) => setNewBudget({ ...newBudget, provider: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-border text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent"
                >
                  <option value="AWS">AWS</option>
                  <option value="Azure">Azure</option>
                  <option value="GCP">GCP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget Name
                </label>
                <input
                  type="text"
                  required
                  value={newBudget.name}
                  onChange={(e) => setNewBudget({ ...newBudget, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-border text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent"
                  placeholder="Production Environment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Limit ($)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newBudget.limit}
                  onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-border text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent"
                  placeholder="5000"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Add Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
