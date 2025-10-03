import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Site, SiteType, PublicPortalSettings } from '../../types.ts';
import useAuth from '../../hooks/useAuth.ts';
import { apiService } from '../../src/services/apiService.ts';
import { useToast } from '../../hooks/useToast.ts';
import Card from '../../components/ui/Card.tsx';
import ToggleSwitch from '../../components/ui/ToggleSwitch.tsx';

type SettingsContext = { site: Site };

const PORTAL_FEATURES: Record<SiteType, Record<string, string>> = {
    [SiteType.CONFERENCE]: {
        registrationEnabled: 'Enable Public Registration',
        scheduleVisible: 'Show Event Schedule',
    },
    [SiteType.HOTEL]: {
        bookingEnabled: 'Enable Public Room Booking',
        galleryVisible: 'Show Room Gallery',
    },
    [SiteType.CHURCH]: {
        givingEnabled: 'Enable Public Giving Portal',
        sermonsVisible: 'Show Sermon Archive',
    },
    [SiteType.SCHOOL]: {
        enrollmentOpen: 'Enable Public Enrollment',
        courseCatalogVisible: 'Show Course Catalog',
    },
    [SiteType.BANK]: {},
    [SiteType.HR]: {},
    [SiteType.COMMS]: {},
};

const PublicPortalsSettings: React.FC = () => {
    const { site } = useOutletContext<SettingsContext>();
    const { user, setCurrentSite } = useAuth();
    const { addToast } = useToast();

    const availableFeatures = useMemo(() => {
        return PORTAL_FEATURES[site.type] || {};
    }, [site.type]);

    const handleToggleChange = async (featureKey: string, enabled: boolean) => {
        if (!user) return;
        try {
            const updatedSettings = {
                ...site.publicSettings,
                [featureKey]: enabled,
            };
            const updatedSite = await apiService.updateSite(
                site.id, 
                { publicSettings: updatedSettings },
                { userId: user.id, userEmail: user.email, reason: `Toggled '${availableFeatures[featureKey]}' portal setting` }
            );
            setCurrentSite(updatedSite);
            addToast('Settings updated!', 'success');
        } catch (err) {
            addToast((err as Error).message, 'error');
        }
    };

    const featureKeys = Object.keys(availableFeatures);

    return (
        <Card title="Public Portal Toggles">
            {featureKeys.length > 0 ? (
                <div className="space-y-2">
                    {featureKeys.map(key => (
                        <ToggleSwitch
                            key={key}
                            label={availableFeatures[key]}
                            enabled={!!site.publicSettings[key]}
                            onChange={(enabled) => handleToggleChange(key, enabled)}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No public portal features available for this site type.</p>
            )}
        </Card>
    );
};

export default PublicPortalsSettings;