import { useState, useEffect } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { HiOutlineRefresh } from 'react-icons/hi';

const PROVIDER_COLORS = {
  AWS: '#FF9900',
  Azure: '#0078D4',
  GCP: '#4285F4'
};

const PROVIDER_ICONS = {
  AWS: '☁️',
  Azure: '☁️',
  GCP: '☁️'
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>
          {p.name}: ${p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function MultiCloudComparison() {
  const { convertCost, currencySymbol, rawConvert } = useApp();
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    fetchComparison();
  }, [dateRange]);

  const fetchComparison = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('cloudcost_token');
      const res = await axios.get('/api/cloud/comparison', {
        headers: { Authorization: `Bearer ${token}` },
        params: { dateRange }
      });
      setComparison(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!comparison || !comparison.providers || comparison.providers.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Multi-Cloud Comparison</h1>
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-12 text-center">
          <p className="text-gray-500 dark:text-dark-muted">No cloud accounts connected. Add accounts to see comparison.</p>
        </div>
      </div>
    );
  }

  const providerData = comparison.providers.map(p => ({
    provider: p._id,
    cost: rawConvert(p.totalCost),
    services: p.services.length
  }));

  const totalCost = comparison.providers.reduce((sum, p) => sum + p.totalCost, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Multi-Cloud Comparison</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Compare costs across AWS, Azure, and GCP
          </p>
        </div>
        <button
          onClick={fetchComparison}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <HiOutlineRefresh className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Provider Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {comparison.providers.map(provider => {
          const percentage = ((provider.totalCost / totalCost) * 100).toFixed(1);
          return (
            <div key={provider._id} className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-5 shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: PROVIDER_COLORS[provider._id] }}>
                  {PROVIDER_ICONS[provider._id]}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-dark-muted">{provider._id}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{convertCost(provider.totalCost)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-dark-muted">{provider.services.length} services</span>
                <span className="font-semibold" style={{ color: PROVIDER_COLORS[provider._id] }}>{percentage}% of total</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Comparison Bar Chart */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 shadow-lg h-[350px] flex flex-col">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Cost by Provider</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={providerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="provider" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={v => `${currencySymbol}${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="cost" radius={[6, 6, 0, 0]} name="Cost">
                  {providerData.map((entry, i) => (
                    <Cell key={i} fill={PROVIDER_COLORS[entry.provider]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Distribution Pie Chart */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 shadow-lg h-[350px] flex flex-col">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Cost Distribution</h3>
          <div className="flex-1 min-h-0">
            <div className="flex items-center justify-center h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={providerData}
                    dataKey="cost"
                    nameKey="provider"
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    innerRadius="50%"
                    strokeWidth={2}
                  >
                    {providerData.map((entry, i) => (
                      <Cell key={i} fill={PROVIDER_COLORS[entry.provider]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${currencySymbol}${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Service Breakdown by Provider */}
      {comparison.serviceBreakdown && comparison.serviceBreakdown.length > 0 && (
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Service Breakdown by Provider</h3>
          <div className="space-y-6">
            {comparison.serviceBreakdown.map(provider => (
              <div key={provider._id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{PROVIDER_ICONS[provider._id]}</span>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{provider._id}</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {provider.services.slice(0, 6).map((service, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-border/30 rounded-lg">
                      <span className="text-sm text-gray-700 dark:text-white">{service.name}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{convertCost(service.cost)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cost Savings Recommendations */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">💡 Multi-Cloud Optimization Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>• Consider using reserved instances across all providers for predictable workloads</li>
          <li>• Compare pricing for similar services (e.g., AWS S3 vs Azure Blob vs GCP Cloud Storage)</li>
          <li>• Use spot instances/preemptible VMs for non-critical workloads</li>
          <li>• Set up budget alerts for each cloud provider</li>
          <li>• Review and delete unused resources regularly</li>
        </ul>
      </div>
    </div>
  );
}
