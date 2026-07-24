import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Task } from '../types';
import { AnimatedModal } from './ui/motion';

interface LogProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onSubmit: (log: { taskId: string; hours: number; notes: string }) => void;
}

export default function LogProgressModal({ isOpen, onClose, tasks, onSubmit }: LogProgressModalProps) {
  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0]?.id || '');
  const [hours, setHours] = useState<number>(2);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId) return;
    onSubmit({ taskId: selectedTaskId, hours, notes: notes.trim() });
    setNotes('');
    onClose();
  };

  return (
    <AnimatedModal open={isOpen} onClose={onClose} className="max-w-md">
      <div className="glass rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-100/80 flex justify-between items-center bg-linear-to-r from-emerald-50/80 to-transparent">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">schedule</span>
            <h3 className="text-base font-semibold text-slate-800">Log Work Progress</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Task</label>
            <select value={selectedTaskId} onChange={(e) => setSelectedTaskId(e.target.value)} className="input-field">
              <option value="">Choose a task...</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Hours: {hours}h</label>
            <input type="range" min={0.5} max={12} step={0.5} value={hours} onChange={(e) => setHours(parseFloat(e.target.value))} className="w-full accent-neutral-800 cursor-pointer" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes</label>
            <textarea required value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="What did you work on?" className="input-field resize-none" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary px-5 py-2 text-sm">Submit</motion.button>
          </div>
        </form>
      </div>
    </AnimatedModal>
  );
}
