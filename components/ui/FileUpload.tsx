
import React, { useRef, useState } from 'react';

interface FileUploadProps {
  label: string;
  currentImageUrl?: string;
  onFileSelect: (file: File | null, base64: string | null) => void;
  helperText?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, currentImageUrl, onFileSelect, helperText }) => {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onFileSelect(file, base64String);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      onFileSelect(null, null);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onFileSelect(null, null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="mt-1 flex items-center gap-4">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          {preview ? (
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>
          )}
        </div>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <div className="flex flex-col gap-1 items-start">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            {preview ? 'Change' : 'Upload'}
          </button>
          {preview && (
              <button type="button" onClick={handleRemove} className="text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300">
                Remove
              </button>
          )}
        </div>
      </div>
      {helperText && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>}
    </div>
  );
};

export default FileUpload;
