import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Site, CommunicationSettings } from '../../types.ts';
import useAuth from '../../hooks/useAuth.ts';
import { apiService } from '../../src/services/apiService.ts';
import { useToast } from '../../hooks/useToast.ts';
import Card from '../../components/ui/Card.tsx';
import Input from '../../components/ui/Input.tsx';
import PasswordInput from '../../components/ui/PasswordInput.tsx';
import Button from '../../components/ui/Button.tsx';

type SettingsContext = { site: Site };

const CommunicationSettings: React.FC = () => {
    const { site } = useOutletContext<SettingsContext>();
    const { user, setCurrentSite } = useAuth();
    const { addToast } = useToast();

    const [formData, setFormData] = useState<CommunicationSettings>({
        email: { apiKey: '', defaultSenderName: '', defaultSenderEmail: '', defaultReplyToEmail: '' },
        sms: { provider: '', accountSid: '', authToken: '', defaultSenderNumber: '' },
        whatsapp: { apiKey: '', phoneNumberId: '' },
    });
    
    const [testRecipients, setTestRecipients] = useState({ email: '', sms: '', whatsapp: '' });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (site && site.communication) {
            setFormData(site.communication);
        }
    }, [site]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const [category, field] = name.split('.');
        
        setFormData(prev => ({
            ...prev,
            [category]: {
                ...prev[category as keyof CommunicationSettings],
                [field]: value
            }
        }));
    };
    
    const handleTestRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTestRecipients(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSendTest = (type: 'email' | 'sms' | 'whatsapp') => {
        const recipient = testRecipients[type];
        if (!recipient) {
            addToast(`Please enter a recipient ${type}.`, 'error');
            return;
        }
        // Mock API call
        console.log(`Sending test ${type} to ${recipient} with config:`, formData[type]);
        addToast(`Test ${type} sent to ${recipient}!`, 'success');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);
        try {
            const updatedSite = await apiService.updateSite(
                site.id, 
                { communication: formData },
                { userId: user.id, userEmail: user.email, reason: 'Updated communication provider settings' }
            );
            setCurrentSite(updatedSite);
            addToast('Communication settings saved!', 'success');
        } catch(err) {
            addToast((err as Error).message, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card title="Email Configuration (SMTP / API)">
                <div className="space-y-4">
                    <PasswordInput label="API Key" name="email.apiKey" value={formData.email.apiKey} onChange={handleChange} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Default Sender Name" name="email.defaultSenderName" value={formData.email.defaultSenderName} onChange={handleChange} placeholder="FWM Conference" />
                        <Input label="Default Sender Email" name="email.defaultSenderEmail" type="email" value={formData.email.defaultSenderEmail} onChange={handleChange} placeholder="noreply@fwm.org" />
                    </div>
                    <Input label="Default Reply-To Email" name="email.defaultReplyToEmail" type="email" value={formData.email.defaultReplyToEmail} onChange={handleChange} placeholder="contact@fwm.org" />
                     <div className="pt-4 border-t dark:border-gray-700 flex items-end gap-2">
                        <Input label="Test Email Recipient" name="email" value={testRecipients.email} onChange={handleTestRecipientChange} type="email" placeholder="test@example.com" />
                        <Button type="button" variant="secondary" onClick={() => handleSendTest('email')}>Send Test</Button>
                    </div>
                </div>
            </Card>

            <Card title="SMS Configuration">
                 <div className="space-y-4">
                    <Input label="Provider" name="sms.provider" value={formData.sms.provider} onChange={handleChange} placeholder="e.g., Twilio" />
                    <PasswordInput label="Account SID / API Key" name="sms.accountSid" value={formData.sms.accountSid} onChange={handleChange} />
                    <PasswordInput label="Auth Token / API Secret" name="sms.authToken" value={formData.sms.authToken} onChange={handleChange} />
                    <Input label="Default Sender Number" name="sms.defaultSenderNumber" value={formData.sms.defaultSenderNumber} onChange={handleChange} placeholder="+15551234567" />
                     <div className="pt-4 border-t dark:border-gray-700 flex items-end gap-2">
                        <Input label="Test Phone Number" name="sms" value={testRecipients.sms} onChange={handleTestRecipientChange} type="tel" placeholder="+15557654321" />
                        <Button type="button" variant="secondary" onClick={() => handleSendTest('sms')}>Send Test</Button>
                    </div>
                </div>
            </Card>
            
            <Card title="WhatsApp Configuration">
                <div className="space-y-4">
                    <PasswordInput label="API Key" name="whatsapp.apiKey" value={formData.whatsapp.apiKey} onChange={handleChange} />
                    <Input label="Phone Number ID" name="whatsapp.phoneNumberId" value={formData.whatsapp.phoneNumberId} onChange={handleChange} />
                    <div className="pt-4 border-t dark:border-gray-700 flex items-end gap-2">
                        <Input label="Test Phone Number" name="whatsapp" value={testRecipients.whatsapp} onChange={handleTestRecipientChange} type="tel" placeholder="+15557654321" />
                        <Button type="button" variant="secondary" onClick={() => handleSendTest('whatsapp')}>Send Test</Button>
                    </div>
                </div>
            </Card>
            
            <div className="flex justify-end pt-4">
                <Button type="submit" isLoading={isLoading}>Save All Changes</Button>
            </div>
        </form>
    );
};
export default CommunicationSettings;