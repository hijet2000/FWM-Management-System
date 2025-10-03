import React, { useState, useEffect } from 'react';
import { User, Site, Role, Permission } from '../../types.ts';
import { apiService } from '../../src/services/apiService.ts';
import Card from '../../components/ui/Card.tsx';
import Button from '../../components/ui/Button.tsx';
import Table from '../../components/ui/Table.tsx';
import { SkeletonTable } from '../../components/ui/SkeletonTable.tsx';
import EmptyState from '../../components/ui/EmptyState.tsx';

// Custom hook for fetching data
const useAdminData = () => {
    const [data, setData] = useState<{ users: User[], sites: Site[], roles: Role[], permissions: Permission[] }>({ users: [], sites: [], roles: [], permissions: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [usersData, sitesData, rolesData, permissionsData] = await Promise.all([
                    apiService.listUsers(),
                    apiService.listSites(),
                    apiService.listRoles(),
                    apiService.listPermissions()
                ]);
                setData({ users: usersData, sites: sitesData, roles: rolesData, permissions: permissionsData });
            } catch (err) {
                setError("Failed to fetch admin data");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return { ...data, loading, error };
};


const AdminManager: React.FC = () => {
    const { users, sites, roles, permissions, loading } = useAdminData();

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Management</h1>

            <Card title="Users" actions={<Button size="sm">Add User</Button>}>
                {loading ? (
                    <SkeletonTable headers={['Email', 'First Name', 'Last Name', 'Actions']} rows={3} />
                ) : users.length === 0 ? (
                    <EmptyState title="No Users Found" message="Get started by adding a new user." />
                ) : (
                    <Table headers={['Email', 'First Name', 'Last Name', 'Actions']}>
                        {users.map(user => (
                            <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{user.email}</td>
                                <td className="px-6 py-4">{user.firstName}</td>
                                <td className="px-6 py-4">{user.lastName}</td>
                                <td className="px-6 py-4"><Button variant="ghost" size="sm">Edit</Button></td>
                            </tr>
                        ))}
                    </Table>
                )}
            </Card>

            <Card title="Sites" actions={<Button size="sm">Add Site</Button>}>
                 {loading ? (
                    <SkeletonTable headers={['Name', 'Type', 'Actions']} rows={3} />
                ) : sites.length === 0 ? (
                    <EmptyState title="No Sites Found" message="Get started by adding a new site." />
                ) : (
                    <Table headers={['Name', 'Type', 'Actions']}>
                        {sites.map(site => (
                            <tr key={site.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{site.name}</td>
                                <td className="px-6 py-4">{site.type}</td>
                                <td className="px-6 py-4"><Button variant="ghost" size="sm">Edit</Button></td>
                            </tr>
                        ))}
                    </Table>
                )}
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card title="Roles">
                    {loading ? <div className="p-4 text-center">Loading...</div> : <ul>{roles.map(r => <li key={r.id} className="p-2 border-b dark:border-gray-700">{r.name}</li>)}</ul>}
                </Card>
                <Card title="Permissions">
                    {loading ? <div className="p-4 text-center">Loading...</div> : <ul>{permissions.map(p => <li key={p.id} className="p-2 border-b dark:border-gray-700">{p.action} {p.resource}</li>)}</ul>}
                </Card>
            </div>
        </div>
    );
};

export default AdminManager;