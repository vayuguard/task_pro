import { useState } from 'react';
import { Search, Bell, HelpCircle, Grid, ChevronDown, Check, Info } from 'lucide-react';
import { Task } from '../types';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  notifications: Array<{ id: string; text: string; time: string; read: boolean }>;
  onMarkNotificationRead: (id: string) => void;
}

export default function Header({ 
  onSearch, 
  searchQuery, 
  notifications, 
  onMarkNotificationRead 
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 w-full flex justify-between items-center px-6 border-b border-slate-200 bg-white sticky top-0 z-40">
      {/* Search Bar */}
      <div className="flex items-center gap-4 w-1/3">
        <div className="relative w-full max-w-xs">
          <Search 
            size={16} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" 
          />
          <input 
            type="text" 
            placeholder="Search tasks or files..." 
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-4 md:gap-6">
        <div className="flex items-center gap-3 text-slate-500 relative">
          
          {/* Notification Button */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-slate-100 transition-all active:scale-95 relative cursor-pointer"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white ring-1 ring-rose-500 animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <span className="font-semibold text-xs text-slate-700 uppercase tracking-wider">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} Unread
                    </span>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-3 border-b border-slate-50 flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-blue-50/20' : ''}`}
                      >
                        <div className="mt-0.5 p-1 rounded-full bg-blue-50 text-blue-500">
                          <Info size={12} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs text-slate-700 ${!notif.read ? 'font-medium' : ''}`}>
                            {notif.text}
                          </p>
                          <span className="text-[10px] text-slate-400 block mt-1">{notif.time}</span>
                        </div>
                        {!notif.read && (
                          <button 
                            onClick={() => onMarkNotificationRead(notif.id)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-green-600 transition-colors"
                            title="Mark as read"
                          >
                            <Check size={12} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            className="p-2 rounded-full hover:bg-slate-100 transition-all active:scale-95 cursor-pointer"
            title="Help Center"
            onClick={() => alert('Welcome to TaskPro Enterprise Help! Navigating through dashboards and boards supports fully real-time interactions.')}
          >
            <HelpCircle size={18} />
          </button>
          
          <button 
            className="p-2 rounded-full hover:bg-slate-100 transition-all active:scale-95 cursor-pointer"
            title="Integrations Grid"
            onClick={() => alert('Quick launch: Google Workspace Integration & Cloud Console linked.')}
          >
            <Grid size={18} />
          </button>
        </div>

        {/* Vertical Divider */}
        <div className="h-8 w-px bg-slate-200"></div>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 hover:opacity-95 transition-opacity cursor-pointer text-left focus:outline-none"
          >
            <div className="hidden md:block text-right">
              <p className="text-xs font-semibold text-slate-800 leading-tight">Alex Rivera</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Product Designer</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-blue-100 overflow-hidden shadow-sm flex-shrink-0">
              <img 
                className="w-full h-full object-cover" 
                alt="Alex Rivera Profile"
                referrerPolicy="no-referrer"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT1jtDA7el1WpSvRQpYrCb4gOoavKhjM8ckwZ5geOgJclzrsJ8MLETWnDpYogNDGdn42U4dL6HjC0945Fqvf61PkuVw0ZiVtTgrn2Gx5c6YPEkEeP7Bx_A93_YtNuuXYfEPUGskKYz_1OkiCMkLpoGaozUDBADf-1M4lS_mYxX0iU0JJwFrIF_6Zf6nYTXV5wnMU5GetDRf1ANE7oMqR-Wdhx-8LyagWiiJuXTUCHIns3R1M7Llq9-IFZmrBvu32tHEBRNNEqNODOa" 
              />
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden md:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="p-3 border-b border-slate-100 bg-slate-50">
                <p className="text-xs font-semibold text-slate-800">Alex Rivera</p>
                <p className="text-[10px] text-slate-500">vayuguardclimatetech@gmail.com</p>
              </div>
              <button 
                onClick={() => { setShowProfileMenu(false); alert('My Profile & Portfolio setup linked successfully.'); }}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors"
              >
                My Profile
              </button>
              <button 
                onClick={() => { setShowProfileMenu(false); alert('Connected Integrations: Figma, Jira, GitHub.'); }}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Developer API Credentials
              </button>
              <div className="border-t border-slate-100"></div>
              <button 
                onClick={() => { setShowProfileMenu(false); alert('Sign out processed.'); }}
                className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
