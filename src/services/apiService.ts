import { User, Site, Role, Permission, Attendee, Booking, Room, AuditLog, DataRequestLog, SystemHealth, SystemServiceStatus, SettingsVersion, TicketType, Registration, DiscountCode, RegistrationStatus } from '../types.ts';

const DELAY = 200; // simulate network latency

const get = <T>(key: string): T[] => JSON.parse(localStorage.getItem(key) || '[]');
const set = <T>(key: string, data: T[]): void => localStorage.setItem(key, JSON.stringify(data));
const uid = () => Math.random().toString(36).substring(2, 9);

const delayed = <T>(data: T): Promise<T> => new Promise(resolve => setTimeout(() => resolve(data), DELAY));
const delayedError = (message: string): Promise<any> => new Promise((_, reject) => setTimeout(() => reject(new Error(message)), DELAY));

// A helper for deep merging objects, useful for updating nested settings
const deepMerge = (target: any, source: any) => {
    const output = { ...target };
    if (target && typeof target === 'object' && source && typeof source === 'object') {
        Object.keys(source).forEach(key => {
            if (source[key] && typeof source[key] === 'object' && key in target) {
                output[key] = deepMerge(target[key], source[key]);
            } else {
                output[key] = source[key];
            }
        });
    }
    return output;
};


