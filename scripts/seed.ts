
import { seedDatabase } from '../src/services/apiService.ts';
import { PermissionAction, RoleName, SiteType } from '../types.ts';

// This is a standalone script. To run it, you might use a tool like `ts-node`.
// Example: `npx ts-node scripts/seed.ts`
// For this project, we can just call the seed function from a browser console
// or a temporary button in the UI if needed.

const seedData = {
    permissions: [
        // SUPER_ADMIN has implicit full access
        { action: PermissionAction.MANAGE, resource: '*' }, // Should only be for SUPER_ADMIN role

        // Site management
        { action: PermissionAction.CREATE, resource: 'site' },
        { action: PermissionAction.READ, resource: 'site' },
        { action: PermissionAction.UPDATE, resource: 'site' },
        { action: PermissionAction.DELETE, resource: 'site' },

        // User management
        { action: PermissionAction.MANAGE, resource: 'user' },

        // Portal access
        { action: PermissionAction.READ, resource: 'admin_panel' },
        { action: PermissionAction.READ, resource: 'conference_portal' },
        { action: PermissionAction.READ, resource: 'hotel_portal' },
        { action: PermissionAction.READ, resource: 'bank_portal' },
        { action: PermissionAction.READ, resource: 'church_portal' },
        { action: PermissionAction.READ, resource: 'school_portal' },
    ],
    roles: [
        { name: RoleName.SUPER_ADMIN, permissions: [{ action: PermissionAction.MANAGE, resource: '*' }] },
        { name: RoleName.SITE_ADMIN, permissions: [
            { action: PermissionAction.READ, resource: 'conference_portal' },
            { action: PermissionAction.READ, resource: 'hotel_portal' },
        ] },
        { name: RoleName.CONFERENCE_MANAGER, permissions: [{ action: PermissionAction.READ, resource: 'conference_portal' }] },
        { name: RoleName.HOTEL_MANAGER, permissions: [{ action: PermissionAction.READ, resource: 'hotel_portal' }] },
        { name: RoleName.BANK_MANAGER, permissions: [{ action: PermissionAction.READ, resource: 'bank_portal' }] },
        { name: RoleName.CHURCH_ADMIN, permissions: [{ action: PermissionAction.READ, resource: 'church_portal' }] },
        { name: RoleName.SCHOOL_ADMIN, permissions: [{ action: PermissionAction.READ, resource: 'school_portal' }] },
        { name: RoleName.GUEST, permissions: [] },
    ],
    sites: [
        { name: 'Global Conference 2024', type: SiteType.CONFERENCE },
        { name: 'FWM Lakeside Hotel', type: SiteType.HOTEL },
        { name: 'FWM Downtown Hotel', type: SiteType.HOTEL },
        { name: 'FWM Main Campus Church', type: SiteType.CHURCH },
        { name: 'FWM Westside Church', type: SiteType.CHURCH },
        { name: 'Faith Academy', type: SiteType.SCHOOL },
        { name: 'Redemption High School', type: SiteType.SCHOOL },
        { name: 'FWM Central Bank', type: SiteType.BANK },
        { name: 'FWM Global HR', type: SiteType.HR },
        { name: 'FWM Communications Hub', type: SiteType.COMMS },
    ],
    users: [
        { 
            email: 'superadmin@fwm.org', 
            password: 'password', // Plain text for mock DB
            firstName: 'Super',
            lastName: 'Admin',
            roles: [{ name: RoleName.SUPER_ADMIN }] // Global role
        },
        { 
            email: 'sitemanager@fwm.org', 
            password: 'password',
            firstName: 'Site',
            lastName: 'Manager',
            roles: [
                { name: RoleName.SITE_ADMIN, siteName: 'Global Conference 2024' },
                { name: RoleName.SITE_ADMIN, siteName: 'FWM Lakeside Hotel' },
                { name: RoleName.SITE_ADMIN, siteName: 'FWM Downtown Hotel' },
                { name: RoleName.CHURCH_ADMIN, siteName: 'FWM Main Campus Church' },
                { name: RoleName.SCHOOL_ADMIN, siteName: 'Faith Academy' }
            ]
        },
        {
            email: 'confmanager@fwm.org',
            password: 'password',
            firstName: 'Conf',
            lastName: 'Manager',
            roles: [{ name: RoleName.CONFERENCE_MANAGER, siteName: 'Global Conference 2024' }]
        },
        {
            email: 'hotelmanager@fwm.org',
            password: 'password',
            firstName: 'Hotel',
            lastName: 'Manager',
            roles: [{ name: RoleName.HOTEL_MANAGER, siteName: 'FWM Lakeside Hotel' }]
        }
    ],
    attendees: [
        { siteName: 'Global Conference 2024', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', checkedIn: true },
        { siteName: 'Global Conference 2024', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', checkedIn: false },
        { siteName: 'Global Conference 2024', firstName: 'Peter', lastName: 'Jones', email: 'peter.jones@example.com', checkedIn: false },
    ],
    rooms: [
        { siteName: 'FWM Lakeside Hotel', roomNumber: '101', type: 'Single', capacity: 1 },
        { siteName: 'FWM Lakeside Hotel', roomNumber: '102', type: 'Double', capacity: 2 },
        { siteName: 'FWM Lakeside Hotel', roomNumber: '201', type: 'Suite', capacity: 4 },
        { siteName: 'FWM Lakeside Hotel', roomNumber: '202', type: 'Suite', capacity: 4 },
        { siteName: 'FWM Downtown Hotel', roomNumber: 'A1', type: 'Standard', capacity: 2 },
        { siteName: 'FWM Downtown Hotel', roomNumber: 'A2', type: 'Standard', capacity: 2 },
    ],
    bookings: [
        { siteName: 'FWM Lakeside Hotel', roomNumber: '101', guestName: 'Alice', checkInDaysFromNow: -2, checkOutDaysFromNow: 1 },
        { siteName: 'FWM Lakeside Hotel', roomNumber: '102', guestName: 'Bob', checkInDaysFromNow: 0, checkOutDaysFromNow: 3 },
    ]
};

async function runSeed() {
    console.log('Seeding database...');
    try {
        await seedDatabase(seedData);
        console.log('Database seeded successfully!');
        console.log('-----------');
        console.log('Available users:');
        console.log('- superadmin@fwm.org (password)');
        console.log('- sitemanager@fwm.org (password)');
        console.log('- confmanager@fwm.org (password)');
        console.log('- hotelmanager@fwm.org (password)');
        console.log('-----------');
    } catch (error) {
        console.error('Failed to seed database:', error);
    }
}


// To make it easy to run, we can expose it globally for the browser console
(window as any).runDbSeed = runSeed;

// Also, let's check if the DB is already seeded. If not, seed it automatically.
if (!localStorage.getItem('fwm_db_seeded')) {
    runSeed();
}
