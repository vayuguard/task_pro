import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Task, User, TaskPriority, UserRole } from '../types';
import { enrichUserWithEmail } from '../utils/tasks';
import { nowTimestamp, defaultDueDateInput, dueDateFromInput } from '../utils/time';
import { createInitialTiming } from '../utils/taskTiming';
import { TASK_PRIORITIES } from '../utils/priority';
import { AnimatedModal } from './ui/motion';

interface NewTaskModalProps {
  onClose: () => void;
  onAddTask: (task: Task) => void;
  currentUser: User;
  userRole: UserRole;
  teamMembers: User[];
}

export default function NewTaskModal({ onClose, onAddTask, currentUser, userRole, teamMembers }: NewTaskModalProps) {
  const isAdmin = userRole === 'admin';
  const self = enrichUserWithEmail(currentUser);

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [assignee, setAssignee] = useState<User>(self);
  const [description, setDescription] = useState('');
  const [timeEstimated, setTimeEstimated] = useState('4');
  const [dueDateInput, setDueDateInput] = useState(defaultDueDateInput());
  const [formError, setFormError] = useState('');

  const estimateHours = parseFloat(timeEstimated);
  const estimateValid = !Number.isNaN(estimateHours) && estimateHours > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!title.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (!estimateValid) {
      setFormError('Enter how many hours this task should take (e.g. 2, 4.5).');
      return;
    }
    if (!dueDateInput) {
      setFormError('Pick a due date.');
      return;
    }

    const taskAssignee = isAdmin ? enrichUserWithEmail(assignee) : self;
    const reporter = self;
    const hours = Math.round(estimateHours * 10) / 10;

    const timing = createInitialTiming();
    const newTask: Task = {
      id: `Task-${Date.now()}`,
      title: title.trim(),
      project: 'General',
      priority,
      status: 'To Do',
      description: description.trim() || 'No description provided.',
      assignee: taskAssignee,
      reporter,
      createdDate: dueDateFromInput(new Date().toISOString().slice(0, 10)),
      dueDate: dueDateFromInput(dueDateInput),
      labels: ['General'],
      timeLogged: 0,
      timeEstimated: hours,
      assignedAt: timing.assignedAt,
      statusHistory: timing.statusHistory,
      subtasks: [],
      attachments: [],
      activity: [{
        id: `act-${Date.now()}`,
        type: 'log',
        user: reporter,
        content: isAdmin
          ? `created in Backlog (${hours}h planned, due ${dueDateFromInput(dueDateInput)}) · assigned to ${taskAssignee.name} · timer starts in In Motion`
          : `created in Backlog with ${hours}h planned, due ${dueDateFromInput(dueDateInput)} · timer starts when moved to In Motion`,
        timestamp: nowTimestamp()
      }]
    };

    onAddTask(newTask);
    onClose();
  };

  return (
    <AnimatedModal open={true} onClose={onClose} className="max-w-lg">
      <div className="glass rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-slate-100/80 flex justify-between items-center bg-linear-to-r from-neutral-100/80 to-transparent">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isAdmin ? 'Create & Assign Task' : 'Create Task for Myself'}
            </h3>
            {!isAdmin && (
              <p className="text-xs text-slate-500 mt-0.5">Estimate how long it will take before you start.</p>
            )}
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {formError && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              {formError}
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full input-field"
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due date *</label>
              <input
                type="date"
                required
                value={dueDateInput}
                onChange={(e) => setDueDateInput(e.target.value)}
                className="w-full input-field"
              />
            </div>
          </div>

          <div className="rounded-2xl border-2 border-black/10 bg-[#c8ff00]/15 p-4 space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Estimated time to complete *
            </label>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              How many hours do you think this task will take? Used to track progress when you log work later
              (planned vs spent).
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                required
                min={0.5}
                step={0.5}
                value={timeEstimated}
                onChange={(e) => setTimeEstimated(e.target.value)}
                className="input-field max-w-[140px] font-mono font-bold"
                placeholder="e.g. 4"
              />
              <span className="text-sm font-semibold text-slate-700">hours</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[1, 2, 4, 8].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setTimeEstimated(String(h))}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border-2 border-black cursor-pointer ${
                    timeEstimated === String(h) ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#c8ff00]/50'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assign to</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {teamMembers.length === 0 ? (
                  <p className="text-xs text-slate-400 col-span-2">No team members yet. Create employees in Settings first.</p>
                ) : (
                  teamMembers.map((member) => (
                    <button
                      key={member.email || member.name}
                      type="button"
                      onClick={() => setAssignee(member)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left cursor-pointer text-sm ${
                        assignee.name === member.name
                          ? 'border-[#131b2e] bg-slate-50 font-semibold'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <img src={member.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                      <span className="truncate">{member.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional details…"
              className="input-field"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-lg cursor-pointer">
              Cancel
            </button>
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-accent px-5 py-2 text-sm">
              Create Task
            </motion.button>
          </div>
        </form>
      </div>
    </AnimatedModal>
  );
}
