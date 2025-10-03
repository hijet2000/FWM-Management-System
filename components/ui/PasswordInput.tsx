import React, { useState } from 'react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ label, id, ...props }) => {
  const [show, setShow] = useState(false);
  const inputId = id || `input-${Math.random()}`;
  
  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
          id={inputId}
          type={show ? 'text' : 'password'}
          className="block w-full rounded-md border-gray-300 pr-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          {...props}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button type="button" onClick={() => setShow(!show)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" aria-label={show ? "Hide value" : "Show value"}>
            {show ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.042 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.27 8.138 15.522 6 10 6c-1.526 0-2.98.394-4.326 1.072L3.707 2.293zm9.237 9.237a4 4 0 01-5.656-5.656L12.944 6.343z" clipRule="evenodd" /><path d="M9.904 4.024c.33.015.662.03.996.03c4.478 0 7.27 2.13 8.642 3.996A10.025 10.025 0 0110 14c-1.432 0-2.8.368-4.096.992L9.904 4.024z" /></svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordInput;