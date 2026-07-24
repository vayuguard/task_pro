import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Task, TaskPriority, TaskStatus, SubTask } from '../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'comments' | 'commentsCount' | 'files'>) => void;
  projects: string[];
  teamMembers: Array<{ name: string; avatar: string }>;
}

export function NewTaskModal({ isOpen, onClose, onSubmit, projects, teamMembers }: NewTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState(projects[0] || 'Enterprise Platform Modernization Project');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState('2026-07-20');
  const [dueTime, setDueTime] = useState('17:00');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(['Alex Rivera']);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      setSubtasks([...subtasks, newSubtaskTitle.trim()]);
      setNewSubtaskTitle('');
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleToggleAssignee = (name: string) => {
    if (selectedAssignees.includes(name)) {
      setSelectedAssignees(selectedAssignees.filter(a => a !== name));
    } else {
      setSelectedAssignees([...selectedAssignees, name]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please provide a task title');
      return;
    }

    const formattedSubtasks: SubTask[] = subtasks.map((st, index) => ({
      id: `sub-new-${Date.now()}-${index}`,
      title: st,
      completed: false
    }));

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      project,
      priority,
      status,
      dueDate,
      dueTime,
      assignees: selectedAssignees,
      subtasks: formattedSubtasks
    });

    // Reset fields
    setTitle('');
    setDescription('');
    setProject(projects[0] || 'Enterprise Platform Modernization Project');
    setPriority('medium');
    setStatus('todo');
    setDueDate('2026-07-20');
    setDueTime('17:00');
    setSelectedAssignees(['Alex Rivera']);
    setSubtasks([]);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-base font-semibold text-slate-800">Create New Enterprise Task</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 max-h-[80vh] custom-scrollbar">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g. Optimize Cloud Run database connection pooling"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea 
              placeholder="Detailed specifications, goals, and architectural impacts..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Project */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Project
              </label>
              <select 
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-all"
              >
                {projects.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select 
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-all text-slate-800"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Due Date
              </label>
              <input 
                type="date" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-all"
              />
            </div>

            {/* Due Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Due Time
              </label>
              <input 
                type="time" 
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-all"
              />
            </div>
          </div>

          {/* Status Select for Kanban Board alignment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Initial Kanban Column
            </label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-all"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Assignees Checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Assignees
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {teamMembers.map(member => (
                <button
                  type="button"
                  key={member.name}
                  onClick={() => handleToggleAssignee(member.name)}
                  className={`flex items-center gap-2 p-1.5 rounded text-left transition-all text-xs border ${
                    selectedAssignees.includes(member.name)
                      ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                      : 'border-transparent text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <img 
                    src={member.avatar} 
                    alt={member.name} 
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover" 
                  />
                  <span>{member.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subtasks Builder */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Subtasks / Execution Steps
            </label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                placeholder="Add checklist subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="bg-slate-800 hover:bg-slate-900 text-white rounded-lg px-3 py-1.5 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Plus size={14} />
              </button>
            </div>
            {subtasks.length > 0 && (
              <ul className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100 max-h-36 overflow-y-auto">
                {subtasks.map((st, idx) => (
                  <li key={idx} className="flex items-center justify-between text-xs text-slate-700 bg-white px-2 py-1.5 rounded border border-slate-100">
                    <span className="truncate pr-2">{st}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(idx)}
                      className="text-slate-400 hover:text-rose-500 p-0.5 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors font-semibold cursor-pointer"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface LogProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onSubmit: (log: { taskId: string; hours: number; notes: string }) => void;
}

export function LogProgressModal({ isOpen, onClose, tasks, onSubmit }: LogProgressModalProps) {
  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0]?.id || '');
  const [hours, setHours] = useState<number>(2);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId) {
      alert('Please select a task to log progress against');
      return;
    }
    onSubmit({
      taskId: selectedTaskId,
      hours,
      notes: notes.trim()
    });
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-base font-semibold text-slate-800">Log Daily Work Progress</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Select Task */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Enterprise Task
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-all"
            >
              <option value="">-- Choose a Task --</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>
                  [{t.project.split(' ').slice(0, 2).join(' ')}] {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Effort Hours */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Hours Logged
            </label>
            <div className="flex items-center gap-2">
              <input 
                type="range" 
                min={0.5} 
                max={12} 
                step={0.5} 
                value={hours}
                onChange={(e) => setHours(parseFloat(e.target.value))}
                className="flex-1 accent-blue-500 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
              />
              <span className="w-12 text-center text-sm font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">
                {hours}h
              </span>
            </div>
          </div>

          {/* Effort Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Activity Notes
            </label>
            <textarea 
              required
              placeholder="What did you implement, resolve, or audit? e.g. Patched package-lock security issues, verified dev deployment."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors font-semibold cursor-pointer"
            >
              Submit Work Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
