import { motion, useReducedMotion } from 'motion/react';

type Tone = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const toneVar: Record<Tone, string> = {
  accent: 'var(--accent)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  info: 'var(--info)',
  neutral: 'var(--ink-faint)'
};

export function ProgressBar({
  value,
  tone = 'accent',
  className = '',
  height = 6
}: {
  value: number;
  tone?: Tone;
  className?: string;
  height?: number;
}) {
  const reduced = useReducedMotion();
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`w-full rounded-full overflow-hidden ${className}`}
      style={{ height, backgroundColor: 'var(--surface-sunken)' }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: toneVar[tone] }}
        initial={reduced ? false : { width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

export function ProgressRing({
  value,
  size = 120,
  stroke = 10,
  tone = 'accent',
  label,
  sublabel
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: Tone;
  label?: string;
  sublabel?: string;
}) {
  const reduced = useReducedMotion();
  const pct = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke="var(--surface-sunken)"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke={toneVar[tone]}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduced ? false : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <span className="text-2xl font-bold text-ink">{label}</span>}
        {sublabel && <span className="text-[10px] uppercase tracking-wide text-ink-faint">{sublabel}</span>}
      </div>
    </div>
  );
}
