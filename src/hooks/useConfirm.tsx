import { useState } from 'react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = (confirmOptions: ConfirmOptions): Promise<boolean> => {
    setOptions(confirmOptions);
    setIsOpen(true);
    
    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    if (resolver) {
      resolver(false);
      setResolver(null);
    }
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolver) {
      resolver(true);
      setResolver(null);
    }
  };

  const ConfirmDialogComponent = () => {
    if (!options) return null;
    
    return (
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        {...options}
      />
    );
  };

  return { confirm, ConfirmDialogComponent };
}