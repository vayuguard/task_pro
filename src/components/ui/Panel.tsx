import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AnimatedNumber } from './AnimatedNumber';

export function Panel({
  className = '',
  children,
  interactive = false,
  padded = true
}: {
  className?: string;
  children: ReactNode;
  interactive?: boolean;
  padded?: boolean;
}) {
  return (
    <div
      className={`${interactive ? 'panel-interactive' : 'panel'} ${padded ? 'p-4 sm:p-5' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
  eyebrow
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  eyebrow?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6"
      initial={reduced ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent mb-1">{eyebrow}</p>
        )}
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-ink-muted mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </motion.div>
  );
}

type Tone = 'accent' | 'success' | 'warning' | 'danger' | 'neutral';

const toneStyles: Record<Tone, { bg: string; fg: string }> = {
  accent: { bg: 'var(--accent-soft)', fg: 'var(--accent)' },
  success: { bg: 'var(--success-soft)', fg: 'var(--success)' },
  warning: { bg: 'var(--warning-soft)', fg: 'var(--warning)' },
  danger: { bg: 'var(--danger-soft)', fg: 'var(--danger)' },
  neutral: { bg: 'var(--surface-sunken)', fg: 'var(--ink-muted)' }
};

export function Stat({
  label,
  value,
  hint,
  icon,
  tone = 'neutral',
  decimals = 0,
  suffix,
  trend
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon?: string;
  tone?: Tone;
  decimals?: number;
  suffix?: string;
  trend?: number;
}) {
  const styles = toneStyles[tone];
  const numeric = typeof value === 'number';

  return (
    <div className="panel-interactive p-4 relative overflow-hidden group">
      <div
        className="absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: styles.bg }}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wide truncate">{label}</p>
          <p className="text-2xl font-bold text-ink mt-1">
            {numeric ? (
              <AnimatedNumber value={value} decimals={decimals} suffix={suffix} />
            ) : (
              value
            )}
          </p>
          {hint && <p className="text-xs text-ink-faint mt-0.5">{hint}</p>}
        </div>
        {icon && (
          <span
            className="material-symbols-outlined text-[20px] p-2 rounded-lg shrink-0"
            style={{ backgroundColor: styles.bg, color: styles.fg }}
            aria-hidden
          >
            {icon}
          </span>
        )}
      </div>
      {trend != null && (
        <p
          className="relative text-xs font-semibold mt-2 flex items-center gap-1"
          style={{ color: trend >= 0 ? 'var(--success)' : 'var(--danger)' }}
        >
          <span className="material-symbols-outlined text-[14px]">
            {trend >= 0 ? 'trending_up' : 'trending_down'}
          </span>
          {Math.abs(trend)}% vs previous period
        </p>
      )}
    </div>
  );
}

export function SectionTitle({
  title,
  action,
  icon
}: {
  title: string;
  action?: ReactNode;
  icon?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
        {icon && <span className="material-symbols-outlined text-[18px] text-accent">{icon}</span>}
        {title}
      </h2>
      {action}
    </div>
  );
}
