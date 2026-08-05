import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface UIContextValue {
  createTaskOpen: boolean;
  openCreateTask: () => void;
  closeCreateTask: () => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  shortcutsOpen: boolean;
  setShortcutsOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const UIContext = createContext<UIContextValue | null>(null);
const SIDEBAR_KEY = 'taskpro_sidebar_collapsed';

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === '1';
    } catch {
      return false;
    }
  });

  const openCreateTask = useCallback(() => setCreateTaskOpen(true), []);
  const closeCreateTask = useCallback(() => setCreateTaskOpen(false), []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0');
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      createTaskOpen,
      openCreateTask,
      closeCreateTask,
      paletteOpen,
      setPaletteOpen,
      shortcutsOpen,
      setShortcutsOpen,
      sidebarCollapsed,
      toggleSidebar
    }),
    [createTaskOpen, openCreateTask, closeCreateTask, paletteOpen, shortcutsOpen, sidebarCollapsed, toggleSidebar]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI requires UIProvider');
  return ctx;
}
