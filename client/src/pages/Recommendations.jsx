import { useState, useEffect } from 'react';
import { recommendationAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { HiOutlineLightningBolt, HiOutlineArrowDown, HiOutlineClock, HiOutlineCheckCircle, HiOutlineChip } from 'react-icons/hi';

const CARD_COLORS = [
  'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800',
  'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800',
  'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800',
  'bg-violet-50 dark:bg-violet-900/10 border-violet-200 dark:border-violet-800',
  'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800',
];

const ICONS = [HiOutlineClock, HiOutlineArrowDown, HiOutlineCheckCircle, HiOutlineChip, HiOutlineLightningBolt];
const ICON_COLORS = ['text-red-500', 'text-amber-500', 'text-blue-500', 'text-violet-500', 'text-emerald-500'];
const BADGE_COLORS = [
  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
];

export default function Recommendations() {
  const { convertCost } = useApp();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recommendationAPI.list()
      .then(res => setRecs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalSavings = recs.reduce((s, r) => s + r.estimatedSavings, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recommendations</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            AI-powered cost optimization suggestions
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-5 py-3">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Total Potential Savings</p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {convertCost(totalSavings)}/mo
          </p>
        </div>
      </div>

      {/* Recommendation cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {recs.map((rec, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div key={rec.id} className={`rounded-xl border p-5 shadow-card hover:shadow-card-hover transition-all duration-200 ${CARD_COLORS[i % CARD_COLORS.length]}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-white dark:bg-dark-card`}>
                  <Icon className={`w-5 h-5 ${ICON_COLORS[i % ICON_COLORS.length]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  {/* Issue */}
                  <p className="text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wide mb-1">Issue</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{rec.issue}</p>

                  {/* Recommendation */}
                  <p className="text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wide mb-1">Recommendation</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{rec.recommendation}</p>

                  {/* Savings badge */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${BADGE_COLORS[i % BADGE_COLORS.length]}`}>
                    <HiOutlineLightningBolt className="w-4 h-4" />
                    Save {convertCost(rec.estimatedSavings)}/month
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
