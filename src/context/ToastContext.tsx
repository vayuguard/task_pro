import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  description?: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, description?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const config: Record<ToastType, { icon: string; color: string }> = {
  success: { icon: 'check_circle', color: 'var(--success)' },
  error: { icon: 'error', color: 'var(--danger)' },
  warning: { icon: 'warning', color: 'var(--warning)' },
  info: { icon: 'info', color: 'var(--accent)' }
};

const TOAST_MS = 4200;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = 'info', description?: string) => {
      counter.current += 1;
      const id = `t-${Date.now()}-${counter.current}`;
      setToasts((prev) => [...prev.slice(-3), { id, message, type, description }]);
      setTimeout(() => dismiss(id), TOAST_MS);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[min(22rem,calc(100vw-2rem))]"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const c = config[t.type];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className="panel relative overflow-hidden flex items-start gap-3 px-4 py-3"
                style={{ boxShadow: 'var(--elevation-3)' }}
              >
                <span
                  className="material-symbols-outlined text-[20px] shrink-0 mt-0.5"
                  style={{ color: c.color }}
                  aria-hidden
                >
                  {c.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{t.message}</p>
                  {t.description && <p className="text-xs text-ink-muted mt-0.5">{t.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss"
                  className="text-ink-faint hover:text-ink cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
                <motion.span
                  className="absolute bottom-0 left-0 h-0.5"
                  style={{ backgroundColor: c.color }}
                  initial={{ width: '100%' }}
                  animate={{ width: 0 }}
                  transition={{ duration: TOAST_MS / 1000, ease: 'linear' }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast requires ToastProvider');
  return ctx;
}
