
import React from 'react';
import Card from '../../components/ui/Card.tsx';

const CommunicationManager: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Communications Portal</h1>
            <Card title="Dashboard" className="mt-4">
                <p>Communication features (Email Campaigns, SMS, etc.) will be implemented here.</p>
            </Card>
        </div>
    );
};

export default CommunicationManager;