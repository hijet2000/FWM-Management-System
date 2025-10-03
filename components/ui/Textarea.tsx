import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helperText?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, id, helperText, ...props }) => {
  const textareaId = id || `textarea-${Math.random()}`;
  return (
    <div>
      <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="mt-1">
        <textarea
          id={textareaId}
          rows={4}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          {...props}
        />
      </div>
      {helperText && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>}
    </div>
  );
};

export default Textarea;
