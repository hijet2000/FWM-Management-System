import React, { useState, useEffect, CSSProperties } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Site, BrandingProfile } from '../../types.ts';
import useAuth from '../../hooks/useAuth.ts';
import { apiService } from '../../src/services/apiService.ts';
import { useToast } from '../../hooks/useToast.ts';
import Card from '../../components/ui/Card.tsx';
import Button from '../../components/ui/Button.tsx';
import ColorInput from '../../components/ui/ColorInput.tsx';
import FileUpload from '../../components/ui/FileUpload.tsx';

type SettingsContext = { site: Site };
type BrandingState = Omit<BrandingProfile, 'logoUrl' | 'faviconUrl' | 'pdfHeaderUrl' | 'pdfFooterUrl'> & {
    logoUrl?: string | null;
    faviconUrl?: string | null;
    pdfHeaderUrl?: string | null;
    pdfFooterUrl?: string | null;
};

const AdminPreview: React.FC<{ branding: BrandingState }> = ({ branding }) => (
    <div className="w-full h-48 rounded-md bg-white dark:bg-gray-900 shadow-inner overflow-hidden">
        <div className="h-12 flex items-center justify-between px-4" style={{ backgroundColor: 'var(--primary-color)' }}>
            {branding.logoUrl ? <img src={branding.logoUrl} alt="Logo Preview" className="h-8 max-w-[100px] object-contain" /> : <span className="text-white font-bold">Your Logo</span>}
            <div className="w-6 h-6 rounded-full bg-white opacity-50"></div>
        </div>
        <div className="p-4">
            <h4 className="font-bold text-gray-800 dark:text-white">Sample Card Title</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This is how your content will look.</p>
            <button className="mt-4 px-4 py-2 text-sm text-white rounded-md" style={{ backgroundColor: 'var(--accent-color)' }}>An Action</button>
        </div>
    </div>
);

const PublicPreview: React.FC<{ branding: BrandingState }> = ({ branding }) => (
     <div className="w-full h-48 rounded-md shadow-inner overflow-hidden" style={{ backgroundColor: 'var(--primary-color)' }}>
        <div className="p-4 text-center text-white flex flex-col items-center justify-center h-full">
            {branding.logoUrl && <img src={branding.logoUrl} alt="Logo Preview" className="h-10 max-w-[120px] mx-auto mb-2 object-contain" />}
            <h2 className="font-bold text-xl">Public Event Title</h2>
            <p className="text-sm opacity-80">This is a public facing page.</p>
            <button className="mt-4 px-4 py-2 text-sm rounded-md" style={{ backgroundColor: 'var(--accent-color)', color: 'white' }}>Register Now</button>
        </div>
    </div>
);


const LivePreview: React.FC<{ branding: BrandingState }> = ({ branding }) => {
    const [previewTab, setPreviewTab] = useState<'admin' | 'public'>('admin');
    const previewStyle = {
        '--primary-color': branding.primaryColor,
        '--accent-color': branding.accentColor,
    } as CSSProperties;
    
    const tabClasses = (isActive: boolean) => `whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${isActive ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}`;

    return (
        <div className="sticky top-24">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Live Preview</h3>
            <div className="border rounded-lg bg-gray-50 dark:bg-gray-800" style={previewStyle}>
                <div className="border-b dark:border-gray-700">
                    <nav className="-mb-px flex space-x-4 px-4" aria-label="Tabs">
                        <button onClick={() => setPreviewTab('admin')} className={tabClasses(previewTab === 'admin')}>Admin</button>
                        <button onClick={() => setPreviewTab('public')} className={tabClasses(previewTab === 'public')}>Public</button>
                    </nav>
                </div>
                <div className="p-4">
                    {previewTab === 'admin' && <AdminPreview branding={branding} />}
                    {previewTab === 'public' && <PublicPreview branding={branding} />}
                </div>
            </div>
        </div>
    );
};


const BrandingSettings: React.FC = () => {
    const { site } = useOutletContext<SettingsContext>();
    const { user, setCurrentSite } = useAuth();
    const { addToast } = useToast();
    const [branding, setBranding] = useState<BrandingState>({
        primaryColor: '#4F46E5',
        accentColor: '#10B981',
        logoUrl: null,
        faviconUrl: null,
        pdfHeaderUrl: null,
        pdfFooterUrl: null,
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (site) {
            setBranding(site.branding);
        }
    }, [site]);

    const handleColorChange = (key: 'primaryColor' | 'accentColor', value: string) => {
        setBranding(prev => ({ ...prev, [key]: value }));
    };

    const handleFileChange = (key: 'logoUrl' | 'faviconUrl' | 'pdfHeaderUrl' | 'pdfFooterUrl', base64: string | null) => {
        setBranding(prev => ({ ...prev, [key]: base64 }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);
        try {
            const updatedSite = await apiService.updateSite(
                site.id, 
                { branding },
                { userId: user.id, userEmail: user.email, reason: 'Updated branding settings' }
            );
            setCurrentSite(updatedSite);
            addToast('Branding saved successfully!', 'success');
        } catch(err) {
            addToast((err as Error).message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <form onSubmit={handleSubmit}>
                    <Card title="Branding & Appearance">
                        <div className="space-y-8">
                            <section>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Brand Colors</h3>
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <ColorInput label="Primary Color" value={branding.primaryColor} onChange={val => handleColorChange('primaryColor', val)} />
                                    <ColorInput label="Accent Color" value={branding.accentColor} onChange={val => handleColorChange('accentColor', val)} />
                                </div>
                            </section>
                             <section>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Assets</h3>
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                                    <FileUpload label="Primary Logo" currentImageUrl={branding.logoUrl ?? undefined} onFileSelect={(_, b64) => handleFileChange('logoUrl', b64)} helperText="Recommended: transparent PNG, 200x50px." />
                                    <FileUpload label="Favicon" currentImageUrl={branding.faviconUrl ?? undefined} onFileSelect={(_, b64) => handleFileChange('faviconUrl', b64)} helperText="Recommended: 32x32px ICO or PNG." />
                                    <FileUpload label="PDF Header" currentImageUrl={branding.pdfHeaderUrl ?? undefined} onFileSelect={(_, b64) => handleFileChange('pdfHeaderUrl', b64)} />
                                    <FileUpload label="PDF Footer" currentImageUrl={branding.pdfFooterUrl ?? undefined} onFileSelect={(_, b64) => handleFileChange('pdfFooterUrl', b64)} />
                                </div>
                            </section>
                        </div>
                        <div className="flex justify-end pt-6 mt-6 border-t dark:border-gray-700">
                           <Button type="submit" isLoading={isLoading}>Save Branding</Button>
                        </div>
                    </Card>
                </form>
            </div>
            <div className="lg:col-span-1">
                <LivePreview branding={branding} />
            </div>
        </div>
    );
};

export default BrandingSettings;