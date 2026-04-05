import { useState, useEffect } from 'react';
import { costAPI } from '../services/api';
import { HiOutlineLightningBolt, HiOutlineArrowDown, HiOutlineClock, HiOutlineCheckCircle } from 'react-icons/hi';

const TYPE_CONFIG = {
  idle: {
    icon: HiOutlineClock,
    color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    iconColor: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  rightsize: {
    icon: HiOutlineArrowDown,
    color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    iconColor: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  reserved: {
    icon: HiOutlineCheckCircle,
    color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    iconColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
};

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 };

export default function Optimizations() {
  const [data, setData] = useState({ suggestions: [], totalEstimatedSavings: 0 });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    costAPI.optimizations()
      .then(res => setData(res.data))
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

  const filtered = filterType
    ? data.suggestions.filter(s => s.type === filterType)
    : data.suggestions;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Optimization Suggestions</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            AI-powered recommendations to reduce your cloud spending
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Potential Monthly Savings</p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            ${data.totalEstimatedSavings.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['', 'idle', 'rightsize', 'reserved'].map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === t
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-dark-muted hover:bg-gray-200 dark:hover:bg-dark-border'
            }`}
          >
            {t === '' ? 'All' : t === 'idle' ? 'Idle Resources' : t === 'rightsize' ? 'Right-size' : 'Reserved Instances'}
          </button>
        ))}
      </div>

      {/* Suggestions */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <HiOutlineLightningBolt className="w-12 h-12 text-gray-300 dark:text-dark-border mx-auto mb-3" />
          <p className="text-gray-500 dark:text-dark-muted">No suggestions for this filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(s => {
            const cfg = TYPE_CONFIG[s.type] || TYPE_CONFIG.idle;
            const Icon = cfg.icon;

            return (
              <div
                key={s.id}
                className={`rounded-xl border p-5 shadow-card hover:shadow-card-hover transition-shadow ${cfg.color}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cfg.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{s.title}</h3>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cfg.badge}`}>
                        {s.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-dark-muted leading-relaxed mb-3">
                      {s.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 dark:text-dark-muted">
                        {s.provider} · {s.service}
                      </span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        Save ~${s.estimatedSavings.toLocaleString()}/mo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
