import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

const CURRENCY_RATES = { USD: 1, INR: 83.5, EUR: 0.92 };
const CURRENCY_SYMBOLS = { USD: '$', INR: '₹', EUR: '€' };

export function AppProvider({ children }) {
  const [currency, setCurrency] = useState('USD');
  const [provider, setProvider] = useState('AWS');
  const [monthlyBudget, setMonthlyBudget] = useState(12000);
  const [emailAlerts, setEmailAlerts] = useState(true);

  const convertCost = (usdAmount) => {
    const converted = usdAmount * CURRENCY_RATES[currency];
    return `${CURRENCY_SYMBOLS[currency]}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const rawConvert = (usdAmount) => {
    return +(usdAmount * CURRENCY_RATES[currency]).toFixed(2);
  };

  return (
    <AppContext.Provider value={{
      currency, setCurrency,
      provider, setProvider,
      monthlyBudget, setMonthlyBudget,
      emailAlerts, setEmailAlerts,
      convertCost, rawConvert,
      currencySymbol: CURRENCY_SYMBOLS[currency],
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
