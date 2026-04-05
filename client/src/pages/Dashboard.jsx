import { useState, useEffect, useRef } from 'react';
import { costAPI, budgetAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import {
  HiOutlineCurrencyDollar, HiOutlineTrendingUp, HiOutlineChartPie, HiOutlineCalendar
} from 'react-icons/hi';

const SERVICE_COLORS = ['#1a73e8', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];
const TYPE_COLORS = { Compute: '#1a73e8', Storage: '#f59e0b', Database: '#8b5cf6', Network: '#10b981' };

// Reusable Card Component
function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 shadow-lg flex flex-col ${className}`}>
      {title && <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">{title}</h3>}
      {children}
    </div>
  );
}

// Chart Wrapper Component
function ChartWrapper({ children }) {
  return (
    <div className="flex-1 min-h-0">
      {children}
    </div>
  );
}

// Animated counter hook
function useAnimatedCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);
  return count;
}

function StatCard({ title, value, displayValue, icon: Icon, color, delay }) {
  const animatedVal = useAnimatedCounter(value);
  return (
    <div className={`animate-fade-in stagger-${delay} bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-5 shadow-card hover:shadow-card-hover transition-all duration-200`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-dark-muted font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {displayValue ? displayValue(animatedVal) : animatedVal}
          </p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

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

export default function Dashboard() {
  const { convertCost, currencySymbol, rawConvert } = useApp();
  const [summary, setSummary] = useState(null);
  const [services, setServices] = useState([]);
  const [daily, setDaily] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sumRes, svcRes, dayRes, monRes] = await Promise.all([
          costAPI.summary(),
          costAPI.services(),
          costAPI.daily(),
          costAPI.monthly(),
        ]);
        setSummary(sumRes.data);
        setServices(svcRes.data.filter(s => s.status === 'active'));
        setDaily(dayRes.data);
        setMonthly(monRes.data);
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

  const budgetPercent = summary?.percentUsed || 0;
  const avgDaily = daily.length > 0 ? daily.reduce((s, d) => s + d.cost, 0) / daily.length : 0;
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - today.getDate();
  const forecastedTotal = (summary?.totalCost || 0) + avgDaily * daysRemaining;
  const top3 = [...services].sort((a, b) => b.cost - a.cost).slice(0, 3);
  const dailyConverted = daily.map(d => ({ ...d, cost: rawConvert(d.cost) }));
  const monthlyConverted = monthly.map(d => ({ ...d, cost: rawConvert(d.cost) }));

  const typeData = Object.entries(
    services.reduce((acc, s) => { acc[s.type] = (acc[s.type] || 0) + s.cost; return acc; }, {})
  ).map(([type, cost]) => ({ type, cost: rawConvert(cost) }));

  let cumulative = 0;
  const cumulativeDaily = dailyConverted.map(d => {
    cumulative += d.cost;
    return { ...d, cumulative: Math.round(cumulative) };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Overview of your cloud infrastructure costs
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Cost (This Month)" value={rawConvert(summary?.totalCost || 0)}
          displayValue={(v) => `${currencySymbol}${v.toLocaleString()}`}
          icon={HiOutlineCurrencyDollar} color="bg-gradient-to-br from-[#f59e0b] to-[#d97706]" delay={1} />
        <StatCard title="Budget" value={rawConvert(summary?.budget || 0)}
          displayValue={(v) => `${currencySymbol}${v.toLocaleString()}`}
          icon={HiOutlineChartPie} color="bg-gradient-to-br from-emerald-500 to-emerald-600" delay={2} />
        <StatCard title="Budget Used" value={Math.round(budgetPercent)}
          displayValue={(v) => `${v}%`}
          icon={HiOutlineTrendingUp}
          color={budgetPercent > 80 ? 'bg-gradient-to-br from-red-500 to-red-600' : budgetPercent > 60 ? 'bg-gradient-to-br from-amber-500 to-amber-600' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'} delay={3} />
        <StatCard title="Forecasted (EOM)" value={rawConvert(Math.round(forecastedTotal))}
          displayValue={(v) => `${currencySymbol}${v.toLocaleString()}`}
          icon={HiOutlineCalendar} color="bg-gradient-to-br from-violet-500 to-violet-600" delay={4} />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Budget Usage</h3>
          <span className={`text-sm font-bold ${budgetPercent > 80 ? 'text-red-500' : budgetPercent > 60 ? 'text-amber-500' : 'text-emerald-500'}`}>
            {budgetPercent}%
          </span>
        </div>
        <div className="w-full h-4 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${Math.min(budgetPercent, 100)}%`,
              background: budgetPercent > 80 ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                : budgetPercent > 60 ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                  : 'linear-gradient(90deg, #10b981, #059669)',
            }} />
        </div>
        <p className="text-xs text-gray-400 dark:text-dark-muted mt-2">
          {convertCost(summary?.totalCost || 0)} of {convertCost(summary?.budget || 0)} budget used
        </p>
      </Card>

      <Card title="Daily Cost Trend (Last 30 Days)" className="h-[350px]">
        <ChartWrapper>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyConverted}>
              <defs>
                <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1a73e8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={v => `${currencySymbol}${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cost" stroke="#1a73e8" fill="url(#dailyGrad)" strokeWidth={2.5} name="Daily Cost" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <Card title="Cost by Type" className="h-[350px]">
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} barSize={35}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="type" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={v => `${currencySymbol}${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="cost" radius={[4, 4, 0, 0]} name="Cost">
                  {typeData.map((entry, i) => (
                    <Cell key={i} fill={TYPE_COLORS[entry.type] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </Card>

        <Card title="Cost by Service" className="h-[350px]">
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {services.sort((a, b) => b.cost - a.cost).map((s, i) => {
              const maxServiceCost = services[0]?.cost || 1;
              const pct = ((s.cost / maxServiceCost) * 100).toFixed(0);
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-700 dark:text-white font-medium">{s.name}</span>
                    <span className="text-gray-500 dark:text-dark-muted font-semibold">{convertCost(s.cost)}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: SERVICE_COLORS[i % SERVICE_COLORS.length] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Service Distribution" className="h-[350px]">
          <ChartWrapper>
            <div className="flex items-center justify-center h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={services} dataKey="cost" nameKey="name" cx="50%" cy="50%"
                    outerRadius="70%" innerRadius="50%" strokeWidth={2}>
                    {services.map((_, i) => (<Cell key={i} fill={SERVICE_COLORS[i % SERVICE_COLORS.length]} />))}
                  </Pie>
                  <Tooltip formatter={(v) => convertCost(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartWrapper>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <Card title="Monthly Trend" className="h-[350px]">
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyConverted}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={v => `${currencySymbol}${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="cost" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} name="Monthly" />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </Card>

        <Card title="Cumulative Spend" className="h-[350px]">
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeDaily}>
                <defs>
                  <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={v => `${currencySymbol}${v.toLocaleString()}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="cumulative" stroke="#8b5cf6" fill="url(#cumGrad)" strokeWidth={2} name="Cumulative" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </Card>
      </div>

      <Card title="Top 3 Cost Drivers">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {top3.map((s, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-dark-border/30">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: SERVICE_COLORS[i] }}>
                #{i + 1}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.name}</p>
                <p className="text-xs text-gray-500 dark:text-dark-muted">{s.type}</p>
                <p className="text-sm font-bold text-[#1a73e8] mt-0.5">{convertCost(s.cost)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
