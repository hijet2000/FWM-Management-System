
import React from 'react';
import Card from '../../components/ui/Card.tsx';
import { useParams } from 'react-router-dom';

const ChurchManager: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Church Management</h1>
            <p className="text-gray-500 dark:text-gray-400">Site ID: {siteId}</p>
            <Card title="Dashboard" className="mt-4">
                <p>Church management features (Members, Groups, Giving, etc.) will be implemented here.</p>
            </Card>
        </div>
    );
};

export default ChurchManager;