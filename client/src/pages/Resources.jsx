import { useState, useEffect } from 'react';
import { costAPI } from '../services/api';
import { HiOutlineServer, HiOutlineDatabase, HiOutlineGlobeAlt, HiOutlineChip } from 'react-icons/hi';

const ICON_MAP = {
  compute: HiOutlineChip,
  storage: HiOutlineDatabase,
  network: HiOutlineGlobeAlt,
  database: HiOutlineDatabase,
  other: HiOutlineServer,
};

const COLOR_MAP = {
  compute: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', bar: '#2563eb' },
  storage: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', bar: '#f59e0b' },
  network: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', bar: '#10b981' },
  database: { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400', bar: '#8b5cf6' },
  other: { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', bar: '#6b7280' },
};

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    costAPI.resources()
      .then(res => setResources(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Group by resource type
  const grouped = resources.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resource Usage</h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Monitor compute, storage, and network utilization
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(grouped).map(([type, items]) => {
          const totalCost = items.reduce((s, i) => s + i.totalCost, 0);
          const avgUtil = Math.round(items.reduce((s, i) => s + i.utilization, 0) / items.length);
          const Icon = ICON_MAP[type] || HiOutlineServer;
          const colors = COLOR_MAP[type] || COLOR_MAP.other;

          return (
            <div key={type} className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-5 shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{type}</p>
                  <p className="text-xs text-gray-400 dark:text-dark-muted">{items.length} resources</p>
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">${totalCost.toLocaleString()}</p>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500 dark:text-dark-muted">Avg. Utilization</span>
                  <span className={`font-medium ${avgUtil > 70 ? 'text-emerald-500' : avgUtil > 40 ? 'text-amber-500' : 'text-red-500'}`}>
                    {avgUtil}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${avgUtil}%`,
                      backgroundColor: avgUtil > 70 ? '#10b981' : avgUtil > 40 ? '#f59e0b' : '#ef4444'
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resource details table */}
      <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-5 shadow-card">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">All Resources</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-border">
                <th className="text-left py-2 px-3 text-gray-500 dark:text-dark-muted font-medium">Type</th>
                <th className="text-left py-2 px-3 text-gray-500 dark:text-dark-muted font-medium">Provider</th>
                <th className="text-right py-2 px-3 text-gray-500 dark:text-dark-muted font-medium">Cost</th>
                <th className="text-right py-2 px-3 text-gray-500 dark:text-dark-muted font-medium">Hours</th>
                <th className="text-right py-2 px-3 text-gray-500 dark:text-dark-muted font-medium">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r, i) => {
                const colors = COLOR_MAP[r.type] || COLOR_MAP.other;
                return (
                  <tr key={i} className="border-b border-gray-50 dark:border-dark-border/50 table-row-hover">
                    <td className="py-2.5 px-3">
                      <span className="capitalize text-gray-900 dark:text-white font-medium">{r.type}</span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 dark:text-dark-muted">{r.provider}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-gray-900 dark:text-white">
                      ${r.totalCost.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-500 dark:text-dark-muted">
                      {r.totalHours.toLocaleString()}h
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${r.utilization}%`,
                              backgroundColor: r.utilization > 70 ? '#10b981' : r.utilization > 40 ? '#f59e0b' : '#ef4444'
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-dark-muted w-8 text-right">
                          {r.utilization}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
