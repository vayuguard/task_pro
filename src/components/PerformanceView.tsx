import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Task, EmployeeMetrics, ProgressLog, ProjectHealth, User, TaskStatus } from '../types';
import { PageHeader, StatCard, GlassPanel } from './ui/Glass';
import { staggerContainer, staggerItem } from './ui/motion';
import { enrichUserWithEmail, isTaskAssignedToUser } from '../utils/tasks';
import { TASK_PRIORITIES, priorityBadgeClass, priorityRank } from '../utils/priority';
import { hoursPct, roundHours, resolveActivityTimestamp } from '../utils/time';

interface PerformanceViewProps {
  tasks: Task[];
  employees: EmployeeMetrics[];
  progressLogs: ProgressLog[];
  projectsHealth: ProjectHealth[];
  teamMembers?: User[];
  onTaskSelect?: (task: Task) => void;
}

type PersonRow = {
  key: string;
  name: string;
  email?: string;
  avatar: string;
  role?: string;
  tasks: number;
  done: number;
  inProgress: number;
  todo: number;
  review: number;
  logged: number;
  estimated: number;
  overdue: number;
  highestOpen: number;
  dueSoon: number;
  completionPct: number;
  used: number;
  remaining: number;
};

function personKey(u: User) {
  return (u.email || u.name).toLowerCase();
}

function parseDue(due: string): Date | null {
  const d = new Date(due);
  return Number.isNaN(d.getTime()) ? null : d;
}

