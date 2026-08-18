import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
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
import { dueDateFromInput, dueDateToInput, formatDayLabelIST, formatTimeIST, nowTimestamp } from '../utils/time';
import { sectionBreakdown, getWorkingHours } from '../utils/taskTiming';
import { Tabs } from '../components/ui/Tabs';
import { useLiveTick } from '../hooks/useLiveTick';
import { isWithinBusinessHours, nextBusinessStart } from '../utils/businessTime';
import { isWorkTimerRunning } from '../utils/taskTiming';

const statuses: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Done'];

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const { visibleTasks, teamMembers, loading, error, reload, updateTask, transitionTask, pauseTimer, resumeTimer, reviewTask, archiveTask, holidayDates } = useData();
  const task = visibleTasks.find((t) => t.id === id);
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [estimateDraft, setEstimateDraft] = useState<number | null>(null);
  const [estimateReason, setEstimateReason] = useState('');
  const [estimateUnit, setEstimateUnit] = useState<'hours' | 'minutes' | 'days'>('hours');
  const [dueInput, setDueInput] = useState<string>('');
  const [newSubtask, setNewSubtask] = useState('');
  const isAdmin = session?.role === 'admin';
  const [tab, setTab] = useState<'details' | 'subtasks' | 'activity' | 'attachments'>('details');

  const liveEnabled = Boolean(task && isWorkTimerRunning(task));
  const liveNow = useLiveTick(1000, liveEnabled);
  const liveWorkHours = useMemo(() => {
    if (!task || task.status !== 'In Progress') return null;
    return getWorkingHours(task, new Date(liveNow), holidayDates);
  }, [liveNow, task, holidayDates]);
  const timerState = useMemo(() => {
    if (!task || task.status !== 'In Progress') return null;
    if (task.timerPaused) return { running: false, label: 'Paused by you' };
    const now = new Date(liveNow);
    if (isWithinBusinessHours(now)) return { running: true, label: 'Running now' };
    const next = nextBusinessStart(now);
    return {
      running: false,
      label: `Office hours pause · resumes ${formatDayLabelIST(next.getTime(), liveNow)} at ${formatTimeIST(next)} IST`
    };
  }, [liveNow, task]);

  const sections = useMemo(() => {
    if (!task) return [];
    return sectionBreakdown(task, new Date(liveEnabled ? liveNow : Date.now()), holidayDates);
  }, [task, liveEnabled, liveNow, holidayDates]);

  // Keep due date picker synced when navigating between tasks.
  useEffect(() => {
    if (!task) return;
    const nextDue = task.dueDate && task.dueDate !== 'No due date' ? dueDateToInput(task.dueDate) : '';
    setDueInput(nextDue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id]);

  useEffect(() => {
    if (!loading && !task && !error) {
      void reload();
    }
  }, [loading, task, error, reload]);

  if (loading) return <PageLoading />;
  if (!task)
    return (
      <EmptyState
        title={error ? 'Could not load task' : 'Task not found'}
        actionLabel={error ? 'Retry' : 'Back to tasks'}
        onAction={() => (error ? void reload() : window.history.back())}
      />
    );
  const estimateValue = estimateDraft ?? task.timeEstimated;
  const estimateChanged = estimateDraft != null && estimateDraft !== task.timeEstimated;
  const currentDueInput =
    task.dueDate && task.dueDate !== 'No due date' ? dueDateToInput(task.dueDate) : '';
  const dueChanged = isAdmin && dueInput !== currentDueInput;

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

  const saveDueDate = async () => {
    if (!isAdmin) return;
    if (!dueChanged) return;
    await updateTask({
      ...task,
      dueDate: dueInput ? dueDateFromInput(dueInput) : 'No due date'
    });
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
            {task.status === 'In Progress' && (
              <div className="flex gap-2">
                {task.timerPaused ? (
                  <Button type="button" variant="secondary" icon="play_arrow" onClick={() => resumeTimer(task.id)}>
                    Resume timer
                  </Button>
                ) : (
                  <Button type="button" variant="secondary" icon="pause" onClick={() => pauseTimer(task.id)}>
                    Pause timer
                  </Button>
                )}
              </div>
            )}
            {task.status === 'Review' && (
              <div className="flex flex-wrap gap-2">
                <Button type="button" icon="check" onClick={() => reviewTask(task.id, 'accepted')}>
                  Accept
                </Button>
                <Button type="button" variant="secondary" icon="undo" onClick={() => reviewTask(task.id, 'changes_requested')}>
                  Request changes
                </Button>
              </div>
            )}
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
                {isAdmin && (
                  <div className="space-y-2 mb-3">
                    <Input
                      label="Due date"
                      type="date"
                      value={dueInput}
                      onChange={(e) => setDueInput(e.target.value)}
                    />
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={!dueChanged}
                        onClick={() => void saveDueDate()}
                      >
                        Save due date
                      </Button>
                      <span className="text-xs text-ink-faint">Blank = “No due date”.</span>
                    </div>
                  </div>
                )}
                {isAdmin ? (
                  <div className="space-y-2">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input
                        label="Estimate amount"
                        type="number"
                        step={estimateUnit === 'minutes' ? 15 : estimateUnit === 'days' ? 0.25 : 0.5}
                        min={estimateUnit === 'minutes' ? 15 : estimateUnit === 'days' ? 0.25 : 0.5}
                        value={hoursToUnit(estimateValue, estimateUnit)}
                        onChange={(e) => {
                          const raw = parseFloat(e.target.value);
                          if (Number.isNaN(raw)) return setEstimateDraft(null);
                          setEstimateDraft(unitToHours(raw, estimateUnit));
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
                  <p className="text-lg font-bold">{task.timeEstimated}h</p>
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
          {isAdmin && (
            <div className="panel p-4">
              <h3 className="text-sm font-semibold mb-2">Archive</h3>
              <p className="text-xs text-ink-muted mb-3">Hides this task from boards. Hours stay on the timesheet.</p>
              <Button
                type="button"
                variant="danger"
                icon="archive"
                onClick={async () => {
                  if (!window.confirm('Archive this task?')) return;
                  await archiveTask(task.id);
                  navigate('/tasks');
                }}
              >
                Archive task
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
