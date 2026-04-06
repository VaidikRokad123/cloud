import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { HiOutlineDownload, HiOutlineCalendar } from 'react-icons/hi';

const PROVIDER_COLORS = {
  AWS: '#FF9900',
  Azure: '#0078D4',
  GCP: '#4285F4'
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

export default function MultiCloudReports() {
  const [dateRange, setDateRange] = useState('month');

  // Mock data
  const monthlyData = [
    { month: 'Oct', AWS: 4200, Azure: 3100, GCP: 2800 },
    { month: 'Nov', AWS: 4500, Azure: 3300, GCP: 2900 },
    { month: 'Dec', AWS: 4800, Azure: 3500, GCP: 3100 },
    { month: 'Jan', AWS: 5100, Azure: 3700, GCP: 3300 },
    { month: 'Feb', AWS: 4900, Azure: 3600, GCP: 3200 },
    { month: 'Mar', AWS: 5300, Azure: 3900, GCP: 3500 }
  ];

  const providerBreakdown = [
    { provider: 'AWS', cost: 5300 },
    { provider: 'Azure', cost: 3900 },
    { provider: 'GCP', cost: 3500 }
  ];

  const serviceBreakdown = {
    AWS: [
      { service: 'EC2', cost: 1800 },
      { service: 'S3', cost: 1200 },
      { service: 'RDS', cost: 1100 },
      { service: 'Lambda', cost: 800 },
      { service: 'Others', cost: 400 }
    ],
    Azure: [
      { service: 'Virtual Machines', cost: 1400 },
      { service: 'Blob Storage', cost: 900 },
      { service: 'SQL Database', cost: 800 },
      { service: 'App Service', cost: 600 },
      { service: 'Others', cost: 200 }
    ],
    GCP: [
      { service: 'Compute Engine', cost: 1300 },
      { service: 'Cloud Storage', cost: 800 },
      { service: 'Cloud SQL', cost: 700 },
      { service: 'Cloud Functions', cost: 500 },
      { service: 'Others', cost: 200 }
    ]
  };

  const totalCost = providerBreakdown.reduce((sum, p) => sum + p.cost, 0);

  const handleExport = () => {
    const csvData = monthlyData.map(m => 
      `${m.month},${m.AWS},${m.Azure},${m.GCP}`
    ).join('\n');
    const header = 'Month,AWS,Azure,GCP\n';
    const blob = new Blob([header + csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'multi-cloud-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Multi-Cloud Reports</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Comprehensive cost reports across all providers
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-[#22c55e] to-[#16a34a] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <HiOutlineDownload className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-5 shadow-card">
          <p className="text-sm text-gray-500 dark:text-dark-muted mb-1">Total Spend (This Month)</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalCost.toLocaleString()}</p>
        </div>
        {providerBreakdown.map(provider => (
          <div key={provider.provider} className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-5 shadow-card">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PROVIDER_COLORS[provider.provider] }} />
              <p className="text-sm text-gray-500 dark:text-dark-muted">{provider.provider}</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${provider.cost.toLocaleString()}</p>
            <p className="text-xs text-gray-400 dark:text-dark-muted mt-1">
              {((provider.cost / totalCost) * 100).toFixed(1)}% of total
            </p>
          </div>
        ))}
      </div>

      {/* Monthly Trend */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 shadow-lg h-[400px] flex flex-col">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">6-Month Cost Trend</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="AWS" stroke={PROVIDER_COLORS.AWS} strokeWidth={2.5} dot={{ r: 4 }} name="AWS" />
              <Line type="monotone" dataKey="Azure" stroke={PROVIDER_COLORS.Azure} strokeWidth={2.5} dot={{ r: 4 }} name="Azure" />
              <Line type="monotone" dataKey="GCP" stroke={PROVIDER_COLORS.GCP} strokeWidth={2.5} dot={{ r: 4 }} name="GCP" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Service Breakdown by Provider */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(serviceBreakdown).map(([provider, services]) => (
          <div key={provider} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PROVIDER_COLORS[provider] }} />
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{provider} Services</h3>
            </div>
            
            <div className="h-[200px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={services}
                    dataKey="cost"
                    nameKey="service"
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    fill={PROVIDER_COLORS[provider]}
                  >
                    {services.map((_, i) => (
                      <Cell key={i} fill={PROVIDER_COLORS[provider]} opacity={1 - (i * 0.15)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {services.map((service, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">{service.service}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">${service.cost.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Cost Comparison Table */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-5 shadow-lg">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Monthly Comparison Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-border">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-white">Month</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-white">AWS</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-white">Azure</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-white">GCP</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-white">Total</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((row, i) => {
                const total = row.AWS + row.Azure + row.GCP;
                return (
                  <tr key={i} className="border-b border-gray-100 dark:border-dark-border/50">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{row.month}</td>
                    <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-300">${row.AWS.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-300">${row.Azure.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-300">${row.GCP.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">${total.toLocaleString()}</td>
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
