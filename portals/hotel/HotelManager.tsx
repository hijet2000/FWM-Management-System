
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Booking, Room } from '../../types.ts';
import { apiService } from '../../src/services/apiService.ts';
import Card from '../../components/ui/Card.tsx';
import Table from '../../components/ui/Table.tsx';
import Button from '../../components/ui/Button.tsx';
import Modal from '../../components/ui/Modal.tsx';
import { SkeletonTable } from '../../components/ui/SkeletonTable.tsx';
import EmptyState from '../../components/ui/EmptyState.tsx';
import { useToast } from '../../hooks/useToast.ts';

// Custom hook for fetching hotel data
const useHotelData = (siteId: string | undefined) => {
    const [data, setData] = useState<{ bookings: Booking[], rooms: Room[] }>({ bookings: [], rooms: [] });
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    const fetchData = useCallback(async () => {
        if (!siteId) return;
        setLoading(true);
        try {
            const [bookingsData, roomsData] = await Promise.all([
                apiService.listBookingsBySite(siteId),
                apiService.listRoomsBySite(siteId),
            ]);
            setData({ bookings: bookingsData, rooms: roomsData });
        } catch (err) {
            console.error(err);
            addToast('Failed to load hotel data.', 'error');
        } finally {
            setLoading(false);
        }
    }, [siteId, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    return { ...data, loading, refetch: fetchData };
};


const HotelManager: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const { bookings, rooms, loading, refetch } = useHotelData(siteId);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBooking, setNewBooking] = useState({ roomId: '', guestName: '', checkIn: '', checkOut: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();
    
    const handleCreateBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!siteId) return;
        setIsSubmitting(true);
        try {
            await apiService.createBooking({
                ...newBooking,
                siteId,
                checkIn: new Date(newBooking.checkIn),
                checkOut: new Date(newBooking.checkOut),
            });
            addToast('Booking created successfully!', 'success');
            setIsModalOpen(false);
            setNewBooking({ roomId: '', guestName: '', checkIn: '', checkOut: '' });
            refetch();
        } catch (err) {
            addToast((err as Error).message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Hotel Management</h1>

            <Card title="Bookings" actions={<Button onClick={() => setIsModalOpen(true)}>New Booking</Button>}>
                {loading ? (
                    <SkeletonTable headers={['Guest Name', 'Room', 'Check-in', 'Check-out']} rows={4} />
                ) : bookings.length === 0 ? (
                     <EmptyState 
                        title="No Bookings Found" 
                        message="Get started by creating a new booking."
                        action={<Button onClick={() => setIsModalOpen(true)}>Create Booking</Button>}
                     />
                ) : (
                    <Table headers={['Guest Name', 'Room', 'Check-in', 'Check-out']}>
                        {bookings.map(booking => {
                            const room = rooms.find(r => r.id === booking.roomId);
                            return (
                                <tr key={booking.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{booking.guestName}</td>
                                    <td className="px-6 py-4">{room ? `${room.roomNumber} (${room.type})` : 'N/A'}</td>
                                    <td className="px-6 py-4">{new Date(booking.checkIn).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{new Date(booking.checkOut).toLocaleDateString()}</td>
                                </tr>
                            );
                        })}
                    </Table>
                )}
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Booking">
                <form onSubmit={handleCreateBooking} className="space-y-4">
                    <div>
                        <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Guest Name</label>
                        <input id="guestName" type="text" value={newBooking.guestName} onChange={e => setNewBooking({...newBooking, guestName: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    <div>
                        <label htmlFor="room" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Room</label>
                        <select id="room" value={newBooking.roomId} onChange={e => setNewBooking({...newBooking, roomId: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                            <option value="">Select a room</option>
                            {rooms.map(room => <option key={room.id} value={room.id}>{room.roomNumber} ({room.type})</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Check-in</label>
                        <input id="checkIn" type="date" value={newBooking.checkIn} onChange={e => setNewBooking({...newBooking, checkIn: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    <div>
                        <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Check-out</label>
                        <input id="checkOut" type="date" value={newBooking.checkOut} onChange={e => setNewBooking({...newBooking, checkOut: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                         <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                         <Button type="submit" isLoading={isSubmitting}>Create Booking</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default HotelManager;
