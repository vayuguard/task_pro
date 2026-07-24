import React from 'react';
import { Task, TaskStatus } from '../types';

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
    { id: 'To Do', title: 'To Do', color: 'border-t-slate-400 bg-slate-50', icon: 'assignment_late' },
    { id: 'In Progress', title: 'In Progress', color: 'border-t-blue-500 bg-blue-50/10', icon: 'autorenew' },
    { id: 'Review', title: 'Review', color: 'border-t-amber-500 bg-amber-50/10', icon: 'rate_review' },
    { id: 'Done', title: 'Done', color: 'border-t-green-500 bg-green-50/10', icon: 'check_circle' }
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
    <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-6 h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Board Header Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#191c1e]">Website Redesign Kanban</h2>
        <p className="text-xs text-[#45464d] mt-1">
          Tactile sprint board. Slide items horizontally with card arrows or click cards to modify details.
        </p>
      </div>

      {/* Columns Grid Container */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 overflow-hidden h-full pb-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`border border-[#c6c6cd] border-t-4 rounded-xl flex flex-col h-full overflow-hidden ${col.color}`}
            >
              {/* Column Title header */}
              <div className="p-4 border-b border-slate-200/60 bg-white/70 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-slate-500">{col.icon}</span>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">{col.title}</span>
                </div>
                <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>

              {/* Cards list (Scrollable) */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                {colTasks.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg p-4">
                    Empty Column
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const totalSubs = task.subtasks.length;
                    const completedSubs = task.subtasks.filter((s) => s.completed).length;
                    const commentCount = task.activity.filter((a) => a.type === 'comment').length;

                    return (
                      <div
                        key={task.id}
                        onClick={() => onTaskSelect(task)}
                        className="bg-white border border-[#c6c6cd] rounded-lg p-4 shadow-2xs hover:shadow-md hover:border-slate-400 transition-all cursor-pointer group flex flex-col gap-3 relative"
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
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
