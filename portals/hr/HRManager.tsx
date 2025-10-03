
import React from 'react';
import Card from '../../components/ui/Card.tsx';

const HRManager: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Human Resources</h1>
            <Card title="Dashboard" className="mt-4">
                <p>HR features (Staff Directory, Payroll, Leave, etc.) will be implemented here.</p>
            </Card>
        </div>
    );
};

export default HRManager;