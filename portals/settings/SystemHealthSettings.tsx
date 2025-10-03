import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Site, SystemHealth, SystemServiceStatus } from '../../types.ts';
import { apiService } from '../../src/services/apiService.ts';
import { useToast } from '../../hooks/useToast.ts';
import Card from '../../components/ui/Card.tsx';
import Button from '../../components/ui/Button.tsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.tsx';

type SettingsContext = { site: Site };

const StatusIndicator: React.FC<{ status: SystemServiceStatus }> = ({ status }) => {
    const config = {
        [SystemServiceStatus.OPERATIONAL]: { text: 'Operational', icon: <div className="h-3 w-3 rounded-full bg-green-500" />, color: 'text-green-700 dark:text-green-300' },
        [SystemServiceStatus.DEGRADED]: { text: 'Degraded Performance', icon: <div className="h-3 w-3 rounded-full bg-yellow-500" />, color: 'text-yellow-700 dark:text-yellow-300' },
        [SystemServiceStatus.OUTAGE]: { text: 'Major Outage', icon: <div className="h-3 w-3 rounded-full bg-red-500" />, color: 'text-red-700 dark:text-red-300' },
    };
    const { text, icon, color } = config[status] || config[SystemServiceStatus.DEGRADED];

    return (
        <div className={`flex items-center gap-2 text-sm font-semibold ${color}`}>
            {icon}
            <span>{text}</span>
        </div>
    );
};


const SystemHealthSettings: React.FC = () => {
    const { site } = useOutletContext<SettingsContext>();
    const { addToast } = useToast();
    const [health, setHealth] = useState<SystemHealth | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchHealth = useCallback(async () => {
        setIsLoading(true);
        try {
            const healthData = await apiService.getSystemHealth();
            setHealth(healthData);
        } catch (err) {
            addToast("Failed to fetch system health.", 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchHealth();
    }, [fetchHealth]);
    
    const usagePercentage = site.usageMetrics ? (site.usageMetrics.apiCallsToday / site.usageMetrics.apiCallLimit) * 100 : 0;

    return (
        <div className="space-y-6">
            <Card title="Overall System Status" actions={<Button variant="secondary" size="sm" onClick={fetchHealth} isLoading={isLoading}>Refresh</Button>}>
                {isLoading ? <LoadingSpinner text="Checking system status..." /> : health ? (
                    <ul className="space-y-3">
                        {Object.entries(health).map(([service, status]) => (
                            <li key={service} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <span className="text-gray-700 dark:text-gray-300 capitalize">{service.replace(/([A-Z])/g, ' $1')}</span>
                                <StatusIndicator status={status as SystemServiceStatus} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500">Could not load system health status.</p>
                )}
            </Card>

            <Card title="Tenant-Specific Metrics">
                {site.usageMetrics ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-white">API Calls Today</h4>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${Math.min(usagePercentage, 100)}%` }}></div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-right">
                                {site.usageMetrics.apiCallsToday.toLocaleString()} / {site.usageMetrics.apiCallLimit.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-white">Errors (Last 24h)</h4>
                            <p className={`text-3xl font-bold mt-2 ${site.usageMetrics.errorsLast24h > 0 ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>
                                {site.usageMetrics.errorsLast24h}
                            </p>
                        </div>
                    </div>
                ) : (
                     <p className="text-center text-gray-500">Usage metrics not available for this site.</p>
                )}
            </Card>
        </div>
    );
};

export default SystemHealthSettings;