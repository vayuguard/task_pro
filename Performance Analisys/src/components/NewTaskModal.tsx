import React, { useState } from 'react';
import { X, ClipboardCheck, Sparkles } from 'lucide-react';
import { Task, Employee, TaskStatus, TaskPriority } from '../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onAddTask: (task: Task) => void;
}

export default function NewTaskModal({ isOpen, onClose, employees, onAddTask }: NewTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState('Cloud Migration');
  const [points, setPoints] = useState(5);
  const [assigneeId, setAssigneeId] = useState(employees[0]?.id || 'emp-1');
  const [dueDate, setDueDate] = useState('2026-07-28');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please fill out the Task Title and Description.');
      return;
    }

    const newTask: Task = {
      id: `task-${Date.now().toString().slice(-4)}`,
      title,
      description,
      status: 'todo' as TaskStatus,
      priority,
      assigneeId,
      dueDate,
      points,
      category,
      comments: []
    };

    onAddTask(newTask);
    
    // Reset states
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategory('Cloud Migration');
    setPoints(5);
    setAssigneeId(employees[0]?.id || 'emp-1');
    setDueDate('2026-07-28');
    
    onClose();
  };

  return (
    <div id="new-task-modal-overlay" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div id="new-task-modal-card" className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
          <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" /> Register New Agile Task
          </h4>
          <button
            id="new-task-modal-close-btn"
            onClick={onClose}
            className="p-1 hover:bg-slate-200/60 text-slate-400 hover:text-slate-800 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form scroll container */}
        <form id="new-task-modal-form" onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          {/* Task Title */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Task Title</label>
            <input
              id="new-task-title-input"
              type="text"
              placeholder="e.g. Optimize staging DB indexing..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-400"
              required
            />
          </div>

          {/* Task Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Task Description & Brief</label>
            <textarea
              id="new-task-desc-textarea"
              placeholder="Provide clean instructions, setup parameters, and goal checkpoints..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-400 leading-relaxed"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Assignee */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assignee</label>
              <select
                id="new-task-assignee-select"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-slate-400 cursor-pointer"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                ))}
              </select>
            </div>

            {/* Project Category */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Project Category</label>
              <select
                id="new-task-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-slate-400 cursor-pointer"
              >
                <option value="Cloud Migration">Cloud Migration</option>
                <option value="API Refactor">API Refactor</option>
                <option value="Mobile App UI">Mobile App UI</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Priority */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Priority</label>
              <select
                id="new-task-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs outline-none focus:border-slate-400 cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Complexity points */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Complexity Points</label>
              <input
                id="new-task-points-input"
                type="number"
                min={1}
                max={21}
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-400"
              />
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Due Date</label>
              <input
                id="new-task-date-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* Dialog Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
            <button
              id="new-task-modal-cancel"
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              id="new-task-modal-submit"
              type="submit"
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Add Task to Queue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
