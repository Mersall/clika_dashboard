import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@contexts/AuthContext';
import { ThemeProvider } from '@contexts/ThemeContext';
import { DashboardLayout } from '@components/layouts/DashboardLayout';
import { ProtectedRoute } from '@components/auth/ProtectedRoute';
import { LoginPage } from '@pages/LoginPage';
import { ForgotPasswordPage } from '@pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@pages/ResetPasswordPage';
import { AuthCallbackPage } from '@pages/AuthCallbackPage';
import { HomePage } from '@pages/HomePage';
import { ContentPage } from '@pages/ContentPage';
import { ContentReviewPage } from '@pages/ContentReviewPage';
import { ContentPacksPage } from '@pages/ContentPacksPage';
import { ContentPackStorePage } from '@pages/ContentPackStorePage';
import { UserPurchasesPage } from '@pages/UserPurchasesPage';
import { EdgeFunctionsPage } from '@pages/EdgeFunctionsPage';
import { FixLogosPage } from '@pages/FixLogosPage';
import { TestLogosPage } from '@pages/TestLogosPage';
import { RoundAnalyticsPage } from '@pages/RoundAnalyticsPage';
import { UserLocationPage } from '@pages/UserLocationPage';
import { RetentionCohortsPage } from '@pages/RetentionCohortsPage';
import { ContentExposurePage } from '@pages/ContentExposurePage';
import { FeatureFlagsPage } from '@pages/FeatureFlagsPage';
import { SessionsPage } from '@pages/SessionsPage';
import { SessionDeviceAnalyticsPage } from '@pages/SessionDeviceAnalyticsPage';
import { CampaignsPage } from '@pages/CampaignsPage';
import { CampaignDaypartingPage } from '@pages/CampaignDaypartingPage';
import { AnalyticsPage } from '@pages/AnalyticsPage';
import { UsersPage } from '@pages/UsersPage';
import { SettingsPage } from '@pages/SettingsPage';
import { ApiTestPage } from '@pages/ApiTestPage';
import { TooltipTestPage } from '@pages/TooltipTestPage';
import { DebugPage } from '@pages/DebugPage';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="content" element={<ContentPage />} />
            <Route path="content/review" element={<ContentReviewPage />} />
            <Route path="content-packs" element={<ContentPacksPage />} />
            <Route path="pack-store" element={<ContentPackStorePage />} />
            <Route path="purchases" element={<UserPurchasesPage />} />
            <Route path="edge-functions" element={<EdgeFunctionsPage />} />
            <Route path="fix-logos" element={<FixLogosPage />} />
            <Route path="test-logos" element={<TestLogosPage />} />
            <Route path="rounds" element={<RoundAnalyticsPage />} />
            <Route path="locations" element={<UserLocationPage />} />
            <Route path="retention" element={<RetentionCohortsPage />} />
            <Route path="exposure" element={<ContentExposurePage />} />
            <Route path="sessions" element={<SessionsPage />} />
            <Route path="device-analytics" element={<SessionDeviceAnalyticsPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="campaigns/:id/dayparting" element={<CampaignDaypartingPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="feature-flags" element={<FeatureFlagsPage />} />
            <Route path="api-test" element={<ApiTestPage />} />
            <Route path="tooltip-test" element={<TooltipTestPage />} />
            <Route path="debug" element={<DebugPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;