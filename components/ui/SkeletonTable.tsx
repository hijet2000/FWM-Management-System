
import React from 'react';
import Table from './Table.tsx';

interface SkeletonTableProps {
  headers: string[];
  rows?: number;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({ headers, rows = 3 }) => {
  return (
    <Table headers={headers}>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 animate-pulse">
          {headers.map((_, j) => (
            <td key={j} className="px-6 py-4">
              <div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
            </td>
          ))}
        </tr>
      ))}
    </Table>
  );
};
