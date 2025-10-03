
// Enums from Prisma Schema
export enum SiteType {
  CONFERENCE = 'CONFERENCE',
  HOTEL = 'HOTEL',
  CHURCH = 'CHURCH',
  SCHOOL = 'SCHOOL',
  BANK = 'BANK',
  HR = 'HR',
  COMMS = 'COMMS'
}

export enum RoleName {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SITE_ADMIN = 'SITE_ADMIN',
  CONFERENCE_MANAGER = 'CONFERENCE_MANAGER',
  HOTEL_MANAGER = 'HOTEL_MANAGER',
  MAINTENANCE_MANAGER = 'MAINTENANCE_MANAGER',
  BANK_MANAGER = 'BANK_MANAGER',
  CHURCH_ADMIN = 'CHURCH_ADMIN',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  HR_MANAGER = 'HR_MANAGER',
  COMMS_MANAGER = 'COMMS_MANAGER',
  GUEST = 'GUEST'
}

export enum PermissionAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  MANAGE = 'MANAGE' // A special permission implying all actions
}

export enum MaintenanceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// Interfaces mirroring Prisma Models

export interface User {
  id: string;
  email: string;
  passwordHash: string; // In a real app, never expose this to the client
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
  roles: UserRole[];
}

export interface Role {
  id: string;
  name: RoleName;
  permissions: RolePermission[];
  users: UserRole[];
}

export interface Permission {
  id: string;
  action: PermissionAction;
  resource: string; // e.g., 'User', 'Site', 'Booking'
  roles: RolePermission[];
}

export interface UserRole {
  userId: string;
  roleId: string;
  siteId?: string; // Scope grant to a specific site
  campusId?: string; // Scope grant to a specific campus
  user: User;
  role: Role;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
}

export interface Site {
  id: string;
  name: string;
  type: SiteType;
  campuses: Campus[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Campus {
  id: string;
  name: string;
  siteId: string;
  site: Site;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
    id: string;
    roomId: string;
    guestName: string;
    checkIn: Date;
    checkOut: Date;
    siteId: string;
    createdAt: Date;
}

export interface Room {
    id: string;
    siteId: string;
    building?: string;
    roomNumber: string;
    type: string;
    capacity: number;
    bookings: Booking[];
}

export interface Attendee {
  id: string;
  siteId: string;
  firstName: string;
  lastName: string;
  email: string;
  checkedIn: boolean;
  registrationDate: Date;
}

// In-memory representation for logged-in user
export interface AuthenticatedUser extends Omit<User, 'passwordHash' | 'roles'> {
    roles: Array<{
        name: RoleName;
        siteId?: string;
        campusId?: string;
        permissions: { action: PermissionAction; resource: string }[];
    }>;
}