export const apiService = {
  // AUTH
  async login(email: string, password: string): Promise<User> {
    const users = get<User>('users');
    const user = users.find(u => u.email === email);
    if (user && password === 'password') { // Mock password check
      return delayed(user);
    }
    return delayedError('Invalid credentials');
  },

  // USERS, ROLES, PERMISSIONS
  listUsers: (): Promise<User[]> => delayed(get<User>('users')),
  listSites: (): Promise<Site[]> => delayed(get<Site>('sites')),
  findSiteByShortCode: (shortCode: string): Promise<Site | undefined> => {
      const site = get<Site>('sites').find(s => s.shortCode === shortCode);
      return delayed(site);
  },
  findSiteByUrl: (hostname: string, pathname: string): Promise<Site | null> => {
    const sites = get<Site>('sites');
    // 1. Check by domain
    const byDomain = sites.find(s => s.domains.includes(hostname));
    if (byDomain) return delayed(byDomain);

    // 2. Check by path slug (for public pages)
    const pathParts = pathname.split('/').filter(Boolean);
    if (pathParts[0] === 'public' && pathParts.length >= 3 && pathParts[1] === 'conference') {
        const shortCode = pathParts[2];
        const byShortCode = sites.find(s => s.shortCode === shortCode);
        if (byShortCode) return delayed(byShortCode);
    }
    
    return delayed(null);
  },
  listRoles: (): Promise<Role[]> => delayed(get<Role>('roles')),
  listRolesBySite: (siteId: string): Promise<Role[]> => {
    const allRoles = get<Role>('roles');
    return delayed(allRoles.filter(r => r.siteId === siteId || r.siteId === null));
  },
  listPermissions: (): Promise<Permission[]> => delayed(get<Permission>('permissions')),
  async getRoleWithPermissions(roleId: string): Promise<{ role: Role, permissionIds: string[] }> {
    const roles = get<Role>('roles');
    const role = roles.find(r => r.id === roleId);
    const rolePermissions = JSON.parse(localStorage.getItem('role_permissions') || '{}');
    if (role) {
      return delayed({ role, permissionIds: rolePermissions[roleId] || [] });
    }
    return delayedError('Role not found');
  },
  async createRole(data: { name: string; permissionIds: string[]; siteId: string; userId: string; }): Promise<Role> {
    const roles = get<Role>('roles');
    const newRole: Role = { id: uid(), name: data.name, siteId: data.siteId };
    set('roles', [...roles, newRole]);
    // ... update role_permissions and audit_log
    return delayed(newRole);
  },
  async updateRole(roleId: string, data: { name: string; permissionIds: string[]; siteId: string; userId: string; }): Promise<Role> {
    const roles = get<Role>('roles');
    const roleIndex = roles.findIndex(r => r.id === roleId);
    if (roleIndex > -1) {
      roles[roleIndex].name = data.name;
      set('roles', roles);
      // ... update role_permissions and audit_log
      return delayed(roles[roleIndex]);
    }
    return delayedError('Role not found');
  },
  async deleteRole(roleId: string, siteId: string, userId: string): Promise<void> {
    const roles = get<Role>('roles');
    const newRoles = roles.filter(r => r.id !== roleId);
    set('roles', newRoles);
    // ... update role_permissions and audit_log
    return delayed(undefined);
  },

  // SITE-SPECIFIC DATA
  updateSite: (siteId: string, updates: Partial<Site>, meta: { userId: string, userEmail: string, reason: string }): Promise<Site> => {
      const sites = get<Site>('sites');
      const siteIndex = sites.findIndex(s => s.id === siteId);
      if (siteIndex === -1) return delayedError('Site not found');
      
      const updatedSite = deepMerge(sites[siteIndex], updates);
      sites[siteIndex] = updatedSite;
      set('sites', sites);

      // Create a version history entry
      const versions = get<SettingsVersion>('settings_versions');
      const newVersion: SettingsVersion = {
          id: uid(),
          siteId,
          createdAt: new Date().toISOString(),
          createdByUserId: meta.userId,
          createdByUserEmail: meta.userEmail,
          settingsSnapshot: updatedSite,
          changeReason: meta.reason,
      };
      set('settings_versions', [...versions, newVersion]);

      return delayed(updatedSite);
  },

  // --- REGISTRATION & ATTENDEE API ---
  listTicketTypesBySite: (siteId: string): Promise<TicketType[]> => {
      return delayed(get<TicketType>('ticket_types').filter(tt => tt.siteId === siteId));
  },
  
  listAttendeesBySite: (siteId: string): Promise<Attendee[]> => {
    const attendees = get<Attendee>('attendees').filter(a => a.siteId === siteId);
    const registrations = get<Registration>('registrations');
    const consents = get<any>('consents');
    
    // Attach related data
    const hydratedAttendees = attendees.map(attendee => ({
        ...attendee,
        registrations: registrations.filter(r => r.attendeeId === attendee.id),
        consents: consents.filter((c: any) => c.attendeeId === attendee.id),
    }));

    return delayed(hydratedAttendees);
  },

  listRegistrationsBySite: (siteId: string): Promise<Registration[]> => {
      return delayed(get<Registration>('registrations').filter(r => r.siteId === siteId));
  },
  
  validateDiscountCode: (siteId: string, code: string, ticketTypeId: string): Promise<{ valid: boolean; discountValue: number; discountType: 'PERCENT' | 'FIXED' }> => {
      const discount = get<DiscountCode>('discount_codes').find(dc => dc.siteId === siteId && dc.code.toUpperCase() === code.toUpperCase());
      if (!discount || discount.usedCount >= discount.usageLimit) {
          return delayedError('Invalid or expired discount code.');
      }
      if (discount.appliesToTicketTypeId && discount.appliesToTicketTypeId !== ticketTypeId) {
          return delayedError(`This code is not valid for the selected ticket type.`);
      }
      return delayed({ valid: true, discountValue: discount.value, discountType: discount.type });
  },

  createRegistration: (data: any): Promise<Registration> => {
    // This is a simplified mock. A real implementation would be a transaction.
    const allAttendees = get<Attendee>('attendees');
    let attendee = allAttendees.find(a => a.email === data.attendee.email && a.siteId === data.siteId);

    if (!attendee) {
        attendee = {
            id: uid(),
            siteId: data.siteId,
            ...data.attendee,
            registrations: [],
            consents: []
        };
        set('attendees', [...allAttendees, attendee]);
    }
    
    const newReg: Registration = {
        id: uid(),
        siteId: data.siteId,
        attendeeId: attendee.id,
        ticketTypeId: data.ticketTypeId,
        status: data.totalPrice > 0 ? RegistrationStatus.PENDING_PAYMENT : RegistrationStatus.PAID,
        createdAt: new Date().toISOString(),
        pricePaid: 0,
        qrCodeValue: `FWM24-${uid()}`,
    };
    const registrations = get<Registration>('registrations');
    set('registrations', [...registrations, newReg]);

    return delayed(newReg);
  },


  // HOTEL
  listBookingsBySite: (siteId: string): Promise<Booking[]> => delayed(get<Booking>('bookings').filter(b => b.siteId === siteId)),
  listRoomsBySite: (siteId: string): Promise<Room[]> => delayed(get<Room>('rooms').filter(r => r.siteId === siteId)),
  createBooking: (bookingData: Omit<Booking, 'id'>): Promise<Booking> => {
    const bookings = get<Booking>('bookings');
    const newBooking = { ...bookingData, id: uid(), checkIn: bookingData.checkIn.toString(), checkOut: bookingData.checkOut.toString() };
    set('bookings', [...bookings, newBooking]);
    return delayed(newBooking);
  },

  // --- ADMIN & LOGGING ---
  listAuditLogsBySite: (siteId: string): Promise<AuditLog[]> => delayed(get<AuditLog>('audit_logs').filter(log => log.siteId === siteId)),
  listDataRequestLogsBySite: (siteId: string): Promise<DataRequestLog[]> => delayed(get<DataRequestLog>('data_request_logs').filter(log => log.siteId === siteId)),
  createDataRequest: (requestData: Omit<DataRequestLog, 'id' | 'status' | 'requestedAt' | 'downloadUrl'>): Promise<DataRequestLog> => {
    const logs = get<DataRequestLog>('data_request_logs');
    const newLog: DataRequestLog = {
      ...requestData,
      id: uid(),
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
      downloadUrl: null,
    };
    set('data_request_logs', [...logs, newLog]);

    // Simulate async processing
    setTimeout(() => {
        const currentLogs = get<DataRequestLog>('data_request_logs');
        const logIndex = currentLogs.findIndex(l => l.id === newLog.id);
        if (logIndex > -1) {
            currentLogs[logIndex].status = 'COMPLETED';
            if (currentLogs[logIndex].type === 'EXPORT') {
                currentLogs[logIndex].downloadUrl = '#'; // Mock download link
            }
            set('data_request_logs', currentLogs);
        }
    }, 3000);

    return delayed(newLog);
  },
  getSystemHealth: (): Promise<SystemHealth> => {
    // Mock health status. In a real app, this would come from a dedicated health check endpoint.
    const health: SystemHealth = {
        database: SystemServiceStatus.OPERATIONAL,
        queues: SystemServiceStatus.OPERATIONAL,
        emailProvider: SystemServiceStatus.DEGRADED, // Example of a degraded service
        smsProvider: SystemServiceStatus.OPERATIONAL,
        storage: SystemServiceStatus.OUTAGE, // Example of an outage
    };
    return delayed(health);
  },
  listSettingsVersionsBySite: (siteId: string): Promise<SettingsVersion[]> => {
    const versions = get<SettingsVersion>('settings_versions').filter(v => v.siteId === siteId);
    return delayed(versions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  },
  getSettingsVersion: (versionId: string): Promise<SettingsVersion> => {
    const version = get<SettingsVersion>('settings_versions').find(v => v.id === versionId);
    return version ? delayed(version) : delayedError('Version not found');
  },
};