import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Site, LocalizationSettings } from '../../types.ts';
import useAuth from '../../hooks/useAuth.ts';
import { apiService } from '../../src/services/apiService.ts';
import { useToast } from '../../hooks/useToast.ts';
import Card from '../../components/ui/Card.tsx';
import Select from '../../components/ui/Select.tsx';
import Button from '../../components/ui/Button.tsx';

type SettingsContext = { site: Site };

// Mock data for dropdowns
const timezones = [
    { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
];
const locales = [
    { value: 'en-US', label: 'English (United States)' },
    { value: 'en-GB', label: 'English (United Kingdom)' },
    { value: 'es-ES', label: 'Español (España)' },
    { value: 'fr-FR', label: 'Français (France)' },
];
const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
    { value: 'Month D, YYYY', label: 'Month D, YYYY' },
];
const timeFormats = [
    { value: 'h:mm A', label: '12-hour (e.g., 3:30 PM)' },
    { value: 'HH:mm', label: '24-hour (e.g., 15:30)' },
];

const LocalizationSettings: React.FC = () => {
    const { site } = useOutletContext<SettingsContext>();
    const { user, setCurrentSite } = useAuth();
    const { addToast } = useToast();
    const [formData, setFormData] = useState<LocalizationSettings>({
        timezone: 'UTC',
        locale: 'en-US',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: 'h:mm A'
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (site && site.localization) {
            setFormData(site.localization);
        }
    }, [site]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);
        try {
            const updatedSite = await apiService.updateSite(
                site.id, 
                { localization: formData },
                { userId: user.id, userEmail: user.email, reason: 'Updated localization settings' }
            );
            setCurrentSite(updatedSite);
            addToast('Localization settings saved!', 'success');
        } catch(err) {
            addToast((err as Error).message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="Localization">
            <form onSubmit={handleSubmit} className="space-y-6">
                <Select label="Timezone" name="timezone" value={formData.timezone} onChange={handleChange} options={timezones} />
                <Select label="Locale" name="locale" value={formData.locale} onChange={handleChange} options={locales} helperText="Determines language and regional formatting for numbers and dates." />
                <Select label="Date Format" name="dateFormat" value={formData.dateFormat} onChange={handleChange} options={dateFormats} />
                <Select label="Time Format" name="timeFormat" value={formData.timeFormat} onChange={handleChange} options={timeFormats} />
                
                <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                    <Button type="submit" isLoading={isLoading}>Save Changes</Button>
                </div>
            </form>
        </Card>
    );
};
export default LocalizationSettings;