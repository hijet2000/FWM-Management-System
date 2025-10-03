
import React from 'react';
import Card from './Card.tsx';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, changeType }) => {
  return (
    <Card className="shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-indigo-500 rounded-md text-white">
          {icon}
        </div>
      </div>
      {change && (
        <div className="mt-4 flex space-x-1 items-center text-sm">
          <span className={`${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
            {change}
          </span>
          <span className="text-gray-500 dark:text-gray-400">from last period</span>
        </div>
      )}
    </Card>
  );
};

export default StatCard;