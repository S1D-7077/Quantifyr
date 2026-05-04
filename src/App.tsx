import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import CampaignAnalysis from './pages/CampaignAnalysis';
import CampaignDetails from './pages/CampaignDetails';
import RTOAnalysis from './pages/RTOAnalysis';
import OrderAnalytics from './pages/Orders';
import AlertCenter from './pages/Alerts';
import Settings from './pages/Settings';
import AIInsights from './pages/AIInsights';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isLoading } = useAuth();
  
  if (isLoading) return null;
  if (!token) return <Navigate to="/login" />;
  
  return <>{children}</>;
};

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/intelligence" element={
        <ProtectedRoute>
          <AIInsights />
        </ProtectedRoute>
      } />
      <Route path="/campaigns" element={
        <ProtectedRoute>
          <CampaignAnalysis />
        </ProtectedRoute>
      } />
      <Route path="/campaigns/:id" element={
        <ProtectedRoute>
          <CampaignDetails />
        </ProtectedRoute>
      } />
      <Route path="/rto" element={
        <ProtectedRoute>
          <RTOAnalysis />
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute>
          <OrderAnalytics />
        </ProtectedRoute>
      } />
      <Route path="/alerts" element={
        <ProtectedRoute>
          <AlertCenter />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
