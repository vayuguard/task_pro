import { motion, useReducedMotion } from 'motion/react';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  count?: number;
}

export function Tabs({
  tabs,
  active,
  onChange,
  layoutId = 'tab-underline'
}: {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  layoutId?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <div
      className="flex items-center gap-1 border-b overflow-x-auto custom-scrollbar"
      style={{ borderColor: 'var(--border)' }}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
              isActive ? 'text-accent' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {tab.icon && <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>}
            {tab.label}
            {tab.count != null && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: isActive ? 'var(--accent-soft)' : 'var(--surface-sunken)',
                  color: isActive ? 'var(--accent)' : 'var(--ink-faint)'
                }}
              >
                {tab.count}
              </span>
            )}
            {isActive &&
              (reduced ? (
                <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-accent" />
              ) : (
                <motion.span
                  layoutId={layoutId}
                  className="absolute left-0 right-0 -bottom-px h-0.5 bg-accent rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                />
              ))}
          </button>
        );
      })}
    </div>
  );
}
