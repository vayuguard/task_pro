import React from 'react';
import { Task, User } from '../types';

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
  // Compute analytics
  const totalTasks = tasks.length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const inReview = tasks.filter((t) => t.status === 'Review').length;
  const completed = tasks.filter((t) => t.status === 'Done').length;
  const todo = tasks.filter((t) => t.status === 'To Do').length;

  const totalEstimated = tasks.reduce((sum, t) => sum + t.timeEstimated, 0);
  const totalLogged = tasks.reduce((sum, t) => sum + t.timeLogged, 0);
  const logProgressPercent = totalEstimated > 0 ? (totalLogged / totalEstimated) * 100 : 0;

  // Group tasks by project
  const projects = Array.from(new Set(tasks.map((t) => t.project)));
  const projectStats = projects.map((proj) => {
    const projTasks = tasks.filter((t) => t.project === proj);
    const completedProj = projTasks.filter((t) => t.status === 'Done').length;
    const pct = projTasks.length > 0 ? (completedProj / projTasks.length) * 100 : 0;
    return { name: proj, count: projTasks.length, completed: completedProj, pct };
  });

  // Calculate workloads for team members
  const memberWorkloads = teamMembers.map((member) => {
    const assignedTasks = tasks.filter((t) => t.assignee.name === member.name);
    const hoursLogged = assignedTasks.reduce((sum, t) => sum + t.timeLogged, 0);
    const hoursEstimated = assignedTasks.reduce((sum, t) => sum + t.timeEstimated, 0);
    return {
      member,
      count: assignedTasks.length,
      hoursLogged,
      hoursEstimated,
      percent: hoursEstimated > 0 ? (hoursLogged / hoursEstimated) * 100 : 0
    };
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#191c1e]">Executive Overview</h2>
          <p className="text-xs text-[#45464d] mt-1">Cross-project analytics, workload diagnostics, and active compliance tracking.</p>
        </div>
        <button
          onClick={onNewTaskClick}
          className="bg-[#131b2e] text-white px-4 py-2.5 rounded-lg text-xs font-bold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Create Task
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-[#c6c6cd] p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#45464d] font-semibold">Total Tasks</span>
            <span className="material-symbols-outlined text-slate-400 text-lg">assessment</span>
          </div>
          <p className="text-2xl font-black text-[#191c1e]">{totalTasks}</p>
          <span className="text-[10px] text-slate-500 block mt-1">Active scope</span>
        </div>

        <div className="bg-white border border-[#c6c6cd] p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#45464d] font-semibold">In Progress</span>
            <span className="material-symbols-outlined text-blue-500 text-lg">autorenew</span>
          </div>
          <p className="text-2xl font-black text-blue-600">{inProgress}</p>
          <span className="text-[10px] text-[#3B82F6] font-semibold block mt-1">{todo} queued in backlog</span>
        </div>

        <div className="bg-white border border-[#c6c6cd] p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#45464d] font-semibold">In Review</span>
            <span className="material-symbols-outlined text-amber-500 text-lg">rate_review</span>
          </div>
          <p className="text-2xl font-black text-amber-600">{inReview}</p>
          <span className="text-[10px] text-slate-500 block mt-1">Awaiting sign-off</span>
        </div>

        <div className="bg-white border border-[#c6c6cd] p-4 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#45464d] font-semibold">Completed</span>
            <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
          </div>
          <p className="text-2xl font-black text-green-600">{completed}</p>
          <span className="text-[10px] text-green-600 font-semibold block mt-1">
            {totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0}% success rate
          </span>
        </div>

        <div className="bg-white border border-[#c6c6cd] p-4 rounded-xl shadow-2xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#45464d] font-semibold">Time Logged</span>
            <span className="material-symbols-outlined text-[#131b2e] text-lg">hourglass_empty</span>
          </div>
          <p className="text-2xl font-black text-[#131b2e]">{totalLogged}h</p>
          <span className="text-[10px] text-slate-500 block mt-1">of {totalEstimated}h estimated</span>
        </div>
      </div>

      {/* Main Grid: Projects & Workloads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Project Health Overview Card */}
        <div className="bg-white border border-[#c6c6cd] p-6 rounded-xl shadow-2xs lg:col-span-1">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500">folder_open</span>
            Project Progress
          </h3>
          <div className="space-y-5">
            {projectStats.map((proj) => (
              <div key={proj.name} className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">{proj.name}</span>
                  <span className="text-slate-500">{proj.completed}/{proj.count} Tasks Done ({Math.round(proj.pct)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#131b2e] h-full rounded-full transition-all duration-500"
                    style={{ width: `${proj.pct}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Resource Allocation/Workloads Card */}
        <div className="bg-white border border-[#c6c6cd] p-6 rounded-xl shadow-2xs lg:col-span-2">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500">groups</span>
            Team Workload & Logged Hours
          </h3>
          
          <div className="space-y-5">
            {memberWorkloads.map((item) => (
              <div key={item.member.name} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-slate-50 pb-3 last:border-b-0 last:pb-0">
                
                {/* Member Meta */}
                <div className="flex items-center gap-3 w-48 shrink-0">
                  <img
                    className="w-8 h-8 rounded-full object-cover border border-[#c6c6cd]"
                    src={item.member.avatar}
                    alt={item.member.name}
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{item.member.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{item.member.role}</p>
                  </div>
                </div>

                {/* Hours allocation chart (using SVG-styled progress) */}
                <div className="flex-1 w-full">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-slate-700">{item.count} tasks assigned</span>
                    <span className="text-slate-500 font-semibold">{item.hoursLogged}h logged / {item.hoursEstimated}h estimated</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(item.percent, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Updates and Clickable Action Logging */}
      <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-2xs">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500">schedule</span>
            Active Task Streams & Deadlines
          </h3>
          <span className="text-[10px] text-slate-500">Click any row to open full task details</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/55 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
                <th className="py-3.5 px-6">Task ID</th>
                <th className="py-3.5 px-6">Task Title</th>
                <th className="py-3.5 px-6">Assignee</th>
                <th className="py-3.5 px-6">Priority</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Time Tracker</th>
                <th className="py-3.5 px-6 text-right">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => onTaskSelect(task)}
                  className="hover:bg-[#f2f4f6]/40 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-6 font-semibold text-slate-500 font-mono">
                    {task.id}
                  </td>
                  <td className="py-3.5 px-6 font-bold text-slate-900 max-w-xs truncate">
                    {task.title}
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-2">
                      <img
                        className="w-5 h-5 rounded-full object-cover"
                        src={task.assignee.avatar}
                        alt={task.assignee.name}
                        referrerPolicy="no-referrer"
                      />
                      <span className="font-semibold text-slate-700">{task.assignee.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      task.priority === 'High' 
                        ? 'bg-red-50 text-red-700' 
                        : task.priority === 'Medium'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-6">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      task.status === 'Done'
                        ? 'bg-green-50 text-green-700'
                        : task.status === 'Review'
                        ? 'bg-amber-50 text-amber-800'
                        : task.status === 'In Progress'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 font-mono text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span>{task.timeLogged}h / {task.timeEstimated}h</span>
                      <span className="text-[10px] bg-slate-100 px-1 py-0.2 rounded font-sans text-slate-600">
                        {Math.round((task.timeLogged / task.timeEstimated) * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 text-right font-bold text-[#ba1a1a]">
                    {task.dueDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
