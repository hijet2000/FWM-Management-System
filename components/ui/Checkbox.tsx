import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, id, ...props }) => {
  const checkboxId = id || `checkbox-${Math.random()}`;
  return (
    <div className="flex items-center">
      <input
        id={checkboxId}
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:checked:bg-indigo-500"
        {...props}
      />
      <label htmlFor={checkboxId} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
        {label}
      </label>
    </div>
  );
};

export default Checkbox;