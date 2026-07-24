import { ArrowLeft, ArrowRight, Eye, Trash2, Plus, Calendar } from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface KanbanBoardProps {
  tasks: Task[];
  onMoveTask: (id: string, newStatus: TaskStatus) => void;
  onSelectTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onAddTaskToColumn: (column: TaskStatus) => void;
  teamMembers: Array<{ name: string; avatar: string }>;
}

export default function KanbanBoard({ 
  tasks, 
  onMoveTask, 
  onSelectTask, 
  onDeleteTask, 
  onAddTaskToColumn,
  teamMembers
}: KanbanBoardProps) {
  const columns: { id: TaskStatus; title: string; color: string; border: string; bg: string }[] = [
    { id: 'todo', title: 'To Do', color: 'text-slate-700 bg-slate-100', border: 'border-slate-200', bg: 'bg-slate-50/50' },
    { id: 'in_progress', title: 'In Progress', color: 'text-blue-700 bg-blue-50', border: 'border-blue-100', bg: 'bg-blue-50/10' },
    { id: 'review', title: 'Review', color: 'text-amber-700 bg-amber-50', border: 'border-amber-100', bg: 'bg-amber-50/10' },
    { id: 'completed', title: 'Completed', color: 'text-emerald-700 bg-emerald-50', border: 'border-emerald-100', bg: 'bg-emerald-50/10' },
  ];

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'todo') return 'in_progress';
    if (current === 'in_progress') return 'review';
    if (current === 'review') return 'completed';
    return null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'completed') return 'review';
    if (current === 'review') return 'in_progress';
    if (current === 'in_progress') return 'todo';
    return null;
  };

  return (
    <div className="space-y-6 animate-fadeIn h-[calc(100vh-140px)] flex flex-col">
      {/* Title */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Interactive Kanban Board</h2>
          <p className="text-slate-500 text-sm md:text-base mt-1">Visually track, transition, and manage task milestones across sprint cycles.</p>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 overflow-y-auto lg:overflow-y-hidden pb-4">
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id);
          return (
            <div 
              key={column.id} 
              className={`rounded-xl border ${column.border} ${column.bg} p-4 flex flex-col h-full overflow-hidden`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${column.color}`}>
                    {column.title}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">{columnTasks.length}</span>
                </div>
                <button
                  onClick={() => onAddTaskToColumn(column.id)}
                  className="p-1 rounded-lg hover:bg-slate-200/50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title={`Add task to ${column.title}`}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Tasks Cards Area */}
              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {columnTasks.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs italic">
                    No tasks in this lane
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    const prevStatus = getPrevStatus(task.status);
                    const nextStatus = getNextStatus(task.status);
                    return (
                      <div
                        key={task.id}
                        className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all group relative cursor-pointer"
                        onClick={() => onSelectTask(task)}
                      >
                        {/* Title and priority */}
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-relaxed">
                            {task.title}
                          </h4>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                            task.priority === 'urgent'
                              ? 'bg-rose-50 text-rose-700'
                              : task.priority === 'medium'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {task.priority}
                          </span>
                        </div>

                        {/* Project name */}
                        <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">{task.project}</p>

                        {/* Assignee and due date */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                            <Calendar size={12} className="text-slate-400" />
                            <span>{task.dueDate.split('-').slice(1).join('/')}</span>
                          </div>

                          {/* Avatars */}
                          <div className="flex -space-x-1">
                            {task.assignees.slice(0, 2).map((name) => {
                              const member = teamMembers.find(m => m.name === name);
                              return (
                                <img
                                  key={name}
                                  src={member?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT1jtDA7el1WpSvRQpYrCb4gOoavKhjM8ckwZ5geOgJclzrsJ8MLETWnDpYogNDGdn42U4dL6HjC0945Fqvf61PkuVw0ZiVtTgrn2Gx5c6YPEkEeP7Bx_A93_YtNuuXYfEPUGskKYz_1OkiCMkLpoGaozUDBADf-1M4lS_mYxX0iU0JJwFrIF_6Zf6nYTXV5wnMU5GetDRf1ANE7oMqR-Wdhx-8LyagWiiJuXTUCHIns3R1M7Llq9-IFZmrBvu32tHEBRNNEqNODOa'}
                                  alt={name}
                                  title={name}
                                  referrerPolicy="no-referrer"
                                  className="w-4.5 h-4.5 rounded-full border border-white object-cover"
                                />
                              );
                            })}
                          </div>
                        </div>

                        {/* Hover Quick Action Buttons */}
                        <div 
                          className="mt-3.5 pt-2 border-t border-slate-100 flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()} // Prevent card selecting
                        >
                          {prevStatus && (
                            <button
                              onClick={() => onMoveTask(task.id, prevStatus)}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                              title="Move back"
                            >
                              <ArrowLeft size={12} />
                            </button>
                          )}
                          <button
                            onClick={() => onSelectTask(task)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                            title="View full specs"
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this task from sprint?')) {
                                onDeleteTask(task.id);
                              }
                            }}
                            className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                            title="Remove task"
                          >
                            <Trash2 size={12} />
                          </button>
                          {nextStatus && (
                            <button
                              onClick={() => onMoveTask(task.id, nextStatus)}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                              title="Move forward"
                            >
                              <ArrowRight size={12} />
                            </button>
                          )}
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
