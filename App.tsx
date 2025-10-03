import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppProvider from './contexts/AppContext.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import MainLayout from './components/layout/MainLayout.tsx';
import ProtectedRoute from './components/auth/ProtectedRoute.tsx';
import EcosystemLoginPage from './portals/EcosystemLoginPage.tsx';
import EcosystemDashboardPage from './portals/EcosystemDashboardPage.tsx';
import AdminManager from './portals/admin/AdminManager.tsx';
import BankManager from './portals/bank/BankManager.tsx';
import ConferenceManager from './portals/conference/ConferenceManager.tsx';
import HotelManager from './portals/hotel/HotelManager.tsx';
import ChurchManager from './portals/church/ChurchManager.tsx';
import SchoolManager from './portals/school/SchoolManager.tsx';
import HRManager from './portals/hr/HRManager.tsx';
import CommunicationManager from './portals/comms/CommunicationManager.tsx';
import ConferenceLanding from './portals/public/ConferenceLanding.tsx';
import SettingsManager from './portals/settings/SettingsManager.tsx';
import TenantProfileSettings from './portals/settings/TenantProfileSettings.tsx';
import BrandingSettings from './portals/settings/BrandingSettings.tsx';
import PublicPortalsSettings from './portals/settings/PublicPortalsSettings.tsx';
import LocalizationSettings from './portals/settings/LocalizationSettings.tsx';
import FinanceSettings from './portals/settings/FinanceSettings.tsx';
import CommunicationSettings from './portals/settings/CommunicationSettings.tsx';
import PaymentSettings from './portals/settings/PaymentSettings.tsx';
import RolesAndPermissionsSettings from './portals/settings/RolesAndPermissionsSettings.tsx';
import SubscriptionSettings from './portals/settings/SubscriptionSettings.tsx';
import DataProtectionSettings from './portals/settings/DataProtectionSettings.tsx';
import NotificationTemplatesSettings from './portals/settings/NotificationTemplatesSettings.tsx';
import SystemHealthSettings from './portals/settings/SystemHealthSettings.tsx';
import ImportExportSettings from './portals/settings/ImportExportSettings.tsx';
import ConferenceRegistrationPage from './portals/public/ConferenceRegistrationPage.tsx';
import RegistrationDashboard from './portals/conference/RegistrationDashboard.tsx';
import AttendeesList from './portals/conference/AttendeesList.tsx';

const App: React.FC = () => {
  // Initialize theme from localStorage
  if (localStorage.fwm_theme === 'dark' || (!('fwm_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  return (
    <AppProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<EcosystemLoginPage />} />
            <Route path="/public/conference/:shortCode" element={<ConferenceLanding />} />
            <Route path="/public/conference/:shortCode/register" element={<ConferenceRegistrationPage />} />


            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<EcosystemDashboardPage />} />
              <Route path="admin" element={<AdminManager />} />
              <Route path="bank" element={<BankManager />} />
              <Route path="hr" element={<HRManager />} />
              <Route path="comms" element={<CommunicationManager />} />
              
              <Route path="conference/:siteId" element={<ConferenceManager />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<RegistrationDashboard />} />
                <Route path="attendees" element={<AttendeesList />} />
                {/* Add routes for attendee profile, imports etc. here */}
              </Route>

              <Route path="hotel/:siteId" element={<HotelManager />} />
              <Route path="church/:siteId" element={<ChurchManager />} />
              <Route path="school/:siteId" element={<SchoolManager />} />
              
              <Route path="settings" element={<SettingsManager />}>
                <Route index element={<Navigate to="profile" replace />} />
                <Route path="profile" element={<TenantProfileSettings />} />
                <Route path="branding" element={<BrandingSettings />} />
                <Route path="portals" element={<PublicPortalsSettings />} />
                <Route path="localization" element={<LocalizationSettings />} />
                <Route path="finance" element={<FinanceSettings />} />
                <Route path="communication" element={<CommunicationSettings />} />
                <Route path="payments" element={<PaymentSettings />} />
                <Route path="roles" element={<RolesAndPermissionsSettings />} />
                <Route path="subscription" element={<SubscriptionSettings />} />
                <Route path="data-protection" element={<DataProtectionSettings />} />
                <Route path="templates" element={<NotificationTemplatesSettings />} />
                <Route path="health" element={<SystemHealthSettings />} />
                <Route path="import-export" element={<ImportExportSettings />} />
              </Route>
            </Route>
            
          </Routes>
        </Router>
      </ToastProvider>
    </AppProvider>
  );
};

export default App;