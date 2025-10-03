import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.tsx';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="flex-grow p-4 sm:p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
