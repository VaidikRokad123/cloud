import { useState } from 'react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import {
  HiOutlineCurrencyDollar, HiOutlineCloud, HiOutlineMail, HiOutlineSave
} from 'react-icons/hi';

export default function Settings() {
  const {
    currency, setCurrency,
    provider, setProvider,
    monthlyBudget, setMonthlyBudget,
    emailAlerts, setEmailAlerts,
  } = useApp();

  const [localBudget, setLocalBudget] = useState(monthlyBudget);
  const [localCurrency, setLocalCurrency] = useState(currency);
  const [localProvider, setLocalProvider] = useState(provider);
  const [localEmail, setLocalEmail] = useState(emailAlerts);

  const handleSave = () => {
    setCurrency(localCurrency);
    setProvider(localProvider);
    setMonthlyBudget(localBudget);
    setEmailAlerts(localEmail);
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Configure your monitoring preferences
        </p>
      </div>

      <div className="max-w-xl space-y-5">
        {/* Currency Selector */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineCurrencyDollar className="w-5 h-5 text-[#1a73e8]" />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Currency</h3>
          </div>
          <div className="flex gap-2">
            {['USD', 'INR', 'EUR'].map(c => (
              <button
                key={c}
                onClick={() => setLocalCurrency(c)}
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
                  localCurrency === c
                    ? 'bg-[#1a73e8] text-white'
                    : 'bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-dark-muted hover:bg-gray-200'
                }`}
              >
                {c === 'USD' ? '$ USD' : c === 'INR' ? '₹ INR' : '€ EUR'}
              </button>
            ))}
          </div>
        </div>

        {/* Cloud Provider */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineCloud className="w-5 h-5 text-[#1a73e8]" />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Cloud Provider</h3>
          </div>
          <div className="flex gap-2">
            {['AWS', 'Azure', 'GCP'].map(p => (
              <button
                key={p}
                onClick={() => setLocalProvider(p)}
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
                  localProvider === p
                    ? 'bg-[#1a73e8] text-white'
                    : 'bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-dark-muted hover:bg-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Monthly Budget */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineCurrencyDollar className="w-5 h-5 text-[#1a73e8]" />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Monthly Budget</h3>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              value={localBudget}
              onChange={e => setLocalBudget(Number(e.target.value))}
              className="w-full pl-7 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
            />
          </div>
        </div>

        {/* Email Alerts Toggle */}
        <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HiOutlineMail className="w-5 h-5 text-[#1a73e8]" />
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Email Alerts</h3>
                <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">Receive email notifications for budget alerts</p>
              </div>
            </div>
            <button
              onClick={() => setLocalEmail(!localEmail)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                localEmail ? 'bg-[#1a73e8]' : 'bg-gray-300 dark:bg-dark-border'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  localEmail ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#1a73e8] hover:bg-blue-700 text-white font-medium py-3 rounded-xl text-sm transition-colors"
        >
          <HiOutlineSave className="w-4 h-4" />
          Save Settings
        </button>
      </div>
    </div>
  );
}
