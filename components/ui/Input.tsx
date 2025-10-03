
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({ label, id, helperText, ...props }) => {
  const inputId = id || `input-${Math.random()}`;
  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="mt-1">
        <input
          id={inputId}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white disabled:bg-gray-200 dark:disabled:bg-gray-600"
          {...props}
        />
      </div>
      {helperText && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>}
    </div>
  );
};

export default Input;
