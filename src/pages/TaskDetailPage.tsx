import { useParams, Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useData } from '../context/DataContext';
import { PageHeader } from '../components/ui/Panel';
import { PageLoading } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TaskStatus, Subtask } from '../types';
import { canAssignToOthers } from '../auth/auth';
import { getTaskHours, getTaskWallHours } from '../utils/taskDisplay';
import { formatDayLabelIST, formatTimeIST, nowTimestamp } from '../utils/time';
import { sectionBreakdown, getWorkingHours } from '../utils/taskTiming';
import { Tabs } from '../components/ui/Tabs';
import { useLiveTick } from '../hooks/useLiveTick';
import { isWithinBusinessHours, nextBusinessStart } from '../utils/businessTime';

const statuses: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Done'];

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const { visibleTasks, teamMembers, loading, updateTask, transitionTask } = useData();
  const task = visibleTasks.find((t) => t.id === id);
  const [comment, setComment] = useState('');
  const [estimateDraft, setEstimateDraft] = useState<number | null>(null);
  const [estimateReason, setEstimateReason] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const isAdmin = session?.role === 'admin';
  const [tab, setTab] = useState<'details' | 'subtasks' | 'activity' | 'attachments'>('details');

  const liveEnabled = task?.status === 'In Progress';
  const liveNow = useLiveTick(1000, liveEnabled);
  const liveWorkHours = useMemo(() => {
    if (!task || !liveEnabled) return null;
    return getWorkingHours(task, new Date(liveNow));
  }, [liveEnabled, liveNow, task]);
  const timerState = useMemo(() => {
    if (!liveEnabled) return null;
    const now = new Date(liveNow);
    if (isWithinBusinessHours(now)) return { running: true, label: 'Running now' };
    const next = nextBusinessStart(now);
    return {
      running: false,
      label: `Paused · resumes ${formatDayLabelIST(next.getTime(), liveNow)} at ${formatTimeIST(next)} IST`
    };
  }, [liveEnabled, liveNow]);

  if (loading) return <PageLoading />;
  if (!task) return <EmptyState title="Task not found" actionLabel="Back to tasks" onAction={() => window.history.back()} />;

  const sections = useMemo(
    () => sectionBreakdown(task, new Date(liveEnabled ? liveNow : Date.now())),
    [task, liveEnabled, liveNow]
  );
  const locked = Boolean(task.estimateLockedAt);
  const estimateValue = estimateDraft ?? task.timeEstimated;
  const estimateChanged = estimateDraft != null && estimateDraft !== task.timeEstimated;

  const changeStatus = async (status: TaskStatus) => {
    if (status === task.status) return;
    await transitionTask(task.id, status, task.version);
  };

  const saveComment = async () => {
    if (!comment.trim()) return;
    await updateTask({
      ...task,
      activity: [
        {
          id: `act-${Date.now()}`,
          type: 'comment',
          user: { ...session!.profile, email: session!.email },
          content: comment.trim(),
          timestamp: nowTimestamp()
        },
        ...task.activity
      ]
    });
    setComment('');
  };

  const saveEstimate = async () => {
    if (!estimateChanged) return;
    if (isAdmin && !estimateReason.trim()) return;
    await updateTask({ ...task, timeEstimated: estimateValue }, { estimateReason: estimateReason.trim() });
    setEstimateDraft(null);
    setEstimateReason('');
  };

  const toggleSubtask = async (sub: Subtask) => {
    await updateTask({
      ...task,
      subtasks: task.subtasks.map((s) => (s.id === sub.id ? { ...s, completed: !s.completed } : s))
    });
  };

  const addSubtask = async () => {
    if (!newSubtask.trim()) return;
    const sub: Subtask = { id: `sub-${Date.now()}`, title: newSubtask.trim(), completed: false };
    await updateTask({ ...task, subtasks: [...task.subtasks, sub] });
    setNewSubtask('');
  };

  return (
    <div className="max-w-5xl">
      <nav className="text-xs text-ink-muted mb-4">
        <Link to="/tasks" className="hover:text-accent">Tasks</Link>
        <span className="mx-2">/</span>
        <span>{task.project}</span>
      </nav>
      <PageHeader title={task.title} subtitle={`${task.id} · ${task.assignee.name}`} />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs
            active={tab}
            onChange={(id) => setTab(id as typeof tab)}
            tabs={[
              { id: 'details', label: 'Details', icon: 'description' },
              { id: 'subtasks', label: `Subtasks (${task.subtasks.length})`, icon: 'checklist' },
              { id: 'activity', label: `Activity (${task.activity.length})`, icon: 'history' },
              { id: 'attachments', label: `Files (${task.attachments.length})`, icon: 'attach_file' }
            ]}
          />

          {tab === 'details' && (
            <>
              <div className="panel p-4">
                <h2 className="text-sm font-semibold mb-2">Description</h2>
                <p className="text-sm text-ink-muted whitespace-pre-wrap">{task.description || 'No description.'}</p>
              </div>
              <div className="panel p-4">
                <h2 className="text-sm font-semibold mb-2">Labels</h2>
                {task.labels.length === 0 ? (
                  <p className="text-xs text-ink-faint">No labels yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {task.labels.map((l) => (
                      <span key={l} className="chip">
                        {l}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {tab === 'subtasks' && (
            <div className="panel p-4">
              <h2 className="text-sm font-semibold mb-3">Subtasks</h2>
              <div className="space-y-2 mb-3">
                {task.subtasks.length === 0 ? (
                  <p className="text-xs text-ink-faint">No subtasks yet.</p>
                ) : (
                  task.subtasks.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={s.completed} onChange={() => toggleSubtask(s)} />
                      <span className={s.completed ? 'line-through text-ink-faint' : ''}>{s.title}</span>
                    </label>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="Add subtask…"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                />
                <Button type="button" variant="secondary" onClick={addSubtask}>
                  Add
                </Button>
              </div>
            </div>
          )}

          {tab === 'activity' && (
            <div className="panel p-4">
              <h2 className="text-sm font-semibold mb-3">Activity</h2>
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                {task.activity.map((a) => (
                  <div key={a.id} className="text-sm border-l-2 border-border pl-3">
                    <p className="font-medium text-ink">{a.user.name}</p>
                    <p className="text-ink-muted">{a.content}</p>
                    <p className="text-xs text-ink-faint mt-0.5">{a.timestamp}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <input
                  className="input flex-1"
                  placeholder="Add a comment…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button type="button" onClick={saveComment}>
                  Post
                </Button>
              </div>
            </div>
          )}

          {tab === 'attachments' && (
            <div className="panel p-4">
              <h2 className="text-sm font-semibold mb-3">Attachments</h2>
              {task.attachments.length === 0 ? (
                <p className="text-xs text-ink-faint">No files attached.</p>
              ) : (
                <div className="space-y-2">
                  {task.attachments.map((att) => (
                    <div key={att.id} className="flex items-start justify-between gap-3 panel-interactive p-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{att.name}</p>
                        <p className="text-xs text-ink-muted mt-1">
                          {att.type.toUpperCase()} · {att.size}
                        </p>
                        <p className="text-xs text-ink-faint mt-1">{att.added}</p>
                      </div>
                      {att.url ? (
                        <a href={att.url} target="_blank" rel="noreferrer" className="btn btn-secondary px-3 py-2">
                          Download
                        </a>
                      ) : (
                        <span className="text-xs text-ink-faint mt-1">No URL</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="panel p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              {task.timingTrust === 'legacy' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">Legacy timing</span>
              )}
              {liveWorkHours != null && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                  style={{
                    backgroundColor: timerState?.running ? 'var(--accent-soft)' : 'var(--surface-sunken)',
                    color: timerState?.running ? 'var(--accent)' : 'var(--ink-muted)'
                  }}
                >
                  {timerState?.label}: {liveWorkHours.toFixed(1)}h
                </span>
              )}
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={task.status} onChange={(e) => changeStatus(e.target.value as TaskStatus)}>
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            {isAdmin && canAssignToOthers(session!.role) && (
              <div>
                <label className="label">Assignee</label>
                <select
                  className="input"
                  value={task.assignee.email || task.assignee.name}
                  onChange={(e) => {
                    const m = teamMembers.find((x) => (x.email || x.name) === e.target.value);
                    if (m) updateTask({ ...task, assignee: m });
                  }}
                >
                  {teamMembers.map((m) => (
                    <option key={m.email || m.name} value={m.email || m.name}>{m.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="label">Planned</p>
                {isAdmin && !locked ? (
                  <div className="space-y-2">
                    <Input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={estimateValue}
                      onChange={(e) => setEstimateDraft(parseFloat(e.target.value))}
                    />
                    {estimateChanged && (
                      <>
                        <Input
                          label="Reason for change"
                          value={estimateReason}
                          onChange={(e) => setEstimateReason(e.target.value)}
                          required
                        />
                        <Button type="button" onClick={saveEstimate} disabled={!estimateReason.trim()}>
                          Save estimate
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-lg font-bold">{task.timeEstimated}h {locked && <span className="text-xs font-normal text-ink-faint">locked</span>}</p>
                )}
              </div>
              <div>
                <p className="label">Spent (business)</p>
                <p className="text-lg font-bold text-accent">
                  {(liveWorkHours ?? getTaskHours(task)).toFixed(1)}h
                </p>
                <p className="text-xs text-ink-faint">Wall: {getTaskWallHours(task)}h</p>
              </div>
            </div>
          </div>
          <div className="panel p-4">
            <h3 className="text-sm font-semibold mb-2">Time by section</h3>
            <p className="text-[11px] text-ink-faint mb-2">
              In Motion uses business hours (Mon–Sat 10:00–18:00 IST). Other columns are dwell time.
            </p>
            {sections.map((s) => (
              <div key={s.status} className="flex justify-between text-xs py-1.5 border-b border-border last:border-0">
                <span className={s.active ? 'text-accent font-semibold' : 'text-ink-muted'}>{s.label}</span>
                <span className="font-mono">{s.display}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
