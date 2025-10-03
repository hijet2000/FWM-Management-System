import React from 'react';
import { plans, Plan } from '../../src/config/plans.ts';
import Card from '../../components/ui/Card.tsx';
import Button from '../../components/ui/Button.tsx';

const CheckIcon = () => (
    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const XIcon = () => (
    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);


const PlanCard: React.FC<{ plan: Plan }> = ({ plan }) => (
    <Card className={`flex flex-col ${plan.isCurrent ? 'border-2 border-indigo-500' : ''} ${plan.isPopular ? 'relative' : ''}`}>
        {plan.isPopular && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Most Popular</div>}
        <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">{plan.description}</p>
            <p className="mt-6">
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{plan.price.startsWith('Contact') ? plan.price : `$${plan.price}`}</span>
                <span className="text-base font-medium text-gray-500 dark:text-gray-400">{plan.pricePeriod}</span>
            </p>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex-grow">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-300">What's included</h4>
            <ul className="mt-4 space-y-3">
                {plan.features.map(feature => (
                    <li key={feature.text} className="flex items-start">
                        {feature.included ? <CheckIcon /> : <XIcon />}
                        <span className={`ml-3 text-sm ${feature.included ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500 line-through'}`}>{feature.text}</span>
                    </li>
                ))}
            </ul>
        </div>
        <div className="p-6">
             <Button className="w-full" disabled={plan.isCurrent}>
                {plan.isCurrent ? 'Current Plan' : (plan.price.startsWith('Contact') ? 'Contact Sales' : 'Upgrade')}
             </Button>
        </div>
    </Card>
);

const SubscriptionSettings: React.FC = () => {
    return (
        <Card title="Subscription & Billing">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map(plan => (
                    <PlanCard key={plan.id} plan={plan} />
                ))}
            </div>
        </Card>
    );
};

export default SubscriptionSettings;