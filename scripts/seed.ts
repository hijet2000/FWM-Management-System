// FIX: Added missing import for the RegistrationEvent type.
import { Site, SiteType, SiteStatus, User, Role, Permission, PermissionAction, Room, Booking, AuditLog, DataRequestLog, NotificationTemplate, TemplateType, LanguageCode, ChannelType, PaymentGatewayMode, PaymentSettings, SiteUsageMetrics, SettingsVersion, Attendee, TicketType, DiscountCode, Registration, RegistrationStatus, DiscountCodeType, RegistrationEvent, RegistrationEventType, Consent } from '../types.ts';

// Helper to generate IDs
const uid = () => Math.random().toString(36).substring(2, 9);

// Default settings objects
const defaultBranding = { primaryColor: '#4F46E5', accentColor: '#10B981', logoUrl: null, faviconUrl: null, pdfHeaderUrl: null, pdfFooterUrl: null };
const defaultLocalization = { timezone: 'UTC', locale: 'en-US', dateFormat: 'MM/DD/YYYY', timeFormat: 'h:mm A' };
const defaultFinance = { currency: 'USD', taxLabel: 'Tax', taxRate: 0, taxRegistrationNumber: null, invoicePrefix: 'INV-', nextInvoiceNumber: 1 };
const defaultPayment: PaymentSettings = { 
    stripe: { enabled: false, mode: PaymentGatewayMode.TEST, testPublicKey: '', testSecretKey: '', livePublicKey: '', liveSecretKey: '', webhookSecret: '' },
    paypal: { enabled: false, mode: PaymentGatewayMode.TEST, testClientId: '', testClientSecret: '', liveClientId: '', liveClientSecret: '', webhookId: '' },
    offline: { enabled: false, instructions: '', requiresApproval: false },
};
const defaultCommunication = {
    email: { apiKey: '', defaultSenderName: '', defaultSenderEmail: '', defaultReplyToEmail: '' },
    sms: { provider: '', accountSid: '', authToken: '', defaultSenderNumber: '' },
    whatsapp: { apiKey: '', phoneNumberId: '' },
};
const defaultPublicSettings = {};
const defaultDataProtection = {
    consentPolicyVersion: 'v1.0',
    retentionPolicies: { commsLogDays: 90, inactiveUserDays: 365 }
};
const defaultUsageMetrics: SiteUsageMetrics = {
    apiCallsToday: 0,
    apiCallLimit: 10000,
    errorsLast24h: 0,
};

const defaultNotificationTemplates: NotificationTemplate[] = [
    {
        id: uid(),
        siteId: 'site_conf_1',
        type: TemplateType.TICKET_ISSUED,
        language: LanguageCode.EN,
        channel: ChannelType.EMAIL,
        subject: 'Your Ticket for {{eventName}} is Here!',
        body: 'Hello {{firstName}},\n\nYour payment is confirmed! We are excited to have you at {{eventName}}.\n\nYour ticket code is: {{ticketCode}}.\n\nSee you soon!',
        isEnabled: true,
    },
    {
        id: uid(),
        siteId: 'site_conf_1',
        type: TemplateType.REGISTRATION_PENDING,
        language: LanguageCode.EN,
        channel: ChannelType.EMAIL,
        subject: 'Action Required: Complete Your Registration for {{eventName}}',
        body: 'Hi {{firstName}}, thanks for starting your registration for {{eventName}}. Please complete your payment to secure your spot. You can resume here: {{resumeLink}}',
        isEnabled: true,
    },
];


