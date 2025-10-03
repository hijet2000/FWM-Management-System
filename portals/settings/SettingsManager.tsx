import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.ts';
import Card from '../../components/ui/Card.tsx';

const settingsLinks = [
    { name: 'Tenant Profile', path: 'profile' },
    { name: 'Branding', path: 'branding' },
    { name: 'Public Portals', path: 'portals' },
    { name: 'Roles & Permissions', path: 'roles' },
    { name: 'Localization', path: 'localization' },
    { name: 'Finance & Invoicing', path: 'finance' },
    { name: 'Payment Gateways', path: 'payments' },
    { name: 'Communication', path: 'communication' },
    { name: 'Notification Templates', path: 'templates' },
    { name: 'Subscription', path: 'subscription' },
    { name: 'Data Protection', path: 'data-protection' },
    { name: 'System Health', path: 'health' },
    { name: 'Import / Export', path: 'import-export' },
];

const SettingsManager: React.FC = () => {
    const { currentSite } = useAuth();

    if (!currentSite) {
        return (
            <Card>
                <div className="text-center py-10">
                    <h3 className="text-lg font-semibold">Please select a site</h3>
                    <p className="text-sm text-gray-500 mt-2">Site-specific settings can be managed after selecting a site from the header dropdown.</p>
                </div>
            </Card>
        );
    }
    
    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
      `block px-3 py-2 rounded-md text-sm font-medium ${
        isActive
          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white'
      }`;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="md:col-span-1">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Settings for {currentSite.name}</h2>
                <nav className="space-y-1">
                    {settingsLinks.map(link => (
                        <NavLink key={link.path} to={link.path} className={navLinkClasses}>
                            {link.name}
                        </NavLink>
                    ))}
                </nav>
            </div>
            <div className="md:col-span-3 lg:col-span-4">
                <Outlet context={{ site: currentSite }} />
            </div>
        </div>
    );
};

export default SettingsManager;