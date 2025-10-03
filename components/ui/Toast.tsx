import React, { useEffect } from 'react';
import { ToastMessage } from '../../contexts/ToastContext.tsx';

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: number) => void;
}

const toastTypeClasses = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [toast, onRemove]);

  return (
    <div className={`text-white p-4 rounded-md shadow-lg flex items-center justify-between mb-2 animate-fade-in-right ${toastTypeClasses[toast.type]}`}>
      <span className="mr-4">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="text-white font-bold">&times;</button>
    </div>
  );
};


interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-5 right-5 z-50">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
