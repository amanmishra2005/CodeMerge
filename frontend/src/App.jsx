import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import PublicSharePage from './pages/PublicSharePage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PlatformLinkingPage from './pages/PlatformLinkingPage.jsx';
import AIAnalysisPage from './pages/AIAnalysisPage.jsx';
import GitHubDashboard from './pages/GitHubDashboard.jsx';
import PlatformDashboard from './pages/PlatformDashboard.jsx';
import ContestsPage from './pages/ContestsPage.jsx';
import TermsOfService from './pages/TermsOfService.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import NotFound from './pages/NotFound.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/contests" element={<ContestsPage />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/share/:identifier" element={<PublicSharePage />} />
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
        path="/dashboard/platform/:platformKey"
        element={
          <ProtectedRoute>
            <PlatformDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/github"
        element={
          <ProtectedRoute>
            <PlatformDashboard defaultPlatform="github" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/contests"
        element={
          <ProtectedRoute>
            <ContestsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/:platformKey"
        element={
          <ProtectedRoute>
            <PlatformDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
