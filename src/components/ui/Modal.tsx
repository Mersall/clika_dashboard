import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black dark:bg-black bg-opacity-50 dark:bg-opacity-75" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full ${sizeClasses[size]} transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-left shadow-xl`}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            <button
              type="button"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Keep the old exports for compatibility
export const Dialog = ({ children, onClose, open }: any) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black dark:bg-black bg-opacity-50 dark:bg-opacity-75" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
};

Dialog.Panel = ({ children, className }: any) => (
  <div className={className} style={{ position: 'relative', zIndex: 10 }}>
    {children}
  </div>
);

Dialog.Title = ({ children, className }: any) => (
  <h3 className={className}>{children}</h3>
);

export const Transition = ({ children, show }: any) => {
  if (!show) return null;
  return <>{children}</>;
};

Transition.Child = ({ children }: any) => <>{children}</>;
export const Fragment = React.Fragment;