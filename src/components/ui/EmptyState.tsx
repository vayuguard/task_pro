import { motion, useReducedMotion } from 'motion/react';
import { Button } from './Button';

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  bare = false
}: {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Drop the panel chrome when rendered inside an existing panel. */
  bare?: boolean;
}) {
  const reduced = useReducedMotion();
  const iconSize = bare ? 'w-12 h-12' : 'w-16 h-16';
  return (
    <motion.div
      className={`text-center max-w-md mx-auto ${bare ? 'py-8' : 'panel p-10'}`}
      initial={reduced ? false : { opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className={`inline-flex items-center justify-center rounded-2xl mb-4 ${iconSize} ${reduced ? '' : 'float-soft'}`}
        style={{ backgroundColor: 'var(--accent-soft)' }}
      >
        <span
          className="material-symbols-outlined"
          style={{ color: 'var(--accent)', fontSize: bare ? 24 : 32 }}
        >
          {icon}
        </span>
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && <p className="text-sm text-ink-muted mt-1.5">{description}</p>}
      {(actionLabel || secondaryLabel) && (
        <div className="flex items-center justify-center gap-2 mt-5">
          {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
          {secondaryLabel && onSecondary && (
            <Button variant="secondary" onClick={onSecondary}>
              {secondaryLabel}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
