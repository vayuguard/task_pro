import React, { useState } from 'react';
import { Task, User, TaskPriority, TaskStatus } from '../types';
import { teamMembers } from '../initialData';

interface NewTaskModalProps {
  onClose: () => void;
  onAddTask: (task: Task) => void;
}

export default function NewTaskModal({ onClose, onAddTask }: NewTaskModalProps) {
  const [title, setTitle] = useState('');
  const [project, setProject] = useState('Website Redesign');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [assignee, setAssignee] = useState<User>(teamMembers[0]);
  const [description, setDescription] = useState('');
  const [timeEstimated, setTimeEstimated] = useState('8');
  const [dueDate, setDueDate] = useState('Oct 28, 2023');
  const [labelsText, setLabelsText] = useState('Product, Security');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please provide a task title.');
      return;
    }

    const labels = labelsText
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const randomIdNumber = Math.floor(Math.random() * 90) + 110;
    
    const newTask: Task = {
      id: `Task-${randomIdNumber}`,
      title: title.trim(),
      project,
      priority,
      status: 'To Do',
      description: description.trim() || 'No additional description provided.',
      assignee,
      reporter: teamMembers[1], // Sarah Chen
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dueDate: dueDate.trim() || 'Oct 31, 2023',
      labels,
      timeLogged: 0,
      timeEstimated: parseFloat(timeEstimated) || 8,
      subtasks: [
        { id: `sub-${Date.now()}-1`, title: 'Review requirements and draft implementation specification', completed: false }
      ],
      attachments: [],
      activity: [
        {
          id: `act-${Date.now()}`,
          type: 'log',
          user: teamMembers[1], // Sarah Chen
          content: `created this task and assigned to ${assignee.name}`,
          timestamp: 'Just now'
        }
      ]
    };

    onAddTask(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-fade-in">
      <div className="bg-white rounded-xl w-full max-w-2xl border border-[#c6c6cd] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">Create New Workspace Task</h3>
            <p className="text-[10px] text-slate-500">Add detailed instructions, assign ownership, and allocate hour estimates.</p>
          </div>
          <button
            onClick={onClose}
            className="material-symbols-outlined text-slate-500 hover:text-black hover:bg-slate-200 p-1 rounded cursor-pointer transition-colors"
          >
            close
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-xs">
          
          {/* Title input */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-700 uppercase tracking-wider">Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement WebAuthn passwordless signup"
              className="w-full border border-[#c6c6cd] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-800"
            />
          </div>

          {/* Project & Priority row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider">Project Scope</label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full border border-[#c6c6cd] bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-800"
              >
                <option value="Website Redesign">Website Redesign</option>
                <option value="Infrastructure Setup">Infrastructure Setup</option>
                <option value="Mobile App Development">Mobile App Development</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider">Priority Level</label>
              <div className="flex gap-2">
                {(['High', 'Medium', 'Low'] as TaskPriority[]).map((p) => {
                  const active = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2 rounded-lg font-bold text-center border cursor-pointer transition-all ${
                        active 
                          ? p === 'High' 
                            ? 'bg-red-50 text-red-700 border-red-300 ring-2 ring-red-100' 
                            : p === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border-amber-300 ring-2 ring-amber-100'
                            : 'bg-slate-50 text-slate-700 border-slate-300 ring-2 ring-slate-100'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Assignee Selection dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-700 uppercase tracking-wider">Assign Ownership</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {teamMembers.map((member) => {
                const active = assignee.name === member.name;
                return (
                  <button
                    key={member.name}
                    type="button"
                    onClick={() => setAssignee(member)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left cursor-pointer transition-all ${
                      active
                        ? 'border-slate-800 bg-slate-50 ring-2 ring-slate-100 font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <img
                      className="w-6 h-6 rounded-full object-cover"
                      src={member.avatar}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-slate-800 font-bold truncate leading-tight">{member.name.split(' ')[0]}</span>
                      <span className="text-[8px] text-slate-400 truncate leading-none mt-0.5">{member.role?.split(' ')[0]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Estimation & Due Date row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider">Estimated Hours</label>
              <input
                type="number"
                min="1"
                max="100"
                value={timeEstimated}
                onChange={(e) => setTimeEstimated(e.target.value)}
                className="w-full border border-[#c6c6cd] rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider">Due Date</label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-[#c6c6cd] rounded-lg px-3 py-2 text-sm focus:outline-none font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider">Labels (Comma-split)</label>
              <input
                type="text"
                value={labelsText}
                onChange={(e) => setLabelsText(e.target.value)}
                placeholder="Marketing, Spec, Design"
                className="w-full border border-[#c6c6cd] rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Description area */}
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-slate-700 uppercase tracking-wider">Task Details & Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State clear deliverables, requirements, and reference parameters..."
              className="w-full border border-[#c6c6cd] rounded-lg p-3 text-sm min-h-[100px] focus:outline-none focus:ring-1 focus:ring-slate-800"
            />
          </div>

          {/* Actions panel */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-[#c6c6cd] bg-white rounded-lg font-semibold hover:bg-slate-50 transition-all cursor-pointer text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#131b2e] text-white rounded-lg font-bold hover:opacity-95 transition-all shadow-sm cursor-pointer"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
