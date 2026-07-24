import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Task, EmployeeMetrics, ProgressLog, ProjectHealth } from '../types';
import { PageHeader, StatCard, GlassPanel } from './ui/Glass';
import { staggerContainer, staggerItem } from './ui/motion';

interface PerformanceViewProps {
  tasks: Task[];
  employees: EmployeeMetrics[];
  progressLogs: ProgressLog[];
  projectsHealth: ProjectHealth[];
}

export default function PerformanceView({ tasks, employees, progressLogs, projectsHealth }: PerformanceViewProps) {
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly'>('monthly');

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Done').length;
  const totalHoursLogged = tasks.reduce((sum, t) => sum + t.timeLogged, 0);
  const totalHoursEstimated = tasks.reduce((sum, t) => sum + t.timeEstimated, 0);

  const burndownData = [
    { day: 'Day 1', actual: 48, ideal: 48 },
    { day: 'Day 2', actual: 42, ideal: 40 },
    { day: 'Day 3', actual: 35, ideal: 32 },
    { day: 'Day 4', actual: 24, ideal: 24 },
    { day: 'Day 5', actual: 16, ideal: 16 },
    { day: 'Day 6', actual: 12, ideal: 8 },
    { day: 'Day 7', actual: 4, ideal: 0 }
  ];

  const velocityWeeks = [
    { label: 'Week 1', completed: 4 },
    { label: 'Week 2', completed: 6 },
    { label: 'Week 3', completed: 8 },
    { label: 'Week 4', completed: completedTasks + 3 }
  ];

  const projectHours = Array.from(new Set(tasks.map((t) => t.project))).map((proj) => {
    const projTasks = tasks.filter((t) => t.project === proj);
    const logged = projTasks.reduce((sum, t) => sum + t.timeLogged, 0);
    const estimated = projTasks.reduce((sum, t) => sum + t.timeEstimated, 0);
    return { name: proj, logged, estimated };
  });

  const chartData = timeframe === 'monthly'
    ? [
        { label: 'Jan', value: 45 },
        { label: 'Feb', value: 62 },
        { label: 'Mar', value: 58 },
        { label: 'Apr', value: 88 },
        { label: 'May', value: 74 },
        { label: 'Jun', value: 92 },
        { label: 'Jul', value: 81 }
      ]
    : [
        { label: 'Q3 2025', value: 68 },
        { label: 'Q4 2025', value: 78 },
        { label: 'Q1 2026', value: 73 },
        { label: 'Q2 2026', value: 89 }
      ];

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-8 flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title="Performance Insights"
        subtitle="Analytics from live task data, velocity, and project health."
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={staggerItem}>
          <StatCard
            label="Completion Rate"
            value={`${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%`}
            icon="pie_chart"
            sub={`${completedTasks} of ${totalTasks} done`}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            label="Sprint Efficiency"
            value={`${totalHoursEstimated > 0 ? Math.round((totalHoursLogged / totalHoursEstimated) * 100) : 0}%`}
            icon="speed"
            color="blue"
            sub="Of estimated budget"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            label="Team Velocity"
            value={(employees.reduce((s, e) => s + e.velocity, 0) / employees.length).toFixed(1)}
            icon="trending_up"
            color="green"
            sub="Story points / sprint"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard label="Work Logs" value={progressLogs.length} icon="history" color="violet" sub="Progress entries" />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassPanel className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-neutral-700">trending_down</span>
              Sprint Burndown (Q4 Scope)
            </h3>
          </div>
          <div className="w-full h-64 liquid-glass rounded-xl p-4 flex flex-col justify-between">
            <div className="flex-1 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="0" y1="20" x2="100" y2="20" stroke="#e2e8f0" strokeWidth="0.5" />
                <line x1="0" y1="40" x2="100" y2="40" stroke="#e2e8f0" strokeWidth="0.5" />
                <line x1="0" y1="60" x2="100" y2="60" stroke="#e2e8f0" strokeWidth="0.5" />
                <line x1="0" y1="80" x2="100" y2="80" stroke="#e2e8f0" strokeWidth="0.5" />
                <line x1="0" y1="10" x2="100" y2="90" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />
                <path d="M 0 10 L 16 20 L 33 30 L 50 50 L 66 65 L 83 72 L 100 85" fill="none" stroke="#6366f1" strokeWidth="2" />
              </svg>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-semibold font-mono border-t border-white/40 pt-2 mt-2">
              {burndownData.map((b) => (
                <span key={b.day}>{b.day}</span>
              ))}
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-neutral-700">bar_chart</span>
              Team Velocity Trend
            </h3>
            <div className="flex gap-1 liquid-glass p-0.5 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setTimeframe('monthly')}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg ${timeframe === 'monthly' ? 'liquid-glass text-neutral-800 shadow-sm' : 'text-slate-500'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setTimeframe('quarterly')}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg ${timeframe === 'quarterly' ? 'liquid-glass text-neutral-800 shadow-sm' : 'text-slate-500'}`}
              >
                Quarterly
              </button>
            </div>
          </div>
          <div className="w-full h-48 sm:h-64 liquid-glass rounded-xl p-3 sm:p-4 flex items-end justify-around gap-1.5 sm:gap-3">
            {chartData.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[9px] font-bold text-slate-600">{d.value}%</span>
                <div className="w-full bg-linear-to-t from-[#c8ff00] to-[#00e5ff] rounded-t" style={{ height: `${d.value}%`, minHeight: '8px' }} />
                <span className="text-[9px] font-bold text-slate-500">{d.label}</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      <GlassPanel className="p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-neutral-700">groups</span>
          Team Performance Leaderboard
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/40 text-left text-slate-500 uppercase tracking-wider">
                <th className="pb-3 font-bold">Employee</th>
                <th className="pb-3 font-bold">Velocity</th>
                <th className="pb-3 font-bold">Completion</th>
                <th className="pb-3 font-bold">Feedback</th>
                <th className="pb-3 font-bold">Trend</th>
                <th className="pb-3 font-bold">Kudos</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-white/30 hover:bg-white/30 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <img src={emp.avatar} alt={emp.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-white/60" referrerPolicy="no-referrer" />
                      <div>
                        <p className="font-bold text-slate-800">{emp.name}</p>
                        <p className="text-[10px] text-slate-400">{emp.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-bold text-slate-700">{emp.velocity}</td>
                  <td className="py-3">
                    <span className="bg-emerald-100/80 text-emerald-700 px-2 py-0.5 rounded-lg font-bold">{emp.completionRate}%</span>
                  </td>
                  <td className="py-3 font-bold text-amber-600">{emp.feedbackScore}/5</td>
                  <td className="py-3">
                    <span className={emp.trend >= 0 ? 'text-green-600' : 'text-red-500'}>
                      {emp.trend >= 0 ? '+' : ''}{emp.trend}%
                    </span>
                  </td>
                  <td className="py-3 font-bold text-neutral-800">{emp.kudos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassPanel className="p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-neutral-700">health_and_safety</span>
            Project Health
          </h3>
          <div className="space-y-4">
            {projectsHealth.map((proj) => (
              <div key={proj.name} className="flex items-center justify-between p-3 liquid-glass rounded-xl">
                <div>
                  <p className="text-xs font-bold text-slate-800">{proj.name}</p>
                  <p className="text-[10px] text-slate-400">Velocity: {proj.velocity}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">{proj.health}%</p>
                  <span className={`text-[10px] font-bold uppercase ${
                    proj.riskLevel === 'low' ? 'text-green-600' : proj.riskLevel === 'medium' ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {proj.riskLevel} risk
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-neutral-700">schedule</span>
            Recent Work Logs
          </h3>
          <div className="space-y-3">
            {progressLogs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No progress logged yet. Use &quot;Log Progress&quot; in the sidebar.</p>
            ) : (
              progressLogs.map((log) => (
                <div key={log.id} className="p-3 liquid-glass rounded-xl">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-bold text-slate-800">{log.taskTitle}</p>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{log.hours}h</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{log.notes}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{log.author} • {log.timestamp}</p>
                </div>
              ))
            )}
          </div>
        </GlassPanel>
      </div>

      <GlassPanel className="p-6">
        <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-neutral-700">donut_large</span>
          Sprint Effort Audit (Estimated vs. Spent)
        </h3>
        <div className="space-y-6">
          {projectHours.map((proj) => {
            const ratioPct = proj.estimated > 0 ? (proj.logged / proj.estimated) * 100 : 0;
            return (
              <div key={proj.name} className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">{proj.name}</span>
                  <span className="text-slate-500 font-semibold">
                    {proj.logged}h logged • {proj.estimated}h planned ({Math.round(ratioPct)}%)
                  </span>
                </div>
                <div className="w-full h-4 rounded-lg overflow-hidden bg-white/50">
                  <div className="h-full rounded-r bg-linear-to-r from-[#ff3cac] to-[#c8ff00]" style={{ width: `${Math.min(ratioPct, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </GlassPanel>
    </div>
  );
}
