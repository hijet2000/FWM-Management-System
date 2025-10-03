import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Site, NotificationTemplate, TemplateType, LanguageCode, ChannelType } from '../../types.ts';
import useAuth from '../../hooks/useAuth.ts';
import { apiService } from '../../src/services/apiService.ts';
import { useToast } from '../../hooks/useToast.ts';
import Card from '../../components/ui/Card.tsx';
import Input from '../../components/ui/Input.tsx';
import Button from '../../components/ui/Button.tsx';
import Textarea from '../../components/ui/Textarea.tsx';
import ToggleSwitch from '../../components/ui/ToggleSwitch.tsx';

type SettingsContext = { site: Site };

const TEMPLATE_CONFIG = {
    [TemplateType.REGISTRATION_CONFIRMATION]: { name: 'Registration Confirmation', variables: ['firstName', 'lastName', 'eventName', 'ticketCode'] },
    [TemplateType.PAYMENT_RECEIPT]: { name: 'Payment Receipt', variables: ['firstName', 'amount', 'invoiceNumber', 'paymentDate'] },
    [TemplateType.BOOKING_CONFIRMATION]: { name: 'Booking Confirmation', variables: ['firstName', 'roomNumber', 'checkInDate', 'checkOutDate'] },
    [TemplateType.EVENT_REMINDER]: { name: 'Event Reminder', variables: ['firstName', 'eventName', 'eventDate', 'eventLocation'] },
};

const LANGUAGES = [
    { code: LanguageCode.EN, name: 'English' },
    { code: LanguageCode.SH, name: 'Shona' },
    { code: LanguageCode.ND, name: 'Ndebele' },
];

const VariableCatalog: React.FC<{ variables: string[] }> = ({ variables }) => (
    <Card title="Available Variables">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Click to copy a variable.</p>
        <div className="flex flex-wrap gap-2">
            {variables.map(variable => (
                <button 
                    key={variable} 
                    onClick={() => navigator.clipboard.writeText(`{{${variable}}}`)}
                    className="bg-gray-200 dark:bg-gray-700 text-xs font-mono p-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900"
                >
                    {`{{${variable}}}`}
                </button>
            ))}
        </div>
    </Card>
);

