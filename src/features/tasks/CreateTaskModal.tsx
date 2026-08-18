import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useData } from '../../context/DataContext';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Task, TaskPriority } from '../../types';
import { TASK_PRIORITIES } from '../../utils/priority';
import { createInitialTiming } from '../../utils/taskTiming';
import { nowTimestamp, dueDateFromInput } from '../../utils/time';
import { canAssignToOthers } from '../../auth/auth';

export function CreateTaskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { session } = useAuth();
  const { addTask, teamMembers } = useData();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [project, setProject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  // Stored in business-hours (hours) to match the scoring + timers.
  const [estimate, setEstimate] = useState(2);
  const [estimateUnit, setEstimateUnit] = useState<'hours' | 'minutes' | 'days'>('hours');
  const [due, setDue] = useState('');
  const [assigneeIdx, setAssigneeIdx] = useState(0);
  const [loading, setLoading] = useState(false);

  const currentUser = session!.profile;
  const canAssign = canAssignToOthers(session!.role);
  const assignee = canAssign ? teamMembers[assigneeIdx] || currentUser : currentUser;

  const reset = () => {
    setTitle('');
    setProject('');
    setDescription('');
    setPriority('Medium');
    setEstimate(2);
    setEstimateUnit('hours');
    setDue('');
  };

  const unitToHours = (value: number, unit: typeof estimateUnit) => {
    if (!Number.isFinite(value)) return 0;
    if (unit === 'hours') return value;
    if (unit === 'minutes') return value / 60;
    return value * 8; // default 8 business hours per day
  };

  const hoursToUnit = (hours: number, unit: typeof estimateUnit) => {
    if (!Number.isFinite(hours)) return 0;
    if (unit === 'hours') return hours;
    if (unit === 'minutes') return hours * 60;
    return hours / 8;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    const id = `task-${Date.now()}`;
    const task: Task = {
      id,
      title: title.trim(),
      project: project.trim() || 'General',
      priority,
      status: 'To Do',
      description: description.trim(),
      assignee: { ...assignee, email: assignee.email || session!.email },
      reporter: { ...currentUser, email: session!.email },
      createdDate: nowTimestamp(),
      dueDate: due ? dueDateFromInput(due) : 'No due date',
      labels: [],
      timeEstimated: estimate,
      timeLogged: 0,
      subtasks: [],
      attachments: [],
      activity: [],
      timingTrust: 'certified',
      version: 0,
      ...createInitialTiming()
    };
    try {
      const created = await addTask(task);
      reset();
      onClose();
      navigate(`/tasks/${created.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New task">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input label="Project" value={project} onChange={(e) => setProject(e.target.value)} />
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[80px]" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Priority</label>
            <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="col-span-1 space-y-2">
            <Input
              label="Estimate amount"
              type="number"
              min={estimateUnit === 'minutes' ? 15 : estimateUnit === 'days' ? 0.25 : 0.5}
              step={estimateUnit === 'minutes' ? 15 : estimateUnit === 'days' ? 0.25 : 0.5}
              value={hoursToUnit(estimate, estimateUnit)}
              onChange={(e) => {
                const raw = parseFloat(e.target.value);
                if (Number.isNaN(raw)) return;
                setEstimate(unitToHours(raw, estimateUnit));
              }}
            />
            <div className="space-y-1">
              <label className="label">Unit</label>
              <select className="input" value={estimateUnit} onChange={(e) => setEstimateUnit(e.target.value as typeof estimateUnit)}>
                <option value="hours">Hours</option>
                <option value="minutes">Minutes</option>
                <option value="days">Days</option>
              </select>
            </div>
          </div>
        </div>
        <Input label="Due date" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
        {canAssign && teamMembers.length > 0 && (
          <div>
            <label className="label">Assignee</label>
            <select className="input" value={assigneeIdx} onChange={(e) => setAssigneeIdx(Number(e.target.value))}>
              {teamMembers.map((m, i) => (
                <option key={m.email || m.name} value={i}>{m.name}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Create</Button>
        </div>
      </form>
    </Modal>
  );
}
