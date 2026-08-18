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

type BoardColumn = 'To Do' | 'In Progress' | 'Paused' | 'Review' | 'Done';
const columns: BoardColumn[] = ['To Do', 'In Progress', 'Paused', 'Review', 'Done'];

function boardColumnOf(task: Task): BoardColumn {
  if (task.status === 'In Progress' && task.timerPaused) return 'Paused';
  if (task.status === 'In Progress') return 'In Progress';
  return task.status;
}

function TaskCard({ task, dragging }: { task: Task; dragging?: boolean }) {
  const { holidayDates } = useData();
  const liveEnabled = isWorkTimerRunning(task);
  const liveNow = useLiveTick(1000, liveEnabled);
  const liveHours = useMemo(() => {
    if (task.status !== 'In Progress') return null;
    return getWorkingHours(task, new Date(liveNow), holidayDates);
  }, [holidayDates, liveNow, task]);
  const clockRunning = isWorkTimerRunning(task) && isWithinBusinessHours(new Date(liveNow));
  const pausedByUser = task.status === 'In Progress' && Boolean(task.timerPaused);

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

function Column({ id, title, tasks }: { id: BoardColumn; title: string; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const totalHours = tasks.reduce((sum, t) => sum + getTaskHours(t), 0);
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[220px] w-[220px] sm:min-w-0 sm:w-auto sm:flex-1 rounded-xl border p-3 transition-colors transition-transform ${
        isOver ? 'border-accent bg-accent-soft/30 shadow-sm scale-[1.01]' : 'border-border bg-surface-sunken/50'
      }`}
    >
      <h3 className="text-xs font-bold uppercase tracking-wide text-ink-muted mb-3 flex justify-between">
        {title}
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
  const { visibleTasks, loading, transitionTask, pauseTimer, resumeTimer } = useData();
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const byColumn = useMemo(() => {
    const map: Record<BoardColumn, Task[]> = {
      'To Do': [],
      'In Progress': [],
      Paused: [],
      Review: [],
      Done: []
    };
    for (const t of visibleTasks) map[boardColumnOf(t)].push(t);
    return map;
  }, [visibleTasks]);

  const activeTask = activeId ? visibleTasks.find((t) => t.id === activeId) : null;

  const moveToColumn = async (task: Task, column: BoardColumn) => {
    if (boardColumnOf(task) === column) return;
    if (column === 'Paused') {
      if (task.status === 'In Progress' && !task.timerPaused) {
        await pauseTimer(task.id);
        return;
      }
      if (task.status !== 'In Progress') {
        await transitionTask(task.id, 'In Progress', task.version);
      }
      await pauseTimer(task.id);
      return;
    }
    if (column === 'In Progress') {
      if (task.status === 'In Progress' && task.timerPaused) {
        await resumeTimer(task.id);
        return;
      }
      await transitionTask(task.id, 'In Progress', task.version);
      return;
    }
    await transitionTask(task.id, column as TaskStatus, task.version);
  };

  const onDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    const taskId = String(e.active.id);
    const column = e.over?.id as BoardColumn | undefined;
    const task = visibleTasks.find((t) => t.id === taskId);
    if (!task || !column || !columns.includes(column)) return;
    await moveToColumn(task, column);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key) || e.target instanceof HTMLInputElement) return;
      const task = visibleTasks.find((t) => document.activeElement?.closest(`[data-task-id="${t.id}"]`));
      if (!task) return;
      const idx = columns.indexOf(boardColumnOf(task));
      const next = e.key === 'ArrowRight' ? columns[idx + 1] : columns[idx - 1];
      if (next) void moveToColumn(task, next);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visibleTasks, transitionTask, pauseTimer, resumeTimer]);

  if (loading) return <PageLoading />;

  return (
    <div>
      <PageHeader
        title="Board"
        subtitle="Only one live In Progress task per person · starting another auto-moves the current one to Paused"
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(e) => setActiveId(String(e.active.id))}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar lg:grid lg:grid-cols-5 lg:overflow-visible">
          {columns.map((col) => (
            <div key={col}>
              <Column id={col} title={col} tasks={byColumn[col]} />
            </div>
          ))}
        </div>
        <DragOverlay>{activeTask ? <TaskCard task={activeTask} dragging /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}
