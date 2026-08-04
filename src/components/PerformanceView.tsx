import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Task, EmployeeMetrics, ProgressLog, ProjectHealth, User } from '../types';
import { PageHeader, StatCard, GlassPanel } from './ui/Glass';
import { staggerContainer, staggerItem } from './ui/motion';
import { enrichUserWithEmail } from '../utils/tasks';
import { TASK_PRIORITIES, priorityBadgeClass, priorityRank } from '../utils/priority';
import { hoursPct, roundHours } from '../utils/time';

interface PerformanceViewProps {
  tasks: Task[];
  employees: EmployeeMetrics[];
  progressLogs: ProgressLog[];
  projectsHealth: ProjectHealth[];
}

function personKey(u: User) {
  return (u.email || u.name).toLowerCase();
}

function parseDue(due: string): Date | null {
  const d = new Date(due);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function PerformanceView({ tasks, progressLogs }: PerformanceViewProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Done').length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress' || t.status === 'Review').length;
  const totalHoursLogged = roundHours(tasks.reduce((sum, t) => sum + (t.timeLogged || 0), 0));
  const totalHoursEstimated = roundHours(tasks.reduce((sum, t) => sum + (t.timeEstimated || 0), 0));
  const remainingHours = Math.max(roundHours(totalHoursEstimated - totalHoursLogged), 0);
  const budgetUsedPct = hoursPct(totalHoursLogged, totalHoursEstimated);
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const overBudget = tasks.filter((t) => t.timeLogged > t.timeEstimated && t.timeEstimated > 0);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const overdueOpen = useMemo(
    () =>
      tasks.filter((t) => {
        if (t.status === 'Done') return false;
        const due = parseDue(t.dueDate);
        return due ? due < today : false;
      }),
    [tasks, today]
  );

  const dueSoon = useMemo(
    () =>
      tasks.filter((t) => {
        if (t.status === 'Done') return false;
        const due = parseDue(t.dueDate);
        if (!due || due < today) return false;
        const in7 = new Date(today);
        in7.setDate(in7.getDate() + 7);
        return due <= in7;
      }),
    [tasks, today]
  );

  const statusBreakdown = useMemo(() => {
    const order = ['To Do', 'In Progress', 'Review', 'Done'] as const;
    return order.map((status) => ({
      status,
      count: tasks.filter((t) => t.status === status).length,
      hours: roundHours(tasks.filter((t) => t.status === status).reduce((s, t) => s + t.timeEstimated, 0)),
      logged: roundHours(tasks.filter((t) => t.status === status).reduce((s, t) => s + t.timeLogged, 0))
    }));
  }, [tasks]);

  const priorityBreakdown = useMemo(() => {
    return TASK_PRIORITIES.map((priority) => {
      const list = tasks.filter((t) => t.priority === priority);
      const open = list.filter((t) => t.status !== 'Done');
      return {
        priority,
        count: list.length,
        open: open.length,
        done: list.length - open.length,
        planned: roundHours(list.reduce((s, t) => s + t.timeEstimated, 0)),
        spent: roundHours(list.reduce((s, t) => s + t.timeLogged, 0))
      };
    });
  }, [tasks]);

  const peopleStats = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        avatar: string;
        role?: string;
        tasks: number;
        done: number;
        logged: number;
        estimated: number;
        overdue: number;
        highestOpen: number;
      }
    >();

    for (const task of tasks) {
      const a = enrichUserWithEmail(task.assignee);
      const key = personKey(a);
      const row = map.get(key) || {
        name: a.name,
        avatar: a.avatar,
        role: a.role,
        tasks: 0,
        done: 0,
        logged: 0,
        estimated: 0,
        overdue: 0,
        highestOpen: 0
      };
      row.tasks += 1;
      if (task.status === 'Done') row.done += 1;
      row.logged += task.timeLogged || 0;
      row.estimated += task.timeEstimated || 0;
      const due = parseDue(task.dueDate);
      if (task.status !== 'Done' && due && due < today) row.overdue += 1;
      if (task.status !== 'Done' && (task.priority === 'Highest' || task.priority === 'High')) {
        row.highestOpen += 1;
      }
      map.set(key, row);
    }

    return [...map.values()]
      .map((p) => ({
        ...p,
        logged: roundHours(p.logged),
        estimated: roundHours(p.estimated),
        completionPct: p.tasks > 0 ? Math.round((p.done / p.tasks) * 100) : 0,
        used: hoursPct(p.logged, p.estimated)
      }))
      .sort((a, b) => b.logged - a.logged);
  }, [tasks, today]);

  const taskEffort = useMemo(() => {
    return [...tasks]
      .filter((t) => t.timeEstimated > 0 || t.timeLogged > 0)
      .sort((a, b) => b.timeLogged - a.timeLogged || priorityRank(b.priority) - priorityRank(a.priority))
      .slice(0, 10);
  }, [tasks]);

  const priorityQueue = useMemo(() => {
    return [...tasks]
      .filter((t) => t.status !== 'Done')
      .sort((a, b) => {
        const pr = priorityRank(b.priority) - priorityRank(a.priority);
        if (pr !== 0) return pr;
        const da = parseDue(a.dueDate)?.getTime() ?? Infinity;
        const db = parseDue(b.dueDate)?.getTime() ?? Infinity;
        return da - db;
      })
      .slice(0, 8);
  }, [tasks]);

  const maxStatusCount = Math.max(...statusBreakdown.map((s) => s.count), 1);
  const maxPriorityCount = Math.max(...priorityBreakdown.map((p) => p.count), 1);
  const maxPersonLogged = Math.max(...peopleStats.map((p) => p.logged), 1);

  const avgEstimate =
    totalTasks > 0 ? roundHours(totalHoursEstimated / totalTasks) : 0;
  const avgLoggedOnDone =
    completedTasks > 0
      ? roundHours(
          tasks.filter((t) => t.status === 'Done').reduce((s, t) => s + t.timeLogged, 0) / completedTasks
        )
      : 0;

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-8 flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title="Performance & Time"
        subtitle="Live calculations from tasks: planned vs spent, priority load, due dates, and delivery."
      />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={staggerItem}>
          <StatCard
            label="Tasks done"
            value={`${completionPct}%`}
            icon="task_alt"
            sub={`${completedTasks} of ${totalTasks} completed`}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            label="Hours planned"
            value={`${totalHoursEstimated}h`}
            icon="event_available"
            color="blue"
            sub={`Avg ${avgEstimate}h per task`}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            label="Hours spent"
            value={`${totalHoursLogged}h`}
            icon="timer"
            color="green"
            sub={`${remainingHours}h still within plan`}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            label="Budget used"
            value={`${budgetUsedPct}%`}
            icon="speed"
            color="violet"
            sub={
              overBudget.length
                ? `${overBudget.length} task(s) over estimate`
                : `${inProgress} task(s) in progress`
            }
          />
        </motion.div>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={staggerItem}>
          <StatCard
            label="Overdue"
            value={String(overdueOpen.length)}
            icon="event_busy"
            color="violet"
            sub="Open tasks past due date"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            label="Due in 7 days"
            value={String(dueSoon.length)}
            icon="upcoming"
            color="blue"
            sub="Open tasks approaching deadline"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            label="Highest / High open"
            value={String(
              tasks.filter(
                (t) => t.status !== 'Done' && (t.priority === 'Highest' || t.priority === 'High')
              ).length
            )}
            icon="keyboard_double_arrow_up"
            sub="Needs attention first"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            label="Avg spent (done)"
            value={`${avgLoggedOnDone}h`}
            icon="avg_pace"
            color="green"
            sub="Mean hours logged on finished tasks"
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassPanel className="p-5 sm:p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff3cac]">donut_large</span>
            Planned vs spent
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">
            How much of the estimated time has been logged across the workspace.
          </p>
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">Spent {totalHoursLogged}h</span>
              <span className="text-slate-600">Planned {totalHoursEstimated}h</span>
            </div>
            <div className="w-full h-4 rounded-full bg-white/70 border border-black/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  budgetUsedPct > 100 ? 'bg-rose-500' : 'bg-linear-to-r from-[#00e5ff] to-[#c8ff00]'
                }`}
                style={{ width: `${Math.min(budgetUsedPct, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {budgetUsedPct <= 100
                ? `You are at ${budgetUsedPct}% of planned effort.`
                : `Logged time is ${budgetUsedPct - 100}% over the total estimate.`}
            </p>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5 sm:p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00e5ff]">view_kanban</span>
            Work by status
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">Task count · planned · spent</p>
          <div className="space-y-3">
            {statusBreakdown.map((row) => (
              <div key={row.status}>
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-slate-700">{row.status}</span>
                  <span className="text-slate-500">
                    {row.count} · {row.hours}h plan · {row.logged}h spent
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/70 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-black"
                    style={{ width: `${(row.count / maxStatusCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5 sm:p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-600">priority_high</span>
            Work by priority
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">Highest · High · Medium · Low</p>
          <div className="space-y-3">
            {priorityBreakdown.map((row) => (
              <div key={row.priority}>
                <div className="flex justify-between items-center text-[11px] font-semibold mb-1 gap-2">
                  <span className={`px-2 py-0.5 rounded border text-[10px] ${priorityBadgeClass(row.priority)}`}>
                    {row.priority}
                  </span>
                  <span className="text-slate-500 shrink-0">
                    {row.open} open / {row.count} · {row.spent}h/{row.planned}h
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/70 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-rose-500 to-amber-400"
                    style={{ width: `${(row.count / maxPriorityCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassPanel className="p-5 sm:p-6 overflow-hidden">
          <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-neutral-700">groups</span>
            People · time & delivery
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">
            Hours planned/spent, completion %, overdue, and open high-priority work.
          </p>
          {peopleStats.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No tasks yet — create tasks to see people stats.</p>
          ) : (
            <div className="space-y-4">
              {peopleStats.map((p) => (
                <div key={p.name} className="liquid-glass rounded-xl p-3">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={p.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-white/60 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-xs truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {p.done}/{p.tasks} done · {p.completionPct}%
                          {p.overdue > 0 ? ` · ${p.overdue} overdue` : ''}
                          {p.highestOpen > 0 ? ` · ${p.highestOpen} high+` : ''}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold shrink-0 ${
                        p.used > 100 ? 'text-rose-600' : p.used >= 80 ? 'text-amber-600' : 'text-slate-700'
                      }`}
                    >
                      {p.used}%
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1">
                    <span>Spent {p.logged}h</span>
                    <span>Planned {p.estimated}h</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/70 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${p.used > 100 ? 'bg-rose-500' : 'bg-linear-to-r from-[#00e5ff] to-[#c8ff00]'}`}
                      style={{ width: `${Math.min((p.logged / maxPersonLogged) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>

        <GlassPanel className="p-5 sm:p-6">
          <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-neutral-700">reorder</span>
            Priority queue
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">
            Open work sorted by priority, then earliest due date.
          </p>
          <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar">
            {priorityQueue.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No open tasks.</p>
            ) : (
              priorityQueue.map((task) => (
                <div key={task.id} className="flex items-start gap-2 p-3 liquid-glass rounded-xl">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${priorityBadgeClass(task.priority)}`}>
                    {task.priority}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{task.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {task.assignee.name} · {task.status} · due {task.dueDate || '—'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {task.timeLogged}h / {task.timeEstimated}h · {hoursPct(task.timeLogged, task.timeEstimated)}%
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassPanel className="p-5 sm:p-6">
          <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-neutral-700">analytics</span>
            Task effort (spent / planned)
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">Top tasks by hours logged.</p>
          <div className="space-y-4">
            {taskEffort.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No time data yet.</p>
            ) : (
              taskEffort.map((task) => {
                const pct = hoursPct(task.timeLogged, task.timeEstimated);
                return (
                  <div key={task.id} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-start gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${priorityBadgeClass(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="font-bold text-slate-800 line-clamp-1">{task.title}</span>
                      </div>
                      <span className="text-slate-500 font-semibold shrink-0 whitespace-nowrap">
                        {task.timeLogged}h / {task.timeEstimated}h
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-lg overflow-hidden bg-white/60 border border-black/5">
                      <div
                        className={`h-full rounded-r ${
                          pct > 100 ? 'bg-rose-500' : 'bg-linear-to-r from-[#ff3cac] to-[#c8ff00]'
                        }`}
                        style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {task.assignee.name} · due {task.dueDate || '—'} · {pct}% of estimate
                      {pct > 100 ? ' · over plan' : ''}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5 sm:p-6">
          <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-neutral-700">history</span>
            Recent hour logs
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">From “Log Hours” — timestamps show when time was recorded.</p>
          <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar">
            {progressLogs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No hours logged yet. Use <strong>Log Hours</strong> in the sidebar.
              </p>
            ) : (
              progressLogs.map((log) => (
                <div key={log.id} className="p-3 liquid-glass rounded-xl">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{log.taskTitle}</p>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded shrink-0">
                      +{log.hours}h
                    </span>
                  </div>
                  {log.notes && <p className="text-[11px] text-slate-500 line-clamp-2">{log.notes}</p>}
                  <p className="text-[10px] text-slate-400 mt-1">
                    {log.author} · {log.timestamp}
                  </p>
                </div>
              ))
            )}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
