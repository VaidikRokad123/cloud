import { useState, useEffect } from 'react';
import { billingAPI } from '../services/api';
import { HiOutlineDownload, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import toast from 'react-hot-toast';

const PROVIDER_COLORS = { AWS: '#22c55e', Azure: '#3b82f6', GCP: '#10b981' };
const STATUS_STYLES = {
  paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  overdue: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
};

export default function Billing() {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filter, setFilter] = useState({ provider: '', status: '', page: 1 });
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    setLoading(true);
    billingAPI.history(filter)
      .then(res => {
        setRecords(res.data.records);
        setPagination(res.data.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  const handleExport = async () => {
    try {
      const res = await billingAPI.exportCSV();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'billing-report.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Billing report exported');
    } catch {
      toast.error('Export failed');
    }
  };

  const sorted = [...records].sort((a, b) => {
    let va = a[sortField], vb = b[sortField];
    if (sortField === 'date') { va = new Date(va); vb = new Date(vb); }
    if (sortField === 'cost') { va = Number(va); vb = Number(vb); }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }) => (
    <span className="ml-1 text-xs text-gray-400">{sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : ''}</span>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing History</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">{pagination.total} total records</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <HiOutlineDownload className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filter.provider}
          onChange={e => setFilter({ ...filter, provider: e.target.value, page: 1 })}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Providers</option>
          <option value="AWS">AWS</option>
          <option value="Azure">Azure</option>
          <option value="GCP">GCP</option>
        </select>
        <select
          value={filter.status}
          onChange={e => setFilter({ ...filter, status: e.target.value, page: 1 })}
          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-dark-border/30">
                <tr>
                  <th onClick={() => toggleSort('date')} className="cursor-pointer text-left py-3 px-4 text-gray-500 dark:text-dark-muted font-medium">
                    Date<SortIcon field="date" />
                  </th>
                  <th className="text-left py-3 px-4 text-gray-500 dark:text-dark-muted font-medium">Invoice</th>
                  <th className="text-left py-3 px-4 text-gray-500 dark:text-dark-muted font-medium">Provider</th>
                  <th onClick={() => toggleSort('service')} className="cursor-pointer text-left py-3 px-4 text-gray-500 dark:text-dark-muted font-medium">
                    Service<SortIcon field="service" />
                  </th>
                  <th onClick={() => toggleSort('cost')} className="cursor-pointer text-right py-3 px-4 text-gray-500 dark:text-dark-muted font-medium">
                    Cost<SortIcon field="cost" />
                  </th>
                  <th onClick={() => toggleSort('status')} className="cursor-pointer text-center py-3 px-4 text-gray-500 dark:text-dark-muted font-medium">
                    Status<SortIcon field="status" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r, i) => (
                  <tr key={i} className="border-t border-gray-50 dark:border-dark-border/50 table-row-hover">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-dark-muted font-mono text-xs">
                      {r.invoiceId}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium"
                        style={{ backgroundColor: `${PROVIDER_COLORS[r.provider]}20`, color: PROVIDER_COLORS[r.provider] }}
                      >
                        {r.provider}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-dark-text">{r.service}</td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">
                      ${r.cost.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-dark-border">
          <span className="text-xs text-gray-500 dark:text-dark-muted">
            Page {pagination.page} of {pagination.pages}
          </span>
          <div className="flex gap-1">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setFilter({ ...filter, page: filter.page - 1 })}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-dark-border disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-dark-card"
            >
              <HiOutlineChevronLeft className="w-4 h-4 text-gray-600 dark:text-dark-muted" />
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => setFilter({ ...filter, page: filter.page + 1 })}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-dark-border disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-dark-card"
            >
              <HiOutlineChevronRight className="w-4 h-4 text-gray-600 dark:text-dark-muted" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
