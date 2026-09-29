import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiGetAttendance } from '../api/client';
import { PageHeader } from '../components/ui/Panel';
import { PageLoading } from '../components/ui/Skeleton';
import { DateCalendar } from '../components/ui/DateCalendar';
import { formatTimeIST, nowTimestamp } from '../utils/time';

type AttendanceRow = {
  id: string;
  date: string;
  email: string;
  name: string;
  loginAt: string | null;
  loginLocation: { lat: number; lng: number; label?: string } | null;
  locationStatus: string;
  officeEnterAt: string | null;
  logoutAt: string | null;
  officeLeaveAt: string | null;
};

function fmtWhen(value: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return nowTimestamp(d);
}

function fmtClock(value: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return formatTimeIST(d);
}

function Field({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-sunken/40 px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="text-sm font-medium text-ink mt-0.5 break-words">{value}</p>
      {hint ? <p className="text-[11px] text-ink-faint mt-0.5">{hint}</p> : null}
    </div>
  );
}

export default function AttendancePage() {
  const { session } = useAuth();
  const isAdmin = session?.role === 'admin';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [dayFilter, setDayFilter] = useState('all');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiGetAttendance(45)
      .then((r) => setRows(r.rows))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load attendance'))
      .finally(() => setLoading(false));
  }, [session?.userId]);

  useEffect(() => {
    if (!calendarOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setCalendarOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCalendarOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [calendarOpen]);

  const employees = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of rows) map.set(r.email, r.name);
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [rows]);

  const markedDays = useMemo(() => new Set(rows.map((r) => r.date)), [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (employeeFilter !== 'all' && r.email !== employeeFilter) return false;
      if (dayFilter !== 'all' && r.date !== dayFilter) return false;
      return true;
    });
  }, [rows, employeeFilter, dayFilter]);

  const dateLabel = dayFilter === 'all' ? 'All dates' : dayFilter;

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Attendance"
        subtitle={
          isAdmin
            ? 'Employee-wise daily attendance · login place · office enter/leave · logout'
            : 'Your daily attendance · login place · office enter/leave · logout'
        }
      />
      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex flex-wrap gap-3 items-end">
        {isAdmin && (
          <label className="block text-xs font-semibold text-ink-muted min-w-[12rem] flex-1">
            Employee
            <select
              className="input mt-1.5"
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
            >
              <option value="all">All employees</option>
              {employees.map(([email, name]) => (
                <option key={email} value={email}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="relative" ref={popRef}>
          <p className="text-xs font-semibold text-ink-muted mb-1.5">Date</p>
          <button
            type="button"
            className="btn btn-secondary min-w-[11rem] justify-between gap-3"
            onClick={() => setCalendarOpen((v) => !v)}
            aria-expanded={calendarOpen}
          >
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            <span className="flex-1 text-left">{dateLabel}</span>
            <span className="material-symbols-outlined text-[18px]">
              {calendarOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {calendarOpen && (
            <div className="absolute left-0 top-full mt-2 z-40 shadow-float">
              <DateCalendar
                value={dayFilter}
                markedDays={markedDays}
                onChange={(next) => {
                  setDayFilter(next);
                  setCalendarOpen(false);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="panel panel-3d p-6">
          <p className="text-sm text-ink-muted">No attendance records for this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <article key={r.id} className="panel panel-3d p-4">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{r.name}</p>
                  <p className="text-xs text-ink-muted break-all">{r.email}</p>
                </div>
                <span className="chip chip-active pointer-events-none">{r.date}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Field label="Login time" value={fmtWhen(r.loginAt)} hint={fmtClock(r.loginAt)} />
                <Field label="Logout / auto-logout" value={fmtWhen(r.logoutAt)} hint={fmtClock(r.logoutAt)} />
                <Field label="Office enter" value={fmtWhen(r.officeEnterAt)} hint={fmtClock(r.officeEnterAt)} />
                <Field label="Office leave" value={fmtWhen(r.officeLeaveAt)} hint={fmtClock(r.officeLeaveAt)} />
              </div>
              <div className="mt-2">
                <Field
                  label="Login location"
                  value={
                    r.loginLocation?.label ||
                    (r.locationStatus === 'unavailable' ? 'Not recorded' : '—')
                  }
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
