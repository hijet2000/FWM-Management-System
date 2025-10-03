import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Site, Role, AuditLog, PermissionAction } from '../../types.ts';
import useAuth from '../../hooks/useAuth.ts';
import { apiService } from '../../src/services/apiService.ts';
import { useToast } from '../../hooks/useToast.ts';
import Card from '../../components/ui/Card.tsx';
import Button from '../../components/ui/Button.tsx';
import Table from '../../components/ui/Table.tsx';
import Modal from '../../components/ui/Modal.tsx';
import { SkeletonTable } from '../../components/ui/SkeletonTable.tsx';
import EmptyState from '../../components/ui/EmptyState.tsx';
import RoleEditor from './RoleEditor.tsx';

type SettingsContext = { site: Site };

const RolesAndPermissionsSettings: React.FC = () => {
    const { site } = useOutletContext<SettingsContext>();
    const { user, can } = useAuth();
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<'roles' | 'audit'>('roles');
    const [roles, setRoles] = useState<Role[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [rolesData, auditLogsData] = await Promise.all([
                apiService.listRolesBySite(site.id),
                apiService.listAuditLogsBySite(site.id)
            ]);
            setRoles(rolesData);
            setAuditLogs(auditLogsData);
        } catch (err) {
            addToast((err as Error).message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [site.id, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEdit = (role: Role) => {
        setSelectedRole(role);
        setIsModalOpen(true);
    };
    
    const handleAddNew = () => {
        setSelectedRole(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (role: Role) => {
        if (!user) return;
        if (window.confirm(`Are you sure you want to delete the "${role.name}" role? This cannot be undone.`)) {
            try {
                await apiService.deleteRole(role.id, site.id, user.id);
                addToast('Role deleted successfully.', 'success');
                fetchData();
            } catch (err) {
                addToast((err as Error).message, 'error');
            }
        }
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRole(null);
    };

    const tabClasses = (isActive: boolean) => `whitespace-nowrap py-3 px-4 text-sm font-medium cursor-pointer rounded-t-lg ${isActive ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`;

    return (
        <div>
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-2" aria-label="Tabs">
                    <button onClick={() => setActiveTab('roles')} className={tabClasses(activeTab === 'roles')}>Roles</button>
                    <button onClick={() => setActiveTab('audit')} className={tabClasses(activeTab === 'audit')}>Audit Log</button>
                </nav>
            </div>
            <div className="mt-4">
                {activeTab === 'roles' && (
                    <Card title="Site Roles" actions={can(PermissionAction.MANAGE, 'roles', {siteId: site.id}) && <Button onClick={handleAddNew}>Add New Role</Button>}>
                        {isLoading ? (
                            <SkeletonTable headers={['Role Name', 'Type', 'Actions']} />
                        ) : roles.length === 0 ? (
                            <EmptyState title="No Roles Found" message="Create a role to manage user permissions for this site." />
                        ) : (
                            <Table headers={['Role Name', 'Type', 'Actions']}>
                                {roles.map(role => (
                                    <tr key={role.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{role.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${role.siteId ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'}`}>
                                                {role.siteId ? 'Custom' : 'Global'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 space-x-2">
                                            {can(PermissionAction.MANAGE, 'roles', {siteId: site.id}) && role.siteId === site.id ? (
                                                <>
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(role)}>Edit</Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(role)}>Delete</Button>
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-500">Read-only</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </Table>
                        )}
                    </Card>
                )}
                {activeTab === 'audit' && (
                    <Card title="Audit Log">
                        {isLoading ? <SkeletonTable headers={['Date', 'User', 'Action', 'Details']} /> :
                         auditLogs.length === 0 ? <EmptyState title="No Logs Found" message="Changes to roles and permissions will be recorded here." /> :
                        <Table headers={['Date', 'User', 'Action', 'Details']}>
                           {auditLogs.map(log => (
                               <tr key={log.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                   <td className="px-6 py-4 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                                   <td className="px-6 py-4">{log.userEmail}</td>
                                   <td className="px-6 py-4 font-mono text-xs">{log.action}</td>
                                   <td className="px-6 py-4 text-xs">{log.details.roleName}</td>
                               </tr>
                           ))}
                        </Table>
                        }
                    </Card>
                )}
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={selectedRole ? `Edit Role: ${selectedRole.name}` : 'Create New Role'}>
                <RoleEditor
                    key={selectedRole?.id || 'new'}
                    roleToEditId={selectedRole?.id}
                    onSave={() => {
                        fetchData();
                        closeModal();
                    }}
                    onCancel={closeModal}
                />
            </Modal>
        </div>
    );
};
export default RolesAndPermissionsSettings;