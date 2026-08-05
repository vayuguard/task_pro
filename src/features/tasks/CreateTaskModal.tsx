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
  const [estimate, setEstimate] = useState(2);
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
    setDue('');
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
          <Input label="Estimate (hours)" type="number" min={0.5} step={0.5} value={estimate} onChange={(e) => setEstimate(parseFloat(e.target.value))} />
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
