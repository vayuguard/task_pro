import React from 'react';
import { motion } from 'motion/react';
import { Task, User } from '../types';
import { isTaskAssignedToUser, enrichUserWithEmail } from '../utils/tasks';
import { PageHeader, StatCard, GlassPanel } from './ui/Glass';
import { staggerContainer, staggerItem } from './ui/motion';

interface AdminDashboardViewProps {
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
  teamMembers: User[];
  onNewTaskClick: () => void;
}

export default function AdminDashboardView({
  tasks,
  onTaskSelect,
  teamMembers,
  onNewTaskClick
}: AdminDashboardViewProps) {
  const totalTasks = tasks.length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const inReview = tasks.filter((t) => t.status === 'Review').length;
  const completed = tasks.filter((t) => t.status === 'Done').length;
  const todo = tasks.filter((t) => t.status === 'To Do').length;
  const totalEstimated = tasks.reduce((sum, t) => sum + t.timeEstimated, 0);
  const totalLogged = tasks.reduce((sum, t) => sum + t.timeLogged, 0);

  const projects = Array.from(new Set(tasks.map((t) => t.project)));
  const projectStats = projects.map((proj) => {
    const projTasks = tasks.filter((t) => t.project === proj);
    const completedProj = projTasks.filter((t) => t.status === 'Done').length;
    const pct = projTasks.length > 0 ? (completedProj / projTasks.length) * 100 : 0;
    return { name: proj, count: projTasks.length, completed: completedProj, pct };
  });

  const memberWorkloads = teamMembers.map((member) => {
    const enriched = enrichUserWithEmail(member);
    const assignedTasks = tasks.filter((t) => isTaskAssignedToUser(t, enriched));
    const hoursLogged = assignedTasks.reduce((sum, t) => sum + t.timeLogged, 0);
    const hoursEstimated = assignedTasks.reduce((sum, t) => sum + t.timeEstimated, 0);
    return {
      member: enriched,
      count: assignedTasks.length,
      hoursLogged,
      hoursEstimated,
      percent: hoursEstimated > 0 ? (hoursLogged / hoursEstimated) * 100 : 0
    };
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-8 flex flex-col gap-6 sm:gap-8">
      <PageHeader
        title="Executive Overview"
        subtitle="Cross-project analytics, workload diagnostics, and compliance tracking."
        action={
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onNewTaskClick} className="btn-accent px-4 sm:px-5 py-2.5 text-sm flex items-center gap-2 w-full sm:w-auto justify-center">
            <span className="material-symbols-outlined text-base">add</span>
            Create Task
          </motion.button>
        }
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div variants={staggerItem}><StatCard label="Total Tasks" value={totalTasks} icon="assessment" sub="Active scope" /></motion.div>
        <motion.div variants={staggerItem}><StatCard label="In Progress" value={inProgress} icon="autorenew" color="blue" sub={`${todo} in backlog`} /></motion.div>
        <motion.div variants={staggerItem}><StatCard label="In Review" value={inReview} icon="rate_review" color="amber" sub="Awaiting sign-off" /></motion.div>
        <motion.div variants={staggerItem}><StatCard label="Completed" value={completed} icon="check_circle" color="green" sub={`${totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0}% rate`} /></motion.div>
        <motion.div variants={staggerItem} className="col-span-2 lg:col-span-1"><StatCard label="Time Logged" value={`${totalLogged}h`} icon="hourglass_empty" color="violet" sub={`of ${totalEstimated}h est.`} /></motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassPanel className="p-6 lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff3cac]">folder_open</span>
            Project Progress
          </h3>
          <div className="space-y-4">
            {projectStats.map((proj) => (
              <div key={proj.name}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800">{proj.name}</span>
                  <span className="text-slate-500">{proj.completed}/{proj.count}</span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden bg-white/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${proj.pct}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-linear-to-r from-[#c8ff00] to-[#00e5ff]"
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel className="p-6 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff6b4a]">groups</span>
            Team Workload
          </h3>
          <div className="space-y-4">
            {memberWorkloads.map((item) => (
              <div key={item.member.email || item.member.name} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-3 border-b border-white/40 last:border-0">
                <div className="flex items-center gap-3 w-44 shrink-0">
                  <img className="w-9 h-9 rounded-full object-cover ring-2 ring-white/80 shadow" src={item.member.avatar} alt="" referrerPolicy="no-referrer" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.member.name}</p>
                    <p className="text-[10px] text-slate-500">{item.member.role}</p>
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-slate-700">{item.count} tasks</span>
                    <span className="text-slate-500">{item.hoursLogged}h / {item.hoursEstimated}h</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden bg-white/50">
                    <div className="h-full rounded-full bg-linear-to-r from-[#ff3cac] to-[#c8ff00] transition-all duration-500" style={{ width: `${Math.min(item.percent, 100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      <GlassPanel className="overflow-hidden">
        <div className="p-5 border-b border-white/40 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1a9bb0]">schedule</span>
            Active Tasks
          </h3>
          <span className="text-[10px] text-slate-400">Click row to open details</span>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-white/40">
                <th className="py-3 px-5">ID</th>
                <th className="py-3 px-5">Title</th>
                <th className="py-3 px-5">Assignee</th>
                <th className="py-3 px-5">Priority</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Time</th>
                <th className="py-3 px-5 text-right">Due</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <motion.tr
                  key={task.id}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
                  onClick={() => onTaskSelect(task)}
                  className="border-b border-white/30 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-5 font-mono text-slate-400">{task.id}</td>
                  <td className="py-3 px-5 font-semibold text-slate-900 max-w-xs truncate">{task.title}</td>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2">
                      <img className="w-5 h-5 rounded-full" src={task.assignee.avatar} alt="" referrerPolicy="no-referrer" />
                      <span>{task.assignee.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-5">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${task.priority === 'High' ? 'bg-red-100/80 text-red-700' : task.priority === 'Medium' ? 'bg-amber-100/80 text-amber-700' : 'bg-slate-100/80 text-slate-600'}`}>{task.priority}</span>
                  </td>
                  <td className="py-3 px-5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${task.status === 'Done' ? 'bg-emerald-100/80 text-emerald-700' : task.status === 'In Progress' ? 'bg-blue-100/80 text-blue-700' : 'bg-slate-100/80 text-slate-600'}`}>{task.status}</span>
                  </td>
                  <td className="py-3 px-5 font-mono text-slate-500">{task.timeLogged}h/{task.timeEstimated}h</td>
                  <td className="py-3 px-5 text-right font-semibold text-rose-500">{task.dueDate}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}
