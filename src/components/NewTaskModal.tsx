import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Task, User, TaskPriority, UserRole } from '../types';
import { enrichUserWithEmail } from '../utils/tasks';
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
  const [timeEstimated, setTimeEstimated] = useState('8');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  );
  const [labelsText, setLabelsText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const labels = labelsText
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);

    const taskAssignee = isAdmin ? enrichUserWithEmail(assignee) : self;
    const reporter = self;

    const newTask: Task = {
      id: `Task-${Date.now()}`,
      title: title.trim(),
      project: 'General',
      priority,
      status: 'To Do',
      description: description.trim() || 'No description provided.',
      assignee: taskAssignee,
      reporter,
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dueDate,
      labels: labels.length ? labels : ['General'],
      timeLogged: 0,
      timeEstimated: parseFloat(timeEstimated) || 8,
      subtasks: [],
      attachments: [],
      activity: [{
        id: `act-${Date.now()}`,
        type: 'log',
        user: reporter,
        content: isAdmin
          ? `created and assigned to ${taskAssignee.name}`
          : 'created this task for themselves',
        timestamp: 'Just now'
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
              <p className="text-xs text-slate-500 mt-0.5">This task will be assigned to you.</p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
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
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
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
