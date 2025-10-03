import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Site, DataProtectionSettings, DataRequestLog } from '../../types.ts';
import useAuth from '../../hooks/useAuth.ts';
import { apiService } from '../../src/services/apiService.ts';
import { useToast } from '../../hooks/useToast.ts';
import Card from '../../components/ui/Card.tsx';
import Input from '../../components/ui/Input.tsx';
import Select from '../../components/ui/Select.tsx';
import Button from '../../components/ui/Button.tsx';
import ToggleSwitch from '../../components/ui/ToggleSwitch.tsx';
import Table from '../../components/ui/Table.tsx';
import Modal from '../../components/ui/Modal.tsx';
import { SkeletonTable } from '../../components/ui/SkeletonTable.tsx';
import EmptyState from '../../components/ui/EmptyState.tsx';

type SettingsContext = { site: Site };

const retentionOptions = [
    { value: -1, label: 'Never' },
    { value: 30, label: 'After 30 days' },
    { value: 90, label: 'After 90 days' },
    { value: 180, label: 'After 180 days' },
    { value: 365, label: 'After 1 year' },
];

const DataProtectionSettings: React.FC = () => {
    const { site } = useOutletContext<SettingsContext>();
    const { user, setCurrentSite } = useAuth();
    const { addToast } = useToast();
    
    const [formData, setFormData] = useState<DataProtectionSettings>({
        consentPolicyVersion: '',
        retentionPolicies: { commsLogDays: -1, inactiveUserDays: -1 }
    });
    const [requestLogs, setRequestLogs] = useState<DataRequestLog[]>([]);
    const [redactPii, setRedactPii] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const fetchLogs = useCallback(async () => {
        setIsLoadingLogs(true);
        try {
            const logs = await apiService.listDataRequestLogsBySite(site.id);
            setRequestLogs(logs.sort((a,b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()));
        } catch(err) {
            addToast("Failed to fetch request logs.", 'error');
        } finally {
            setIsLoadingLogs(false);
        }
    }, [site.id, addToast]);

    useEffect(() => {
        if (site && site.dataProtection) {
            setFormData(site.dataProtection);
        }
        fetchLogs();
    }, [site, fetchLogs]);

    // FIX: Safely handle nested state updates by checking if the parent state is an object.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => {
                const parentState = prev[parent as keyof DataProtectionSettings];
                if (typeof parentState === 'object' && parentState !== null) {
                     return {
                        ...prev,
                        [parent]: {
                            ...parentState,
                            [child]: Number(value),
                        },
                    };
                }
                return prev;
            });
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSaving(true);
        try {
            const updatedSite = await apiService.updateSite(
                site.id, 
                { dataProtection: formData },
                { userId: user.id, userEmail: user.email, reason: 'Updated data protection settings' }
            );
            setCurrentSite(updatedSite);
            addToast('Data protection settings saved!', 'success');
        } catch(err) {
            addToast((err as Error).message, 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleCreateRequest = async (type: 'EXPORT' | 'ERASURE') => {
        if (!user) return;
        try {
            await apiService.createDataRequest({
                type,
                requestedByUserId: user.id,
                requestedByUserEmail: user.email,
                redactPii: type === 'EXPORT' ? redactPii : false,
                siteId: site.id
            });
            addToast(`${type} request initiated successfully.`, 'success');
            // Optimistically show pending state or refetch
            setTimeout(fetchLogs, 500); // Give a small delay before refetching
        } catch (err) {
             addToast((err as Error).message, 'error');
        }
        if (isModalOpen) setIsModalOpen(false);
    };

    const StatusBadge: React.FC<{ status: DataRequestLog['status'] }> = ({ status }) => {
        const colors = {
            PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status]}`}>{status}</span>;
    };

    return (
         <div className="space-y-6">
            <form onSubmit={handleSaveSettings}>
                <Card title="Data Retention Policies">
                    <div className="space-y-4">
                        <Select label="Automatically delete communication logs" name="retentionPolicies.commsLogDays" value={formData.retentionPolicies.commsLogDays} onChange={handleChange} options={retentionOptions} />
                        <Select label="Automatically delete inactive user data" name="retentionPolicies.inactiveUserDays" value={formData.retentionPolicies.inactiveUserDays} onChange={handleChange} options={retentionOptions} />
                        <Input label="Consent Policy Version" name="consentPolicyVersion" value={formData.consentPolicyVersion} onChange={handleChange} helperText="Increment this version to require users to re-consent." />
                    </div>
                    <div className="flex justify-end pt-6 mt-6 border-t dark:border-gray-700">
                        <Button type="submit" isLoading={isSaving}>Save Settings</Button>
                    </div>
                </Card>
            </form>
            <Card title="Data Privacy Requests" actions={<Button onClick={() => setIsModalOpen(true)}>New Request</Button>}>
                {isLoadingLogs ? <SkeletonTable headers={['Type', 'Status', 'Requested By', 'Requested At', 'Redacted', 'Download']} /> :
                 requestLogs.length === 0 ? <EmptyState title="No Requests Found" message="Data export and erasure requests will be logged here." /> :
                    <Table headers={['Type', 'Status', 'Requested By', 'Requested At', 'Redacted', 'Download']}>
                        {requestLogs.map(log => (
                           <tr key={log.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                               <td className="px-6 py-4">{log.type}</td>
                               <td className="px-6 py-4"><StatusBadge status={log.status} /></td>
                               <td className="px-6 py-4">{log.requestedByUserEmail}</td>
                               <td className="px-6 py-4 text-xs">{new Date(log.requestedAt).toLocaleString()}</td>
                               <td className="px-6 py-4">{log.redactPii ? 'Yes' : 'No'}</td>
                               <td className="px-6 py-4">
                                   {log.downloadUrl ? <a href={log.downloadUrl} className="text-indigo-600 hover:underline">Download</a> : 'N/A'}
                               </td>
                           </tr>
                        ))}
                    </Table>
                }
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Data Privacy Request">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Choose the type of request to initiate for all data associated with this site.</p>
                    <Card>
                        <h4 className="font-semibold text-gray-800 dark:text-white">Data Export</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">Generate a downloadable archive of all site data. This may take several minutes.</p>
                        <ToggleSwitch label="Redact Personally Identifiable Information (PII)" enabled={redactPii} onChange={setRedactPii} />
                        <div className="mt-4 text-right">
                           <Button onClick={() => handleCreateRequest('EXPORT')}>Request Export</Button>
                        </div>
                    </Card>
                     <Card>
                        <h4 className="font-semibold text-gray-800 dark:text-white">Data Erasure</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">Permanently delete all data for this site. This action is irreversible and cannot be undone.</p>
                        <div className="mt-4 text-right">
                           <Button variant="danger" onClick={() => handleCreateRequest('ERASURE')}>Request Erasure</Button>
                        </div>
                    </Card>
                </div>
            </Modal>
        </div>
    );
};
export default DataProtectionSettings;