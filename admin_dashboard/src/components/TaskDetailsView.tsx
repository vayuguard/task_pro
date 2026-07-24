import { useState, useMemo, FormEvent } from 'react';
import { Task, TaskStatus, TaskPriority, DivisionType } from '../types';

interface TaskDetailsViewProps {
  tasks: Task[];
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string) => void;
  onUpdateTask: (task: Task) => void;
}

export default function TaskDetailsView({
  tasks,
  selectedTaskId,
  setSelectedTaskId,
  onUpdateTask
}: TaskDetailsViewProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // Find the currently selected task, or fall back to the first task if not specified
  const currentTask = useMemo(() => {
    if (!selectedTaskId && tasks.length > 0) {
      return tasks[0];
    }
    return tasks.find(t => t.id === selectedTaskId) || tasks[0] || null;
  }, [tasks, selectedTaskId]);

  // Sync back selected ID if we auto-picked on load
  useState(() => {
    if (!selectedTaskId && currentTask) {
      setSelectedTaskId(currentTask.id);
    }
  });

  const subtaskProgress = useMemo(() => {
    if (!currentTask || !currentTask.subtasks || currentTask.subtasks.length === 0) return 0;
    const completed = currentTask.subtasks.filter(s => s.completed).length;
    return Math.round((completed / currentTask.subtasks.length) * 100);
  }, [currentTask]);

  if (!currentTask) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs animate-fade-in">
        <span className="material-symbols-outlined text-5xl mb-2 text-slate-300">assignment_late</span>
        <p className="font-bold">No tasks found inside TaskPro Ledger</p>
        <p className="mt-1">Deploy a new task first using the sidebar control.</p>
      </div>
    );
  }

  // Toggling subtask completion
  const toggleSubtask = (subId: string) => {
    const updatedSubtasks = currentTask.subtasks.map(s => {
      if (s.id === subId) return { ...s, completed: !s.completed };
      return s;
    });
    onUpdateTask({
      ...currentTask,
      subtasks: updatedSubtasks
    });
  };

  // Adding new subtask
  const handleAddSubtask = (e: FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSub = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false
    };

    onUpdateTask({
      ...currentTask,
      subtasks: [...(currentTask.subtasks || []), newSub]
    });
    setNewSubtaskTitle('');
  };

  // Adding comment
  const handleAddComment = (e: FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment = {
      id: `comm-${Date.now()}`,
      user: 'Marcus Thorne',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKWPkJfegr9YENVXozHwAK3Xtv6oBBqUylwH3ZfjPCcjB59-QlIEAn1xy9Kc3rK8GcO-UEfUuUWkmVulLZyxMTdPIOleQd9kr_1fKLb2Oj-py3jCa6sObu5maRlA8jpqTVSwOxtZAhzAUxyv56q0m_RtYQasPpif1WfriwzO3nfRZ66adACpjhmPoybkQ8_cj9_M4ydArSa0yXweEkEs4w5Jsaf18eKzgczVL8n6P9-lyoewCx3IXIliZUeiAZvtQNcNY8nyiHEJZS',
      text: newCommentText.trim(),
      date: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    onUpdateTask({
      ...currentTask,
      comments: [...(currentTask.comments || []), newComment]
    });
    setNewCommentText('');
  };

  const updateMeta = (field: 'priority' | 'status' | 'division', value: string) => {
    onUpdateTask({
      ...currentTask,
      [field]: value
    });
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'high': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium': return 'bg-sky-100 text-sky-800 border-sky-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Selector & Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-[28px] font-bold text-slate-900 tracking-tight">Task Details</h2>
          <p className="text-slate-500 text-sm mt-1">Deep-dive inspect panel, sub-task tracking, and audit threads.</p>
        </div>

        {/* Task dropdown picker */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Task:</label>
          <div className="relative">
            <select
              value={currentTask.id}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 focus:outline-none focus:border-slate-400 cursor-pointer shadow-sm w-64 text-ellipsis whitespace-nowrap overflow-hidden"
            >
              {tasks.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none text-base">
              keyboard_arrow_down
            </span>
          </div>
        </div>
      </div>

      {/* Main details body layout split 12 columns */}
      <div className="grid grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Main Details & Comments) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Main Card */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(currentTask.priority)}`}>
                  {currentTask.priority}
                </span>
                <span className="text-xs text-slate-400 font-mono">{currentTask.division} Division</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">{currentTask.title}</h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed font-sans whitespace-pre-wrap">
              {currentTask.description}
            </p>

            {/* Checklist module */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Assigned Sub-tasks Checklist</h4>
                  <p className="text-slate-400 text-xs mt-0.5">Maintain granular progression indicators</p>
                </div>
                <span className="text-xs font-mono font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded">
                  {subtaskProgress}% Complete
                </span>
              </div>

              {/* Checklist Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>

              {/* Checklist items */}
              <div className="space-y-2">
                {currentTask.subtasks && currentTask.subtasks.length > 0 ? (
                  currentTask.subtasks.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => toggleSubtask(sub.id)}
                      className="w-full flex items-center gap-3 py-2 px-3 hover:bg-slate-50 border border-slate-100 rounded-lg text-left transition-colors text-sm border-none select-none cursor-pointer"
                    >
                      <span className={`material-symbols-outlined text-lg ${sub.completed ? 'text-sky-500 font-bold' : 'text-slate-300'}`}>
                        {sub.completed ? 'check_box' : 'check_box_outline_blank'}
                      </span>
                      <span className={`flex-1 text-[13px] ${sub.completed ? 'line-through text-slate-400 font-medium' : 'text-slate-700 font-medium'}`}>
                        {sub.title}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-2">No sub-tasks cataloged. Use the input below to add some.</p>
                )}
              </div>

              {/* Add subtask */}
              <form onSubmit={handleAddSubtask} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Insert checklist item target..."
                  className="flex-1 px-3.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 text-slate-800 bg-white placeholder-slate-300"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shrink-0"
                >
                  Add Item
                </button>
              </form>
            </div>
          </div>

          {/* Comments thread card */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h4 className="text-sm font-bold text-slate-800">Operational Audit Comments ({currentTask.comments?.length || 0})</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">Secure ledger record logs</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Comment stack */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {currentTask.comments && currentTask.comments.length > 0 ? (
                  currentTask.comments.map((comm) => (
                    <div key={comm.id} className="flex gap-3 text-sm items-start">
                      <img
                        src={comm.avatar}
                        alt={comm.user}
                        className="w-8 h-8 rounded-full border border-slate-200 object-cover shrink-0 mt-0.5"
                      />
                      <div className="flex-1 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs text-slate-800">{comm.user}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{comm.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans">{comm.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">No audit updates. Post the first response below.</p>
                )}
              </div>

              {/* Add comment response form */}
              <form onSubmit={handleAddComment} className="space-y-3 pt-3 border-t border-slate-100">
                <textarea
                  rows={2}
                  required
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Record an operational log or checklist block..."
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 placeholder-slate-300 text-slate-800"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow active:translate-y-[1px]"
                  >
                    Post Audit Update
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* Right Column (Meta Settings Sidebar) */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden p-6 space-y-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Ticket Parameters</h4>

          {/* Parameter details */}
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-400">Workflow Phase</span>
              <select
                value={currentTask.status}
                onChange={(e) => updateMeta('status', e.target.value)}
                className="bg-slate-100 font-bold text-slate-700 px-2 py-1 rounded border border-slate-200 outline-none text-right cursor-pointer text-xs"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-400">Severity Metric</span>
              <select
                value={currentTask.priority}
                onChange={(e) => updateMeta('priority', e.target.value)}
                className="bg-slate-100 font-bold text-slate-700 px-2 py-1 rounded border border-slate-200 outline-none text-right cursor-pointer text-xs"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Severity</option>
                <option value="urgent">Critical (Urgent)</option>
              </select>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-400">Division Origin</span>
              <select
                value={currentTask.division}
                onChange={(e) => updateMeta('division', e.target.value)}
                className="bg-slate-100 font-bold text-slate-700 px-2 py-1 rounded border border-slate-200 outline-none text-right cursor-pointer text-xs"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Operations">Operations</option>
                <option value="Marketing">Marketing</option>
                <option value="Security">Security</option>
              </select>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
              <span className="font-semibold text-slate-400">Creation Date</span>
              <span className="font-mono text-slate-600 font-bold">{currentTask.dateCreated}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-400">Time Interval</span>
              <span className="text-slate-600 font-bold">{currentTask.timeAgo}</span>
            </div>
          </div>

          {/* Assignees visual representation */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Deployed Assignees</label>
            <div className="flex flex-wrap gap-2">
              {currentTask.assignees && currentTask.assignees.length > 0 ? (
                currentTask.assignees.map(name => (
                  <span
                    key={name}
                    className="px-2.5 py-1 bg-slate-50 text-slate-700 rounded-full border border-slate-200 font-semibold text-[10px] flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 bg-sky-500 rounded-full shrink-0" />
                    <span>{name}</span>
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-400 font-medium">Unassigned Ticket</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