function statusBadgeClass(status: TaskStatus): string {
  switch (status) {
    case 'Done':
      return 'bg-emerald-100 text-emerald-700';
    case 'In Progress':
      return 'bg-sky-100 text-sky-700';
    case 'Review':
      return 'bg-fuchsia-100 text-fuchsia-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

export default function PerformanceView({
  tasks,
  progressLogs,
  teamMembers = [],
  onTaskSelect
}: PerformanceViewProps) {
  const [selectedKey, setSelectedKey] = useState<string>('all');
  const [workFilter, setWorkFilter] = useState<'all' | TaskStatus | 'overdue'>('all');

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const in7 = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    return d;
  }, [today]);

  const peopleStats: PersonRow[] = useMemo(() => {
    const map = new Map<string, PersonRow>();

    const ensure = (u: User) => {
      const a = enrichUserWithEmail(u);
      const key = personKey(a);
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: a.name,
          email: a.email,
          avatar: a.avatar,
          role: a.role,
          tasks: 0,
          done: 0,
          inProgress: 0,
          todo: 0,
          review: 0,
          logged: 0,
          estimated: 0,
          overdue: 0,
          highestOpen: 0,
          dueSoon: 0,
          completionPct: 0,
          used: 0,
          remaining: 0
        });
      }
      return map.get(key)!;
    };

    for (const member of teamMembers) {
      ensure(member);
    }

    for (const task of tasks) {
      const row = ensure(task.assignee);
      row.tasks += 1;
      if (task.status === 'Done') row.done += 1;
      else if (task.status === 'In Progress') row.inProgress += 1;
      else if (task.status === 'Review') row.review += 1;
      else if (task.status === 'To Do') row.todo += 1;
      row.logged += task.timeLogged || 0;
      row.estimated += task.timeEstimated || 0;

      const due = parseDue(task.dueDate);
      if (task.status !== 'Done' && due && due < today) row.overdue += 1;
      if (task.status !== 'Done' && due && due >= today && due <= in7) row.dueSoon += 1;
      if (task.status !== 'Done' && (task.priority === 'Highest' || task.priority === 'High')) {
        row.highestOpen += 1;
      }
    }

    return [...map.values()]
      .map((p) => ({
        ...p,
        logged: roundHours(p.logged),
        estimated: roundHours(p.estimated),
        remaining: Math.max(roundHours(p.estimated - p.logged), 0),
        completionPct: p.tasks > 0 ? Math.round((p.done / p.tasks) * 100) : 0,
        used: hoursPct(p.logged, p.estimated)
      }))
      .sort((a, b) => b.logged - a.logged || a.name.localeCompare(b.name));
  }, [tasks, teamMembers, today, in7]);

  const selectedPerson = selectedKey === 'all' ? null : peopleStats.find((p) => p.key === selectedKey) || null;

  const scopedTasks = useMemo(() => {
    if (!selectedPerson) return tasks;
    const user: User = {
      name: selectedPerson.name,
      email: selectedPerson.email,
      avatar: selectedPerson.avatar,
      role: selectedPerson.role
    };
    return tasks.filter((t) => isTaskAssignedToUser(t, user));
  }, [tasks, selectedPerson]);

  const scopedLogs = useMemo(() => {
    if (!selectedPerson) return progressLogs;
    const name = selectedPerson.name.toLowerCase();
    const taskIds = new Set(scopedTasks.map((t) => t.id));
    return progressLogs.filter(
      (l) => l.author.toLowerCase() === name || taskIds.has(l.taskId)
    );
  }, [progressLogs, selectedPerson, scopedTasks]);

  const filteredWork = useMemo(() => {
    return scopedTasks.filter((t) => {
      if (workFilter === 'all') return true;
      if (workFilter === 'overdue') {
        if (t.status === 'Done') return false;
        const due = parseDue(t.dueDate);
        return due ? due < today : false;
      }
      return t.status === workFilter;
    });
  }, [scopedTasks, workFilter, today]);

  const totalTasks = scopedTasks.length;
  const completedTasks = scopedTasks.filter((t) => t.status === 'Done').length;
  const inProgress = scopedTasks.filter((t) => t.status === 'In Progress' || t.status === 'Review').length;
  const totalHoursLogged = roundHours(scopedTasks.reduce((sum, t) => sum + (t.timeLogged || 0), 0));
  const totalHoursEstimated = roundHours(scopedTasks.reduce((sum, t) => sum + (t.timeEstimated || 0), 0));
  const remainingHours = Math.max(roundHours(totalHoursEstimated - totalHoursLogged), 0);
  const budgetUsedPct = hoursPct(totalHoursLogged, totalHoursEstimated);
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const overBudget = scopedTasks.filter((t) => t.timeLogged > t.timeEstimated && t.timeEstimated > 0);

  const overdueOpen = useMemo(
    () =>
      scopedTasks.filter((t) => {
        if (t.status === 'Done') return false;
        const due = parseDue(t.dueDate);
        return due ? due < today : false;
      }),
    [scopedTasks, today]
  );

  const dueSoon = useMemo(
    () =>
      scopedTasks.filter((t) => {
        if (t.status === 'Done') return false;
        const due = parseDue(t.dueDate);
        if (!due || due < today) return false;
        return due <= in7;
      }),
    [scopedTasks, today, in7]
  );

  const statusBreakdown = useMemo(() => {
    const order = ['To Do', 'In Progress', 'Review', 'Done'] as const;
    return order.map((status) => ({
      status,
      count: scopedTasks.filter((t) => t.status === status).length,
      hours: roundHours(scopedTasks.filter((t) => t.status === status).reduce((s, t) => s + t.timeEstimated, 0)),
      logged: roundHours(scopedTasks.filter((t) => t.status === status).reduce((s, t) => s + t.timeLogged, 0))
    }));
  }, [scopedTasks]);

  const priorityBreakdown = useMemo(() => {
    return TASK_PRIORITIES.map((priority) => {
      const list = scopedTasks.filter((t) => t.priority === priority);
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
  }, [scopedTasks]);

  const recentActivity = useMemo(() => {
    const rows: { id: string; taskId: string; taskTitle: string; content: string; timestamp: string; user: string; type: string }[] = [];
    for (const task of scopedTasks) {
      for (const act of task.activity || []) {
        rows.push({
          id: `${task.id}-${act.id}`,
          taskId: task.id,
          taskTitle: task.title,
          content: act.content,
          timestamp: resolveActivityTimestamp(act),
          user: act.user?.name || 'Unknown',
          type: act.type
        });
      }
    }
    return rows.slice(0, 40);
  }, [scopedTasks]);

  const maxStatusCount = Math.max(...statusBreakdown.map((s) => s.count), 1);
  const maxPriorityCount = Math.max(...priorityBreakdown.map((p) => p.count), 1);
  const maxPersonLogged = Math.max(...peopleStats.map((p) => p.logged), 1);

  const scopeLabel = selectedPerson ? selectedPerson.name : 'Entire team';

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-8 flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title="Team Performance"
        subtitle="Admin view — stats, work, and time details for every employee."
      />

      {/* Employee roster selector */}
      <GlassPanel className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-neutral-700">badge</span>
              Employees
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Select a person for full work & time details, or view the whole team.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedKey('all');
              setWorkFilter('all');
            }}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border-2 cursor-pointer transition-colors ${
              selectedKey === 'all'
                ? 'bg-black text-white border-black'
                : 'bg-white text-slate-700 border-slate-200 hover:border-black'
            }`}
          >
            All employees ({peopleStats.length})
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
          {peopleStats.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No employees yet. Add them in Settings.</p>
          ) : (
            peopleStats.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => {
                  setSelectedKey(p.key);
                  setWorkFilter('all');
                }}
                className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedKey === p.key
                    ? 'border-black bg-[#c8ff00]/40 shadow-[2px_2px_0_#0a0a0a]'
                    : 'border-slate-200 bg-white/70 hover:border-slate-400'
                }`}
              >
                <img
                  src={p.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{p.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {p.tasks} tasks · {p.logged}h spent
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </GlassPanel>

      {selectedPerson && (
        <GlassPanel className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={selectedPerson.avatar}
                alt=""
                className="w-14 h-14 rounded-full object-cover ring-2 ring-black/10"
                referrerPolicy="no-referrer"
              />
              <div>
                <h2 className="text-lg font-black text-slate-900">{selectedPerson.name}</h2>
                <p className="text-xs text-slate-500">
                  {selectedPerson.role || 'Employee'}
                  {selectedPerson.email ? ` · ${selectedPerson.email}` : ''}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {selectedPerson.done}/{selectedPerson.tasks} done · {selectedPerson.inProgress} in progress ·{' '}
                  {selectedPerson.review} review · {selectedPerson.todo} backlog
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="liquid-glass rounded-xl px-3 py-2">
                <p className="text-[10px] uppercase font-bold text-slate-400">Spent</p>
                <p className="text-lg font-black text-slate-900">{selectedPerson.logged}h</p>
              </div>
              <div className="liquid-glass rounded-xl px-3 py-2">
                <p className="text-[10px] uppercase font-bold text-slate-400">Planned</p>
                <p className="text-lg font-black text-slate-900">{selectedPerson.estimated}h</p>
              </div>
              <div className="liquid-glass rounded-xl px-3 py-2">
                <p className="text-[10px] uppercase font-bold text-slate-400">Used</p>
                <p
                  className={`text-lg font-black ${
                    selectedPerson.used > 100 ? 'text-rose-600' : 'text-slate-900'
                  }`}
                >
                  {selectedPerson.used}%
                </p>
              </div>
            </div>
          </div>
        </GlassPanel>
      )}

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
            sub={`${completedTasks} of ${totalTasks} · ${scopeLabel}`}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            label="Hours planned"
            value={`${totalHoursEstimated}h`}
            icon="event_available"
            color="blue"
            sub={`${remainingHours}h still within plan`}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            label="Hours spent"
            value={`${totalHoursLogged}h`}
            icon="timer"
            color="green"
            sub={`${scopedLogs.length} hour-log entries`}
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
            sub="Open past due date"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            label="Due in 7 days"
            value={String(dueSoon.length)}
            icon="upcoming"
            color="blue"
            sub="Approaching deadline"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            label="Highest / High open"
            value={String(
              scopedTasks.filter(
                (t) => t.status !== 'Done' && (t.priority === 'Highest' || t.priority === 'High')
              ).length
            )}
            icon="keyboard_double_arrow_up"
            sub="Needs attention first"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            label="People tracked"
            value={String(peopleStats.length)}
            icon="groups"
            color="green"
            sub={selectedPerson ? `Focused on ${selectedPerson.name}` : 'Full roster'}
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassPanel className="p-5 sm:p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff3cac]">donut_large</span>
            Planned vs spent
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">{scopeLabel}</p>
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
          </div>
        </GlassPanel>

        <GlassPanel className="p-5 sm:p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00e5ff]">view_kanban</span>
            Work by status
          </h3>
          <div className="space-y-3 mt-3">
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
          <div className="space-y-3 mt-3">
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

      {/* Full employee comparison table — always visible for admin */}
      {!selectedPerson && (
        <GlassPanel className="p-5 sm:p-6 overflow-hidden">
          <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-neutral-700">table_chart</span>
            All employees · detailed comparison
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">
            Click a row to open that employee’s full work details.
          </p>
          {peopleStats.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No employees yet.</p>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-xs min-w-[900px]">
                <thead>
                  <tr className="border-b border-white/40 text-left text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 font-bold">Employee</th>
                    <th className="pb-3 font-bold">Tasks</th>
                    <th className="pb-3 font-bold">Done</th>
                    <th className="pb-3 font-bold">Active</th>
                    <th className="pb-3 font-bold">Planned</th>
                    <th className="pb-3 font-bold">Spent</th>
                    <th className="pb-3 font-bold">Left</th>
                    <th className="pb-3 font-bold">Used</th>
                    <th className="pb-3 font-bold">Overdue</th>
                    <th className="pb-3 font-bold">High+</th>
                  </tr>
                </thead>
                <tbody>
                  {peopleStats.map((p) => (
                    <tr
                      key={p.key}
                      onClick={() => setSelectedKey(p.key)}
                      className="border-b border-white/30 cursor-pointer hover:bg-white/40 transition-colors"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={p.avatar}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-bold text-slate-800">{p.name}</p>
                            <p className="text-[10px] text-slate-400">{p.role || p.email || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 font-semibold">{p.tasks}</td>
                      <td className="py-3">
                        <span className="bg-emerald-100/80 text-emerald-700 px-2 py-0.5 rounded-lg font-bold">
                          {p.done} ({p.completionPct}%)
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-slate-700">
                        {p.inProgress + p.review}
                      </td>
                      <td className="py-3 font-mono font-semibold">{p.estimated}h</td>
                      <td className="py-3 font-mono font-semibold">{p.logged}h</td>
                      <td className="py-3 font-mono text-slate-500">{p.remaining}h</td>
                      <td className="py-3">
                        <span
                          className={`font-bold ${
                            p.used > 100 ? 'text-rose-600' : p.used >= 80 ? 'text-amber-600' : 'text-slate-700'
                          }`}
                        >
                          {p.used}%
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={p.overdue > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                          {p.overdue}
                        </span>
                      </td>
                      <td className="py-3 font-semibold">{p.highestOpen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassPanel>
      )}

      {selectedKey === 'all' && (
        <GlassPanel className="p-5 sm:p-6">
          <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-neutral-700">monitoring</span>
            People · effort bars
          </h3>
          <div className="space-y-4 mt-4">
            {peopleStats.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setSelectedKey(p.key)}
                className="w-full text-left liquid-glass rounded-xl p-3 cursor-pointer hover:border-black/20 border border-transparent"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={p.avatar}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-xs truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {p.done}/{p.tasks} done · {p.completionPct}%
                        {p.overdue > 0 ? ` · ${p.overdue} overdue` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold shrink-0">{p.used}%</span>
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
              </button>
            ))}
          </div>
        </GlassPanel>
      )}

      {/* Work details table */}
      <GlassPanel className="p-5 sm:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-neutral-700">work</span>
              Work details
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {scopeLabel} — every task with time, priority, status, and due date.
            </p>
          </div>
          <select
            value={workFilter}
            onChange={(e) => setWorkFilter(e.target.value as typeof workFilter)}
            className="input-field text-xs font-semibold py-2 w-full sm:w-auto"
          >
            <option value="all">All work</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Done">Done</option>
            <option value="overdue">Overdue only</option>
          </select>
        </div>

        {filteredWork.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No matching work items.</p>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-xs min-w-[960px]">
              <thead>
                <tr className="border-b border-white/40 text-left text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 font-bold">Task</th>
                  <th className="pb-3 font-bold">Assignee</th>
                  <th className="pb-3 font-bold">Priority</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold">Due</th>
                  <th className="pb-3 font-bold">Planned</th>
                  <th className="pb-3 font-bold">Spent</th>
                  <th className="pb-3 font-bold">Used</th>
                  <th className="pb-3 font-bold">Created</th>
                </tr>
              </thead>
              <tbody>
                {[...filteredWork]
                  .sort(
                    (a, b) =>
                      priorityRank(b.priority) - priorityRank(a.priority) ||
                      (parseDue(a.dueDate)?.getTime() ?? Infinity) -
                        (parseDue(b.dueDate)?.getTime() ?? Infinity)
                  )
                  .map((task) => {
                    const pct = hoursPct(task.timeLogged, task.timeEstimated);
                    const due = parseDue(task.dueDate);
                    const isOverdue = task.status !== 'Done' && due && due < today;
                    return (
                      <tr
                        key={task.id}
                        onClick={() => onTaskSelect?.(task)}
                        className={`border-b border-white/30 transition-colors ${
                          onTaskSelect ? 'cursor-pointer hover:bg-white/50' : ''
                        }`}
                      >
                        <td className="py-3 pr-3">
                          <p className="font-bold text-slate-800 line-clamp-1 max-w-[240px]">{task.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{task.id}</p>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={task.assignee.avatar}
                              alt=""
                              className="w-5 h-5 rounded-full"
                              referrerPolicy="no-referrer"
                            />
                            <span className="font-semibold text-slate-700">{task.assignee.name}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${priorityBadgeClass(task.priority)}`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadgeClass(task.status)}`}>
                            {task.status}
                          </span>
                        </td>
                        <td className={`py-3 font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-600'}`}>
                          {task.dueDate || '—'}
                          {isOverdue ? ' · overdue' : ''}
                        </td>
                        <td className="py-3 font-mono">{task.timeEstimated}h</td>
                        <td className="py-3 font-mono font-semibold">{task.timeLogged}h</td>
                        <td className="py-3">
                          <span className={pct > 100 ? 'text-rose-600 font-bold' : 'text-slate-700 font-semibold'}>
                            {pct}%
                          </span>
                        </td>
                        <td className="py-3 text-slate-500">{task.createdDate || '—'}</td>
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
            <span className="material-symbols-outlined text-neutral-700">history</span>
            Hour logs
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">
            Time entries for {scopeLabel.toLowerCase()} with timestamps and notes.
          </p>
          <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar">
            {scopedLogs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No hours logged yet.</p>
            ) : (
              scopedLogs.map((log) => (
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

        <GlassPanel className="p-5 sm:p-6">
          <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-neutral-700">timeline</span>
            Activity feed
          </h3>
          <p className="text-[11px] text-slate-500 mb-4">
            Comments and status/time logs from tasks in this scope.
          </p>
          <div className="space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No activity yet.</p>
            ) : (
              recentActivity.map((act) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => {
                    const task = tasks.find((t) => t.id === act.taskId);
                    if (task) onTaskSelect?.(task);
                  }}
                  className="w-full text-left p-3 liquid-glass rounded-xl cursor-pointer hover:bg-white/60"
                >
                  <div className="flex justify-between gap-2 mb-1">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{act.taskTitle}</p>
                    <span className="text-[9px] font-bold uppercase text-slate-400 shrink-0">{act.type}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    <span className="font-semibold">{act.user}</span> {act.content}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">{act.timestamp}</p>
                </button>
              ))
            )}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
