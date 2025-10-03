
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.ts';
import { Site, SiteType, PermissionAction } from '../types.ts';
import { apiService } from '../src/services/apiService.ts';
import Card from '../components/ui/Card.tsx';

const PortalCard: React.FC<{ title: string; description: string; path: string; icon: React.ReactNode; }> = ({ title, description, path, icon }) => (
  <Link to={path} className="block group">
    <Card className="h-full group-hover:shadow-xl group-hover:-translate-y-1 transform transition-all duration-300">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-indigo-500 rounded-lg text-white">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </Card>
  </Link>
);


const EcosystemDashboardPage: React.FC = () => {
  const { user, can, currentSite } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);

  useEffect(() => {
    apiService.listSites().then(setSites);
  }, []);

  const getVisibleSitesForType = (type: SiteType) => {
    const filtered = sites.filter(s => s.type === type);
    if (currentSite && currentSite.type !== type) return [];
    if (currentSite && currentSite.type === type) return [currentSite];
    return filtered;
  }

  const AdminIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
  const BankIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
  const ConfIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
  const HotelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
  const ChurchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
  const SchoolIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20" /></svg>;
  
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Welcome to the FWM Ecosystem, {user?.firstName}!</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {(!currentSite && can(PermissionAction.READ, 'admin_panel')) && (
          <PortalCard title="Admin" description="Manage users, roles, and sites" path="/admin" icon={<AdminIcon />} />
        )}
        
        {(!currentSite && can(PermissionAction.READ, 'bank_portal')) && (
          <PortalCard title="Banking" description="Financial management" path="/bank" icon={<BankIcon />} />
        )}

        {getVisibleSitesForType(SiteType.CONFERENCE).map(site => can(PermissionAction.READ, 'conference_portal', { siteId: site.id }) && (
          <PortalCard key={site.id} title={site.name} description="Manage conference" path={`/conference/${site.id}`} icon={<ConfIcon />} />
        ))}
        
        {getVisibleSitesForType(SiteType.HOTEL).map(site => can(PermissionAction.READ, 'hotel_portal', { siteId: site.id }) && (
          <PortalCard key={site.id} title={site.name} description="Manage hotel" path={`/hotel/${site.id}`} icon={<HotelIcon />} />
        ))}

        {getVisibleSitesForType(SiteType.CHURCH).map(site => can(PermissionAction.READ, 'church_portal', { siteId: site.id }) && (
          <PortalCard key={site.id} title={site.name} description="Manage church" path={`/church/${site.id}`} icon={<ChurchIcon />} />
        ))}

        {getVisibleSitesForType(SiteType.SCHOOL).map(site => can(PermissionAction.READ, 'school_portal', { siteId: site.id }) && (
          <PortalCard key={site.id} title={site.name} description="Manage school" path={`/school/${site.id}`} icon={<SchoolIcon />} />
        ))}

      </div>
    </div>
  );
};

export default EcosystemDashboardPage;
