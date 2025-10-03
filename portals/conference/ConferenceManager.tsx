
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Attendee } from '../../types.ts';
import { apiService } from '../../src/services/apiService.ts';
import Card from '../../components/ui/Card.tsx';
import Table from '../../components/ui/Table.tsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.tsx';

const ConferenceManager: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (siteId) {
            setLoading(true);
            apiService.listAttendeesBySite(siteId)
                .then(setAttendees)
                .catch(err => console.error("Failed to fetch attendees", err))
                .finally(() => setLoading(false));
        }
    }, [siteId]);

    if (loading) {
        return <LoadingSpinner text="Loading Conference Data..." />;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Conference Management</h1>
            <Card title={`Attendees (${attendees.length})`}>
                <Table headers={['Name', 'Email', 'Checked In', 'Registered On']}>
                    {attendees.map(attendee => (
                        <tr key={attendee.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{attendee.firstName} {attendee.lastName}</td>
                            <td className="px-6 py-4">{attendee.email}</td>
                            <td className="px-6 py-4">{attendee.checkedIn ? 'Yes' : 'No'}</td>
                            <td className="px-6 py-4">{new Date(attendee.registrationDate).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </Table>
            </Card>
        </div>
    );
};

export default ConferenceManager;
