import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Site, SiteStatus } from '../../types.ts';
import useAuth from '../../hooks/useAuth.ts';
import { apiService } from '../../src/services/apiService.ts';
import { useToast } from '../../hooks/useToast.ts';
import Card from '../../components/ui/Card.tsx';
import Input from '../../components/ui/Input.tsx';
import Button from '../../components/ui/Button.tsx';

type SettingsContext = { site: Site };

const TenantProfileSettings: React.FC = () => {
    const { site } = useOutletContext<SettingsContext>();
    const { user, setCurrentSite } = useAuth();
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        shortCode: '',
        domains: '', // as comma-separated string
        status: SiteStatus.ACTIVE
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (site) {
            setFormData({
                shortCode: site.shortCode || '',
                domains: site.domains?.join(', ') || '',
                status: site.status
            });
        }
    }, [site]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);
        const domainsArray = formData.domains.split(',').map(d => d.trim()).filter(Boolean);
        try {
            const updatedSite = await apiService.updateSite(site.id, {
                shortCode: formData.shortCode,
                domains: domainsArray,
                status: formData.status
            }, { 
                userId: user.id, 
                userEmail: user.email, 
                reason: 'Updated tenant profile' 
            });
            setCurrentSite(updatedSite);
            addToast('Profile saved successfully!', 'success');
        } catch(err) {
            addToast((err as Error).message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="Tenant Profile">
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input label="Site Name" id="name" value={site.name} readOnly disabled />
                <Input label="Short Code" id="shortCode" name="shortCode" value={formData.shortCode} onChange={handleChange} helperText="Used in public URLs (e.g., /public/conference/short-code). Changing this will break existing links."/>
                <Input label="Custom Domains" id="domains" name="domains" value={formData.domains} onChange={handleChange} helperText="Comma-separated domains that point to this site. Requires DNS configuration."/>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    {/* FIX: Add type assertion to resolve 'unknown' type error on `s` */}
                    {Object.values(SiteStatus).map(s => <option key={s} value={s}>{(s as string).charAt(0).toUpperCase() + (s as string).slice(1).toLowerCase()}</option>)}
                  </select>
                </div>
                
                <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                    <Button type="submit" isLoading={isLoading}>Save Changes</Button>
                </div>
            </form>
        </Card>
    );
};
export default TenantProfileSettings;