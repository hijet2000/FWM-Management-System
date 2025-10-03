
import { AuthenticatedUser, User, Site, Role, Permission, Booking, Room, Attendee } from '../../types.ts';

// --- LocalStorage DB Abstraction ---

class LocalStorageDB {
    private prefix = 'fwm_';

    getItem<T>(key: string): T | null {
        const item = localStorage.getItem(this.prefix + key);
        if (!item) return null;
        // JSON reviver to correctly parse date strings back into Date objects
        return JSON.parse(item, (k, v) => {
             if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(v)) {
                return new Date(v);
            }
            return v;
        });
    }

    setItem<T>(key: string, value: T): void {
        localStorage.setItem(this.prefix + key, JSON.stringify(value));
    }

    getCollection<T>(key: string): T[] {
        return this.getItem<T[]>(key) || [];
    }
}

const db = new LocalStorageDB();

// --- Helper Functions ---

const uuid = () => crypto.randomUUID();
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));


// --- Seeding Logic --- (Called from scripts/seed.ts)
export const seedDatabase = async (seedData: any) => {
    localStorage.clear();

    // Permissions
    const permissions = seedData.permissions.map((p: any) => ({ ...p, id: uuid() }));
    db.setItem('permissions', permissions);

    // Roles and Role-Permission links
    const roles: Role[] = [];
    const rolePermissions: any[] = [];
    seedData.roles.forEach((r: any) => {
        const roleId = uuid();
        roles.push({ id: roleId, name: r.name, permissions: [], users: [] });
        r.permissions.forEach((p: any) => {
            const perm = permissions.find((perm: any) => perm.action === p.action && perm.resource === p.resource);
            if(perm) {
                rolePermissions.push({ roleId, permissionId: perm.id });
            }
        });
    });
    db.setItem('roles', roles);
    db.setItem('rolePermissions', rolePermissions);

    // Sites
    const sites = seedData.sites.map((s: any) => ({ ...s, id: uuid(), createdAt: new Date(), updatedAt: new Date(), campuses: [] }));
    db.setItem('sites', sites);
    
    // Users and User-Role links
    const users: User[] = [];
    const userRoles: any[] = [];
    seedData.users.forEach((u: any) => {
        const userId = uuid();
        users.push({
            id: userId,
            email: u.email,
            passwordHash: u.password, // Storing plain text in mock DB
            firstName: u.firstName,
            lastName: u.lastName,
            createdAt: new Date(),
            updatedAt: new Date(),
            roles: []
        });
        u.roles.forEach((ur: any) => {
            const role = roles.find(r => r.name === ur.name);
            const site = sites.find(s => s.name === ur.siteName);
            if (role) {
                userRoles.push({ userId, roleId: role.id, siteId: site?.id });
            }
        });
    });
    db.setItem('users', users);
    db.setItem('userRoles', userRoles);

    // Attendees
    const attendees = seedData.attendees.map((a: any) => {
        const site = sites.find(s => s.name === a.siteName);
        return {
            ...a,
            id: uuid(),
            siteId: site.id,
            registrationDate: new Date(),
        };
    });
    db.setItem('attendees', attendees);

    // Rooms
    const rooms = seedData.rooms.map((r: any) => {
        const site = sites.find(s => s.name === r.siteName);
        return {
            ...r,
            id: uuid(),
            siteId: site.id,
            bookings: [],
        };
    });
    db.setItem('rooms', rooms);

    // Bookings
    const bookings = seedData.bookings.map((b: any) => {
        const site = sites.find(s => s.name === b.siteName);
        const room = rooms.find(r => r.siteId === site.id && r.roomNumber === b.roomNumber);
        const checkIn = new Date();
        checkIn.setDate(checkIn.getDate() + b.checkInDaysFromNow);
        const checkOut = new Date();
        checkOut.setDate(checkOut.getDate() + b.checkOutDaysFromNow);
        return {
            id: uuid(),
            siteId: site.id,
            roomId: room.id,
            guestName: b.guestName,
            checkIn,
            checkOut,
            createdAt: new Date(),
        };
    });
    db.setItem('bookings', bookings);

    db.setItem('fwm_db_seeded', true);
};

