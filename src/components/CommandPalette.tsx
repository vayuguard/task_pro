import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useData } from '../context/DataContext';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { StatusBadge } from './ui/Badge';

interface Command {
  id: string;
  label: string;
  hint?: string;
  icon: string;
  group: 'Navigation' | 'Actions' | 'Tasks';
  run: () => void;
}

export function CommandPalette({
  open,
  onClose,
  onNewTask
}: {
  open: boolean;
  onClose: () => void;
  onNewTask: () => void;
}) {
  const navigate = useNavigate();
  const { visibleTasks } = useData();
  const { logout, session } = useAuth();
  const { toggle, resolved } = useTheme();
  const reduced = useReducedMotion();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands = useMemo<Command[]>(() => {
    const go = (path: string) => () => {
      navigate(path);
      onClose();
    };

    const base: Command[] = [
      { id: 'nav-home', label: 'Go to Dashboard', icon: 'dashboard', group: 'Navigation', run: go('/') },
      { id: 'nav-tasks', label: 'Go to My tasks', icon: 'checklist', group: 'Navigation', run: go('/tasks') },
      { id: 'nav-board', label: 'Go to Board', icon: 'view_kanban', group: 'Navigation', run: go('/board') },
      { id: 'nav-perf', label: 'Go to Performance', icon: 'monitoring', group: 'Navigation', run: go('/performance') },
      { id: 'nav-chat', label: 'Go to Chat', icon: 'forum', group: 'Navigation', run: go('/chat') },
      { id: 'nav-settings', label: 'Go to Settings', icon: 'settings', group: 'Navigation', run: go('/settings') },
      {
        id: 'act-new',
        label: 'Create new task',
        hint: 'N',
        icon: 'add_circle',
        group: 'Actions',
        run: () => {
          onClose();
          onNewTask();
        }
      },
      {
        id: 'act-theme',
        label: `Switch to ${resolved === 'dark' ? 'light' : 'dark'} theme`,
        hint: 'T',
        icon: resolved === 'dark' ? 'light_mode' : 'dark_mode',
        group: 'Actions',
        run: () => {
          toggle();
          onClose();
        }
      },
      {
        id: 'act-logout',
        label: 'Sign out',
        icon: 'logout',
        group: 'Actions',
        run: () => {
          onClose();
          logout();
        }
      }
    ];

    const taskCommands: Command[] = visibleTasks.slice(0, 40).map((t) => ({
      id: `task-${t.id}`,
      label: t.title,
      hint: t.project,
      icon: 'task_alt',
      group: 'Tasks',
      run: () => {
        navigate(`/tasks/${t.id}`);
        onClose();
      }
    }));

    return [...base, ...taskCommands];
  }, [navigate, onClose, onNewTask, visibleTasks, logout, toggle, resolved]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands.filter((c) => c.group !== 'Tasks').concat(commands.filter((c) => c.group === 'Tasks').slice(0, 5));
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.hint?.toLowerCase().includes(q)
    );
  }, [commands, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Command[]>();
    for (const c of filtered) {
      const list = map.get(c.group) || [];
      list.push(c);
      map.set(c.group, list);
    }
    return [...map.entries()];
  }, [filtered]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        filtered[cursor]?.run();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, cursor, onClose]);

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[95] flex items-start justify-center pt-[12vh] px-4">
          <motion.button
            type="button"
            aria-label="Close command palette"
            className="absolute inset-0 border-0 cursor-default"
            style={{ backgroundColor: 'rgba(2, 6, 23, 0.5)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className="relative z-10 w-full max-w-xl panel overflow-hidden"
            style={{ boxShadow: 'var(--elevation-3)' }}
          >
            <div
              className="flex items-center gap-3 px-4 py-3.5 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <span className="material-symbols-outlined text-[20px] text-accent">search</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks or run a command…"
                className="flex-1 bg-transparent border-0 outline-none text-sm text-ink placeholder:text-ink-faint"
                aria-label="Command search"
              />
              <kbd
                className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
                style={{ borderColor: 'var(--border)', color: 'var(--ink-faint)' }}
              >
                ESC
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[52vh] overflow-y-auto custom-scrollbar py-2">
              {filtered.length === 0 ? (
                <p className="text-sm text-ink-muted text-center py-10">
                  No matches for “{query}”
                </p>
              ) : (
                grouped.map(([group, items]) => (
                  <div key={group} className="mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-faint px-4 py-1.5">
                      {group}
                    </p>
                    {items.map((c) => {
                      flatIndex += 1;
                      const active = flatIndex === cursor;
                      const idx = flatIndex;
                      const task =
                        c.group === 'Tasks'
                          ? visibleTasks.find((t) => `task-${t.id}` === c.id)
                          : undefined;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          data-active={active}
                          onMouseEnter={() => setCursor(idx)}
                          onClick={c.run}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer transition-colors"
                          style={{ backgroundColor: active ? 'var(--surface-sunken)' : 'transparent' }}
                        >
                          <span
                            className="material-symbols-outlined text-[18px]"
                            style={{ color: active ? 'var(--accent)' : 'var(--ink-faint)' }}
                          >
                            {c.icon}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm text-ink truncate">{c.label}</span>
                            {c.hint && c.group === 'Tasks' && (
                              <span className="block text-xs text-ink-faint truncate">{c.hint}</span>
                            )}
                          </span>
                          {task && <StatusBadge status={task.status} />}
                          {c.hint && c.group !== 'Tasks' && (
                            <kbd
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
                              style={{ borderColor: 'var(--border)', color: 'var(--ink-faint)' }}
                            >
                              {c.hint}
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div
              className="flex items-center justify-between px-4 py-2 border-t text-[11px] text-ink-faint"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-sunken)' }}
            >
              <span>Signed in as {session?.profile.name}</span>
              <span className="flex items-center gap-2">
                <span>↑↓ navigate</span>
                <span>↵ select</span>
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
