import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Site, FinanceSettings } from '../../types.ts';
import useAuth from '../../hooks/useAuth.ts';
import { apiService } from '../../src/services/apiService.ts';
import { useToast } from '../../hooks/useToast.ts';
import Card from '../../components/ui/Card.tsx';
import Input from '../../components/ui/Input.tsx';
import Select from '../../components/ui/Select.tsx';
import Button from '../../components/ui/Button.tsx';

type SettingsContext = { site: Site };

const currencies = [
    { value: 'USD', label: 'USD - United States Dollar ($)' },
    { value: 'EUR', label: 'EUR - Euro (€)' },
    { value: 'GBP', label: 'GBP - British Pound (£)' },
    { value: 'CAD', label: 'CAD - Canadian Dollar ($)' },
    { value: 'AUD', label: 'AUD - Australian Dollar ($)' },
];

const FinanceSettings: React.FC = () => {
    const { site } = useOutletContext<SettingsContext>();
    const { user, setCurrentSite } = useAuth();
    const { addToast } = useToast();
    const [formData, setFormData] = useState<FinanceSettings>({
        currency: 'USD',
        taxLabel: 'Tax',
        taxRate: 0,
        taxRegistrationNumber: '',
        invoicePrefix: 'INV-',
        nextInvoiceNumber: 1
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (site && site.finance) {
            setFormData(site.finance);
        }
    }, [site]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData({ ...formData, [name]: isNumber ? parseFloat(value) || 0 : value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);
        try {
            const updatedSite = await apiService.updateSite(
                site.id, 
                { finance: formData },
                { userId: user.id, userEmail: user.email, reason: 'Updated finance and invoicing settings' }
            );
            setCurrentSite(updatedSite);
            addToast('Finance settings saved!', 'success');
        } catch(err) {
            addToast((err as Error).message, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const invoicePreview = `${formData.invoicePrefix || ''}${(formData.nextInvoiceNumber || 1).toString().padStart(6, '0')}`;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card title="Tax Settings">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Tax Label" name="taxLabel" value={formData.taxLabel} onChange={handleChange} placeholder="e.g., VAT, Sales Tax"/>
                    <Input label="Tax Rate (%)" name="taxRate" type="number" value={formData.taxRate} onChange={handleChange} step="0.01" min="0" max="100" />
                    <Input label="Tax Registration No." name="taxRegistrationNumber" value={formData.taxRegistrationNumber || ''} onChange={handleChange} placeholder="e.g., VAT ID" className="md:col-span-2" />
                </div>
            </Card>

            <Card title="Invoicing">
                <div className="space-y-6">
                    <Select label="Currency" name="currency" value={formData.currency} onChange={handleChange} options={currencies} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <Input label="Invoice Prefix" name="invoicePrefix" value={formData.invoicePrefix} onChange={handleChange} placeholder="e.g., INV-" />
                       <Input label="Next Invoice Number" name="nextInvoiceNumber" type="number" value={formData.nextInvoiceNumber} onChange={handleChange} min="1"/>
                    </div>
                     <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Invoice Number Preview</span>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded-md">{invoicePreview}</p>
                    </div>
                </div>
            </Card>
            
            <div className="flex justify-end pt-4">
                <Button type="submit" isLoading={isLoading}>Save All Changes</Button>
            </div>
        </form>
    );
};
export default FinanceSettings;