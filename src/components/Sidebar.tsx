import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveScreen, UserRole } from '../types';
import { canAccessScreen } from '../auth/auth';
import { staggerContainer, staggerItem } from './ui/motion';

interface SidebarProps {
  activeScreen: ActiveScreen;
  userRole: UserRole;
  onScreenChange: (screen: ActiveScreen) => void;
  onNewTaskClick: () => void;
  onLogProgressClick?: () => void;
  onLogout: () => void;
  canCreateTasks: boolean;
  open: boolean;
  onClose: () => void;
}

const ALL_MENU_ITEMS: { id: ActiveScreen; label: string; icon: string }[] = [
  { id: 'admin-dashboard', label: 'HQ', icon: 'dashboard' },
  { id: 'employee-dashboard', label: 'My Stuff', icon: 'person_check' },
  { id: 'kanban-board', label: 'Board', icon: 'view_kanban' },
  { id: 'task-details', label: 'Deep Dive', icon: 'assignment' },
  { id: 'performance', label: 'Team Stats', icon: 'insights' },
  { id: 'team-chat', label: 'Chat', icon: 'forum' }
];

export default function Sidebar({
  activeScreen,
  userRole,
  onScreenChange,
  onNewTaskClick,
  onLogProgressClick,
  onLogout,
  canCreateTasks,
  open,
  onClose
}: SidebarProps) {
  const menuItems = ALL_MENU_ITEMS.filter((item) => canAccessScreen(userRole, item.id));

  const go = (screen: ActiveScreen) => {
    onScreenChange(screen);
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 lg:hidden cursor-pointer border-0"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed left-0 top-0 h-screen w-[min(280px,88vw)] glass-dark flex flex-col pt-5 pb-3 z-[70] text-white border-r border-[#c8ff00]/15 overflow-hidden transition-transform duration-300 ease-out lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 sm:px-6 mb-5 sm:mb-6 shrink-0 flex items-start justify-between gap-2"
        >
          <div className="flex items-center gap-3 min-w-0">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-[#c8ff00] flex items-center justify-center border-2 border-black shadow-[3px_3px_0_#ff3cac] shrink-0"
            >
              <span className="material-symbols-outlined text-xl text-black">bolt</span>
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold tracking-tight text-white font-display truncate">TaskPro</h1>
              <p className="text-[#c8ff00] text-[10px] font-bold uppercase tracking-widest">{userRole} mode</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden w-9 h-9 rounded-xl border border-white/20 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/10 cursor-pointer shrink-0"
            aria-label="Close navigation"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </motion.div>

        <motion.nav
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1.5 px-3 custom-scrollbar"
        >
          {menuItems.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <motion.div key={item.id} variants={staggerItem} className="relative shrink-0">
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-[#c8ff00] rounded-xl border-2 border-black"
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => go(item.id)}
                  className={`relative flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-colors cursor-pointer ${
                    isActive ? 'text-black font-bold' : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={`material-symbols-outlined text-xl ${isActive ? 'scale-110' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm tracking-tight">{item.label}</span>
                </button>
              </motion.div>
            );
          })}
        </motion.nav>

        <div className="shrink-0 px-4 pt-3 space-y-2">
          {canCreateTasks && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.03, x: -2, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                onNewTaskClick();
                onClose();
              }}
              className="btn-accent w-full py-2.5 flex items-center justify-center gap-2 text-sm"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              New Task
            </motion.button>
          )}
          {onLogProgressClick && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onLogProgressClick();
                onClose();
              }}
              className="w-full bg-[#ff3cac]/15 hover:bg-[#ff3cac]/25 border-2 border-[#ff3cac]/40 text-[#ff3cac] py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
            >
              <span className="material-symbols-outlined text-base">schedule</span>
              Log Hours
            </motion.button>
          )}
        </div>

        <div className="shrink-0 px-3 pt-2 mt-2 border-t border-white/10 flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => go('settings')}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left cursor-pointer transition-all ${
              activeScreen === 'settings'
                ? 'bg-[#c8ff00] text-black font-bold border-2 border-black'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-xl">settings</span>
            <span className="font-medium text-sm">Settings</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-left text-neutral-400 hover:text-[#ff3cac] hover:bg-[#ff3cac]/10 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span className="font-medium text-sm">Peace out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
