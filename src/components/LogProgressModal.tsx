import React, { useMemo, useState, useEffect } from 'react';
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
  const [hours, setHours] = useState<number>(1);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedTaskId(tasks[0]?.id || '');
      setHours(1);
      setNotes('');
    }
  }, [isOpen, tasks]);

  const selected = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId),
    [tasks, selectedTaskId]
  );

  const remaining = selected
    ? Math.max(selected.timeEstimated - selected.timeLogged, 0)
    : 0;
  const afterLog = selected ? selected.timeLogged + hours : hours;
  const overEstimate = selected ? afterLog > selected.timeEstimated : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || hours <= 0) return;
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
            <div>
              <h3 className="text-base font-semibold text-slate-800">Log hours worked</h3>
              <p className="text-[10px] text-slate-500">Add time you actually spent on a task</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Task</label>
            <select value={selectedTaskId} onChange={(e) => setSelectedTaskId(e.target.value)} className="input-field" required>
              <option value="">Choose a task…</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} · {t.timeLogged}/{t.timeEstimated}h
                </option>
              ))}
            </select>
          </div>

          {selected && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Planned (estimate)</span>
                <span className="font-bold text-slate-800">{selected.timeEstimated}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Already logged</span>
                <span className="font-bold text-slate-800">{selected.timeLogged}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Still within plan</span>
                <span className="font-bold text-slate-800">{remaining}h left</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full ${overEstimate ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{
                    width: `${Math.min(
                      (selected.timeLogged / Math.max(selected.timeEstimated, 0.1)) * 100,
                      100
                    )}%`
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Hours spent this session: <span className="font-mono text-slate-900">{hours}h</span>
            </label>
            <input
              type="range"
              min={0.5}
              max={12}
              step={0.5}
              value={hours}
              onChange={(e) => setHours(parseFloat(e.target.value))}
              className="w-full accent-neutral-800 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0.5h</span>
              <span>12h</span>
            </div>
            {overEstimate && (
              <p className="text-[11px] text-amber-700 font-semibold mt-2">
                This will put the task over its estimate ({afterLog}h / {selected?.timeEstimated}h).
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">What did you work on? *</label>
            <textarea
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Short note about the work done…"
              className="input-field resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer">
              Cancel
            </button>
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary px-5 py-2 text-sm">
              Save {hours}h
            </motion.button>
          </div>
        </form>
      </div>
    </AnimatedModal>
  );
}
