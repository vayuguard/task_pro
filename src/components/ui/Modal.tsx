import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-3xl'
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className = '',
  size = 'md'
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    ref.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 border-0 cursor-pointer"
            style={{ backgroundColor: 'rgba(2, 6, 23, 0.55)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            tabIndex={-1}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className={`relative z-10 w-full ${sizes[size]} max-h-[92vh] flex flex-col panel m-0 sm:m-4 rounded-t-2xl sm:rounded-xl overflow-hidden ${className}`}
            style={{ boxShadow: 'var(--elevation-3)' }}
          >
            {title && (
              <div
                className="flex items-start justify-between gap-4 border-b px-5 py-4 shrink-0"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="min-w-0">
                  <h2 id="modal-title" className="text-lg font-semibold text-ink">
                    {title}
                  </h2>
                  {description && <p className="text-xs text-ink-muted mt-0.5">{description}</p>}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-ghost p-1 rounded-lg shrink-0"
                  aria-label="Close"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            )}
            <div className="p-5 overflow-y-auto custom-scrollbar">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
