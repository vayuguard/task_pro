import React from 'react';
import { motion } from 'motion/react';
import { Task, TaskStatus } from '../types';
import { fadeUp, staggerContainer, staggerItem } from './ui/motion';

interface KanbanBoardViewProps {
  tasks: Task[];
  onTaskSelect: (task: Task) => void;
  onUpdateTask: (updatedTask: Task) => void;
}

export default function KanbanBoardView({
  tasks,
  onTaskSelect,
  onUpdateTask
}: KanbanBoardViewProps) {
  const columns: { id: TaskStatus; title: string; color: string; icon: string }[] = [
    { id: 'To Do', title: 'Backlog', color: 'border-t-black bg-white/30', icon: 'assignment_late' },
    { id: 'In Progress', title: 'In Motion', color: 'border-t-[#00e5ff] bg-cyan-50/30', icon: 'autorenew' },
    { id: 'Review', title: 'Check It', color: 'border-t-[#ff3cac] bg-pink-50/25', icon: 'rate_review' },
    { id: 'Done', title: 'Slayed', color: 'border-t-[#c8ff00] bg-lime-50/40', icon: 'check_circle' }
  ];

  const moveTask = (e: React.MouseEvent, task: Task, direction: 'left' | 'right') => {
    e.stopPropagation();
    const order: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Done'];
    const currentIndex = order.indexOf(task.status);
    let nextIndex = currentIndex;

    if (direction === 'left' && currentIndex > 0) {
      nextIndex -= 1;
    } else if (direction === 'right' && currentIndex < order.length - 1) {
      nextIndex += 1;
    }

    if (nextIndex !== currentIndex) {
      const nextStatus = order[nextIndex];
      onUpdateTask({
        ...task,
        status: nextStatus,
        activity: [
          {
            id: `act-log-${Date.now()}`,
            type: 'log',
            user: task.assignee,
            content: `moved this task from "${task.status}" to "${nextStatus}"`,
            timestamp: 'Just now'
          },
          ...task.activity
        ]
      });
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-8 flex flex-col gap-4 sm:gap-6 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden">
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="shrink-0">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Kanban Board</h2>
        <p className="text-sm text-slate-500 mt-1">
          <span className="md:hidden">Swipe columns · </span>
          Use arrow controls to move tasks.
        </p>
      </motion.div>

      <div className="flex-1 min-h-0 flex md:grid md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 overflow-x-auto md:overflow-hidden pb-3 md:pb-4 custom-scrollbar snap-x snap-mandatory md:snap-none">
        {columns.map((col, colIndex) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: colIndex * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className={`glass border-t-4 rounded-2xl flex flex-col h-full min-h-[420px] md:min-h-0 overflow-hidden shrink-0 w-[min(280px,82vw)] md:w-auto snap-center ${col.color}`}
            >
              <div className="p-4 border-b border-slate-200/40 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-slate-500">{col.icon}</span>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">{col.title}</span>
                </div>
                <motion.span
                  key={colTasks.length}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="bg-[#c8ff00] text-black text-[10px] font-bold px-2.5 py-0.5 rounded-lg border border-black"
                >
                  {colTasks.length}
                </motion.span>
              </div>

              <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                {colTasks.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs border border-dashed border-slate-200/80 rounded-xl p-4">
                    Drop tasks here
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const totalSubs = task.subtasks.length;
                    const completedSubs = task.subtasks.filter((s) => s.completed).length;
                    const commentCount = task.activity.filter((a) => a.type === 'comment').length;

                    return (
                      <motion.div
                        key={task.id}
                        layout
                        variants={staggerItem}
                        whileHover={{ y: -3, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onTaskSelect(task)}
                        className="liquid-glass rounded-xl p-4 hover:shadow-lg hover:border-neutral-300/50 transition-all cursor-pointer group flex flex-col gap-3 liquid-card-hover"
                      >
                        {/* Tags / ID Row */}
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider">{task.id}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            task.priority === 'High' 
                              ? 'bg-red-50 text-red-700' 
                              : task.priority === 'Medium'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {task.priority}
                          </span>
                        </div>

                        {/* Card Title */}
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                          {task.title}
                        </h4>

                        {/* Labels row */}
                        {task.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.labels.slice(0, 2).map((lbl) => (
                              <span key={lbl} className="bg-slate-100 text-slate-700 text-[8px] font-bold px-1.5 py-0.2 rounded">
                                {lbl}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Info details / indicators */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-3">
                          
                          {/* Left stats */}
                          <div className="flex items-center gap-2">
                            {totalSubs > 0 && (
                              <span className="inline-flex items-center gap-0.5" title="Subtasks">
                                <span className="material-symbols-outlined text-xs">checklist</span>
                                <span className="font-semibold text-slate-600">{completedSubs}/{totalSubs}</span>
                              </span>
                            )}
                            {commentCount > 0 && (
                              <span className="inline-flex items-center gap-0.5" title="Comments">
                                <span className="material-symbols-outlined text-xs">forum</span>
                                <span className="font-semibold text-slate-600">{commentCount}</span>
                              </span>
                            )}
                            {task.attachments.length > 0 && (
                              <span className="inline-flex items-center gap-0.5" title="Attachments">
                                <span className="material-symbols-outlined text-xs">attach_file</span>
                                <span className="font-semibold text-slate-600">{task.attachments.length}</span>
                              </span>
                            )}
                          </div>

                          {/* Member avatar */}
                          <img
                            className="w-5 h-5 rounded-full object-cover border border-[#c6c6cd]"
                            src={task.assignee.avatar}
                            alt={task.assignee.name}
                            title={`Assigned to ${task.assignee.name}`}
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Tactile Slider/Shift Controls */}
                        <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded px-1.5 py-1 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => moveTask(e, task, 'left')}
                            disabled={col.id === 'To Do'}
                            className="material-symbols-outlined text-xs hover:text-black hover:bg-slate-200 p-0.5 rounded cursor-pointer disabled:opacity-25"
                            title="Slide left"
                          >
                            arrow_back
                          </button>
                          <span className="text-[8px] font-bold text-slate-400 uppercase font-mono tracking-wider">Slide Task</span>
                          <button
                            onClick={(e) => moveTask(e, task, 'right')}
                            disabled={col.id === 'Done'}
                            className="material-symbols-outlined text-xs hover:text-black hover:bg-slate-200 p-0.5 rounded cursor-pointer disabled:opacity-25"
                            title="Slide right"
                          >
                            arrow_forward
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
