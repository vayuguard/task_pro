import React, { useMemo } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Eye, 
  Clock 
} from 'lucide-react';
import { Task, Employee, TaskStatus } from '../types';

interface KanbanProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  employees: Employee[];
  onTaskSelect: (task: Task) => void;
  onNewTaskClick: () => void;
}

export default function KanbanBoard({ 
  tasks, 
  setTasks, 
  employees, 
  onTaskSelect,
  onNewTaskClick
}: KanbanProps) {
  
  // Group tasks by their current status
  const columns = useMemo(() => {
    return {
      todo: {
        id: 'todo' as TaskStatus,
        title: 'To Do',
        color: 'border-t-slate-400 bg-slate-100/50',
        tasks: tasks.filter(t => t.status === 'todo'),
      },
      in_progress: {
        id: 'in_progress' as TaskStatus,
        title: 'In Progress',
        color: 'border-t-blue-500 bg-blue-50/20',
        tasks: tasks.filter(t => t.status === 'in_progress'),
      },
      review: {
        id: 'review' as TaskStatus,
        title: 'In Review',
        color: 'border-t-amber-500 bg-amber-50/20',
        tasks: tasks.filter(t => t.status === 'review'),
      },
      done: {
        id: 'done' as TaskStatus,
        title: 'Completed',
        color: 'border-t-emerald-500 bg-emerald-50/20',
        tasks: tasks.filter(t => t.status === 'done'),
      },
    };
  }, [tasks]);

  const moveTask = (taskId: string, currentStatus: TaskStatus, direction: 'left' | 'right') => {
    const statusOrder: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    let nextIndex = currentIndex;
    if (direction === 'left' && currentIndex > 0) nextIndex -= 1;
    if (direction === 'right' && currentIndex < statusOrder.length - 1) nextIndex += 1;
    
    if (nextIndex !== currentIndex) {
      const nextStatus = statusOrder[nextIndex];
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: nextStatus } : t));
    }
  };

  const getAssignee = (assigneeId: string) => {
    return employees.find(e => e.id === assigneeId) || {
      name: 'Unassigned',
      initials: 'UA',
      avatarBg: 'bg-slate-400',
      role: 'Staff'
    };
  };

  return (
    <div id="kanban-board-container" className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-64px)] flex flex-col h-full">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Sprint Kanban Board</h3>
          <p className="text-xs text-slate-400 mt-0.5">Manage tasks, timelines, and progress stages</p>
        </div>
        <button
          id="kanban-add-task-btn"
          onClick={onNewTaskClick}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Grid columns */}
      <div id="kanban-columns-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-grow items-start overflow-y-auto">
        {Object.values(columns).map((column: any) => (
          <div 
            id={`kanban-column-${column.id}`}
            key={column.id} 
            className={`rounded-xl border border-slate-200 border-t-4 p-4 space-y-4 flex flex-col min-h-[30rem] ${column.color}`}
          >
            {/* Column Header */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="font-bold text-xs text-slate-800 tracking-tight flex items-center gap-2">
                {column.id === 'done' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Circle className={`w-4 h-4 ${
                    column.id === 'todo' ? 'text-slate-400' :
                    column.id === 'in_progress' ? 'text-blue-500' :
                    'text-amber-500'
                  }`} />
                )}
                {column.title}
              </h4>
              <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-full">
                {column.tasks.length}
              </span>
            </div>

            {/* Column Task Cards */}
            <div className="space-y-3 overflow-y-auto max-h-[28rem] pr-1 flex-grow">
              {column.tasks.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-lg p-6 text-center text-[11px] text-slate-400 font-medium">
                  No tasks here
                </div>
              ) : (
                column.tasks.map((task) => {
                  const assignee = getAssignee(task.assigneeId);
                  return (
                    <div
                      id={`kanban-task-card-${task.id}`}
                      key={task.id}
                      className="bg-white rounded-lg border border-slate-200 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-md transition-all space-y-3 relative group"
                    >
                      {/* Priority and ID */}
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                          {task.id}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          task.priority === 'urgent' ? 'bg-red-50 text-red-600' :
                          task.priority === 'high' ? 'bg-amber-50 text-amber-700' :
                          task.priority === 'medium' ? 'bg-indigo-50 text-indigo-600' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Title */}
                      <h5 className="font-bold text-xs text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
                        {task.title}
                      </h5>

                      {/* Date and Points */}
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium">{task.dueDate}</span>
                        </div>
                        <span className="font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                          {task.points} pts
                        </span>
                      </div>

                      {/* Assignee & Controls footer */}
                      <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                        {/* Assignee initials bubble */}
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-6 h-6 rounded-full ${assignee.avatarBg} text-white flex items-center justify-center font-bold text-[9px] shadow-xs`}
                            title={`${assignee.name} - ${assignee.role}`}
                          >
                            {assignee.initials}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium truncate max-w-[5.5rem]">
                            {assignee.name}
                          </span>
                        </div>

                        {/* Ergonomic task progression controls */}
                        <div className="flex gap-1">
                          <button
                            id={`move-${task.id}-left`}
                            onClick={() => moveTask(task.id, column.id, 'left')}
                            disabled={column.id === 'todo'}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                            title="Move column left"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                          
                          <button
                            id={`inspect-${task.id}`}
                            onClick={() => onTaskSelect(task)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600 cursor-pointer"
                            title="Inspect full details"
                          >
                            <Eye className="w-3 h-3" />
                          </button>

                          <button
                            id={`move-${task.id}-right`}
                            onClick={() => moveTask(task.id, column.id, 'right')}
                            disabled={column.id === 'done'}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                            title="Move column right"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
