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

const nav = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/tasks', label: 'My tasks', icon: 'checklist' },
  { to: '/board', label: 'Board', icon: 'view_kanban' },
  { to: '/performance', label: 'Performance', icon: 'monitoring' },
  { to: '/chat', label: 'Chat', icon: 'forum' },
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

  // Routing does not reset scroll, so a deep-scrolled list would open the next
  // page already scrolled past its content.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/tasks?q=${encodeURIComponent(q)}` : '/tasks');
  };

  const links = nav;
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
