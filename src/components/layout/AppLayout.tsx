import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { NavLink, useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useUI } from '../../context/UIContext';
import { CommandPalette } from '../CommandPalette';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { CreateTaskModal } from '../../features/tasks/CreateTaskModal';
import { apiGetNotifications } from '../../api/client';

const nav = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/tasks', label: 'My tasks', icon: 'checklist' },
  { to: '/board', label: 'Board', icon: 'view_kanban' },
  { to: '/timesheet', label: 'Timesheet', icon: 'schedule' },
  { to: '/performance', label: 'Performance', icon: 'monitoring' },
  { to: '/chat', label: 'Chat', icon: 'forum' },
  { to: '/activity', label: 'Activity', icon: 'history', admin: true },
  { to: '/settings', label: 'Settings', icon: 'settings' }
];

export function AppLayout() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Capture the matched route element so a page transition animates the page it
  // belongs to, instead of re-rendering whatever route is current.
  const outlet = useOutlet();
  const mainRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notes, setNotes] = useState<Array<{ id: string; tone: string; title: string; body: string; href: string }>>([]);
  const { resolved, toggle } = useTheme();
  const {
    paletteOpen,
    setPaletteOpen,
    openCreateTask,
    sidebarCollapsed,
    toggleSidebar,
    createTaskOpen,
    closeCreateTask
  } = useUI();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (!mod) return;
      if (e.key.toLowerCase() !== 'k') return;
      e.preventDefault();
      setPaletteOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPaletteOpen]);

  // Auto-logout employees at 6:00 PM IST.
  useEffect(() => {
    if (session?.role !== 'employee') return;
    const check = () => {
      const istHour = Number(
        new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false })
          .formatToParts(new Date())
          .find((p) => p.type === 'hour')?.value ?? '0'
      );
      if (istHour >= 18) {
        logout();
        window.alert('Work hours ended at 6:00 PM IST. You have been logged out.');
      }
    };
    const id = window.setInterval(check, 30_000);
    return () => window.clearInterval(id);
  }, [session?.role, logout]);

  // Routing does not reset scroll, so a deep-scrolled list would open the next
  // page already scrolled past its content.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      apiGetNotifications()
        .then((r) => {
          if (!cancelled) setNotes(r.items);
        })
        .catch(() => {});
    };
    load();
    const id = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [session?.userId]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/tasks?q=${encodeURIComponent(q)}` : '/tasks');
  };

  const links = nav.filter((item) => !('admin' in item && item.admin) || session?.role === 'admin');
  const sidebarWidthClass = sidebarCollapsed ? 'w-[5.5rem]' : 'w-64';

  return (
    <div className="min-h-screen flex">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 z-50 h-screen ${sidebarWidthClass} sidebar flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className={`p-5 border-b sidebar-divider ${sidebarCollapsed ? 'text-center' : ''}`}>
          <p className="font-display text-xl font-semibold tracking-tight truncate">
            {sidebarCollapsed ? 'TP' : 'TaskPro'}
          </p>
          {!sidebarCollapsed && <p className="text-xs sidebar-muted mt-0.5">Work management</p>}
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto custom-scrollbar">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              title={sidebarCollapsed ? item.label : undefined}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''} ${sidebarCollapsed ? 'justify-center' : ''}`
              }
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {!sidebarCollapsed && item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t sidebar-divider space-y-0.5">
          <button
            type="button"
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`sidebar-link w-full hidden lg:flex ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <span className="material-symbols-outlined text-lg">
              {sidebarCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
            {!sidebarCollapsed && 'Collapse'}
          </button>
          <button
            type="button"
            onClick={logout}
            title={sidebarCollapsed ? 'Sign out' : undefined}
            className={`sidebar-link w-full ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            {!sidebarCollapsed && 'Sign out'}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-surface-raised/90 backdrop-blur border-b border-border px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            type="button"
            className="lg:hidden btn-ghost p-2"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <form onSubmit={onSearch} className="flex-1 max-w-md">
            <input
              type="search"
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input py-2 text-sm"
              aria-label="Search tasks"
            />
          </form>
          <div className="flex items-center gap-2 shrink-0">
            <Tooltip label="Command palette (Ctrl/⌘ K)" side="bottom">
              <Button
                variant="ghost"
                className="hidden sm:inline-flex"
                icon="search"
                onClick={() => setPaletteOpen(true)}
              />
            </Tooltip>
            <Tooltip label="Notifications" side="bottom">
              <div className="relative">
                <Button
                  variant="ghost"
                  icon="notifications"
                  onClick={() => setNotifyOpen((v) => !v)}
                  aria-expanded={notifyOpen}
                  aria-label="Notifications"
                />
                {notes.length > 0 && (
                  <span className="absolute top-1 right-1 min-w-[1rem] h-4 px-1 rounded-full bg-danger text-white text-[10px] leading-4 text-center">
                    {notes.length > 9 ? '9+' : notes.length}
                  </span>
                )}
                {notifyOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto custom-scrollbar panel p-2 z-50 shadow-lg">
                    {notes.length === 0 ? (
                      <p className="text-xs text-ink-faint p-3">No alerts right now.</p>
                    ) : (
                      notes.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          className="w-full text-left p-2 rounded-lg hover:bg-surface-sunken"
                          onClick={() => {
                            setNotifyOpen(false);
                            navigate(n.href);
                          }}
                        >
                          <p className="text-xs font-semibold text-ink">{n.title}</p>
                          <p className="text-xs text-ink-muted truncate">{n.body}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </Tooltip>
            <Tooltip label="New task" side="bottom">
              <Button variant="primary" size="sm" icon="add" onClick={openCreateTask}>
                <span className="hidden sm:inline">New task</span>
              </Button>
            </Tooltip>
            <Tooltip label={resolved === 'dark' ? 'Switch to light' : 'Switch to dark'} side="bottom">
              <Button
                variant="ghost"
                icon={resolved === 'dark' ? 'light_mode' : 'dark_mode'}
                onClick={toggle}
              />
            </Tooltip>
            <img
              src={session?.profile.avatar}
              alt=""
              className="w-8 h-8 rounded-full border border-border"
              referrerPolicy="no-referrer"
            />
            <span className="text-sm font-medium text-ink hidden sm:block">{session?.profile.name}</span>
          </div>
        </header>

        <main ref={mainRef} className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
          <motion.div
            key={location.pathname}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {outlet}
          </motion.div>
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNewTask={openCreateTask}
      />

      <CreateTaskModal open={createTaskOpen} onClose={closeCreateTask} />
    </div>
  );
}
