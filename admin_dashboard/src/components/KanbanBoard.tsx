import { useState, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority, TabType } from '../types';

interface KanbanBoardProps {
  tasks: Task[];
  searchQuery: string;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onAddTask: (task: Omit<Task, 'id' | 'timeAgo' | 'dateCreated' | 'comments'>) => void;
  onDeleteTask: (taskId: string) => void;
  setActiveTab: (tab: TabType) => void;
  setSelectedTaskId: (id: string) => void;
}

const COLUMNS: { id: TaskStatus; label: string; bg: string; text: string; ring: string }[] = [
  { id: 'todo', label: 'To Do', bg: 'bg-slate-50 border-slate-200', text: 'text-slate-700', ring: 'ring-slate-100' },
  { id: 'in_progress', label: 'In Progress', bg: 'bg-sky-50/40 border-sky-100', text: 'text-sky-800', ring: 'ring-sky-100/50' },
  { id: 'in_review', label: 'In Review', bg: 'bg-amber-50/40 border-amber-100', text: 'text-amber-800', ring: 'ring-amber-100/50' },
  { id: 'done', label: 'Done', bg: 'bg-emerald-50/40 border-emerald-100', text: 'text-emerald-800', ring: 'ring-emerald-100/50' }
];

export default function KanbanBoard({
  tasks,
  searchQuery,
  onUpdateTaskStatus,
  onAddTask,
  onDeleteTask,
  setActiveTab,
  setSelectedTaskId
}: KanbanBoardProps) {
  // Input tracking for quick additions
  const [quickTitles, setQuickTitles] = useState<Record<TaskStatus, string>>({
    todo: '',
    in_progress: '',
    in_review: '',
    done: ''
  });

  // Search filter
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (searchQuery.trim() === '') return true;
      const query = searchQuery.toLowerCase();
      return t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query);
    });
  }, [tasks, searchQuery]);

  // Group tasks by status
  const columnsData = useMemo(() => {
    const data: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      in_review: [],
      done: []
    };
    filteredTasks.forEach((t) => {
      if (data[t.status]) {
        data[t.status].push(t);
      }
    });
    return data;
  }, [filteredTasks]);

  const handleQuickAdd = (status: TaskStatus) => {
    const title = quickTitles[status];
    if (!title.trim()) return;

    onAddTask({
      title,
      description: 'Quickly provisioned from Kanban Board interface.',
      status,
      priority: 'medium',
      division: 'Operations',
      assignees: ['Marcus Thorne'],
      subtasks: []
    });

    setQuickTitles({
      ...quickTitles,
      [status]: ''
    });
  };

  const shiftStatus = (task: Task, direction: 'left' | 'right') => {
    const statusOrder: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'done'];
    const currentIndex = statusOrder.indexOf(task.status);
    let targetIndex = currentIndex;

    if (direction === 'left' && currentIndex > 0) {
      targetIndex -= 1;
    } else if (direction === 'right' && currentIndex < statusOrder.length - 1) {
      targetIndex += 1;
    }

    if (targetIndex !== currentIndex) {
      onUpdateTaskStatus(task.id, statusOrder[targetIndex]);
    }
  };

  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'high': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium': return 'bg-sky-100 text-sky-800 border-sky-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleInspect = (id: string) => {
    setSelectedTaskId(id);
    setActiveTab('task_details');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h2 className="text-[28px] font-bold text-slate-900 tracking-tight">Kanban Board</h2>
          <p className="text-slate-500 text-sm mt-1">
            Visual task lifecycle pipelines. Move tasks across lanes or schedule immediate tickets.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">info</span>
          <span>Click arrows or use quick inputs to organize workspace status.</span>
        </div>
      </div>

      {/* Grid containing Columns */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {COLUMNS.map((col) => {
          const colTasks = columnsData[col.id] || [];
          return (
            <div key={col.id} className="col-span-12 md:col-span-6 xl:col-span-3 flex flex-col max-h-[75vh]">
              {/* Column Header */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${col.bg} ${col.text}`}>
                    {col.label}
                  </span>
                  <span className="text-xs text-slate-400 font-bold font-mono">({colTasks.length})</span>
                </div>
              </div>

              {/* Column Card Body container */}
              <div className="bg-slate-100/50 border border-slate-200/60 rounded-xl p-3 space-y-3.5 overflow-y-auto min-h-[300px] max-h-[55vh]">
                {colTasks.length > 0 ? (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-slate-300 transition-all duration-150 group flex flex-col justify-between hover:shadow"
                    >
                      <div>
                        {/* Tags */}
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityStyle(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium font-mono">{task.division}</span>
                        </div>

                        {/* Title */}
                        <h4
                          onClick={() => handleInspect(task.id)}
                          className="font-bold text-slate-800 text-[13px] leading-snug cursor-pointer hover:text-sky-600 transition-colors line-clamp-2"
                        >
                          {task.title}
                        </h4>

                        {/* Description snippet */}
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-normal">
                          {task.description}
                        </p>
                      </div>

                      {/* Card Actions & Meta */}
                      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                        
                        {/* Shift Controls (Arrows for reliable sandboxed movement) */}
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg py-0.5 px-1 gap-1 shrink-0">
                          <button
                            onClick={() => shiftStatus(task, 'left')}
                            disabled={col.id === 'todo'}
                            className={`p-0.5 rounded ${col.id === 'todo' ? 'text-slate-200' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'}`}
                            title="Move Lane Left"
                          >
                            <span className="material-symbols-outlined text-[15px] font-bold">arrow_back</span>
                          </button>
                          <span className="w-px h-3.5 bg-slate-200" />
                          <button
                            onClick={() => shiftStatus(task, 'right')}
                            disabled={col.id === 'done'}
                            className={`p-0.5 rounded ${col.id === 'done' ? 'text-slate-200' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'}`}
                            title="Move Lane Right"
                          >
                            <span className="material-symbols-outlined text-[15px] font-bold">arrow_forward</span>
                          </button>
                        </div>

                        {/* Assignees & Delete */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (confirm('Permanently decommission this task from TaskPro ledger?')) {
                                onDeleteTask(task.id);
                              }
                            }}
                            className="text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 p-1"
                            title="Decommission Task"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                          
                          <div className="flex -space-x-1">
                            {task.assignees.slice(0, 2).map((assignee) => (
                              <div
                                key={assignee}
                                title={assignee}
                                className="w-5.5 h-5.5 rounded-full border border-white bg-slate-800 text-white text-[8px] font-black flex items-center justify-center shrink-0 shadow-sm"
                              >
                                {assignee.charAt(0)}
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-300 text-[11px] font-mono">
                    Empty Pipeline Lane
                  </div>
                )}
              </div>

              {/* Quick Task addition input drawer */}
              <div className="mt-3">
                <div className="flex bg-white border border-slate-200 rounded-lg p-1.5 focus-within:border-slate-400">
                  <input
                    type="text"
                    value={quickTitles[col.id]}
                    onChange={(e) => setQuickTitles({ ...quickTitles, [col.id]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuickAdd(col.id);
                    }}
                    placeholder="Add quick ticket..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-xs text-slate-800 px-2 placeholder-slate-300"
                  />
                  <button
                    onClick={() => handleQuickAdd(col.id)}
                    className="p-1 bg-slate-900 text-white hover:bg-slate-800 transition-all rounded flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
