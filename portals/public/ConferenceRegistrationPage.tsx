import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Site, TicketType } from '../../types.ts';
import { apiService } from '../../src/services/apiService.ts';
import { useToast } from '../../hooks/useToast.ts';
import LoadingSpinner from '../../components/ui/LoadingSpinner.tsx';
import Button from '../../components/ui/Button.tsx';
import Input from '../../components/ui/Input.tsx';
import Card from '../../components/ui/Card.tsx';

type CartItem = {
    ticketType: TicketType;
    quantity: number;
};

const TicketTypeCard: React.FC<{ ticketType: TicketType, onAdd: () => void, onRemove: () => void, quantity: number }> = ({ ticketType, onAdd, onRemove, quantity }) => {
    const isSoldOut = ticketType.capacity <= 0; // Simplified check
    return (
        <Card className={`transition-shadow hover:shadow-lg ${isSoldOut ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold">{ticketType.name}</h3>
                    <p className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">${ticketType.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{ticketType.description}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={onRemove} disabled={quantity === 0}>-</Button>
                    <span className="w-8 text-center font-semibold">{quantity}</span>
                    <Button size="sm" variant="secondary" onClick={onAdd} disabled={isSoldOut}>+</Button>
                </div>
            </div>
            {isSoldOut && <p className="text-red-500 text-sm font-semibold mt-2">Sold Out</p>}
        </Card>
    )
};

const ConferenceRegistrationPage: React.FC = () => {
    const { shortCode } = useParams<{ shortCode: string }>();
    const { addToast } = useToast();
    const [site, setSite] = useState<Site | null>(null);
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [attendees, setAttendees] = useState<any[]>([]);
    const [discountCode, setDiscountCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (shortCode) {
            Promise.all([
                apiService.findSiteByShortCode(shortCode),
                apiService.listTicketTypesBySite(`site_conf_1`) // MOCK: hardcoded siteId
            ]).then(([siteData, ticketTypeData]) => {
                setSite(siteData || null);
                setTicketTypes(ticketTypeData);
            }).catch(err => {
                addToast('Failed to load registration data.', 'error');
                console.error(err);
            }).finally(() => setIsLoading(false));
        }
    }, [shortCode, addToast]);

    const updateCart = (ticketType: TicketType, change: 1 | -1) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.ticketType.id === ticketType.id);
            if (existingItem) {
                const newQuantity = existingItem.quantity + change;
                if (newQuantity <= 0) {
                    return prevCart.filter(item => item.ticketType.id !== ticketType.id);
                }
                return prevCart.map(item => item.ticketType.id === ticketType.id ? { ...item, quantity: newQuantity } : item);
            } else if (change === 1) {
                return [...prevCart, { ticketType, quantity: 1 }];
            }
            return prevCart;
        });
    };

    useEffect(() => {
        const totalTickets = cart.reduce((sum, item) => sum + item.quantity, 0);
        const newAttendees = Array.from({ length: totalTickets }, (_, i) => attendees[i] || { firstName: '', lastName: '', email: '' });
        setAttendees(newAttendees);
    }, [cart]);
    
    const handleAttendeeChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedAttendees = [...attendees];
        updatedAttendees[index] = { ...updatedAttendees[index], [e.target.name]: e.target.value };
        setAttendees(updatedAttendees);
    };

    const handleApplyDiscount = async () => {
        // Mock validation
        if (discountCode.toUpperCase() === 'SAVE10' && cart.some(item => item.ticketType.id === 'tt_standard')) {
            setDiscountAmount(subtotal * 0.10);
            addToast('Discount applied!', 'success');
        } else {
            setDiscountAmount(0);
            addToast('Invalid discount code.', 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // In a real app, this would be a single transaction
            const registrationPromises = [];
            let ticketIndex = 0;
            for (const item of cart) {
                for (let i = 0; i < item.quantity; i++) {
                    const attendeeData = attendees[ticketIndex++];
                    registrationPromises.push(apiService.createRegistration({
                        siteId: site!.id,
                        attendee: attendeeData,
                        ticketTypeId: item.ticketType.id,
                        totalPrice: total, // simplified
                    }));
                }
            }
            await Promise.all(registrationPromises);
            addToast(`Registration successful for ${attendees.length} attendees!`, 'success');
            // Reset state or redirect
        } catch (err) {
            addToast((err as Error).message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const subtotal = cart.reduce((sum, item) => sum + item.ticketType.price * item.quantity, 0);
    const total = subtotal - discountAmount;
    
    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" text="Loading Registration..."/></div>;
    if (!site) return <div className="p-4 text-center"><h1>Conference not found.</h1></div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    {site.branding.logoUrl && <img src={site.branding.logoUrl} alt={`${site.name} Logo`} className="mx-auto h-12 mb-4 object-contain"/>}
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">{site.name}</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Registration</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Card title="1. Select Tickets">
                                <div className="space-y-4">
                                    {ticketTypes.map(tt => (
                                        <TicketTypeCard 
                                            key={tt.id} 
                                            ticketType={tt}
                                            quantity={cart.find(item => item.ticketType.id === tt.id)?.quantity || 0}
                                            onAdd={() => updateCart(tt, 1)}
                                            onRemove={() => updateCart(tt, -1)}
                                        />
                                    ))}
                                </div>
                            </Card>

                            {attendees.length > 0 && (
                                <Card title="2. Attendee Information">
                                    <div className="space-y-8">
                                        {attendees.map((attendee, index) => (
                                            <div key={index} className="p-4 border rounded-md dark:border-gray-700">
                                                <h4 className="font-semibold text-lg mb-4">Attendee {index + 1}</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <Input label="First Name" name="firstName" value={attendee.firstName} onChange={(e) => handleAttendeeChange(index, e)} required />
                                                    <Input label="Last Name" name="lastName" value={attendee.lastName} onChange={(e) => handleAttendeeChange(index, e)} required />
                                                    <Input label="Email Address" name="email" type="email" value={attendee.email} onChange={(e) => handleAttendeeChange(index, e)} required className="sm:col-span-2" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="sticky top-8 space-y-6">
                                <Card title="Order Summary">
                                    {cart.length === 0 ? (
                                        <p className="text-gray-500 text-center">Your cart is empty.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {cart.map(item => (
                                                <div key={item.ticketType.id} className="flex justify-between items-center text-sm">
                                                    <p className="text-gray-800 dark:text-gray-200">{item.quantity} x {item.ticketType.name}</p>
                                                    <p className="font-semibold">${(item.ticketType.price * item.quantity).toFixed(2)}</p>
                                                </div>
                                            ))}
                                            <div className="border-t pt-4 space-y-2">
                                                 <div className="flex justify-between text-sm">
                                                    <p>Subtotal</p>
                                                    <p className="font-semibold">${subtotal.toFixed(2)}</p>
                                                </div>
                                                {discountAmount > 0 && (
                                                     <div className="flex justify-between text-sm text-green-600">
                                                        <p>Discount</p>
                                                        <p className="font-semibold">-${discountAmount.toFixed(2)}</p>
                                                    </div>
                                                )}
                                                <div className="flex justify-between font-bold text-lg">
                                                    <p>Total</p>
                                                    <p>${total.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Card>

                                {cart.length > 0 && (
                                    <Card>
                                        <div className="flex gap-2">
                                            <Input label="Discount Code" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} />
                                            <Button type="button" variant="secondary" onClick={handleApplyDiscount} className="self-end">Apply</Button>
                                        </div>
                                    </Card>
                                )}
                                
                                <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting} disabled={attendees.length === 0}>
                                    Proceed to Payment
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConferenceRegistrationPage;