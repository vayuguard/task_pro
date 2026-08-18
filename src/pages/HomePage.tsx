import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '../auth/AuthContext';
import { useData } from '../context/DataContext';
import { useUI } from '../context/UIContext';
import { PageHeader, SectionTitle, Stat } from '../components/ui/Panel';
import { PageLoading } from '../components/ui/Skeleton';
import { Avatar, PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { getTaskHours } from '../utils/taskDisplay';
import { ProgressBar, ProgressRing } from '../components/ui/Progress';
import { formatLongDateIST, startOfIstDay } from '../utils/time';
import type { TaskStatus } from '../types';

const STATUS_ORDER: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Done'];
const STATUS_TONE: Record<TaskStatus, 'neutral' | 'accent' | 'info' | 'success'> = {
  'To Do': 'neutral',
  'In Progress': 'accent',
  Review: 'info',
  Done: 'success'
};

function epochFromActivityId(id?: string) {
  const match = id?.match(/(\d{12,})$/);
  const ms = match ? Number(match[1]) : NaN;
  return Number.isFinite(ms) ? ms : 0;
}

function dueLabel(iso: string, now: number) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { text: 'No due date', overdue: false };
  const dueDay = startOfIstDay(d.getTime());
  const today = startOfIstDay(now);
  const days = Math.round((dueDay - today) / 86_400_000);
  if (days < 0) return { text: days === -1 ? '1d overdue' : `${Math.abs(days)}d overdue`, overdue: true };
  if (days === 0) return { text: 'Due today', overdue: false };
  if (days === 1) return { text: 'Due tomorrow', overdue: false };
  return { text: `Due in ${days}d`, overdue: false };
}

function isOverdue(dueDate: string, now: number) {
  const d = new Date(dueDate);
  if (Number.isNaN(d.getTime())) return false;
  return startOfIstDay(d.getTime()) < startOfIstDay(now);
}

