import React from 'react';
import { useParams, NavLink, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.ts';

const ConferenceManager: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const { currentSite } = useAuth();
    
    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `whitespace-nowrap py-3 px-4 text-sm font-medium cursor-pointer rounded-t-lg ${
            isActive 
            ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500' 
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border-b-2 border-transparent'
        }`;
    
    return (
        <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                {currentSite?.name || 'Conference Management'}
            </h1>
            
             <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <NavLink to={`/conference/${siteId}/dashboard`} className={navLinkClasses}>
                        Dashboard
                    </NavLink>
                     <NavLink to={`/conference/${siteId}/attendees`} className={navLinkClasses}>
                        Attendees
                    </NavLink>
                    {/* Add links for Imports, Settings etc. here */}
                </nav>
            </div>
            
            <div className="mt-4">
                <Outlet />
            </div>
        </div>
    );
};

export default ConferenceManager;