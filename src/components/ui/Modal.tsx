import React from 'react';

// Simple modal replacement for @headlessui/react Dialog
export const Dialog = ({ children, onClose, open }: any) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-75" onClick={onClose} />
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

// Simple transition replacement
export const Transition = ({ children, show }: any) => {
  if (!show) return null;
  return <>{children}</>;
};

Transition.Child = ({ children }: any) => <>{children}</>;

export const Fragment = React.Fragment;