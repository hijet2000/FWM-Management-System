
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../../components/ui/Button.tsx';

const ConferenceLanding: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '' });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would call apiService.createAttendee or similar
        console.log('Registering for conference site:', siteId, formData);
        setIsSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-indigo-700 text-white flex flex-col items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-5xl font-extrabold mb-4">FWM Annual Conference 2024</h1>
                <p className="text-xl mb-8 text-indigo-200">Join us for an inspiring week of faith, fellowship, and growth.</p>
            </div>

            <div className="w-full max-w-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-8 rounded-xl shadow-2xl">
                {isSubmitted ? (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-green-500">Thank You for Registering!</h2>
                        <p className="mt-4">We've received your information and will be in touch with more details soon.</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-center mb-6">Register Now</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                                <input type="text" name="firstName" id="firstName" onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                                <input type="text" name="lastName" id="lastName" onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                <input type="email" name="email" id="email" onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                            <Button type="submit" className="w-full !mt-6">Register</Button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ConferenceLanding;