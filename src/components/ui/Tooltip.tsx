import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';

export function Tooltip({
  label,
  children,
  side = 'top'
}: {
  label: string;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom';
}) {
  const [open, setOpen] = useState(false);

  const position =
    side === 'right'
      ? 'left-full top-1/2 -translate-y-1/2 ml-2'
      : side === 'bottom'
        ? 'top-full left-1/2 -translate-x-1/2 mt-2'
        : 'bottom-full left-1/2 -translate-x-1/2 mb-2';

  const offset = side === 'right' ? { x: -4 } : side === 'bottom' ? { y: -4 } : { y: 4 };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, ...offset }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, ...offset }}
            transition={{ duration: 0.15 }}
            className={`absolute z-[80] px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap pointer-events-none ${position}`}
            style={{
              backgroundColor: 'var(--ink)',
              color: 'var(--surface-raised)',
              boxShadow: 'var(--elevation-2)'
            }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
