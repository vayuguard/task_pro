import { useState } from 'react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notificationsCount: number;
}

export default function Header({ searchQuery, setSearchQuery, notificationsCount }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const notifications = [
    { id: 1, text: 'New Security Threat detected in Firewall logs', time: '10m ago', urgent: true },
    { id: 2, text: 'System Maintenance scheduled for 23:00 UTC', time: '2h ago', urgent: false },
    { id: 3, text: 'Sarah Chen updated "API Documentation"', time: '3h ago', urgent: false },
  ];

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-280px)] h-16 bg-white border-b border-slate-200 flex justify-between items-center px-6 z-40">
      {/* Interactive Search Bar */}
      <div className="flex items-center bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200 w-96 transition-all focus-within:border-slate-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-100">
        <span className="material-symbols-outlined text-slate-400 mr-2 text-xl">search</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks, teams, or reports..."
          className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-800 placeholder-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-slate-400 hover:text-slate-600 font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
      </div>

      {/* Action Buttons & User Profile */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-slate-500 relative">
          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-full transition-colors relative hover:bg-slate-50 hover:text-slate-800 ${
                showNotifications ? 'bg-slate-100 text-slate-800' : ''
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {notificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                  <span className="font-semibold text-xs uppercase text-slate-500 tracking-wider">Alert Center</span>
                  <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {notificationsCount} New
                  </span>
                </div>
                <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3.5 hover:bg-slate-50/50 transition-colors">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className={`text-[12px] font-medium leading-normal ${n.urgent ? 'text-rose-900 font-semibold' : 'text-slate-700'}`}>
                          {n.text}
                        </p>
                        {n.urgent && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 pt-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] text-sky-600 font-bold hover:text-sky-800 uppercase tracking-widest"
                  >
                    Close Panel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Help Resource Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className={`p-2 rounded-full transition-colors hover:bg-slate-50 hover:text-slate-800 ${
                showHelp ? 'bg-slate-100 text-slate-800' : ''
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">help</span>
            </button>
            {showHelp && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-4 z-50 text-slate-700">
                <h4 className="font-semibold text-xs uppercase text-slate-500 tracking-wider mb-2">Help Desk</h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <a href="#" className="hover:text-sky-600 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">book</span>
                      <span>API Reference Docs</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-sky-600 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">support_agent</span>
                      <span>Internal Slack Channel</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-sky-600 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">terminal</span>
                      <span>CLI Development Kit</span>
                    </a>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* App Directory Menu */}
          <button
            onClick={() => alert('Corporate App Grid: Directory linked to internal ERP and AWS Cloud Control Console.')}
            className="p-2 rounded-full transition-colors hover:bg-slate-50 hover:text-slate-800"
          >
            <span className="material-symbols-outlined text-[22px]">apps</span>
          </button>
        </div>

        {/* User Identity */}
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-900 leading-none">Marcus Thorne</p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Chief Operations</p>
          </div>
          <img
            className="w-10 h-10 rounded-full border border-slate-200 object-cover hover:ring-2 hover:ring-slate-100 transition-all duration-150 cursor-pointer"
            alt="Marcus Thorne, Chief Operations"
            referrerPolicy="no-referrer"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKWPkJfegr9YENVXozHwAK3Xtv6oBBqUylwH3ZfjPCcjB59-QlIEAn1xy9Kc3rK8GcO-UEfUuUWkmVulLZyxMTdPIOleQd9kr_1fKLb2Oj-py3jCa6sObu5maRlA8jpqTVSwOxtZAhzAUxyv56q0m_RtYQasPpif1WfriwzO3nfRZ66adACpjhmPoybkQ8_cj9_M4ydArSa0yXweEkEs4w5Jsaf18eKzgczVL8n6P9-lyoewCx3IXIliZUeiAZvtQNcNY8nyiHEJZS"
          />
        </div>
      </div>
    </header>
  );
}
