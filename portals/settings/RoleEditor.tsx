import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Site, Permission, PermissionAction, Role } from '../../types.ts';
import useAuth from '../../hooks/useAuth.ts';
import { apiService } from '../../src/services/apiService.ts';
import { useToast } from '../../hooks/useToast.ts';
import Input from '../../components/ui/Input.tsx';
import Button from '../../components/ui/Button.tsx';
import Checkbox from '../../components/ui/Checkbox.tsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.tsx';

type SettingsContext = { site: Site };

interface RoleEditorProps {
  roleToEditId?: string;
  onSave: () => void;
  onCancel: () => void;
}

const ACTIONS = [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE];

const RoleEditor: React.FC<RoleEditorProps> = ({ roleToEditId, onSave, onCancel }) => {
    const { site } = useOutletContext<SettingsContext>();
    const { user } = useAuth();
    const { addToast } = useToast();

    const [roleName, setRoleName] = useState('');
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedPermIds, setSelectedPermIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const allPermissions = await apiService.listPermissions();
                setPermissions(allPermissions.filter(p => p.resource !== '*')); // Exclude super admin perm

                if (roleToEditId) {
                    const { role, permissionIds } = await apiService.getRoleWithPermissions(roleToEditId);
                    setRoleName(role.name);
                    setSelectedPermIds(new Set(permissionIds));
                }
            } catch (err) {
                addToast((err as Error).message, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [roleToEditId, addToast]);
    
    const groupedPermissions = useMemo(() => {
        return permissions.reduce((acc, perm) => {
            acc[perm.resource] = acc[perm.resource] || [];
            acc[perm.resource].push(perm);
            return acc;
        }, {} as Record<string, Permission[]>);
    }, [permissions]);

    const handlePermissionChange = (permId: string, isChecked: boolean) => {
        const newSet = new Set(selectedPermIds);
        if (isChecked) {
            newSet.add(permId);
        } else {
            newSet.delete(permId);
        }
        setSelectedPermIds(newSet);
    };

    const handleManageResource = (resource: string, isChecked: boolean) => {
        const newSet = new Set(selectedPermIds);
        const resourcePerms = groupedPermissions[resource];
        if (isChecked) {
            resourcePerms.forEach(p => newSet.add(p.id));
        } else {
            resourcePerms.forEach(p => newSet.delete(p.id));
        }
        setSelectedPermIds(newSet);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !roleName.trim()) return;
        setIsSubmitting(true);
        const data = { name: roleName.trim(), permissionIds: Array.from(selectedPermIds), siteId: site.id, userId: user.id };
        try {
            if (roleToEditId) {
                await apiService.updateRole(roleToEditId, data);
                addToast('Role updated successfully!', 'success');
            } else {
                await apiService.createRole(data);
                addToast('Role created successfully!', 'success');
            }
            onSave();
        } catch (err) {
            addToast((err as Error).message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) {
        return <LoadingSpinner text="Loading permissions..." />;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input label="Role Name" value={roleName} onChange={(e) => setRoleName(e.target.value)} required />
            
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {Object.entries(groupedPermissions).map(([resource, perms]) => {
                const managePerm = perms.find(p => p.action === PermissionAction.MANAGE);
                return (
                    <div key={resource} className="p-4 rounded-md border dark:border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                           <h4 className="font-semibold capitalize text-gray-800 dark:text-gray-100">{resource.replace(/_/g, ' ')}</h4>
                           {managePerm && <Checkbox label="Manage All"
                            checked={selectedPermIds.has(managePerm.id)}
                            onChange={(e) => handlePermissionChange(managePerm.id, e.target.checked)}/>}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {perms.filter(p => p.action !== PermissionAction.MANAGE).map(perm => (
                             <Checkbox key={perm.id} label={perm.action} 
                                checked={selectedPermIds.has(perm.id)}
                                onChange={(e) => handlePermissionChange(perm.id, e.target.checked)} />
                        ))}
                        </div>
                    </div>
                );
            })}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit" isLoading={isSubmitting}>Save Role</Button>
            </div>
        </form>
    );
};

export default RoleEditor;