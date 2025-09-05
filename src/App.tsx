import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@contexts/AuthContext';
import { DashboardLayout } from '@components/layouts/DashboardLayout';
import { ProtectedRoute } from '@components/auth/ProtectedRoute';
import { LoginPage } from '@pages/LoginPage';
import { HomePage } from '@pages/HomePage';
import { ContentPage } from '@pages/ContentPage';
import { CampaignsPage } from '@pages/CampaignsPage';
import { AnalyticsPage } from '@pages/AnalyticsPage';
import { UsersPage } from '@pages/UsersPage';
import { SettingsPage } from '@pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
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
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;