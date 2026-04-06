import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, Cell } from 'recharts';
import { HiOutlineRefresh, HiOutlineClock, HiOutlineDatabase, HiOutlineGlobe } from 'react-icons/hi';

const PROVIDER_COLORS = {
  AWS: '#FF9900',
  Azure: '#0078D4',
  GCP: '#4285F4'
};

const CHART_COLORS = {
  compute: { gradient: ['#22c55e', '#16a34a'], bar: '#22c55e' },
  storage: { gradient: ['#8b5cf6', '#7c3aed'], bar: '#8b5cf6' },
  network: { gradient: ['#f59e0b', '#d97706'], bar: '#f59e0b' },
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.value?.toLocaleString()} {p.unit || ''}
        </p>
      ))}
    </div>
  );
}

export default function MultiCloudUsage() {
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchUsageData();
  }, [timeRange]);

  const fetchUsageData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockData = {
        providers: [
          {
            name: 'AWS',
            computeHours: 8500,
            storageGB: 4200,
            networkGB: 1800,
            apiCalls: 125000,
            trend: [
              { date: '01/01', compute: 1200, storage: 600, network: 250 },
              { date: '01/02', compute: 1350, storage: 620, network: 280 },
              { date: '01/03', compute: 1280, storage: 640, network: 260 },
              { date: '01/04', compute: 1400, storage: 650, network: 290 },
              { date: '01/05', compute: 1320, storage: 670, network: 270 },
              { date: '01/06', compute: 1450, storage: 680, network: 300 },
              { date: '01/07', compute: 1500, storage: 700, network: 320 }
            ]
          },
          {
            name: 'Azure',
            computeHours: 6200,
            storageGB: 3800,
            networkGB: 1500,
            apiCalls: 98000,
            trend: [
              { date: '01/01', compute: 850, storage: 520, network: 200 },
              { date: '01/02', compute: 920, storage: 540, network: 220 },
              { date: '01/03', compute: 880, storage: 550, network: 210 },
              { date: '01/04', compute: 950, storage: 560, network: 230 },
              { date: '01/05', compute: 900, storage: 570, network: 215 },
              { date: '01/06', compute: 980, storage: 580, network: 240 },
              { date: '01/07', compute: 1020, storage: 600, network: 250 }
            ]
          },
          {
            name: 'GCP',
            computeHours: 5800,
            storageGB: 3200,
            networkGB: 1200,
            apiCalls: 87000,
            trend: [
              { date: '01/01', compute: 780, storage: 440, network: 160 },
              { date: '01/02', compute: 850, storage: 460, network: 175 },
              { date: '01/03', compute: 820, storage: 470, network: 165 },
              { date: '01/04', compute: 880, storage: 480, network: 180 },
              { date: '01/05', compute: 840, storage: 490, network: 170 },
              { date: '01/06', compute: 900, storage: 500, network: 190 },
              { date: '01/07', compute: 930, storage: 520, network: 200 }
            ]
          }
        ]
      };
      setUsageData(mockData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-[#22c55e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalCompute = usageData.providers.reduce((sum, p) => sum + p.computeHours, 0);
  const totalStorage = usageData.providers.reduce((sum, p) => sum + p.storageGB, 0);
  const totalNetwork = usageData.providers.reduce((sum, p) => sum + p.networkGB, 0);
  const totalAPICalls = usageData.providers.reduce((sum, p) => sum + p.apiCalls, 0);

  const computeData = usageData.providers.map(p => ({ provider: p.name, hours: p.computeHours }));
  const storageData = usageData.providers.map(p => ({ provider: p.name, gb: p.storageGB }));
  const networkData = usageData.providers.map(p => ({ provider: p.name, gb: p.networkGB }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Multi-Cloud Usage Metrics</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Monitor resource usage across all cloud providers
          </p>
        </div>
        <button
          onClick={fetchUsageData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <HiOutlineRefresh className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-5 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center">
              <HiOutlineClock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-muted">Compute Hours</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCompute.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-5 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center">
              <HiOutlineDatabase className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-muted">Storage (GB)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalStorage.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-5 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center">
              <HiOutlineGlobe className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-muted">Network (GB)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalNetwork.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-5 shadow-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#0891b2] flex items-center justify-center">
              <span className="text-white font-bold text-sm">API</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-dark-muted">API Calls</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{(totalAPICalls / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compute Hours Chart - Green themed */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 shadow-lg h-[350px] flex flex-col">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Compute Hours by Provider</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={computeData}>
                <defs>
                  <linearGradient id="computeGrad-0" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={1} />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="computeGrad-1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="computeGrad-2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="provider" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]} name="Hours">
                  {computeData.map((entry, i) => (
                    <Cell key={i} fill={`url(#computeGrad-${i})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Storage Chart - Purple themed */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 shadow-lg h-[350px] flex flex-col">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Storage Usage (GB)</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storageData}>
                <defs>
                  <linearGradient id="storageGrad-0" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="storageGrad-1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="storageGrad-2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c4b5fd" stopOpacity={1} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="provider" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="gb" radius={[6, 6, 0, 0]} name="GB">
                  {storageData.map((entry, i) => (
                    <Cell key={i} fill={`url(#storageGrad-${i})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Network Chart - Amber/Orange themed */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 shadow-lg h-[350px] flex flex-col">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Network Transfer (GB)</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={networkData}>
                <defs>
                  <linearGradient id="networkGrad-0" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                    <stop offset="100%" stopColor="#d97706" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="networkGrad-1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={1} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="networkGrad-2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fcd34d" stopOpacity={1} />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="provider" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="gb" radius={[6, 6, 0, 0]} name="GB">
                  {networkData.map((entry, i) => (
                    <Cell key={i} fill={`url(#networkGrad-${i})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trend Charts by Provider */}
      {usageData.providers.map(provider => (
        <div key={provider.name} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">
            {provider.name} - 7 Day Usage Trend
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={provider.trend}>
                <defs>
                  <linearGradient id={`compute-${provider.name}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PROVIDER_COLORS[provider.name]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PROVIDER_COLORS[provider.name]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="compute" stroke={PROVIDER_COLORS[provider.name]} fill={`url(#compute-${provider.name})`} strokeWidth={2} name="Compute" />
                <Area type="monotone" dataKey="storage" stroke="#10b981" fill="none" strokeWidth={2} name="Storage" />
                <Area type="monotone" dataKey="network" stroke="#8b5cf6" fill="none" strokeWidth={2} name="Network" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
}
