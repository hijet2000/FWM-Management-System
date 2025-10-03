import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { User, Site, PermissionAction } from '../types.ts';
import { apiService } from '../src/services/apiService.ts';

export interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  logout: () => void;
  currentSite: Site | null;
  setCurrentSite: (site: Site | null) => void;
  can: (action: PermissionAction, resource: string, context?: { siteId?: string }) => boolean;
}

export const AppContext = createContext<AppContextType | null>(null);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSite, setCurrentSiteState] = useState<Site | null>(null);
  
  // One-time effect to initialize auth state and resolve tenant
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      let resolvedSite: Site | null = null;
      let storedUser: User | null = null;

      // 1. Resolve tenant from URL
      try {
          // In a real app, window.location might be passed from a server context
          resolvedSite = await apiService.findSiteByUrl(window.location.hostname, window.location.pathname);
      } catch (error) {
          console.error("Failed to resolve site by URL", error);
      }

      // 2. Load user and last-viewed site from localStorage
      try {
        const userJson = localStorage.getItem('fwm_user');
        if (userJson) storedUser = JSON.parse(userJson);
        
        // Only load site from storage if URL resolution fails
        if (!resolvedSite) {
            const siteJson = localStorage.getItem('fwm_site');
            if (siteJson) resolvedSite = JSON.parse(siteJson);
        }
      } catch (error) {
        console.error("Failed to parse from localStorage", error);
        localStorage.clear(); // Clear potentially corrupted storage
      }
      
      setUserState(storedUser);
      setCurrentSiteState(resolvedSite);
      setIsLoading(false);
    };
    initialize();
  }, []);

  const setUser = (user: User | null) => {
    setUserState(user);
    if (user) {
      localStorage.setItem('fwm_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fwm_user');
    }
  };
  
  const setCurrentSite = (site: Site | null) => {
    setCurrentSiteState(site);
    if (site) {
        localStorage.setItem('fwm_site', JSON.stringify(site));
    } else {
        localStorage.removeItem('fwm_site');
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentSite(null);
  };
  
  const can = useCallback((action: PermissionAction, resource: string, context?: { siteId?: string }): boolean => {
      // Mock implementation of permission checking. A real app would have a more robust system.
      if (!user) return false;

      const superAdminRole = user.roles.find(r => r.roleId === 'superadmin_role' && r.siteId === null);
      if (superAdminRole) return true;
      
      const siteId = context?.siteId;
      if (!siteId) { // No site context, check for non-site-specific roles
          if(resource === 'bank_portal' && user.roles.some(r => r.roleId === 'superadmin_role')) return true;
          if(resource === 'admin_panel' && user.roles.some(r => r.roleId === 'superadmin_role')) return true;
          return false;
      }

      const userSiteRole = user.roles.find(r => r.siteId === siteId);

      if (userSiteRole) {
          if (resource === 'admin_panel' || resource === '*') return false;
          // For this mock, we assume any assigned site role gives broad permissions for that site.
          return true;
      }
      
      return false; // Default deny
  }, [user]);

  const value = useMemo(() => ({
    user,
    setUser,
    isLoading,
    logout,
    currentSite,
    setCurrentSite,
    can,
  }), [user, isLoading, currentSite, can, logout]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;