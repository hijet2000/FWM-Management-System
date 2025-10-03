import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Site, SettingsVersion } from '../../types.ts';
import useAuth from '../../hooks/useAuth.ts';
import { apiService } from '../../src/services/apiService.ts';
import { useToast } from '../../hooks/useToast.ts';
import Card from '../../components/ui/Card.tsx';
import Button from '../../components/ui/Button.tsx';
import Table from '../../components/ui/Table.tsx';
import Modal from '../../components/ui/Modal.tsx';
import { SkeletonTable } from '../../components/ui/SkeletonTable.tsx';

type SettingsContext = { site: Site };

const MASKED_KEYS = ['apiKey', 'secretKey', 'authToken', 'accountSid', 'clientSecret', 'webhookSecret', 'webhookId'];

// Helper to deeply clone and mask sensitive data
const maskSecrets = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(maskSecrets);
    }
    return Object.keys(obj).reduce((acc, key) => {
        if (MASKED_KEYS.includes(key) && obj[key]) {
            acc[key] = '****' + String(obj[key]).slice(-4);
        } else {
            acc[key] = maskSecrets(obj[key]);
        }
        return acc;
    }, {} as any);
};

// Helper to find differences between two objects
const getDiff = (original: any, updated: any, path: string = ''): { key: string, from: any, to: any }[] => {
    let diffs: { key: string, from: any, to: any }[] = [];
    const allKeys = new Set([...Object.keys(original), ...Object.keys(updated)]);

    for (const key of allKeys) {
        const currentPath = path ? `${path}.${key}` : key;
        const originalVal = original[key];
        const updatedVal = updated[key];

        if (typeof originalVal === 'object' && originalVal !== null && typeof updatedVal === 'object' && updatedVal !== null) {
            diffs = [...diffs, ...getDiff(originalVal, updatedVal, currentPath)];
        } else if (JSON.stringify(originalVal) !== JSON.stringify(updatedVal)) {
            diffs.push({ key: currentPath, from: originalVal, to: updatedVal });
        }
    }
    return diffs;
};


const ImportExportSettings: React.FC = () => {
    const { site } = useOutletContext<SettingsContext>();
    const { user, setCurrentSite } = useAuth();
    const { addToast } = useToast();

    const [versions, setVersions] = useState<SettingsVersion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [importedSettings, setImportedSettings] = useState<Partial<Site> | null>(null);

    const fetchVersions = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiService.listSettingsVersionsBySite(site.id);
            setVersions(data);
        } catch (err) {
            addToast((err as Error).message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [site.id, addToast]);

    useEffect(() => {
        fetchVersions();
    }, [fetchVersions]);

    const handleExport = () => {
        const maskedSite = maskSecrets(site);
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(maskedSite, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `${site.shortCode || 'site'}_settings_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        addToast('Settings exported successfully.', 'success');
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = JSON.parse(e.target?.result as string);
                    // Basic validation to check if it looks like a site object
                    if (content.id && content.name && content.type) {
                        setImportedSettings(content);
                        setIsModalOpen(true);
                    } else {
                        throw new Error("Invalid settings file format.");
                    }
                } catch (err) {
                    addToast((err as Error).message, 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    
    const handleConfirmImport = async () => {
        if (!importedSettings || !user) return;
        try {
            const updatedSite = await apiService.updateSite(
                site.id,
                importedSettings,
                { userId: user.id, userEmail: user.email, reason: 'Imported settings from file' }
            );
            setCurrentSite(updatedSite);
            addToast('Settings imported successfully!', 'success');
            setIsModalOpen(false);
            setImportedSettings(null);
            fetchVersions(); // Refresh version history
        } catch (err) {
            addToast((err as Error).message, 'error');
        }
    };

    const handleRollback = async (version: SettingsVersion) => {
        if (!user || !window.confirm(`Are you sure you want to roll back to the version from ${new Date(version.createdAt).toLocaleString()}?`)) {
            return;
        }
        try {
            const { settingsSnapshot } = version;
            // Exclude fields that shouldn't be changed by a rollback
            const { id, name, type, ...safeSettings } = settingsSnapshot;
            
            const updatedSite = await apiService.updateSite(
                site.id,
                safeSettings,
                { userId: user.id, userEmail: user.email, reason: `Rolled back to version from ${new Date(version.createdAt).toLocaleString()}` }
            );
            setCurrentSite(updatedSite);
            addToast('Rollback successful!', 'success');
            fetchVersions();
        } catch (err) {
            addToast((err as Error).message, 'error');
        }
    };
    
    const diff = importedSettings ? getDiff(site, importedSettings) : [];

    return (
        <div className="space-y-6">
            <Card title="Export Site Settings">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Export all settings for this site to a JSON file. Sensitive information like API keys will be masked.</p>
                <Button onClick={handleExport}>Export Current Settings</Button>
            </Card>

            <Card title="Import Site Settings">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Import settings from a JSON file. This will overwrite existing settings. A preview will be shown before applying.</p>
                <input type="file" accept=".json" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            </Card>

            <Card title="Version History">
                {isLoading ? <SkeletonTable headers={['Date', 'Changed By', 'Reason', 'Actions']} /> :
                    versions.length === 0 ? <p>No version history found.</p> :
                    <Table headers={['Date', 'Changed By', 'Reason', 'Actions']}>
                        {versions.map(v => (
                            <tr key={v.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td className="px-6 py-4 text-xs">{new Date(v.createdAt).toLocaleString()}</td>
                                <td className="px-6 py-4">{v.createdByUserEmail}</td>
                                <td className="px-6 py-4">{v.changeReason}</td>
                                <td className="px-6 py-4">
                                    <Button variant="secondary" size="sm" onClick={() => handleRollback(v)}>Rollback</Button>
                                </td>
                            </tr>
                        ))}
                    </Table>
                }
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Preview Settings Import">
                <div className="max-h-96 overflow-y-auto">
                    <p className="text-sm mb-4">The following changes will be applied. Review them carefully.</p>
                    {diff.length > 0 ? (
                        <div className="text-xs font-mono space-y-2">
                        {diff.map(d => (
                            <div key={d.key} className="p-2 rounded bg-gray-100 dark:bg-gray-700">
                                <strong className="text-indigo-600 dark:text-indigo-400">{d.key}</strong>
                                <div className="text-red-600 dark:text-red-400">- {JSON.stringify(d.from)}</div>
                                <div className="text-green-600 dark:text-green-400">+ {JSON.stringify(d.to)}</div>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">No changes detected between the import file and current settings.</p>
                    )}
                </div>
                 <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700 mt-4">
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirmImport} disabled={diff.length === 0}>Confirm & Apply</Button>
                </div>
            </Modal>
        </div>
    );
};

export default ImportExportSettings;