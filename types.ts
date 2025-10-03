// types.ts

// --- ENUMS ---

export enum SiteType {
  CONFERENCE = 'CONFERENCE',
  HOTEL = 'HOTEL',
  CHURCH = 'CHURCH',
  SCHOOL = 'SCHOOL',
  BANK = 'BANK',
  HR = 'HR',
  COMMS = 'COMMS',
}

export enum SiteStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  EXPORT = 'export',
  IMPORT = 'import',
}

export enum PaymentGatewayMode {
    TEST = 'TEST',
    LIVE = 'LIVE'
}

export enum TemplateType {
    REGISTRATION_CONFIRMATION = 'REGISTRATION_CONFIRMATION',
    PAYMENT_RECEIPT = 'PAYMENT_RECEIPT',
    BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
    EVENT_REMINDER = 'EVENT_REMINDER',
    REGISTRATION_PENDING = 'REGISTRATION_PENDING',
    TICKET_ISSUED = 'TICKET_ISSUED',
}

export enum LanguageCode {
    EN = 'EN', // English
    SH = 'SH', // Shona
    ND = 'ND', // Ndebele
}

export enum ChannelType {
    EMAIL = 'EMAIL',
    SMS = 'SMS',
    WHATSAPP = 'WHATSAPP',
}

export enum SystemServiceStatus {
    OPERATIONAL = 'OPERATIONAL',
    DEGRADED = 'DEGRADED',
    OUTAGE = 'OUTAGE',
}

// FIX: Added missing SystemHealth type definition.
export type SystemHealth = {
    database: SystemServiceStatus;
    queues: SystemServiceStatus;
    emailProvider: SystemServiceStatus;
    smsProvider: SystemServiceStatus;
    storage: SystemServiceStatus;
};

export enum RegistrationStatus {
    DRAFT = 'DRAFT',
    PENDING_PAYMENT = 'PENDING_PAYMENT',
    PAID = 'PAID',
    CANCELLED = 'CANCELLED',
    WAITLIST = 'WAITLIST',
}

export enum DiscountCodeType {
    PERCENT = 'PERCENT',
    FIXED = 'FIXED',
}

export enum RegistrationEventType {
    CREATED = 'CREATED',
    PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
    TICKET_TRANSFERRED = 'TICKET_TRANSFERRED',
    STATUS_CHANGED = 'STATUS_CHANGED',
    ATTENDEE_MERGED = 'ATTENDEE_MERGED',
    REGISTRATION_UPDATED = 'REGISTRATION_UPDATED',
}

// --- CORE MODELS ---

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: { roleId: string; siteId: string | null }[];
};

export type Role = {
  id: string;
  name: string;
  siteId: string | null; // null for global roles
};

export type Permission = {
  id: string;
  action: PermissionAction;
  resource: string;
  description: string;
};

export type Site = {
  id: string;
  name: string;
  type: SiteType;
  shortCode: string | null;
  domains: string[];
  status: SiteStatus;
  branding: BrandingProfile;
  publicSettings: PublicPortalSettings;
  localization: LocalizationSettings;
  finance: FinanceSettings;
  paymentSettings: PaymentSettings;
  communication: CommunicationSettings;
  dataProtection: DataProtectionSettings;
  notificationTemplates: NotificationTemplate[];
  usageMetrics: SiteUsageMetrics;
};

// --- REGISTRATION & ATTENDEES MODULE ---

export type Attendee = {
  id: string;
  siteId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  organization?: string;
  role?: string; // e.g., Delegate, VIP, Staff
  // Optional custom fields
  accessibilityNeeds?: string;
  visaInfo?: {
      passportNumber: string;
      nationality: string;
  };
  // Relations
  registrations: Registration[];
  consents: Consent[];
};

export type Registration = {
  id: string;
  siteId: string;
  attendeeId: string;
  ticketTypeId: string;
  discountCodeId?: string;
  status: RegistrationStatus;
  createdAt: string; // ISO date
  pricePaid: number;
  qrCodeValue: string;
  groupPayerId?: string; // Links to an Attendee who paid for this
};

export type TicketType = {
  id: string;
  siteId: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  saleStartDate: string; // ISO date
  saleEndDate: string; // ISO date
  isWaitlistEnabled: boolean;
};

