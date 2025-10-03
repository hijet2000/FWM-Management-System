import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Attendee, TicketType, Registration, RegistrationStatus } from '../../types.ts';
import { apiService } from '../../src/services/apiService.ts';
import useAuth from '../../hooks/useAuth.ts';
import Card from '../../components/ui/Card.tsx';
import Table from '../../components/ui/Table.tsx';
import Button from '../../components/ui/Button.tsx';
import Input from '../../components/ui/Input.tsx';
import { SkeletonTable } from '../../components/ui/SkeletonTable.tsx';
import EmptyState from '../../components/ui/EmptyState.tsx';

type AttendeeWithMainRegistration = Attendee & { mainRegistration: Registration };

const useAttendeesData = (siteId: string | undefined) => {
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (siteId) {
            setLoading(true);
            Promise.all([
                apiService.listAttendeesBySite(siteId),
                apiService.listTicketTypesBySite(siteId)
            ]).then(([attendeeData, ticketTypeData]) => {
                setAttendees(attendeeData);
                setTicketTypes(ticketTypeData);
            }).catch(console.error).finally(() => setLoading(false));
        }
    }, [siteId]);

    const attendeesWithRegistrations = useMemo(() => {
        return attendees
            .map(attendee => ({
                ...attendee,
                // Find the primary registration for this attendee
                mainRegistration: attendee.registrations?.[0]
            }))
            .filter(a => a.mainRegistration); // Only show attendees with at least one registration
    }, [attendees]);

    return { attendeesWithRegistrations, ticketTypes, loading };
}

const AttendeesList: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const { can } = useAuth();
    const { attendeesWithRegistrations, ticketTypes, loading } = useAttendeesData(siteId);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAttendees = useMemo(() => {
        return attendeesWithRegistrations.filter(attendee =>
            attendee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            attendee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            attendee.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [attendeesWithRegistrations, searchTerm]);

    const StatusBadge: React.FC<{ status: RegistrationStatus }> = ({ status }) => {
        const colors = {
            [RegistrationStatus.PAID]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            [RegistrationStatus.PENDING_PAYMENT]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            [RegistrationStatus.CANCELLED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            [RegistrationStatus.DRAFT]: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
            [RegistrationStatus.WAITLIST]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        };
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status]}`}>{status.replace('_', ' ')}</span>;
    };


    return (
        <Card>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <div className="w-full sm:w-1/2 md:w-1/3">
                    <Input label="Search Attendees" id="search" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary">Export</Button>
                    <Button>Add Attendee</Button>
                </div>
            </div>

            {loading ? (
                <SkeletonTable headers={['Name', 'Email', 'Ticket Type', 'Status', 'Actions']} rows={5} />
            ) : filteredAttendees.length === 0 ? (
                <EmptyState title="No Attendees Found" message={searchTerm ? "No attendees match your search." : "Get started by adding an attendee or importing a list."} />
            ) : (
                <Table headers={['Name', 'Email', 'Ticket Type', 'Status', 'Actions']}>
                    {filteredAttendees.map(attendee => {
                        const ticketType = ticketTypes.find(tt => tt.id === attendee.mainRegistration.ticketTypeId);
                        return (
                            <tr key={attendee.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{attendee.firstName} {attendee.lastName}</td>
                                <td className="px-6 py-4">{attendee.email}</td>
                                <td className="px-6 py-4">{ticketType?.name || 'N/A'}</td>
                                <td className="px-6 py-4"><StatusBadge status={attendee.mainRegistration.status} /></td>
                                <td className="px-6 py-4">
                                    <Button variant="ghost" size="sm">View</Button>
                                </td>
                            </tr>
                        );
                    })}
                </Table>
            )}
        </Card>
    );
};

export default AttendeesList;