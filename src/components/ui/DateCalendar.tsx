import { useMemo, useState } from 'react';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/** Month calendar popup. `value` is YYYY-MM-DD or "all". */
export function DateCalendar({
  value,
  onChange,
  markedDays,
  className = ''
}: {
  value: string;
  onChange: (next: string) => void;
  markedDays?: Set<string>;
  className?: string;
}) {
  const initial = value !== 'all' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date();
  const [cursor, setCursor] = useState({ year: initial.getFullYear(), month: initial.getMonth() });

  const cells = useMemo(() => {
    const firstDow = new Date(cursor.year, cursor.month, 1).getDay();
    const total = daysInMonth(cursor.year, cursor.month);
    const list: Array<{ key: string; day: number | null; iso: string | null }> = [];
    for (let i = 0; i < firstDow; i++) list.push({ key: `e-${i}`, day: null, iso: null });
    for (let d = 1; d <= total; d++) {
      const iso = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      list.push({ key: iso, day: d, iso });
    }
    return list;
  }, [cursor]);

  const shift = (delta: number) => {
    setCursor((c) => {
      const dt = new Date(c.year, c.month + delta, 1);
      return { year: dt.getFullYear(), month: dt.getMonth() };
    });
  };

  return (
    <div className={`panel panel-3d p-4 w-[18.5rem] shrink-0 ${className}`}>
      <div className="flex items-center justify-between mb-3 gap-2">
        <button type="button" className="btn btn-ghost !px-2 !py-1.5" onClick={() => shift(-1)} aria-label="Previous month">
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
        <p className="text-sm font-semibold text-ink whitespace-nowrap">{monthLabel(cursor.year, cursor.month)}</p>
        <button type="button" className="btn btn-ghost !px-2 !py-1.5" onClick={() => shift(1)} aria-label="Next month">
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-[11px] font-bold uppercase text-ink-faint text-center py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((c) => {
          if (!c.iso || c.day == null) return <div key={c.key} className="aspect-square" />;
          const selected = value === c.iso;
          const marked = markedDays?.has(c.iso);
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => onChange(c.iso!)}
              className={`calendar-day ${selected ? 'calendar-day-active' : ''} ${marked && !selected ? 'calendar-day-marked' : ''}`}
            >
              {c.day}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" className="btn btn-secondary flex-1 !py-2 text-xs" onClick={() => onChange('all')}>
          All dates
        </button>
        <button
          type="button"
          className="btn btn-ghost flex-1 !py-2 text-xs"
          onClick={() => {
            const now = new Date();
            const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            setCursor({ year: now.getFullYear(), month: now.getMonth() });
            onChange(iso);
          }}
        >
          Today
        </button>
      </div>
    </div>
  );
}