export type DiscountCode = {
  id: string;
  siteId: string;
  code: string;
  type: DiscountCodeType;
  value: number;
  usageLimit: number;
  usedCount: number;
  appliesToTicketTypeId?: string; // Optional: restrict to a specific tier
};

export type Consent = {
  id: string;
  attendeeId: string;
  policyVersion: string;
  consentType: 'PRIVACY' | 'MARKETING' | 'PHOTO';
  isGiven: boolean;
  timestamp: string; // ISO date
};

export type RegistrationEvent = {
  id: string;
  registrationId: string;
  timestamp: string; // ISO date
  type: RegistrationEventType;
  details: string; // e.g., "Status changed from PENDING_PAYMENT to PAID"
  triggeredByUserId: string;
  triggeredByUserEmail: string;
};

// --- HOTEL MODULE ---
export type Room = {
  id: string;
  roomNumber: string;
  type: string; // 'Single', 'Double', 'Suite'
  siteId: string;
};

export type Booking = {
  id: string;
  guestName: string;
  roomId: string;
  siteId: string;
  checkIn: string;
  checkOut: string;
};

// --- SETTINGS & CONFIG SUB-MODELS ---

export type BrandingProfile = {
  primaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  pdfHeaderUrl: string | null;
  pdfFooterUrl: string | null;
};

export type LocalizationSettings = {
    timezone: string;
    locale: string;
    dateFormat: string;
    timeFormat: string;
};

export type FinanceSettings = {
    currency: string;
    taxLabel: string;
    taxRate: number;
    taxRegistrationNumber: string | null;
    invoicePrefix: string;
    nextInvoiceNumber: number;
};

export type StripeSettings = {
    enabled: boolean;
    mode: PaymentGatewayMode;
    testPublicKey: string;
    testSecretKey: string;
    livePublicKey: string;
    liveSecretKey: string;
    webhookSecret: string;
};

export type PayPalSettings = {
    enabled: boolean;
    mode: PaymentGatewayMode;
    testClientId: string;
    testClientSecret: string;
    liveClientId: string;
    liveClientSecret: string;
    webhookId: string;
};

export type OfflinePaymentSettings = {
    enabled: boolean;
    instructions: string;
    requiresApproval: boolean;
};

export type PaymentSettings = {
    stripe: StripeSettings;
    paypal: PayPalSettings;
    offline: OfflinePaymentSettings;
};

export type EmailCommunicationSettings = {
    apiKey: string;
    defaultSenderName: string;
    defaultSenderEmail: string;
    defaultReplyToEmail: string;
};

export type SmsCommunicationSettings = {
    provider: string;
    accountSid: string;
    authToken: string;
    defaultSenderNumber: string;
};

export type WhatsAppCommunicationSettings = {
    apiKey: string;
    phoneNumberId: string;
};

export type CommunicationSettings = {
    email: EmailCommunicationSettings;
    sms: SmsCommunicationSettings;
    whatsapp: WhatsAppCommunicationSettings;
};

export type PublicPortalSettings = {
    [key: string]: boolean;
};

export type DataProtectionSettings = {
    consentPolicyVersion: string;
    retentionPolicies: {
        commsLogDays: number; // -1 for never
        inactiveUserDays: number; // -1 for never
    };
};

export type NotificationTemplate = {
    id: string;
    siteId: string;
    type: TemplateType;
    language: LanguageCode;
    channel: ChannelType;
    subject: string | null; // For email
    body: string;
    isEnabled: boolean;
};

export type SiteUsageMetrics = {
    apiCallsToday: number;
    apiCallLimit: number;
    errorsLast24h: number;
};

export type SettingsVersion = {
    id: string;
    siteId: string;
    createdAt: string; // ISO date
    createdByUserId: string;
    createdByUserEmail: string;
    settingsSnapshot: Site;
    changeReason: string;
};

// --- LOGGING & HISTORY ---
export type AuditLog = {
    id: string;
    timestamp: string;
    userId: string;
    userEmail: string;
    action: string; // e.g., 'role.create', 'role.update', 'role.delete'
    details: {
        roleName: string;
        changes?: any;
    };
    siteId: string;
};

export type DataRequestLog = {
    id: string;
    type: 'EXPORT' | 'ERASURE';
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    requestedAt: string; // ISO date
    requestedByUserId: string;
    requestedByUserEmail: string;
    redactPii: boolean;
    downloadUrl: string | null;
    siteId: string;
};