const seed = () => {
    // Permissions
    const resources = ['admin_panel', 'bank_portal', 'conference_portal', 'hotel_portal', 'church_portal', 'school_portal', 'settings', 'roles', 'attendees', 'registrations'];
    const actions = Object.values(PermissionAction);
    const permissions: Permission[] = [];
    resources.forEach(resource => {
        actions.forEach(action => {
            permissions.push({
                id: uid(),
                action,
                resource,
                description: `${action} ${resource}`
            });
        });
    });
    permissions.push({ id: uid(), action: PermissionAction.MANAGE, resource: '*', description: 'Super Admin' });
    localStorage.setItem('permissions', JSON.stringify(permissions));
    
    // Roles
    const superAdminRole: Role = { id: 'superadmin_role', name: 'Super Admin', siteId: null };
    const siteAdminRole: Role = { id: 'siteadmin_role', name: 'Site Admin', siteId: null };
    const registrarRole: Role = { id: 'registrar_role', name: 'Registrar', siteId: 'site_conf_1'};
    localStorage.setItem('roles', JSON.stringify([superAdminRole, siteAdminRole, registrarRole]));
    
    // Role-Permission mapping
    const superAdminPerms = permissions.map(p => p.id);
    const siteAdminPerms = permissions.filter(p => p.resource !== 'admin_panel' && p.resource !== '*').map(p => p.id);
    const registrarPerms = permissions.filter(p => ['attendees', 'registrations'].includes(p.resource)).map(p => p.id);
    const rolePermissions = {
        [superAdminRole.id]: superAdminPerms,
        [siteAdminRole.id]: siteAdminPerms,
        [registrarRole.id]: registrarPerms,
    };
    localStorage.setItem('role_permissions', JSON.stringify(rolePermissions));

    // Users
    const users: User[] = [
        { id: 'user_superadmin', email: 'superadmin@fwm.org', firstName: 'Super', lastName: 'Admin', roles: [{ roleId: superAdminRole.id, siteId: null }] },
        { id: 'user_siteadmin', email: 'siteadmin@fwm.org', firstName: 'Site', lastName: 'Admin', roles: [] },
    ];
    localStorage.setItem('users', JSON.stringify(users));

    // Sites
    const sites: Site[] = [
        { id: 'site_conf_1', name: 'FWM Annual Conference', type: SiteType.CONFERENCE, status: SiteStatus.ACTIVE, shortCode: 'fwm24', domains: ['conference.fwm.org', 'fwm-conference.com'], branding: defaultBranding, publicSettings: { registrationEnabled: true }, localization: defaultLocalization, finance: defaultFinance, paymentSettings: defaultPayment, communication: defaultCommunication, dataProtection: defaultDataProtection, notificationTemplates: defaultNotificationTemplates, usageMetrics: { ...defaultUsageMetrics, apiCallsToday: 1253, errorsLast24h: 5 } },
        { id: 'site_hotel_1', name: 'FWM Retreat Center', type: SiteType.HOTEL, status: SiteStatus.ACTIVE, shortCode: 'fwm-retreat', domains: ['retreat.fwm.org'], branding: defaultBranding, publicSettings: { bookingEnabled: true }, localization: defaultLocalization, finance: defaultFinance, paymentSettings: defaultPayment, communication: defaultCommunication, dataProtection: defaultDataProtection, notificationTemplates: [], usageMetrics: { ...defaultUsageMetrics, apiCallsToday: 488, errorsLast24h: 0 } },
        { id: 'site_church_1', name: 'FWM Main Campus', type: SiteType.CHURCH, status: SiteStatus.INACTIVE, shortCode: 'fwm-campus', domains: [], branding: defaultBranding, publicSettings: {}, localization: defaultLocalization, finance: defaultFinance, paymentSettings: defaultPayment, communication: defaultCommunication, dataProtection: defaultDataProtection, notificationTemplates: [], usageMetrics: defaultUsageMetrics },
    ];
    localStorage.setItem('sites', JSON.stringify(sites));

    // Assign site admin role to site admin user for a specific site
    const siteAdminUser = users.find(u => u.id === 'user_siteadmin')!;
    if (siteAdminUser) {
        siteAdminUser.roles.push({ roleId: siteAdminRole.id, siteId: 'site_conf_1' });
        siteAdminUser.roles.push({ roleId: siteAdminRole.id, siteId: 'site_hotel_1' });
        localStorage.setItem('users', JSON.stringify(users));
    }

    // --- SEED REGISTRATION DATA FOR site_conf_1 ---
    const confSiteId = 'site_conf_1';
    
    const ticketTypes: TicketType[] = [
        { id: 'tt_early', siteId: confSiteId, name: 'Early Bird', description: 'Get your ticket now at a discounted price!', price: 50, capacity: 100, saleStartDate: new Date('2024-01-01').toISOString(), saleEndDate: new Date('2024-08-01').toISOString(), isWaitlistEnabled: true },
        { id: 'tt_standard', siteId: confSiteId, name: 'Standard Admission', description: 'Regular access to all conference sessions.', price: 75, capacity: 300, saleStartDate: new Date('2024-01-01').toISOString(), saleEndDate: new Date('2024-10-15').toISOString(), isWaitlistEnabled: true },
        { id: 'tt_vip', siteId: confSiteId, name: 'VIP Access', description: 'Includes front-row seating and an exclusive lunch.', price: 150, capacity: 50, saleStartDate: new Date('2024-01-01').toISOString(), saleEndDate: new Date('2024-10-15').toISOString(), isWaitlistEnabled: false },
    ];
    localStorage.setItem('ticket_types', JSON.stringify(ticketTypes));
    
    const discountCodes: DiscountCode[] = [
        { id: 'dc_save10', siteId: confSiteId, code: 'SAVE10', type: DiscountCodeType.PERCENT, value: 10, usageLimit: 50, usedCount: 12, appliesToTicketTypeId: 'tt_standard' },
        { id: 'dc_staff', siteId: confSiteId, code: 'STAFFCOMP', type: DiscountCodeType.PERCENT, value: 100, usageLimit: 20, usedCount: 5 },
    ];
    localStorage.setItem('discount_codes', JSON.stringify(discountCodes));
    
    const attendees: Attendee[] = [];
    const registrations: Registration[] = [];
    const consents: Consent[] = [];
    const registrationEvents: RegistrationEvent[] = [];

    const createRegistration = (attendee: Omit<Attendee, 'id' | 'registrations' | 'consents'>, ticketTypeId: string, status: RegistrationStatus, groupPayerId?: string) => {
        const attendeeId = uid();
        const regId = uid();
        const newAttendee: Attendee = { id: attendeeId, ...attendee, registrations: [], consents: [] };
        const newReg: Registration = { id: regId, siteId: confSiteId, attendeeId, ticketTypeId, status, createdAt: new Date().toISOString(), pricePaid: status === RegistrationStatus.PAID ? ticketTypes.find(t=>t.id===ticketTypeId)!.price : 0, qrCodeValue: `FWM24-${uid()}`, groupPayerId };
        
        const newConsent: Consent = { id: uid(), attendeeId, policyVersion: 'v1.0', consentType: 'PRIVACY', isGiven: true, timestamp: new Date().toISOString() };
        
        attendees.push(newAttendee);
        registrations.push(newReg);
        consents.push(newConsent);
        
        registrationEvents.push({
            id: uid(),
            registrationId: regId,
            timestamp: new Date().toISOString(),
            type: RegistrationEventType.CREATED,
            details: `Registration created with status ${status}.`,
            triggeredByUserId: 'system',
            triggeredByUserEmail: 'System',
        });
        if (status === RegistrationStatus.PAID) {
            registrationEvents.push({
                 id: uid(),
                registrationId: regId,
                timestamp: new Date().toISOString(),
                type: RegistrationEventType.PAYMENT_SUCCESS,
                details: `Payment of $${newReg.pricePaid} recorded.`,
                triggeredByUserId: 'system',
                triggeredByUserEmail: 'System',
            });
        }
    };
    
    // Seed Paid Attendees
    for (let i = 0; i < 30; i++) createRegistration({ siteId: confSiteId, firstName: `StandardUser${i}`, lastName: 'Paid', email: `standard.paid${i}@test.com`}, 'tt_standard', RegistrationStatus.PAID);
    for (let i = 0; i < 10; i++) createRegistration({ siteId: confSiteId, firstName: `VipUser${i}`, lastName: 'Paid', email: `vip.paid${i}@test.com`}, 'tt_vip', RegistrationStatus.PAID);

    // Seed Unpaid & Draft
    createRegistration({ siteId: confSiteId, firstName: 'Pending', lastName: 'User', email: 'pending@test.com'}, 'tt_standard', RegistrationStatus.PENDING_PAYMENT);
    createRegistration({ siteId: confSiteId, firstName: 'Draft', lastName: 'User', email: 'draft@test.com'}, 'tt_standard', RegistrationStatus.DRAFT);
    
    // Seed Duplicate
    createRegistration({ siteId: confSiteId, firstName: 'Duplicate', lastName: 'One', email: 'duplicate@test.com'}, 'tt_standard', RegistrationStatus.PAID);
    createRegistration({ siteId: confSiteId, firstName: 'Duplicate', lastName: 'Two', email: 'duplicate@test.com'}, 'tt_early', RegistrationStatus.PENDING_PAYMENT);

    // Seed Group Booking
    const payerId = attendees.find(a => a.email === 'vip.paid0@test.com')!.id;
    createRegistration({ siteId: confSiteId, firstName: 'Groupie', lastName: 'One', email: 'groupie1@test.com'}, 'tt_vip', RegistrationStatus.PAID, payerId);
    createRegistration({ siteId: confSiteId, firstName: 'Groupie', lastName: 'Two', email: 'groupie2@test.com'}, 'tt_vip', RegistrationStatus.PAID, payerId);
    
    localStorage.setItem('attendees', JSON.stringify(attendees));
    localStorage.setItem('registrations', JSON.stringify(registrations));
    localStorage.setItem('consents', JSON.stringify(consents));
    localStorage.setItem('registration_events', JSON.stringify(registrationEvents));


    // --- SEED OTHER DATA ---
    const rooms: Room[] = [
        { id: 'room_101', roomNumber: '101', type: 'King Suite', siteId: 'site_hotel_1' },
        { id: 'room_102', roomNumber: '102', type: 'Double Queen', siteId: 'site_hotel_1' },
    ];
    localStorage.setItem('rooms', JSON.stringify(rooms));
    
    const bookings: Booking[] = [
        { id: uid(), guestName: 'Alice Johnson', roomId: 'room_101', siteId: 'site_hotel_1', checkIn: new Date('2024-08-10').toISOString(), checkOut: new Date('2024-08-15').toISOString() },
    ];
    localStorage.setItem('bookings', JSON.stringify(bookings));

    const auditLogs: AuditLog[] = [
        { id: uid(), timestamp: new Date().toISOString(), userId: 'user_superadmin', userEmail: 'superadmin@fwm.org', action: 'role.create', details: { roleName: 'Events Team' }, siteId: 'site_conf_1' }
    ];
    localStorage.setItem('audit_logs', JSON.stringify(auditLogs));

    const dataRequestLogs: DataRequestLog[] = [
        { id: uid(), type: 'EXPORT', status: 'COMPLETED', requestedAt: new Date(Date.now() - 86400000).toISOString(), requestedByUserId: 'user_siteadmin', requestedByUserEmail: 'siteadmin@fwm.org', redactPii: true, downloadUrl: '#', siteId: 'site_conf_1' }
    ];
    localStorage.setItem('data_request_logs', JSON.stringify(dataRequestLogs));

    const settingsVersions: SettingsVersion[] = [
        {
            id: uid(),
            siteId: 'site_conf_1',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
            createdByUserId: 'user_superadmin',
            createdByUserEmail: 'superadmin@fwm.org',
            settingsSnapshot: sites[0], // Initial state
            changeReason: 'Initial site creation'
        }
    ];
    localStorage.setItem('settings_versions', JSON.stringify(settingsVersions));


    console.log('Database seeded!');
};

// Only seed if db is empty
if (!localStorage.getItem('users')) {
    seed();
}