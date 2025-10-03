
import React, { useState, createContext, useEffect, useCallback } from 'react';
import { AuthenticatedUser, Site, PermissionAction, RoleName } from '../types.ts';
import { apiService } from '../src/services/apiService.ts';

export interface AppContextType {
  user: AuthenticatedUser | null;
  setUser: (user: AuthenticatedUser | null) => void;
  isLoading: boolean;
  currentSite: Site | null;
  setCurrentSite: (site: Site | null) => void;
  can: (action: PermissionAction, resource: string, scope?: { siteId?: string; campusId?: string }) => boolean;
  logout: () => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const loggedInUser = await apiService.getLoggedInUser();
        setUser(loggedInUser);
      } catch (error) {
        console.log("No user logged in");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);

  const logout = useCallback(() => {
    apiService.logout();
    setUser(null);
    setCurrentSite(null);
  }, []);

  const can = useCallback((action: PermissionAction, resource: string, scope?: { siteId?: string; campusId?: string }): boolean => {
    if (!user) return false;

    for (const role of user.roles) {
      // Super admin can do anything
      if (role.name === RoleName.SUPER_ADMIN) return true;

      const hasPermission = role.permissions.some(p =>
        (p.resource === resource || p.resource === '*') &&
        (p.action === action || p.action === PermissionAction.MANAGE)
      );

      if (hasPermission) {
        // Permission exists, now check scope
        const siteScopeMatch = !scope?.siteId || !role.siteId || scope.siteId === role.siteId;
        const campusScopeMatch = !scope?.campusId || !role.campusId || scope.campusId === role.campusId;

        if (siteScopeMatch && campusScopeMatch) {
          return true;
        }
      }
    }
    return false;
  }, [user]);
  
  const value = { user, setUser, isLoading, currentSite, setCurrentSite, can, logout };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};