import React, { useState } from 'react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  teamMembers: User[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({
  currentUser,
  onUserChange,
  teamMembers,
  searchQuery,
  onSearchChange
}: HeaderProps) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: "Sarah Chen assigned you 'Task-102: Implement User Auth'", time: "2h ago", unread: true },
    { id: 2, text: "Alex River moved 'Task-104: Integrate Stripe' to Review", time: "10h ago", unread: true },
    { id: 3, text: "Q4 Compliance Audit deadline set to October 24", time: "1d ago", unread: false }
  ];

  return (
    <header id="top-nav-bar" class="fixed top-0 right-0 w-[calc(100%-280px)] h-16 bg-[#f7f9fb] flex justify-between items-center px-6 border-b border-[#c6c6cd] z-40">
      {/* Search Input */}
      <div class="flex items-center gap-4 w-1/2">
        <div class="relative w-full max-w-md">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#45464d] text-xl">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks, labels, or projects..."
            class="w-full pl-10 pr-4 py-2 bg-[#f2f4f6] border border-[#c6c6cd] rounded-lg text-sm focus:ring-2 focus:ring-[#131b2e] focus:bg-white focus:outline-none transition-all placeholder-[#76777d]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-[#76777d] hover:text-[#191c1e] text-xs"
            >
              clear
            </button>
          )}
        </div>
      </div>

      {/* Utility Panel */}
      <div class="flex items-center gap-4 relative">
        {/* Notification center */}
        <div class="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            class="p-2 text-[#45464d] hover:bg-[#f2f4f6] rounded-full transition-colors relative cursor-pointer"
          >
            <span class="material-symbols-outlined">notifications</span>
            <span class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full border border-white"></span>
          </button>

          {showNotifications && (
            <div class="absolute right-0 mt-2 w-80 bg-white border border-[#c6c6cd] rounded-xl shadow-lg py-2 z-50 text-xs text-[#191c1e]">
              <div class="px-4 py-2 border-b border-[#eceef0] font-bold flex justify-between items-center">
                <span>Notifications</span>
                <span class="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div class="max-h-64 overflow-y-auto custom-scrollbar">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    class={`p-3 border-b border-[#eceef0] hover:bg-slate-50 transition-colors ${
                      notif.unread ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <p class="font-medium text-slate-800">{notif.text}</p>
                    <span class="text-[10px] text-[#76777d] mt-1 block">{notif.time}</span>
                  </div>
                ))}
              </div>
              <div class="text-center pt-2 pb-1">
                <button
                  onClick={() => setShowNotifications(false)}
                  class="text-blue-600 font-semibold hover:underline"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Support help */}
        <button
          onClick={() => alert('Corporate help desk and support documentation are available in the workspace.')}
          class="p-2 text-[#45464d] hover:bg-[#f2f4f6] rounded-full transition-colors cursor-pointer"
        >
          <span class="material-symbols-outlined">help</span>
        </button>

        {/* Corporate apps launcher */}
        <button
          onClick={() => alert('Additional Enterprise modules: Wiki, Drive, Chat, OKR Dashboard.')}
          class="p-2 text-[#45464d] hover:bg-[#f2f4f6] rounded-full transition-colors cursor-pointer"
        >
          <span class="material-symbols-outlined">apps</span>
        </button>

        <div class="h-8 w-[1px] bg-[#c6c6cd] mx-1"></div>

        {/* Active Member Selection Dropdown */}
        <div class="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            class="flex items-center gap-2 pl-2 focus:outline-none cursor-pointer group"
          >
            <img
              class="w-8 h-8 rounded-full border border-[#c6c6cd] object-cover group-hover:ring-2 group-hover:ring-slate-800 transition-all"
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
            />
            <div class="hidden md:flex flex-col text-left">
              <span class="text-xs font-semibold leading-tight">{currentUser.name}</span>
              <span class="text-[10px] text-[#7c839b] leading-tight">{currentUser.role || 'Member'}</span>
            </div>
            <span class="material-symbols-outlined text-xs text-[#76777d] group-hover:text-[#191c1e] transition-colors">
              expand_more
            </span>
          </button>

          {showProfileDropdown && (
            <div class="absolute right-0 mt-2 w-56 bg-white border border-[#c6c6cd] rounded-xl shadow-lg py-2 z-50 text-xs">
              <div class="px-4 py-2 border-b border-[#eceef0] bg-slate-50">
                <p class="font-bold text-[#191c1e]">Switch Workspace View</p>
                <p class="text-[10px] text-[#76777d]">Simulate other team members</p>
              </div>
              <div class="py-1">
                {teamMembers.map((member) => (
                  <button
                    key={member.name}
                    onClick={() => {
                      onUserChange(member);
                      setShowProfileDropdown(false);
                    }}
                    class={`flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors ${
                      currentUser.name === member.name ? 'bg-blue-50/50 font-semibold text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    <img
                      class="w-6 h-6 rounded-full object-cover border border-[#c6c6cd]"
                      src={member.avatar}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                    />
                    <div class="flex flex-col">
                      <span>{member.name}</span>
                      <span class="text-[9px] text-[#7c839b]">{member.role}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
