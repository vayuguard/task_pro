import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useUI } from '../context/UIContext';
import { PageHeader } from '../components/ui/Panel';
import { PageLoading } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { TaskStatus } from '../types';
import { getTaskHours } from '../utils/taskDisplay';
import { startOfIstDay } from '../utils/time';

type Filter = 'all' | 'Paused' | TaskStatus;

const filters: Filter[] = ['all', 'To Do', 'In Progress', 'Paused', 'Review', 'Done'];

function dueChip(dueDate: string, now: number) {
  const d = new Date(dueDate);
  if (Number.isNaN(d.getTime()) || dueDate === 'No due date') return null;
  const days = Math.round((startOfIstDay(d.getTime()) - startOfIstDay(now)) / 86_400_000);
  if (days < 0) return { text: days === -1 ? '1d overdue' : `${Math.abs(days)}d overdue`, tone: 'danger' as const };
  if (days === 0) return { text: 'Due today', tone: 'warning' as const };
  if (days <= 3) return { text: `Due in ${days}d`, tone: 'info' as const };
  return null;
}

export default function TasksPage() {
  const { visibleTasks, loading } = useData();
  const [params] = useSearchParams();
  const q = params.get('q')?.toLowerCase() || '';
  const [statusFilter, setStatusFilter] = useState<Filter>('all');
  const { openCreateTask } = useUI();
  const [sortBy, setSortBy] = useState<'due' | 'priority' | 'created'>('due');
  const [view, setView] = useState<'comfortable' | 'compact'>('comfortable');
  const nowMs = Date.now();

  const filtered = useMemo(() => {
    return visibleTasks.filter((t) => {
      if (statusFilter === 'Paused') {
        if (!(t.status === 'In Progress' && t.timerPaused)) return false;
      } else if (statusFilter === 'In Progress') {
        if (t.status !== 'In Progress' || t.timerPaused) return false;
      } else if (statusFilter !== 'all' && t.status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.project.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    });
  }, [visibleTasks, statusFilter, q]);

  const displayTasks = useMemo(() => {
    const arr = [...filtered];
    const priorityRank: Record<string, number> = { Highest: 4, High: 3, Medium: 2, Low: 1 };
    const epochFromTaskId = (taskId: string) => {
      const match = taskId.match(/(\d{12,})$/);
      const ms = match ? Number(match[1]) : NaN;
      return Number.isFinite(ms) ? ms : 0;
    };
    arr.sort((a, b) => {
      if (sortBy === 'priority') return (priorityRank[b.priority] ?? 0) - (priorityRank[a.priority] ?? 0);
      if (sortBy === 'created') return epochFromTaskId(b.id) - epochFromTaskId(a.id);
      const ad = new Date(a.dueDate).getTime();
      const bd = new Date(b.dueDate).getTime();
      const aOk = !Number.isNaN(ad);
      const bOk = !Number.isNaN(bd);
      if (aOk && bOk) return ad - bd;
      if (aOk) return -1;
      if (bOk) return 1;
      return 0;
    });
    return arr;
  }, [filtered, sortBy]);

  if (loading && visibleTasks.length === 0) return <PageLoading />;

  return (
    <div>
      <PageHeader
        title="My tasks"
        subtitle={q ? `Search: "${q}"` : `${displayTasks.length} tasks · Mon–Sat · Sunday weekly off`}
        action={<Button onClick={openCreateTask}>New task</Button>}
      />
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setStatusFilter(f)}
            className={`chip ${statusFilter === f ? 'chip-active' : ''}`}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-ink-muted">Sort</span>
          <select
            className="input w-auto py-1.5 px-3"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            aria-label="Sort tasks"
          >
            <option value="due">Due date</option>
            <option value="priority">Priority</option>
            <option value="created">Created</option>
          </select>
        </div>
        <Button
          variant="ghost"
          onClick={() => setView((v) => (v === 'comfortable' ? 'compact' : 'comfortable'))}
          icon={view === 'comfortable' ? 'view_compact' : 'view_list'}
        >
          {view === 'comfortable' ? 'Compact' : 'Comfortable'}
        </Button>
      </div>

      {displayTasks.length === 0 ? (
        <EmptyState
          title={q || statusFilter !== 'all' ? 'No matching tasks' : 'No tasks yet'}
          description={
            q || statusFilter !== 'all'
              ? 'Clear filters or create a new task.'
              : 'Create a task to start tracking work.'
          }
          actionLabel={q || statusFilter !== 'all' ? 'Clear filters' : 'New task'}
          onAction={
            q || statusFilter !== 'all'
              ? () => {
                  setStatusFilter('all');
                  window.history.replaceState({}, '', '/tasks');
                }
              : openCreateTask
          }
        />
      ) : (
        <div className="space-y-2">
          {displayTasks.map((t) => {
            const due = dueChip(t.dueDate, nowMs);
            const spent = getTaskHours(t);
            const ratio =
              t.timeEstimated > 0 ? `${spent.toFixed(1)}h / ${t.timeEstimated.toFixed(1)}h` : `${spent.toFixed(1)}h`;
            return (
              <Link
                key={t.id}
                to={`/tasks/${t.id}`}
                className={`panel flex items-center justify-between gap-4 hover:border-accent/40 transition-colors ${
                  view === 'compact' ? 'p-3 gap-3' : 'p-4'
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{t.title}</p>
                  {view === 'comfortable' && (
                    <p className="text-xs text-ink-muted mt-0.5">
                      {t.project} · {t.assignee.name} · {ratio}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  {due && (
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        due.tone === 'danger'
                          ? 'bg-danger-soft text-danger'
                          : due.tone === 'warning'
                            ? 'bg-warning-soft text-warning'
                            : 'bg-info-soft text-info'
                      }`}
                    >
                      {due.text}
                    </span>
                  )}
                  <PriorityBadge priority={t.priority} />
                  <span className="text-xs text-ink-muted tabular-nums">{spent.toFixed(1)}h</span>
                  <StatusBadge
                    status={t.status}
                    paused={Boolean(t.timerPaused)}
                    live={t.status === 'In Progress' && !t.timerPaused}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
