import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Task, EmployeeMetrics, ProgressLog, ProjectHealth, User } from '../types';
import { PageHeader, StatCard, GlassPanel } from './ui/Glass';
import { staggerContainer, staggerItem } from './ui/motion';
import { enrichUserWithEmail } from '../utils/tasks';

interface PerformanceViewProps {
  tasks: Task[];
  employees: EmployeeMetrics[];
  progressLogs: ProgressLog[];
  projectsHealth: ProjectHealth[];
}

function personKey(u: User) {
  return (u.email || u.name).toLowerCase();
}

export default function PerformanceView({ tasks, progressLogs }: PerformanceViewProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Done').length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress' || t.status === 'Review').length;
  const totalHoursLogged = tasks.reduce((sum, t) => sum + (t.timeLogged || 0), 0);
  const totalHoursEstimated = tasks.reduce((sum, t) => sum + (t.timeEstimated || 0), 0);
  const remainingHours = Math.max(totalHoursEstimated - totalHoursLogged, 0);
  const budgetUsedPct =
    totalHoursEstimated > 0 ? Math.round((totalHoursLogged / totalHoursEstimated) * 100) : 0;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const overBudget = tasks.filter((t) => t.timeLogged > t.timeEstimated && t.timeEstimated > 0);

  const statusBreakdown = useMemo(() => {
    const order = ['To Do', 'In Progress', 'Review', 'Done'] as const;
    return order.map((status) => ({
      status,
      count: tasks.filter((t) => t.status === status).length,
      hours: tasks.filter((t) => t.status === status).reduce((s, t) => s + t.timeEstimated, 0)
    }));
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
        estimated: 0
      };
      row.tasks += 1;
      if (task.status === 'Done') row.done += 1;
      row.logged += task.timeLogged || 0;
      row.estimated += task.timeEstimated || 0;
      map.set(key, row);
    }

    return [...map.values()].sort((a, b) => b.logged - a.logged);
  }, [tasks]);

  const taskEffort = useMemo(() => {
    return [...tasks]
      .filter((t) => t.timeEstimated > 0 || t.timeLogged > 0)
      .sort((a, b) => b.timeLogged - a.timeLogged)
      .slice(0, 8);
  }, [tasks]);

  const maxStatusCount = Math.max(...statusBreakdown.map((s) => s.count), 1);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-8 flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title="Performance & Time"
        subtitle="Live view of planned hours, time spent, and how the team is tracking against estimates."
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
            sub="Total estimates on all tasks"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <p className="text-[11px] text-slate-500 mb-4">Task count and planned hours in each column.</p>
          <div className="space-y-3">
            {statusBreakdown.map((row) => (
              <div key={row.status}>
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-slate-700">{row.status}</span>
                  <span className="text-slate-500">
                    {row.count} tasks · {row.hours}h planned
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
      </div>

      <GlassPanel className="p-5 sm:p-6 overflow-hidden">
        <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-neutral-700">groups</span>
          People · time & delivery
        </h3>
        <p className="text-[11px] text-slate-500 mb-4">
          Built from task assignees: hours planned, hours logged, and tasks finished.
        </p>
        {peopleStats.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No tasks yet — create tasks to see people stats.</p>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-xs min-w-[640px]">
              <thead>
                <tr className="border-b border-white/40 text-left text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 font-bold">Person</th>
                  <th className="pb-3 font-bold">Tasks</th>
                  <th className="pb-3 font-bold">Done</th>
                  <th className="pb-3 font-bold">Planned</th>
                  <th className="pb-3 font-bold">Spent</th>
                  <th className="pb-3 font-bold">Used</th>
                </tr>
              </thead>
              <tbody>
                {peopleStats.map((p) => {
                  const used = p.estimated > 0 ? Math.round((p.logged / p.estimated) * 100) : 0;
                  return (
                    <tr key={p.name} className="border-b border-white/30">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={p.avatar}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover ring-2 ring-white/60"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-bold text-slate-800">{p.name}</p>
                            {p.role && <p className="text-[10px] text-slate-400">{p.role}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-semibold text-slate-700">{p.tasks}</td>
                      <td className="py-3">
                        <span className="bg-emerald-100/80 text-emerald-700 px-2 py-0.5 rounded-lg font-bold">
                          {p.done}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-semibold">{p.estimated}h</td>
                      <td className="py-3 font-mono font-semibold">{p.logged}h</td>
                      <td className="py-3">
                        <span
                          className={`font-bold ${
                            used > 100 ? 'text-rose-600' : used >= 80 ? 'text-amber-600' : 'text-slate-700'
                          }`}
                        >
                          {used}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassPanel>

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
                const pct =
                  task.timeEstimated > 0
                    ? Math.round((task.timeLogged / task.timeEstimated) * 100)
                    : 0;
                return (
                  <div key={task.id} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-start gap-2 text-xs">
                      <span className="font-bold text-slate-800 line-clamp-1">{task.title}</span>
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
                      {task.assignee.name} · {pct}% of estimate
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
          <p className="text-[11px] text-slate-500 mb-4">From “Log Hours” — actual time people reported.</p>
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
