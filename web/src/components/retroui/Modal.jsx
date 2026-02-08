import React, { useEffect, useCallback } from 'react';
import { cn } from '../../helpers/utils';
import { X } from 'lucide-react';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({
  visible,
  onClose,
  onOk,
  title,
  children,
  footer,
  okText = '确定',
  cancelText = '取消',
  okLoading = false,
  className,
  closeOnEsc = true,
  maskClosable = true,
}) => {
  const handleEsc = useCallback(
    (e) => {
      if (e.key === 'Escape' && closeOnEsc && !okLoading) {
        onClose?.();
      }
    },
    [closeOnEsc, okLoading, onClose]
  );

  useEffect(() => {
    if (visible) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [visible, handleEsc]);

  // Handle animation logic simply with conditional rendering for now or use a library if available.
  // Given user wants "design feel", we'll just style the static state beautifully first.
  if (!visible) return null;

  const handleMaskClick = (e) => {
    if (e.target === e.currentTarget && maskClosable && !okLoading) {
      onClose?.();
    }
  };

  const defaultFooter = (
    <div className="flex justify-end gap-3">
      <Button variant="secondary" onClick={onClose} disabled={okLoading}>
        {cancelText}
      </Button>
      <Button variant="primary" onClick={onOk} disabled={okLoading}>
        {okLoading ? '...' : okText}
      </Button>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 dark:bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleMaskClick}
    >
      <div
        className={cn(
          'w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl scale-100',
          'max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/50">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            disabled={okLoading}
            className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {children}
        </div>

        {/* Footer */}
        {footer !== null && (
          <div className="px-6 py-5 bg-gray-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800/50">
            {footer === undefined ? defaultFooter : footer}
          </div>
        )}
      </div>
    </div>
  );
};

export { Modal };