// --- API Service ---

const getAuthenticatedUserFromUser = (user: User): AuthenticatedUser => {
    const allRoles = db.getCollection<Role>('roles');
    const allPermissions = db.getCollection<Permission>('permissions');
    const userRoleLinks = db.getCollection<any>('userRoles').filter(ur => ur.userId === user.id);
    const rolePermissionLinks = db.getCollection<any>('rolePermissions');

    const hydratedRoles = userRoleLinks.map(link => {
        const role = allRoles.find(r => r.id === link.roleId);
        if (!role) return null;

        const permissionsForRole = rolePermissionLinks
            .filter(rp => rp.roleId === role.id)
            .map(rp => allPermissions.find(p => p.id === rp.permissionId))
            .filter(Boolean) as Permission[];

        return {
            name: role.name,
            siteId: link.siteId,
            campusId: link.campusId,
            permissions: permissionsForRole.map(p => ({ action: p.action, resource: p.resource }))
        };
    }).filter(Boolean) as AuthenticatedUser['roles'];

    const { passwordHash, ...safeUser } = user;
    return { ...safeUser, roles: hydratedRoles };
};


export const apiService = {
    async login(email: string, password_plaintext: string): Promise<AuthenticatedUser> {
        await delay(500);
        const users = db.getCollection<User>('users');
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user || user.passwordHash !== password_plaintext) {
            throw new Error('Invalid email or password');
        }

        db.setItem('loggedInUserId', user.id);
        return getAuthenticatedUserFromUser(user);
    },

    async logout(): Promise<void> {
        await delay(100);
        localStorage.removeItem('fwm_loggedInUserId');
    },

    async getLoggedInUser(): Promise<AuthenticatedUser> {
        await delay(100);
        const userId = db.getItem<string>('loggedInUserId');
        if (!userId) {
            throw new Error('Not authenticated');
        }
        const users = db.getCollection<User>('users');
        const user = users.find(u => u.id === userId);
        if (!user) {
            throw new Error('User not found');
        }
        return getAuthenticatedUserFromUser(user);
    },

    async listUsers(): Promise<User[]> {
        await delay(200);
        return db.getCollection<User>('users');
    },

    async listSites(): Promise<Site[]> {
        await delay(100);
        return db.getCollection<Site>('sites');
    },
    
    async listRoles(): Promise<Role[]> {
        await delay(100);
        return db.getCollection<Role>('roles');
    },

    async listPermissions(): Promise<Permission[]> {
        await delay(100);
        return db.getCollection<Permission>('permissions');
    },

    async listAttendeesBySite(siteId: string): Promise<Attendee[]> {
        await delay(300);
        const allAttendees = db.getCollection<Attendee>('attendees');
        return allAttendees.filter(a => a.siteId === siteId);
    },
    
    async listRoomsBySite(siteId: string): Promise<Room[]> {
        await delay(200);
        const allRooms = db.getCollection<Room>('rooms');
        return allRooms.filter(r => r.siteId === siteId);
    },
    
    async listBookingsBySite(siteId: string): Promise<Booking[]> {
        await delay(300);
        const allBookings = db.getCollection<Booking>('bookings');
        return allBookings.filter(b => b.siteId === siteId);
    },

    async createBooking(data: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
        await delay(600);
        const allBookings = db.getCollection<Booking>('bookings');

        // Overlap check
        const hasOverlap = allBookings.some(booking =>
            booking.roomId === data.roomId &&
            data.checkIn < booking.checkOut &&
            data.checkOut > booking.checkIn
        );
        
        if (hasOverlap) {
            throw new Error('This room is already booked for the selected dates.');
        }

        const newBooking: Booking = {
            ...data,
            id: uuid(),
            createdAt: new Date(),
        };

        allBookings.push(newBooking);
        db.setItem('bookings', allBookings);
        return newBooking;
    },
};
