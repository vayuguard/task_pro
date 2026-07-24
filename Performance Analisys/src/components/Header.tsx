import { useState } from 'react';
import { Search, Bell, HelpCircle, Grid, ChevronDown, Check } from 'lucide-react';
import { Employee } from '../types';

interface HeaderProps {
  title: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentUser: { name: string; role: string; avatar: string; id: string | null };
  setCurrentUser: (user: any) => void;
  employees: Employee[];
}

export default function Header({ 
  title, 
  searchQuery, 
  setSearchQuery, 
  currentUser, 
  setCurrentUser,
  employees 
}: HeaderProps) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const notifications = [
    { id: 1, text: 'Alex Murphy pushed Phase 2 API documentation updates.', time: '2 mins ago', unread: true },
    { id: 2, text: 'Your QA Automation task test coverage report has finished building.', time: '1 hour ago', unread: true },
    { id: 3, text: 'James Brown mentioned you in #project-alpha: "Let\'s lock the sprint today."', time: '4 hours ago', unread: false },
  ];

  return (
    <header id="top-navigation-bar" className="h-16 bg-white flex justify-between items-center px-6 border-b border-slate-200 sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <h2 id="header-page-title" className="text-xl font-bold text-slate-900 tracking-tight capitalize">
          {title}
        </h2>
        
        {/* Search bar */}
        <div id="header-search-container" className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            id="header-search-input"
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-slate-200 focus:bg-white outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            id="notifications-bell-btn"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileDropdown(false);
              setShowHelp(false);
            }}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {showNotifications && (
            <div id="notifications-dropdown" className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-50">
              <div className="px-4 py-1.5 border-b border-slate-100 flex justify-between items-center">
                <span className="font-semibold text-xs text-slate-700">Notifications</span>
                <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full cursor-pointer">Mark all read</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className="px-4 py-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-start gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${notif.unread ? 'bg-indigo-600' : 'bg-transparent'}`} />
                    <div className="flex-1">
                      <p className="text-xs text-slate-600 leading-tight">{notif.text}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Help Panel Toggle */}
        <div className="relative">
          <button
            id="help-guide-btn"
            onClick={() => {
              setShowHelp(!showHelp);
              setShowNotifications(false);
              setShowProfileDropdown(false);
            }}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {showHelp && (
            <div id="help-dropdown" className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-xl p-4 z-50">
              <h4 className="font-bold text-xs text-slate-800 mb-2">TaskPro Help & Quick Tips</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                Welcome to TaskPro Enterprise! You can switch views in the sidebar or change roles via the profile switcher in the top right to simulate team metrics.
              </p>
              <div className="text-[10px] text-slate-400 space-y-1">
                <p>• <b>Kanban:</b> Click column-header buttons or task tags to progress.</p>
                <p>• <b>Performance:</b> Click Monthly/Quarterly or sort tables.</p>
                <p>• <b>Chat:</b> Type messages to receive team replies.</p>
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Role Matrix Switcher */}
        <button
          id="role-grid-switcher"
          onClick={() => {
            setShowProfileDropdown(!showProfileDropdown);
            setShowNotifications(false);
            setShowHelp(false);
          }}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          title="Switch Team Member Role"
        >
          <Grid className="w-5 h-5" />
        </button>

        <div className="h-8 w-px bg-slate-200 mx-2"></div>

        {/* User Profile Info */}
        <div className="relative">
          <div
            id="profile-info-trigger"
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotifications(false);
              setShowHelp(false);
            }}
            className="flex items-center gap-3 pl-2 cursor-pointer group"
          >
            <div className="text-right hidden sm:block">
              <p className="font-semibold text-sm text-slate-800 leading-none group-hover:text-slate-900 transition-colors">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                {currentUser.role}
              </p>
            </div>
            <img
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full border border-slate-200 object-cover ring-2 ring-transparent group-hover:ring-slate-100 transition-all"
              alt={currentUser.name}
              src={currentUser.avatar}
            />
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors hidden sm:block" />
          </div>

          {/* Profile & Role Switcher Dropdown */}
          {showProfileDropdown && (
            <div id="profile-dropdown-menu" className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Currently Logged In</p>
                <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
                <p className="text-xs text-slate-500">{currentUser.role}</p>
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                <div className="px-4 py-1 border-b border-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Switch Role Perspective</p>
                </div>

                {/* Main default leader profile */}
                <button
                  id="profile-switch-leader"
                  onClick={() => {
                    setCurrentUser({
                      id: null,
                      name: 'Sarah Jenkins',
                      role: 'Project Lead',
                      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVPFrOxJGqclwonSnoQXye_wwUaRFQJI6D7ZcQJJdQmkcgaOs3qUSllkY_g8EoJrXKqyZBOTy8H6ZnrIurF46kK_uTTqqggxGJBUN2C7b_kWkNutYMRECOe0mP4JdGo8kARUufNQYRZq5jzJ0c-91-082JtJpwRgAeNqDf7F_6Woh3dopJFUwxM7dxFBaQoxbyaHfx4uhlM5y0Sm-gDdivneAIs_NSfUEdGalcthVPSQgJPF_m5Vth9j2v8ubn5qG05hbeMyQHNLCc'
                    });
                    setShowProfileDropdown(false);
                  }}
                  className="w-full px-4 py-2 hover:bg-slate-50 text-left flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[9px]">SJ</div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Sarah Jenkins</p>
                      <p className="text-[9px] text-slate-400">Project Lead</p>
                    </div>
                  </div>
                  {currentUser.id === null && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>

                {/* Team member profiles */}
                {employees.map((emp) => (
                  <button
                    id={`profile-switch-${emp.id}`}
                    key={emp.id}
                    onClick={() => {
                      setCurrentUser({
                        id: emp.id,
                        name: emp.name,
                        role: emp.role,
                        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${emp.name}`
                      });
                      setShowProfileDropdown(false);
                    }}
                    className="w-full px-4 py-2 hover:bg-slate-50 text-left flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full ${emp.avatarBg} text-white flex items-center justify-center font-bold text-[9px]`}>
                        {emp.initials}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">{emp.name}</p>
                        <p className="text-[9px] text-slate-400">{emp.role}</p>
                      </div>
                    </div>
                    {currentUser.id === emp.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
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
