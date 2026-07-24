import React from 'react';
import { ActiveScreen } from '../types';

interface SidebarProps {
  activeScreen: ActiveScreen;
  onScreenChange: (screen: ActiveScreen) => void;
  onNewTaskClick: () => void;
}

export default function Sidebar({
  activeScreen,
  onScreenChange,
  onNewTaskClick
}: SidebarProps) {
  const menuItems = [
    { id: 'admin-dashboard' as ActiveScreen, label: 'Admin Dashboard', icon: 'dashboard' },
    { id: 'employee-dashboard' as ActiveScreen, label: 'Employee Dashboard', icon: 'person_check' },
    { id: 'kanban-board' as ActiveScreen, label: 'Kanban Board', icon: 'view_kanban' },
    { id: 'task-details' as ActiveScreen, label: 'Task Details', icon: 'assignment' },
    { id: 'performance' as ActiveScreen, label: 'Performance', icon: 'insights' },
    { id: 'team-chat' as ActiveScreen, label: 'Team Chat', icon: 'forum', badge: 3 }
  ];

  return (
    <aside id="sidebar-nav" class="fixed left-0 top-0 h-full w-[280px] bg-[#131b2e] flex flex-col py-6 z-50 text-white select-none">
      {/* Brand logo */}
      <div class="px-6 mb-8">
        <h1 class="text-xl font-bold tracking-tight">TaskPro Enterprise</h1>
        <p class="text-[#7c839b] text-xs mt-1">Modern Corporate UI</p>
      </div>

      {/* Navigation list */}
      <nav class="flex-1 flex flex-col gap-1">
        {menuItems.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onScreenChange(item.id)}
              class={`flex items-center justify-between w-full text-left px-6 py-3 transition-colors cursor-pointer group ${
                isActive
                  ? 'bg-[#3a485c]/60 text-white border-l-4 border-[#d5e3fd]'
                  : 'text-[#7c839b] hover:bg-[#3a485c]/30 hover:text-white'
              }`}
            >
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-xl">{item.icon}</span>
                <span class="font-medium text-sm">{item.label}</span>
              </div>
              {item.badge && !isActive && (
                <span class="bg-[#ba1a1a] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Add Task Quick Trigger */}
      <div class="px-6 mt-4 mb-6">
        <button
          onClick={onNewTaskClick}
          class="w-full bg-[#3B82F6] hover:bg-blue-600 active:scale-[0.98] text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
        >
          <span class="material-symbols-outlined text-lg">add</span>
          <span class="text-sm">New Task</span>
        </button>
      </div>

      {/* Bottom control links */}
      <div class="mt-auto px-6 pt-4 flex flex-col gap-1 border-t border-[#7c839b]/20">
        <button
          onClick={() => onScreenChange('settings')}
          class={`flex items-center gap-3 py-2 text-left cursor-pointer transition-colors w-full ${
            activeScreen === 'settings' ? 'text-white' : 'text-[#7c839b] hover:text-white'
          }`}
        >
          <span class="material-symbols-outlined text-xl">settings</span>
          <span class="font-medium text-sm">Settings</span>
        </button>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to sign out?')) {
              alert('Logged out successfully.');
            }
          }}
          class="flex items-center gap-3 py-2 text-left text-[#7c839b] hover:text-white transition-colors cursor-pointer w-full"
        >
          <span class="material-symbols-outlined text-xl">logout</span>
          <span class="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
