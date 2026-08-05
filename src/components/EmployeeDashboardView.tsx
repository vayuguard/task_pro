import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Task, User, TaskStatus } from '../types';
import { TASK_PRIORITIES, priorityBadgeClass } from '../utils/priority';
import { getWorkingHours, transitionTaskStatus } from '../utils/taskTiming';
import { fadeUp, staggerContainer, staggerItem } from './ui/motion';

interface EmployeeDashboardViewProps {
  tasks: Task[];
  currentUser: User;
  onTaskSelect: (task: Task) => void;
  onUpdateTask: (updatedTask: Task) => void;
}

export default function EmployeeDashboardView({
  tasks,
  currentUser,
  onTaskSelect,
  onUpdateTask
}: EmployeeDashboardViewProps) {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const myTasks = tasks;

  const filteredTasks = myTasks.filter((t) => {
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const completedCount = myTasks.filter((t) => t.status === 'Done').length;
  const activeCount = myTasks.filter((t) => t.status === 'In Progress' || t.status === 'Review').length;
  const hoursLogged = myTasks.reduce((sum, t) => sum + getWorkingHours(t), 0);
  const hoursEstimated = myTasks.reduce((sum, t) => sum + t.timeEstimated, 0);

  const handleNextStatus = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    let nextStatus: TaskStatus = task.status;
    if (task.status === 'To Do') nextStatus = 'In Progress';
    else if (task.status === 'In Progress') nextStatus = 'Review';
    else if (task.status === 'Review') nextStatus = 'Done';
    else return;

    onUpdateTask(transitionTaskStatus(task, nextStatus, currentUser));
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-8 flex flex-col gap-6 sm:gap-8">
      <motion.section
        variants={fadeUp}
        initial="initial"
        animate="animate"
        className="glass rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 card-hover"
      >
        <div className="flex items-center gap-4">
          <img
            className="w-16 h-16 rounded-full object-cover border-2 border-slate-900 shadow-sm"
            src={currentUser.avatar}
            alt={currentUser.name}
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{currentUser.name}</h2>
              <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active Now
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">{currentUser.role || 'Contributor'}</p>
            <p className="text-[11px] text-[#45464d] mt-1">Workspace ID: {currentUser.name.toLowerCase().replace(' ', '_')}@taskpro.ent</p>
          </div>
        </div>

        {/* User stats widget */}
        <div className="flex gap-4 sm:gap-8 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 pl-0 md:pl-8 w-full md:w-auto justify-around md:justify-start">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Hours spent</span>
            <p className="text-xl font-black text-[#131b2e] mt-1">{hoursLogged}h</p>
            <span className="text-[9px] text-slate-500">of {hoursEstimated}h planned</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Completed</span>
            <p className="text-xl font-black text-green-600 mt-1">{completedCount}</p>
            <span className="text-[9px] text-slate-500">tasks delivered</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">In Progress</span>
            <p className="text-xl font-black text-blue-600 mt-1">{activeCount}</p>
            <span className="text-[9px] text-slate-500">active sprint focus</span>
          </div>
        </div>
      </motion.section>

      <motion.section variants={fadeUp} initial="initial" animate="animate" transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-[#191c1e]">My Task Queue ({filteredTasks.length})</h3>
          <p className="text-xs text-[#45464d]">Individual task log for {currentUser.name}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Status filter selection */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field text-xs font-semibold py-2 w-full sm:w-auto"
          >
            <option value="All">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Done">Done</option>
          </select>

          {/* Priority filter selection */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input-field text-xs font-semibold py-2 w-full sm:w-auto"
          >
            <option value="All">All Priorities</option>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </motion.section>

      <motion.section variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full bg-slate-50 border border-dashed border-slate-300 p-12 text-center rounded-xl">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">assignment_late</span>
            <p className="text-sm font-semibold text-slate-600">No active tasks match your filters.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the status/priority selection or allocate new tasks.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const completedSubs = task.subtasks.filter((s) => s.completed).length;
            const totalSubs = task.subtasks.length;
            const percentage = totalSubs > 0 ? (completedSubs / totalSubs) * 100 : 0;

            return (
              <motion.div
                key={task.id}
                variants={staggerItem}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onTaskSelect(task)}
                className="glass rounded-2xl overflow-hidden cursor-pointer flex flex-col group h-full border-b-4 border-b-[#c8ff00] card-hover"
              >
                {/* Header Meta */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono">
                      {task.id} • {task.project}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityBadgeClass(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                    {task.title}
                  </h4>

                  <p className="text-xs text-[#45464d] line-clamp-3 mb-4 leading-relaxed">
                    {task.description.replace(/\* /g, '')}
                  </p>

                  {/* Subtask micro indicator */}
                  {totalSubs > 0 && (
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <div className="flex justify-between text-[10px] font-semibold mb-1">
                        <span className="text-slate-500">Subtasks progress</span>
                        <span className="text-slate-800">{completedSubs} of {totalSubs}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-green-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action Bar */}
                <div className="bg-slate-50 border-t border-[#eceef0] px-5 py-3 flex items-center justify-between text-xs">
                  <div className="flex flex-col gap-0.5 font-mono text-[11px] text-slate-500 font-semibold">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      {getWorkingHours(task)}h spent / {task.timeEstimated}h planned
                      {task.status === 'In Progress' ? ' · timer on' : ''}
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans">Due {task.dueDate}</span>
                  </div>

                  {task.status !== 'Done' && (
                    <button
                      onClick={(e) => handleNextStatus(e, task)}
                      className="bg-[#131b2e] text-white hover:bg-slate-800 active:scale-95 text-[10px] font-bold px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                      title="Promote status to next phase"
                    >
                      <span>Move to {task.status === 'To Do' ? 'Progress' : task.status === 'In Progress' ? 'Review' : 'Done'}</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                  )}
                  {task.status === 'Done' && (
                    <span className="text-green-600 font-bold text-[10px] flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
                      <span className="material-symbols-outlined text-xs">check_circle</span> Delivered
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </motion.section>
    </div>
  );
}
