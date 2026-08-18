import { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useData } from '../context/DataContext';
import { PageHeader } from '../components/ui/Panel';
import { PageLoading } from '../components/ui/Skeleton';
import { PriorityBadge } from '../components/ui/Badge';
import { Task, TaskStatus } from '../types';
import { getTaskHours } from '../utils/taskDisplay';
import { getWorkingHours, isWorkTimerRunning } from '../utils/taskTiming';
import { useLiveTick } from '../hooks/useLiveTick';
import { isWithinBusinessHours } from '../utils/businessTime';

const columns: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Done'];

function TaskCard({ task, dragging }: { task: Task; dragging?: boolean }) {
  const { holidayDates } = useData();
  const liveEnabled = isWorkTimerRunning(task);
  const liveNow = useLiveTick(1000, liveEnabled);
  const liveHours = useMemo(() => {
    if (task.status !== 'In Progress') return null;
    return getWorkingHours(task, new Date(liveNow), holidayDates);
  }, [holidayDates, liveNow, task]);
  const clockRunning = isWorkTimerRunning(task) && isWithinBusinessHours(new Date(liveNow));
  const pausedByUser = task.status === 'In Progress' && task.timerPaused;

  return (
    <div className={`panel p-3 ${dragging ? 'opacity-90 shadow-lg ring-2 ring-accent' : ''}`}>
      <p className="text-sm font-semibold text-ink line-clamp-2">{task.title}</p>
      <p className="text-xs text-ink-muted mt-1">{task.project}</p>
      <div className="flex items-center justify-between mt-2">
        <PriorityBadge priority={task.priority} />
        <span className="text-xs text-ink-muted tabular-nums">
          {(liveHours ?? getTaskHours(task)).toFixed(1)}h
          {task.status === 'In Progress' && (
            <span className={`ml-1 ${clockRunning ? 'text-accent' : 'text-ink-faint'}`}>
              {clockRunning ? 'live' : pausedByUser ? 'paused' : 'after hours'}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

function DraggableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined;
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none" data-task-id={task.id} tabIndex={0}>
      <Link to={`/tasks/${task.id}`} onClick={(e) => isDragging && e.preventDefault()}>
        <TaskCard task={task} dragging={isDragging} />
      </Link>
    </div>
  );
}

function Column({ status, tasks }: { status: TaskStatus; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const totalHours = tasks.reduce((sum, t) => sum + getTaskHours(t), 0);
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[260px] w-[260px] sm:min-w-0 sm:w-auto sm:flex-1 rounded-xl border p-3 transition-colors transition-transform ${
        isOver ? 'border-accent bg-accent-soft/30 shadow-sm scale-[1.01]' : 'border-border bg-surface-sunken/50'
      }`}
    >
      <h3 className="text-xs font-bold uppercase tracking-wide text-ink-muted mb-3 flex justify-between">
        {status}
        <span className="text-ink-faint flex items-center gap-2">
          <span>{tasks.length}</span>
          <span className="text-[10px] font-semibold tabular-nums">{totalHours.toFixed(1)}h</span>
        </span>
      </h3>
      <div className="flex flex-col gap-2 min-h-[120px]">
        {tasks.length === 0 ? (
          <p className="text-xs text-ink-faint text-center py-8">Drop tasks here</p>
        ) : (
          tasks.map((t) => (
            <div key={t.id}>
              <DraggableTask task={t} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function BoardPage() {
  const { visibleTasks, loading, transitionTask } = useData();
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const byStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { 'To Do': [], 'In Progress': [], Review: [], Done: [] };
    for (const t of visibleTasks) map[t.status].push(t);
    return map;
  }, [visibleTasks]);

  const activeTask = activeId ? visibleTasks.find((t) => t.id === activeId) : null;

  const onDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    const taskId = String(e.active.id);
    const newStatus = e.over?.id as TaskStatus | undefined;
    const task = visibleTasks.find((t) => t.id === taskId);
    if (!task || !newStatus || !columns.includes(newStatus) || task.status === newStatus) return;
    await transitionTask(taskId, newStatus, task.version);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key) || e.target instanceof HTMLInputElement) return;
      const task = visibleTasks.find((t) => document.activeElement?.closest(`[data-task-id="${t.id}"]`));
      if (!task) return;
      const idx = columns.indexOf(task.status);
      const next = e.key === 'ArrowRight' ? columns[idx + 1] : columns[idx - 1];
      if (next) void transitionTask(task.id, next, task.version);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visibleTasks, transitionTask]);

  if (loading) return <PageLoading />;

  return (
    <div>
      <PageHeader
        title="Board"
        subtitle="Drag tasks between columns · timer runs in In Progress · pause without leaving the column · office hours 10:00–18:00 IST"
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(e) => setActiveId(String(e.active.id))}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar lg:grid lg:grid-cols-4 lg:overflow-visible">
          {columns.map((col) => (
            <div key={col}>
              <Column status={col} tasks={byStatus[col]} />
            </div>
          ))}
        </div>
        <DragOverlay>{activeTask ? <TaskCard task={activeTask} dragging /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}
