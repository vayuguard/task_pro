import { useState, FormEvent } from 'react';
import { Task, TaskStatus, TaskPriority, DivisionType } from '../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'timeAgo' | 'dateCreated' | 'comments'>) => void;
}

const AVAILABLE_ASSIGNEES = ['Sarah Chen', 'Marcus Thorne', 'System Admin', 'Cloud Sentinel', 'Emily Rose'];
const DIVISIONS: DivisionType[] = ['Engineering', 'Product', 'Operations', 'Marketing', 'Security'];

export default function NewTaskModal({ isOpen, onClose, onSave }: NewTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [division, setDivision] = useState<DivisionType>('Engineering');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title,
      description,
      status,
      priority,
      division,
      assignees: selectedAssignees,
      subtasks: []
    });

    // Reset fields
    setTitle('');
    setDescription('');
    setStatus('todo');
    setPriority('medium');
    setDivision('Engineering');
    setSelectedAssignees([]);
    onClose();
  };

  const toggleAssignee = (name: string) => {
    if (selectedAssignees.includes(name)) {
      setSelectedAssignees(selectedAssignees.filter(a => a !== name));
    } else {
      setSelectedAssignees([...selectedAssignees, name]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-500">add_task</span>
              <span>Create New Task</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Provision a new operational item in the project ledger</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Title */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Conduct Vulnerability Analysis on server subnet"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 placeholder-slate-300 text-slate-800"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
            <textarea
              placeholder="Describe the technical guidelines, deliverables, and targets..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-400 placeholder-slate-300 text-slate-800"
            />
          </div>

          {/* Selector Row 1 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Division</label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value as DivisionType)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 text-slate-800 bg-white"
              >
                {DIVISIONS.map(div => (
                  <option key={div} value={div}>{div}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 text-slate-800 bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Selector Row 2 */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Workflow Status</label>
            <div className="grid grid-cols-4 gap-2">
              {(['todo', 'in_progress', 'in_review', 'done'] as TaskStatus[]).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`py-2 px-1 text-[11px] font-bold rounded-lg border text-center uppercase tracking-wider transition-all ${
                    status === st
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Assignees Selection */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assign Team Members</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {AVAILABLE_ASSIGNEES.map((name) => {
                const isSelected = selectedAssignees.includes(name);
                return (
                  <button
                    type="button"
                    key={name}
                    onClick={() => toggleAssignee(name)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-sky-50 border-sky-200 text-sky-800 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {isSelected ? 'check_circle' : 'person_add'}
                    </span>
                    <span>{name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow active:translate-y-[1px]"
          >
            Deploy Task
          </button>
        </div>

      </div>
    </div>
  );
}
