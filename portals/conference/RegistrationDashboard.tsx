import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Registration, TicketType, RegistrationStatus } from '../../types.ts';
import { apiService } from '../../src/services/apiService.ts';
import StatCard from '../../components/ui/StatCard.tsx';
import Card from '../../components/ui/Card.tsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.tsx';

const useRegistrationData = (siteId: string | undefined) => {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (siteId) {
            setLoading(true);
            Promise.all([
                apiService.listRegistrationsBySite(siteId),
                apiService.listTicketTypesBySite(siteId)
            ]).then(([regs, tts]) => {
                setRegistrations(regs);
                setTicketTypes(tts);
            }).catch(console.error)
            .finally(() => setLoading(false));
        }
    }, [siteId]);

    return { registrations, ticketTypes, loading };
}

const RegistrationDashboard: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const { registrations, ticketTypes, loading } = useRegistrationData(siteId);

    if (loading) {
        return <LoadingSpinner text="Loading dashboard data..." />
    }

    const paidRegistrations = registrations.filter(r => r.status === RegistrationStatus.PAID);
    const totalRevenue = paidRegistrations.reduce((sum, reg) => sum + reg.pricePaid, 0);
    const totalCapacity = ticketTypes.reduce((sum, tt) => sum + tt.capacity, 0);
    const totalRegistrations = registrations.length;
    
    const UserGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
    const CashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
    const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Registrations" value={totalRegistrations} icon={<UserGroupIcon />} />
                <StatCard title="Paid Registrations" value={paidRegistrations.length} icon={<CheckCircleIcon />} />
                <StatCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={<CashIcon />} />
            </div>

            <Card title="Ticket Sales & Capacity">
                <div className="space-y-4">
                    {ticketTypes.map(tt => {
                        const sold = registrations.filter(r => r.ticketTypeId === tt.id).length;
                        const percentage = tt.capacity > 0 ? (sold / tt.capacity) * 100 : 0;
                        return (
                            <div key={tt.id}>
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-semibold text-gray-800 dark:text-white">{tt.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{sold} / {tt.capacity} sold</p>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>

             <Card title="Recent Registrations">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-4 py-2">Date</th>
                                <th className="px-4 py-2">Ticket Type</th>
                                <th className="px-4 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registrations.slice(0, 5).map(reg => (
                                <tr key={reg.id} className="border-b dark:border-gray-700">
                                    <td className="px-4 py-2">{new Date(reg.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-2">{ticketTypes.find(t=>t.id === reg.ticketTypeId)?.name}</td>
                                    <td className="px-4 py-2">{reg.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default RegistrationDashboard;