const NotificationTemplatesSettings: React.FC = () => {
    const { site } = useOutletContext<SettingsContext>();
    const { user, setCurrentSite } = useAuth();
    const { addToast } = useToast();
    
    const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
    const [selectedType, setSelectedType] = useState<TemplateType>(TemplateType.REGISTRATION_CONFIRMATION);
    const [activeLang, setActiveLang] = useState<LanguageCode>(LanguageCode.EN);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setTemplates(site.notificationTemplates || []);
    }, [site]);

    const getTemplate = (type: TemplateType, lang: LanguageCode, channel: ChannelType) => {
        return templates.find(t => t.type === type && t.language === lang && t.channel === channel);
    };

    const handleTemplateChange = (type: TemplateType, lang: LanguageCode, channel: ChannelType, updates: Partial<NotificationTemplate>) => {
        const existingTemplate = getTemplate(type, lang, channel);
        let newTemplates;
        if (existingTemplate) {
            newTemplates = templates.map(t => t.id === existingTemplate.id ? { ...t, ...updates } : t);
        } else {
            const newTemplate: NotificationTemplate = {
                id: `new_${Date.now()}`,
                siteId: site.id,
                type,
                language: lang,
                channel,
                subject: null,
                body: '',
                isEnabled: true,
                ...updates
            };
            newTemplates = [...templates, newTemplate];
        }
        setTemplates(newTemplates);
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        // Filter out any newly created but empty templates
        const templatesToSave = templates.filter(t => t.body?.trim() || t.subject?.trim());
        try {
            const updatedSite = await apiService.updateSite(
                site.id, 
                { notificationTemplates: templatesToSave },
                { userId: user.id, userEmail: user.email, reason: 'Updated notification templates' }
            );
            setCurrentSite(updatedSite);
            setTemplates(updatedSite.notificationTemplates || []); // Re-sync state with saved data
            addToast('Templates saved successfully!', 'success');
        } catch(err) {
            addToast((err as Error).message, 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    const selectedTemplateConfig = TEMPLATE_CONFIG[selectedType];
    const templateTypeLinkClasses = (type: TemplateType) => `block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${ selectedType === type ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'}`;
    const langTabClasses = (langCode: LanguageCode) => `whitespace-nowrap py-2 px-4 text-sm font-medium cursor-pointer rounded-t-md ${ activeLang === langCode ? 'bg-white dark:bg-gray-800 border-x border-t dark:border-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Template Type</h3>
                <nav className="space-y-1">
                    {Object.entries(TEMPLATE_CONFIG).map(([type, config]) => (
                        <button key={type} onClick={() => setSelectedType(type as TemplateType)} className={templateTypeLinkClasses(type as TemplateType)}>
                            {config.name}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="lg:col-span-3">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2">
                        <Card title={selectedTemplateConfig.name}>
                            <div className="border-b border-gray-200 dark:border-gray-700">
                                <nav className="-mb-px flex space-x-2" aria-label="Languages">
                                    {LANGUAGES.map(lang => (
                                        <button key={lang.code} onClick={() => setActiveLang(lang.code)} className={langTabClasses(lang.code)}>
                                            {lang.name}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                            <div className="pt-4 space-y-6">
                                {/* Email */}
                                <Card title="Email">
                                    <div className="space-y-4">
                                        <ToggleSwitch 
                                            label="Enable Email Notification" 
                                            enabled={getTemplate(selectedType, activeLang, ChannelType.EMAIL)?.isEnabled ?? false} 
                                            onChange={val => handleTemplateChange(selectedType, activeLang, ChannelType.EMAIL, { isEnabled: val })}
                                        />
                                        <Input 
                                            label="Subject" 
                                            value={getTemplate(selectedType, activeLang, ChannelType.EMAIL)?.subject ?? ''}
                                            onChange={e => handleTemplateChange(selectedType, activeLang, ChannelType.EMAIL, { subject: e.target.value })}
                                        />
                                        <Textarea 
                                            label="Body" 
                                            rows={8}
                                            value={getTemplate(selectedType, activeLang, ChannelType.EMAIL)?.body ?? ''}
                                            onChange={e => handleTemplateChange(selectedType, activeLang, ChannelType.EMAIL, { body: e.target.value })}
                                        />
                                    </div>
                                </Card>
                                {/* SMS */}
                                <Card title="SMS">
                                     <ToggleSwitch 
                                        label="Enable SMS Notification" 
                                        enabled={getTemplate(selectedType, activeLang, ChannelType.SMS)?.isEnabled ?? false} 
                                        onChange={val => handleTemplateChange(selectedType, activeLang, ChannelType.SMS, { isEnabled: val })}
                                    />
                                    <Textarea
                                        label="Message"
                                        rows={4}
                                        value={getTemplate(selectedType, activeLang, ChannelType.SMS)?.body ?? ''}
                                        onChange={e => handleTemplateChange(selectedType, activeLang, ChannelType.SMS, { body: e.target.value })}
                                        helperText="Keep it short and concise for SMS."
                                    />
                                </Card>
                                {/* WhatsApp */}
                                <Card title="WhatsApp">
                                    <ToggleSwitch 
                                        label="Enable WhatsApp Notification" 
                                        enabled={getTemplate(selectedType, activeLang, ChannelType.WHATSAPP)?.isEnabled ?? false} 
                                        onChange={val => handleTemplateChange(selectedType, activeLang, ChannelType.WHATSAPP, { isEnabled: val })}
                                    />
                                    <Textarea
                                        label="Message"
                                        rows={6}
                                        value={getTemplate(selectedType, activeLang, ChannelType.WHATSAPP)?.body ?? ''}
                                        onChange={e => handleTemplateChange(selectedType, activeLang, ChannelType.WHATSAPP, { body: e.target.value })}
                                    />
                                </Card>
                            </div>
                        </Card>
                        <div className="mt-6 flex justify-end">
                            <Button onClick={handleSave} isLoading={isSaving}>Save Templates</Button>
                        </div>
                    </div>
                     <div className="xl:col-span-1">
                        <div className="sticky top-24">
                            <VariableCatalog variables={selectedTemplateConfig.variables} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationTemplatesSettings;