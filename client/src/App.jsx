import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Budget from './pages/Budget';
import Reports from './pages/Reports';
import Recommendations from './pages/Recommendations';
import Settings from './pages/Settings';
import CloudAccounts from './pages/CloudAccounts';
import MultiCloudComparison from './pages/MultiCloudComparison';
import MultiCloudUsage from './pages/MultiCloudUsage';
import MultiCloudBudget from './pages/MultiCloudBudget';
import MultiCloudReports from './pages/MultiCloudReports';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1e293b',
                  color: '#f1f5f9',
                  fontSize: '14px',
                },
              }}
            />
            <Routes>
              {/* Public routes */}
              <Route path="/landing" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/services" element={<Services />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/recommendations" element={<Recommendations />} />
                <Route path="/cloud-accounts" element={<CloudAccounts />} />
                <Route path="/multi-cloud" element={<MultiCloudComparison />} />
                <Route path="/multi-cloud-usage" element={<MultiCloudUsage />} />
                <Route path="/multi-cloud-budget" element={<MultiCloudBudget />} />
                <Route path="/multi-cloud-reports" element={<MultiCloudReports />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Redirect root to dashboard or landing */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
