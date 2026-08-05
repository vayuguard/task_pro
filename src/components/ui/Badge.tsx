import type { ReactNode } from 'react';
import { TaskPriority, TaskStatus } from '../../types';

const priorityStyles: Record<TaskPriority, { bg: string; fg: string; icon: string }> = {
  Highest: { bg: 'var(--danger-soft)', fg: 'var(--danger)', icon: 'keyboard_double_arrow_up' },
  High: { bg: 'var(--warning-soft)', fg: 'var(--warning)', icon: 'keyboard_arrow_up' },
  Medium: { bg: 'var(--surface-sunken)', fg: 'var(--ink-muted)', icon: 'remove' },
  Low: { bg: 'var(--surface-sunken)', fg: 'var(--ink-faint)', icon: 'keyboard_arrow_down' }
};

const statusStyles: Record<TaskStatus, { bg: string; fg: string }> = {
  'To Do': { bg: 'var(--surface-sunken)', fg: 'var(--ink-muted)' },
  'In Progress': { bg: 'var(--accent-soft)', fg: 'var(--accent)' },
  Review: { bg: 'var(--info-soft)', fg: 'var(--info)' },
  Done: { bg: 'var(--success-soft)', fg: 'var(--success)' }
};

export function PriorityBadge({ priority, showIcon = true }: { priority: TaskPriority; showIcon?: boolean }) {
  const s = priorityStyles[priority];
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      {showIcon && <span className="material-symbols-outlined text-[12px] leading-none">{s.icon}</span>}
      {priority}
    </span>
  );
}

export function StatusBadge({ status, live = false }: { status: TaskStatus; live?: boolean }) {
  const s = statusStyles[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      {live && status === 'In Progress' && (
        <span
          className="w-1.5 h-1.5 rounded-full live-dot"
          style={{ backgroundColor: s.fg }}
          aria-hidden
        />
      )}
      {status}
    </span>
  );
}

type Tone = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const toneStyles: Record<Tone, { bg: string; fg: string }> = {
  accent: { bg: 'var(--accent-soft)', fg: 'var(--accent)' },
  success: { bg: 'var(--success-soft)', fg: 'var(--success)' },
  warning: { bg: 'var(--warning-soft)', fg: 'var(--warning)' },
  danger: { bg: 'var(--danger-soft)', fg: 'var(--danger)' },
  info: { bg: 'var(--info-soft)', fg: 'var(--info)' },
  neutral: { bg: 'var(--surface-sunken)', fg: 'var(--ink-muted)' }
};

export function Badge({
  children,
  tone = 'neutral',
  icon
}: {
  children: ReactNode;
  tone?: Tone;
  icon?: string;
}) {
  const s = toneStyles[tone];
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.fg }}
    >
      {icon && <span className="material-symbols-outlined text-[12px] leading-none">{icon}</span>}
      {children}
    </span>
  );
}

export function Avatar({
  name,
  src,
  size = 32,
  ring = false
}: {
  name: string;
  src?: string;
  size?: number;
  ring?: boolean;
}) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 font-semibold ${
        ring ? 'ring-2 ring-accent ring-offset-2' : ''
      }`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        backgroundColor: 'var(--accent-soft)',
        color: 'var(--accent)',
        // ring-offset needs an explicit colour so it blends in dark mode
        ['--tw-ring-offset-color' as string]: 'var(--surface-raised)'
      }}
      title={name}
    >
      {src ? (
        <img src={src} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        initials
      )}
    </span>
  );
}

export function AvatarStack({
  users,
  max = 4,
  size = 28
}: {
  users: Array<{ name: string; avatar?: string }>;
  max?: number;
  size?: number;
}) {
  const shown = users.slice(0, max);
  const rest = users.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((u, i) => (
        <span key={`${u.name}-${i}`} className="-ml-2 first:ml-0 rounded-full" style={{ zIndex: max - i }}>
          <span className="block rounded-full" style={{ boxShadow: '0 0 0 2px var(--surface-raised)' }}>
            <Avatar name={u.name} src={u.avatar} size={size} />
          </span>
        </span>
      ))}
      {rest > 0 && (
        <span
          className="-ml-2 inline-flex items-center justify-center rounded-full text-[10px] font-bold"
          style={{
            width: size,
            height: size,
            backgroundColor: 'var(--surface-sunken)',
            color: 'var(--ink-muted)',
            boxShadow: '0 0 0 2px var(--surface-raised)'
          }}
        >
          +{rest}
        </span>
      )}
    </div>
  );
}
