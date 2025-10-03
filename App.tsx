
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import ProtectedRoute from './components/auth/ProtectedRoute.tsx';
import MainLayout from './components/layout/MainLayout.tsx';
import EcosystemLoginPage from './portals/EcosystemLoginPage.tsx';
import EcosystemDashboardPage from './portals/EcosystemDashboardPage.tsx';
import AdminManager from './portals/admin/AdminManager.tsx';
import ConferenceManager from './portals/conference/ConferenceManager.tsx';
import HotelManager from './portals/hotel/HotelManager.tsx';
import BankManager from './portals/bank/BankManager.tsx';
import ChurchManager from './portals/church/ChurchManager.tsx';
import SchoolManager from './portals/school/SchoolManager.tsx';
import HRManager from './portals/hr/HRManager.tsx';
import CommunicationManager from './portals/comms/CommunicationManager.tsx';
import ConferenceLanding from './portals/public/ConferenceLanding.tsx';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<EcosystemLoginPage />} />
            <Route path="/public/conference/:siteId" element={<ConferenceLanding />} />

            {/* Protected routes with shared layout */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/" element={<EcosystemDashboardPage />} />
              <Route path="/admin" element={<AdminManager />} />
              <Route path="/conference/:siteId" element={<ConferenceManager />} />
              <Route path="/hotel/:siteId" element={<HotelManager />} />
              <Route path="/bank" element={<BankManager />} />
              <Route path="/church/:siteId" element={<ChurchManager />} />
              <Route path="/school/:siteId" element={<SchoolManager />} />
              <Route path="/hr" element={<HRManager />} />
              <Route path="/comms" element={<CommunicationManager />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </HashRouter>
      </AppProvider>
    </ToastProvider>
  );
};

export default App;