
import React from 'react';

type SelectOption = {
  value: string | number;
  label: string;
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  helperText?: string;
}

const Select: React.FC<SelectProps> = ({ label, id, options, helperText, ...props }) => {
  const selectId = id || `select-${Math.random()}`;
  return (
    <div>
      <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <select
        id={selectId}
        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {helperText && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>}
    </div>
  );
};

export default Select;
