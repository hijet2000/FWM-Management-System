export type PlanFeature = {
    text: string;
    included: boolean;
};

export type Plan = {
    id: string;
    name: string;
    price: string;
    pricePeriod: string;
    description: string;
    features: PlanFeature[];
    isCurrent?: boolean;
    isPopular?: boolean;
};

export const plans: Plan[] = [
    {
        id: 'plan_basic',
        name: 'Basic',
        price: '99',
        pricePeriod: '/month',
        description: 'Essential tools for small organizations and single sites.',
        features: [
            { text: 'Up to 500 members', included: true },
            { text: 'Single Site Management', included: true },
            { text: 'Basic Reporting', included: true },
            { text: 'Community Support', included: true },
            { text: 'Advanced Branding', included: false },
            { text: 'API Access', included: false },
        ],
        isCurrent: true,
    },
    {
        id: 'plan_pro',
        name: 'Professional',
        price: '249',
        pricePeriod: '/month',
        description: 'Comprehensive features for growing ecosystems.',
        features: [
            { text: 'Up to 5000 members', included: true },
            { text: 'Up to 5 Sites', included: true },
            { text: 'Advanced Reporting & Analytics', included: true },
            { text: 'Priority Email Support', included: true },
            { text: 'Advanced Branding', included: true },
            { text: 'API Access', included: false },
        ],
        isPopular: true,
    },
    {
        id: 'plan_enterprise',
        name: 'Enterprise',
        price: 'Contact Us',
        pricePeriod: '',
        description: 'Tailored solutions for large-scale, multi-site organizations.',
        features: [
            { text: 'Unlimited members', included: true },
            { text: 'Unlimited Sites', included: true },
            { text: 'Custom Reporting', included: true },
            { text: 'Dedicated Account Manager', included: true },
            { text: 'Advanced Branding', included: true },
            { text: 'API Access & Integrations', included: true },
        ],
    }
];
