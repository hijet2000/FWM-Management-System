
import React from 'react';
import Card from '../../components/ui/Card.tsx';

const BankManager: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Banking Portal</h1>
            <Card title="Dashboard" className="mt-4">
                <p>Banking features (Transactions, Budgets, Analytics, etc.) will be implemented here.</p>
            </Card>
        </div>
    );
};

export default BankManager;