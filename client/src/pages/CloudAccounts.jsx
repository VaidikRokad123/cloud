import { useState, useEffect } from 'react';
import axios from 'axios';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineRefresh, HiOutlineCloud } from 'react-icons/hi';

const PROVIDER_CONFIG = {
  AWS: {
    name: 'Amazon Web Services',
    icon: '☁️',
    color: 'bg-gradient-to-br from-orange-500 to-orange-600',
    fields: ['Account ID', 'Access Key', 'Secret Key', 'Region']
  },
  Azure: {
    name: 'Microsoft Azure',
    icon: '☁️',
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    fields: ['Subscription ID', 'Tenant ID', 'Client ID', 'Client Secret']
  },
  GCP: {
    name: 'Google Cloud Platform',
    icon: '☁️',
    color: 'bg-gradient-to-br from-red-500 to-red-600',
    fields: ['Project ID', 'Service Account Key']
  }
};

export default function CloudAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [formData, setFormData] = useState({
    accountName: '',
    accountId: '',
    apiKey: '',
    region: 'us-east-1'
  });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('cloudcost_token');
      const res = await axios.get('/api/cloud/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccounts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('cloudcost_token');
      await axios.post('/api/cloud/add', {
        provider: selectedProvider,
        ...formData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setFormData({ accountName: '', accountId: '', apiKey: '', region: 'us-east-1' });
      setSelectedProvider('');
      fetchAccounts();
    } catch (err) {
      console.error(err);
      alert('Failed to add account');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    try {
      const token = localStorage.getItem('cloudcost_token');
      await axios.delete(`/api/cloud/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAccounts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem('cloudcost_token');
      const res = await axios.post('/api/cloud/sync', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Sync completed! ${res.data.results.filter(r => r.success).length} accounts synced successfully.`);
      fetchAccounts();
    } catch (err) {
      console.error(err);
      alert('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const groupedAccounts = accounts.reduce((acc, account) => {
    if (!acc[account.provider]) acc[account.provider] = [];
    acc[account.provider].push(account);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cloud Accounts</h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Manage your AWS, Azure, and GCP accounts
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSyncAll}
            disabled={syncing || accounts.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiOutlineRefresh className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync All'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Add Account
          </button>
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-12 text-center">
          <HiOutlineCloud className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No cloud accounts connected</h3>
          <p className="text-sm text-gray-500 dark:text-dark-muted mb-6">
            Connect your AWS, Azure, or GCP accounts to start monitoring costs
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white font-medium rounded-lg"
          >
            <HiOutlinePlus className="w-5 h-5" />
            Add Your First Account
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAccounts).map(([provider, providerAccounts]) => {
            const config = PROVIDER_CONFIG[provider];
            return (
              <div key={provider} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${config.color} flex items-center justify-center text-2xl`}>
                    {config.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{config.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-dark-muted">{providerAccounts.length} account(s)</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {providerAccounts.map(account => (
                    <div key={account._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-border/30 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{account.accountName}</p>
                        <p className="text-sm text-gray-500 dark:text-dark-muted">ID: {account.accountId}</p>
                        <p className="text-xs text-gray-400 dark:text-dark-muted mt-1">Region: {account.region}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${account.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                          {account.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => handleDeleteAccount(account._id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Cloud Account</h2>
            
            {!selectedProvider ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 dark:text-dark-muted mb-4">Select a cloud provider:</p>
                {Object.entries(PROVIDER_CONFIG).map(([key, config]) => {
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedProvider(key)}
                      className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-dark-border rounded-xl hover:border-[#f59e0b] dark:hover:border-[#f59e0b] transition-colors"
                    >
                      <div className={`w-12 h-12 rounded-lg ${config.color} flex items-center justify-center text-2xl`}>
                        {config.icon}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{config.name}</span>
                    </button>
                  );
                })}
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-full mt-4 px-4 py-2 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-border text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent"
                    placeholder="My Production Account"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account ID / Project ID
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.accountId}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-border text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Key / Credentials
                  </label>
                  <textarea
                    required
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-border text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent"
                    rows="3"
                    placeholder="Paste your credentials here"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Region
                  </label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-border text-gray-900 dark:text-white focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProvider('');
                      setFormData({ accountName: '', accountId: '', apiKey: '', region: 'us-east-1' });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