export default function HomePage() {
  const { session } = useAuth();
  const { visibleTasks, loading, teamMembers } = useData();
  const { openCreateTask } = useUI();
  const isAdmin = session?.role === 'admin';

  const nowMs = Date.now();

  const groups = useMemo(() => {
    const open = visibleTasks.filter((t) => t.status !== 'Done');
    const done = visibleTasks.filter((t) => t.status === 'Done');
    const inProgress = visibleTasks.filter((t) => t.status === 'In Progress' && !t.timerPaused);
    const overdue = open.filter((t) => isOverdue(t.dueDate, nowMs));
    return { open, done, inProgress, overdue };
  }, [visibleTasks, nowMs]);

  const statusCounts = useMemo(() => {
    const counts = { 'To Do': 0, 'In Progress': 0, Review: 0, Done: 0 } as Record<TaskStatus, number>;
    for (const t of visibleTasks) {
      if (t.status === 'In Progress' && t.timerPaused) continue;
      counts[t.status] += 1;
    }
    return counts;
  }, [visibleTasks]);

  const dueSoon = useMemo(() => {
    const end = nowMs + 3 * 86_400_000;
    return groups.open
      .filter((t) => {
        const d = new Date(t.dueDate).getTime();
        return !Number.isNaN(d) && d <= end;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 6);
  }, [groups.open, nowMs]);

  const workload = useMemo(() => {
    if (!isAdmin) return [];
    const totals = new Map<
      string,
      { email: string; name: string; avatar: string; tasks: number; inProgress: number; businessHours: number }
    >();
    for (const t of visibleTasks) {
      const email = (t.assignee.email || '').toLowerCase();
      if (!email) continue;
      const existing =
        totals.get(email) ||
        { email, name: t.assignee.name, avatar: t.assignee.avatar, tasks: 0, inProgress: 0, businessHours: 0 };
      existing.tasks += 1;
      if (t.status === 'In Progress' && !t.timerPaused) existing.inProgress += 1;
      existing.businessHours += getTaskHours(t);
      totals.set(email, existing);
    }

    const members = teamMembers.length
      ? teamMembers
      : Array.from(totals.values()).map((x) => ({ name: x.name, avatar: x.avatar, email: x.email }));

    return members
      .map((m) => {
        const email = (m.email || '').toLowerCase();
        const found = totals.get(email);
        return (
          found || { email, name: m.name, avatar: m.avatar || '', tasks: 0, inProgress: 0, businessHours: 0 }
        );
      })
      .filter((x) => x.email || x.name)
      .sort((a, b) => b.businessHours - a.businessHours)
      .slice(0, 6);
  }, [isAdmin, teamMembers, visibleTasks]);

  const recentActivity = useMemo(() => {
    const all = visibleTasks.flatMap((t) =>
      (t.activity || []).map((a) => ({
        id: `${t.id}-${a.id}`,
        taskId: t.id,
        taskTitle: t.title,
        type: a.type,
        user: a.user,
        content: a.content,
        timestamp: a.timestamp,
        epoch: epochFromActivityId(a.id) || Date.parse(a.timestamp || '')
      }))
    );
    return all.sort((a, b) => b.epoch - a.epoch).slice(0, 6);
  }, [visibleTasks]);

  const recentTasks = useMemo(
    () =>
      [...visibleTasks]
        .sort((a, b) => Date.parse(b.createdDate || '') - Date.parse(a.createdDate || ''))
        .slice(0, 6),
    [visibleTasks]
  );

  const maxLoad = useMemo(() => Math.max(1, ...workload.map((w) => w.businessHours)), [workload]);

  if (loading && visibleTasks.length === 0) return <PageLoading />;

  const { open, done, inProgress, overdue } = groups;
  const donePct = visibleTasks.length ? Math.round((done.length / visibleTasks.length) * 100) : 0;
  const loggedHours = visibleTasks.reduce((sum, t) => sum + getTaskHours(t), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={formatLongDateIST()}
        title={isAdmin ? 'Team dashboard' : `Hi, ${session?.profile.name.split(' ')[0] ?? 'there'}`}
        subtitle={
          isAdmin
            ? `${teamMembers.length} team members · ${visibleTasks.length} tasks tracked`
            : `${open.length} open · ${inProgress.length} in motion · ${overdue.length} overdue`
        }
        action={
          <>
            <Link to="/tasks" className="btn btn-secondary px-4 py-2.5 hidden sm:inline-flex">
              <span className="material-symbols-outlined text-[18px]">checklist</span>
              View all tasks
            </Link>
            <Button variant="primary" icon="add" onClick={openCreateTask}>
              New task
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Open" value={open.length} icon="inbox" tone="neutral" hint="Not yet done" />
        <Stat label="In progress" value={inProgress.length} icon="bolt" tone="accent" hint="Timer running" />
        <Stat label="Completed" value={done.length} icon="task_alt" tone="success" hint={`${donePct}% of all`} />
        <Stat
          label="Overdue"
          value={overdue.length}
          icon="running_with_errors"
          tone={overdue.length ? 'danger' : 'neutral'}
          hint="Past due date"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="panel p-5 lg:col-span-2">
          <SectionTitle
            title="Next up"
            icon="event_upcoming"
            action={<span className="text-xs text-ink-faint">Overdue &amp; due in 3 days</span>}
          />
          {dueSoon.length === 0 ? (
            <EmptyState
              bare
              icon="beach_access"
              title="Nothing due soon"
              description="You are clear for the next three days."
            />
          ) : (
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {dueSoon.map((t, i) => {
                  const due = dueLabel(t.dueDate, nowMs);
                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, delay: i * 0.04 }}
                    >
                      <Link to={`/tasks/${t.id}`} className="panel-interactive p-3 flex items-center gap-3">
                        <Avatar name={t.assignee.name} src={t.assignee.avatar} size={34} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-ink truncate">{t.title}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-ink-faint truncate">{t.project}</span>
                            <span
                              className="text-xs font-semibold"
                              style={{ color: due.overdue ? 'var(--danger)' : 'var(--ink-muted)' }}
                            >
                              {due.text}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <PriorityBadge priority={t.priority} />
                          <span className="text-xs text-ink-muted tabular-nums hidden sm:inline">
                            {getTaskHours(t)}h
                          </span>
                          <StatusBadge status={t.status} live />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="panel p-5">
          <SectionTitle title="Progress" icon="donut_large" />
          <div className="flex items-center gap-4">
            <ProgressRing value={donePct} size={96} stroke={9} tone="success" label={`${donePct}%`} sublabel="done" />
            <div className="min-w-0 space-y-1">
              <p className="text-sm text-ink-muted">
                <span className="font-bold text-ink tabular-nums">{done.length}</span> of {visibleTasks.length} tasks
                complete
              </p>
              <p className="text-xs text-ink-faint tabular-nums">{loggedHours.toFixed(1)}h business time logged</p>
              {overdue.length > 0 && (
                <p className="text-xs font-semibold" style={{ color: 'var(--danger)' }}>
                  {overdue.length} overdue
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {STATUS_ORDER.map((status) => {
              const count = statusCounts[status];
              const pct = visibleTasks.length ? Math.round((count / visibleTasks.length) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-ink-muted font-medium">{status}</span>
                    <span className="text-ink-faint tabular-nums">{count}</span>
                  </div>
                  <ProgressBar value={pct} tone={STATUS_TONE[status]} height={6} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isAdmin && workload.length > 0 && (
        <div className="panel p-5">
          <SectionTitle
            title="Workload balance"
            icon="groups"
            action={<span className="text-xs text-ink-faint">Certified business hours</span>}
          />
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            {workload.map((w, i) => (
              <motion.div
                key={w.email || w.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                <Avatar name={w.name} src={w.avatar} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-ink truncate">{w.name}</p>
                    <p className="text-sm font-bold text-accent tabular-nums shrink-0">
                      {w.businessHours.toFixed(1)}h
                    </p>
                  </div>
                  <div className="mt-1.5">
                    <ProgressBar value={Math.round((w.businessHours / maxLoad) * 100)} tone="accent" height={6} />
                  </div>
                  <p className="text-xs text-ink-faint mt-1">
                    {w.tasks} tasks · {w.inProgress} in motion
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="panel p-5">
          <SectionTitle title="Recent activity" icon="history" />
          {recentActivity.length === 0 ? (
            <EmptyState
              bare
              icon="forum"
              title="No activity yet"
              description="Comments and status changes appear here."
            />
          ) : (
            <ol className="relative">
              <span className="absolute left-[15px] top-2 bottom-2 w-px bg-border" aria-hidden />
              {recentActivity.map((a, i) => (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  className="relative flex gap-3 py-2.5"
                >
                  <span
                    className="relative z-10 w-8 h-8 shrink-0 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: a.type === 'comment' ? 'var(--info-soft)' : 'var(--accent-soft)',
                      color: a.type === 'comment' ? 'var(--info)' : 'var(--accent)'
                    }}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {a.type === 'comment' ? 'chat_bubble' : 'sync_alt'}
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-ink truncate">{a.user.name}</p>
                      <span className="text-xs text-ink-faint shrink-0">{a.timestamp}</span>
                    </div>
                    <p className="text-sm text-ink-muted mt-0.5 line-clamp-2">{a.content}</p>
                    <Link
                      to={`/tasks/${a.taskId}`}
                      className="text-xs font-semibold text-accent hover:underline mt-0.5 inline-block truncate max-w-full"
                    >
                      {a.taskTitle}
                    </Link>
                  </div>
                </motion.li>
              ))}
            </ol>
          )}
        </div>

        <div className="panel p-5">
          <SectionTitle
            title="Recent tasks"
            icon="bolt"
            action={
              <Link to="/tasks" className="text-xs font-semibold text-accent hover:underline">
                View all
              </Link>
            }
          />
          {recentTasks.length === 0 ? (
            <EmptyState
              bare
              icon="add_task"
              title="No tasks yet"
              description="Create your first task to get started."
              actionLabel="New task"
              onAction={openCreateTask}
            />
          ) : (
            <ul className="-mx-2">
              {recentTasks.map((t, i) => (
                <motion.li
                  key={t.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                >
                  <Link
                    to={`/tasks/${t.id}`}
                    className="row-hover flex items-center gap-3 px-2 py-2.5 rounded-lg group"
                  >
                    <Avatar name={t.assignee.name} src={t.assignee.avatar} size={30} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink truncate group-hover:text-accent transition-colors">
                        {t.title}
                      </p>
                      <p className="text-xs text-ink-faint truncate">
                        {t.project} · {getTaskHours(t)}h
                      </p>
                    </div>
                    <StatusBadge status={t.status} />
                  </Link>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
