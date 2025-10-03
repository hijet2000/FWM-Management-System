
import React from 'react';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorInput: React.FC<ColorInputProps> = ({ label, value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="mt-1 flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 p-1 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 rounded border-none bg-transparent cursor-pointer"
        />
        <input
          type="text"
          value={value.toUpperCase()}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded border-none bg-transparent p-1 text-sm focus:ring-0 dark:text-white"
        />
      </div>
    </div>
  );
};

export default ColorInput;
