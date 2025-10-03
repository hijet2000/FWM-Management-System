import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Button from '../../components/ui/Button.tsx';
import { apiService } from '../../src/services/apiService.ts';
import { Site } from '../../types.ts';
import LoadingSpinner from '../../components/ui/LoadingSpinner.tsx';

const ConferenceLanding: React.FC = () => {
    const { shortCode } = useParams<{ shortCode: string }>();
    const [site, setSite] = useState<Site | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (shortCode) {
            setLoading(true);
            apiService.findSiteByShortCode(shortCode)
                .then(foundSite => {
                    if (foundSite) {
                        setSite(foundSite);
                    } else {
                        console.error("Site not found for shortCode:", shortCode);
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [shortCode]);
    
    const primaryColor = site?.branding.primaryColor || '#4338CA'; // indigo-700
    const accentColor = site?.branding.accentColor || '#10B981';

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg"/></div>;
    }

    if (!site) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-4xl font-bold">Conference Not Found</h1>
                <p className="mt-4 text-gray-600 dark:text-gray-400">The conference you are looking for does not exist or has been moved.</p>
            </div>
        );
    }
    
    const isRegistrationEnabled = site.publicSettings?.registrationEnabled !== false;

    return (
        <div className="min-h-screen text-white flex flex-col items-center justify-center p-4" style={{ backgroundColor: primaryColor }}>
            <div className="text-center">
                {site.branding.logoUrl && <img src={site.branding.logoUrl} alt={`${site.name} Logo`} className="mx-auto h-16 mb-6 object-contain"/>}
                <h1 className="text-5xl font-extrabold mb-4">{site.name}</h1>
                <p className="text-xl mb-8 opacity-80">Join us for an inspiring week of faith, fellowship, and growth.</p>
            </div>

            <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg p-8 rounded-xl shadow-2xl">
                {isRegistrationEnabled ? (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">Registration is Open!</h2>
                        <p className="mt-2 mb-6">Secure your spot today.</p>
                        <Link to={`/public/conference/${shortCode}/register`}>
                             <Button size="lg" className="w-full !text-lg" style={{ backgroundColor: accentColor }}>
                                Register Now
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">Registration is Currently Closed</h2>
                        <p className="mt-4 text-white/80">Please check back later for updates.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConferenceLanding;