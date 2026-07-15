import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PlatformLinkingPage from './pages/PlatformLinkingPage.jsx';
import AIAnalysisPage from './pages/AIAnalysisPage.jsx';
import GitHubDashboard from './pages/GitHubDashboard.jsx';
import TermsOfService from './pages/TermsOfService.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/link"
        element={
          <ProtectedRoute>
            <PlatformLinkingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/analysis"
        element={
          <ProtectedRoute>
            <AIAnalysisPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/github"
        element={
          <ProtectedRoute>
            <GitHubDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
