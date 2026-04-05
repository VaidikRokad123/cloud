import { useState, useEffect } from 'react';
import { costAPI, exportAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { HiOutlineDownload, HiOutlineTrendingUp, HiOutlineTrendingDown } from 'react-icons/hi';

const SERVICE_COLORS = ['#1a73e8', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];
const DATE_RANGES = [
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Last 3 Months', value: '3months' },
];

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

export default function Reports() {
  const { convertCost, currencySymbol, rawConvert } = useApp();
  const [monthly, setMonthly] = useState([]);
  const [daily, setDaily] = useState([]);
  const [services, setServices] = useState([]);
  const [range, setRange] = useState('3months');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [monRes, dayRes, svcRes, rangeRes] = await Promise.all([
          costAPI.monthly(),
          costAPI.daily(),
          costAPI.services(),
          exportAPI.dateRange(),
        ]);
        setMonthly(monRes.data);
        setDaily(dayRes.data);
        setServices(svcRes.data.filter(s => s.status === 'active'));
        setDateRange(rangeRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filter monthly data based on range
  let filteredMonthly = monthly;
  if (range === 'month') filteredMonthly = monthly.slice(-1);
  else if (range === 'week') filteredMonthly = monthly.slice(-1);
  else filteredMonthly = monthly.slice(-3);

  // Comparison card
  const currentMonth = monthly[monthly.length - 1]?.cost || 0;
  const lastMonth = monthly[monthly.length - 2]?.cost || 0;
  const changePercent = lastMonth > 0 ? (((currentMonth - lastMonth) / lastMonth) * 100).toFixed(1) : 0;
  const isMore = changePercent > 0;

  // Convert for charts
  const monthlyConverted = filteredMonthly.map(d => ({ ...d, cost: rawConvert(d.cost) }));
  const allMonthlyConverted = monthly.map(d => ({ ...d, cost: rawConvert(d.cost) }));
  const dailyConverted = daily.map(d => ({ ...d, cost: rawConvert(d.cost) }));

  // Daily with moving average (7-day)
  const dailyWithMA = dailyConverted.map((d, i) => {
    const window = dailyConverted.slice(Math.max(0, i - 6), i + 1);
    const ma = Math.round(window.reduce((s, w) => s + w.cost, 0) / window.length);
    return { ...d, movingAvg: ma };
  });

  // Cumulative daily
  let cum = 0;
  const cumulativeDaily = dailyConverted.map(d => {
    cum += d.cost;
    return { ...d, cumulative: Math.round(cum) };
  });

  // Group services by type for pie
  const typeData = Object.entries(
    services.reduce((acc, s) => { acc[s.type] = (acc[s.type] || 0) + s.cost; return acc; }, {})
  ).map(([type, cost]) => ({ name: type, value: rawConvert(cost) }));

  // Export to S3 and download
  const handleExport = async () => {
    if (!dateRange?.hasData) return;

    setExporting(true);
    try {
      const response = await exportAPI.costs(dateRange.startDate, dateRange.endDate);
      
      if (response.data.success) {
        // Auto-download the file from S3
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.download = `cost-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  // Stats
  const totalSpend = monthly.reduce((s, m) => s + m.cost, 0);
  const avgMonthly = Math.round(totalSpend / monthly.length);
  const highestMonth = monthly.reduce((max, m) => m.cost > max.cost ? m : max, monthly[0]);
  const lowestMonth = monthly.reduce((min, m) => m.cost < min.cost ? m : min, monthly[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Cost analysis, trends, and comparisons
          </p>
        </div>
        <button onClick={handleExport}
          disabled={exporting || !dateRange?.hasData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a73e8] hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <HiOutlineDownload className="w-4 h-4" />
          {exporting ? 'Exporting...' : 'Export to S3'}
        </button>
      </div>

      {/* Date range + Summary card */}
      <div className="flex gap-2 flex-wrap">
        {DATE_RANGES.map(r => (
          <button key={r.value} onClick={() => setRange(r.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              range === r.value ? 'bg-[#1a73e8] text-white'
                : 'bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-dark-muted hover:bg-gray-200 dark:hover:bg-dark-border'
            }`}>
            {r.label}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-xl border p-4 shadow-card ${isMore ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'}`}>
          <div className="flex items-center gap-2 mb-1">
            {isMore ? <HiOutlineTrendingUp className="w-5 h-5 text-red-500" /> : <HiOutlineTrendingDown className="w-5 h-5 text-green-500" />}
            <p className="text-xs font-medium text-gray-500 dark:text-dark-muted">vs Last Month</p>
          </div>
          <p className={`text-xl font-bold ${isMore ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
            {Math.abs(changePercent)}% {isMore ? 'more' : 'less'}
          </p>
        </div>
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-4 shadow-card">
          <p className="text-xs font-medium text-gray-500 dark:text-dark-muted mb-1">6-Month Total</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{convertCost(totalSpend)}</p>
        </div>
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-4 shadow-card">
          <p className="text-xs font-medium text-gray-500 dark:text-dark-muted mb-1">Highest Month</p>
          <p className="text-xl font-bold text-red-500">{convertCost(highestMonth?.cost || 0)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{highestMonth?.month}</p>
        </div>
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-4 shadow-card">
          <p className="text-xs font-medium text-gray-500 dark:text-dark-muted mb-1">Avg Monthly</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{convertCost(avgMonthly)}</p>
        </div>
      </div>

      {/* Row 1: Monthly bar chart */}
      <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-5 shadow-card">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Monthly Cost Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyConverted} barSize={50}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={v => `${currencySymbol}${v.toLocaleString()}`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="cost" fill="#1a73e8" radius={[6, 6, 0, 0]} name="Monthly Cost" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Row 2: Daily trend with moving avg + Cost by type pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-5 shadow-card">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">Daily Spending Trend</h3>
          <p className="text-xs text-gray-400 dark:text-dark-muted mb-4">With 7-day moving average</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyWithMA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={v => `${currencySymbol}${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="cost" stroke="#94a3b8" strokeWidth={1} dot={false} name="Daily" />
              <Line type="monotone" dataKey="movingAvg" stroke="#1a73e8" strokeWidth={2.5} dot={false} name="7-Day Avg" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-5 shadow-card">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Cost by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                outerRadius={75} innerRadius={40} strokeWidth={2}>
                {typeData.map((_, i) => (<Cell key={i} fill={SERVICE_COLORS[i % SERVICE_COLORS.length]} />))}
              </Pie>
              <Tooltip formatter={(v) => `${currencySymbol}${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {typeData.map((t, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SERVICE_COLORS[i % SERVICE_COLORS.length] }} />
                  <span className="text-gray-600 dark:text-dark-muted">{t.name}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{currencySymbol}{t.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Cumulative spend + Monthly trend line */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-5 shadow-card">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Cumulative Spend (30 Days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={cumulativeDaily}>
              <defs>
                <linearGradient id="repCumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={v => `${currencySymbol}${v.toLocaleString()}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cumulative" stroke="#10b981" fill="url(#repCumGrad)" strokeWidth={2} name="Cumulative" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-5 shadow-card">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">6-Month Spending Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={allMonthlyConverted}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={v => `${currencySymbol}${v.toLocaleString()}`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="cost" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4, fill: '#8b5cf6' }} name="Monthly" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-service breakdown bars */}
      <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-5 shadow-card">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Service Cost Breakdown</h3>
        <div className="space-y-3">
          {services.sort((a, b) => b.cost - a.cost).map((s, i) => {
            const maxCost = services[0]?.cost || 1;
            const pct = ((s.cost / maxCost) * 100).toFixed(0);
            return (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-white font-medium">{s.name} <span className="text-xs text-gray-400">({s.type})</span></span>
                  <span className="text-gray-500 dark:text-dark-muted font-semibold">{convertCost(s.cost)}</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: SERVICE_COLORS[i % SERVICE_COLORS.length] }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
