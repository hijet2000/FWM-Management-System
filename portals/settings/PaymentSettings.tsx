import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Site, PaymentSettings, PaymentGatewayMode } from '../../types.ts';
import useAuth from '../../hooks/useAuth.ts';
import { apiService } from '../../src/services/apiService.ts';
import { useToast } from '../../hooks/useToast.ts';
import Card from '../../components/ui/Card.tsx';
import Input from '../../components/ui/Input.tsx';
import PasswordInput from '../../components/ui/PasswordInput.tsx';
import Button from '../../components/ui/Button.tsx';
import ToggleSwitch from '../../components/ui/ToggleSwitch.tsx';
import Textarea from '../../components/ui/Textarea.tsx';

type SettingsContext = { site: Site };

const PaymentSettings: React.FC = () => {
    const { site } = useOutletContext<SettingsContext>();
    const { user, setCurrentSite } = useAuth();
    const { addToast } = useToast();

    const [formData, setFormData] = useState<PaymentSettings>({
        stripe: { enabled: false, mode: PaymentGatewayMode.TEST, testPublicKey: '', testSecretKey: '', livePublicKey: '', liveSecretKey: '', webhookSecret: '' },
        paypal: { enabled: false, mode: PaymentGatewayMode.TEST, testClientId: '', testClientSecret: '', liveClientId: '', liveClientSecret: '', webhookId: '' },
        offline: { enabled: false, instructions: '', requiresApproval: false },
    });
    
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (site && site.paymentSettings) {
            setFormData(site.paymentSettings);
        }
    }, [site]);

    // FIX: Widened the type of `e` to include `HTMLTextAreaElement` to support the Textarea component's onChange event.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const [category, field] = name.split('.');
        
        setFormData(prev => ({
            ...prev,
            [category]: {
                ...prev[category as keyof PaymentSettings],
                [field]: value
            }
        }));
    };
    
    const handleToggle = (name: string, enabled: boolean) => {
        const [category, field] = name.split('.');
        if (category === 'stripe' && field === 'mode' && enabled) {
            addToast('You are switching to LIVE mode. Please ensure you are using live API keys.', 'info');
        }
        setFormData(prev => ({
            ...prev,
            [category]: {
                ...prev[category as keyof PaymentSettings],
                [field]: field === 'mode' ? (enabled ? PaymentGatewayMode.LIVE : PaymentGatewayMode.TEST) : enabled,
            }
        }));
    };
    
    const handleSimulateWebhook = (gateway: string) => {
        console.log(`Simulating ${gateway} webhook for site ${site.id}...`);
        addToast(`Simulated ${gateway} webhook event sent.`, 'success');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);
        try {
            const updatedSite = await apiService.updateSite(
                site.id, 
                { paymentSettings: formData },
                { userId: user.id, userEmail: user.email, reason: 'Updated payment gateway settings' }
            );
            setCurrentSite(updatedSite);
            addToast('Payment settings saved!', 'success');
        } catch(err) {
            addToast((err as Error).message, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card title="Stripe">
                <div className="space-y-4">
                    <ToggleSwitch label="Enable Stripe" enabled={formData.stripe.enabled} onChange={(val) => handleToggle('stripe.enabled', val)} />
                    {formData.stripe.enabled && (
                        <div className="pl-4 border-l-2 dark:border-gray-700 space-y-4">
                            <ToggleSwitch label={formData.stripe.mode === 'LIVE' ? 'Mode: LIVE' : 'Mode: Test'} enabled={formData.stripe.mode === 'LIVE'} onChange={(val) => handleToggle('stripe.mode', val)} />
                            {formData.stripe.mode === 'TEST' ? (
                                <>
                                <Input label="Test Public Key" name="stripe.testPublicKey" value={formData.stripe.testPublicKey} onChange={handleChange} />
                                <PasswordInput label="Test Secret Key" name="stripe.testSecretKey" value={formData.stripe.testSecretKey} onChange={handleChange} />
                                </>
                            ) : (
                                <>
                                <Input label="Live Public Key" name="stripe.livePublicKey" value={formData.stripe.livePublicKey} onChange={handleChange} />
                                <PasswordInput label="Live Secret Key" name="stripe.liveSecretKey" value={formData.stripe.liveSecretKey} onChange={handleChange} />
                                </>
                            )}
                             <PasswordInput label="Webhook Signing Secret" name="stripe.webhookSecret" value={formData.stripe.webhookSecret} onChange={handleChange} />
                             <div className="pt-4 border-t dark:border-gray-700">
                                <Button type="button" variant="secondary" onClick={() => handleSimulateWebhook('Stripe')}>Simulate Webhook</Button>
                             </div>
                        </div>
                    )}
                </div>
            </Card>

            <Card title="PayPal">
                <ToggleSwitch label="Enable PayPal" enabled={formData.paypal.enabled} onChange={(val) => handleToggle('paypal.enabled', val)} />
                {formData.paypal.enabled && <p className="text-sm text-center text-gray-500 dark:text-gray-400 p-4">PayPal configuration options will be available here.</p>}
            </Card>

            <Card title="Offline / Bank Transfer">
                 <div className="space-y-4">
                    <ToggleSwitch label="Enable Offline Payments" enabled={formData.offline.enabled} onChange={(val) => handleToggle('offline.enabled', val)} />
                    {formData.offline.enabled && (
                         <div className="pl-4 border-l-2 dark:border-gray-700 space-y-4">
                             <Textarea label="Instructions for Customer" name="offline.instructions" value={formData.offline.instructions} onChange={handleChange} />
                             <ToggleSwitch label="Require manual approval for offline payments" enabled={formData.offline.requiresApproval} onChange={(val) => handleToggle('offline.requiresApproval', val)} />
                         </div>
                    )}
                 </div>
            </Card>
            
            <div className="flex justify-end pt-4">
                <Button type="submit" isLoading={isLoading}>Save All Changes</Button>
            </div>
        </form>
    );
};
export default PaymentSettings;