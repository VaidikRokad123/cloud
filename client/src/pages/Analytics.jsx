import { useState, useEffect } from 'react';
import { costAPI } from '../services/api';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const PROVIDER_COLORS = { AWS: '#22c55e', Azure: '#3b82f6', GCP: '#10b981' };

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: ${p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [trends, setTrends] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [overview, setOverview] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [trRes, ovRes] = await Promise.all([
          costAPI.trends(days),
          costAPI.overview(),
        ]);
        setTrends(trRes.data.trends || []);
        setPredictions(trRes.data.predictions || []);
        setOverview(ovRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [days]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">Detailed cost analysis and predictions</p>
        </div>
        <select
          value={days}
          onChange={e => setDays(Number(e.target.value))}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={60}>Last 60 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Daily spending by provider */}
      <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-5 shadow-card">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Daily Spending by Provider</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={trends} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={v => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="AWS" fill="#22c55e" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Azure" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            <Bar dataKey="GCP" fill="#10b981" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Total daily spending trend */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-5 shadow-card">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Total Daily Spending</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} dot={false} name="Total" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cost prediction */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-5 shadow-card">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">Cost Prediction (Next 7 Days)</h3>
          <p className="text-xs text-gray-400 dark:text-dark-muted mb-4">Based on linear regression model</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={predictions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v) => `$${v}`} />
              <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Predicted" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Service-wise and Resource-type breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-5 shadow-card">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Top Services</h3>
          <div className="space-y-3">
            {overview?.byService?.slice(0, 8).map((s, i) => {
              const maxCost = overview.byService[0]?.total || 1;
              const pct = (s.total / maxCost * 100).toFixed(0);
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-dark-text font-medium">{s.service}</span>
                    <span className="text-gray-500 dark:text-dark-muted">${s.total.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: PROVIDER_COLORS[s.provider] || '#2563eb' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-5 shadow-card">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Cost by Resource Type</h3>
          <div className="space-y-3">
            {overview?.byResourceType?.map((r, i) => {
              const total = overview.byResourceType.reduce((s, t) => s + t.total, 0);
              const pct = ((r.total / total) * 100).toFixed(1);
              const colors = { compute: '#2563eb', storage: '#22c55e', network: '#10b981', database: '#8b5cf6', other: '#6b7280' };
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-dark-text font-medium capitalize">{r.type}</span>
                    <span className="text-gray-500 dark:text-dark-muted">{pct}% · ${r.total.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: colors[r.type] || '#6b7280' }}
                    />
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
