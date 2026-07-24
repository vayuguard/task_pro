import { TabType } from '../types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onNewTaskClick: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onNewTaskClick }: SidebarProps) {
  const menuItems = [
    { id: 'admin_dashboard' as TabType, label: 'Admin Dashboard', icon: 'dashboard' },
    { id: 'employee_dashboard' as TabType, label: 'Employee Dashboard', icon: 'person_check' },
    { id: 'kanban_board' as TabType, label: 'Kanban Board', icon: 'view_kanban' },
    { id: 'task_details' as TabType, label: 'Task Details', icon: 'assignment' },
    { id: 'performance' as TabType, label: 'Performance', icon: 'insights' },
    { id: 'team_chat' as TabType, label: 'Team Chat', icon: 'forum', badge: 3 },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] bg-[#131b2e] text-slate-200 flex flex-col py-6 z-50 border-r border-slate-800">
      <div className="px-6 mb-10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sky-400 text-3xl font-bold">query_stats</span>
          <h1 className="font-headline-md text-xl font-bold text-white tracking-tight">TaskPro Enterprise</h1>
        </div>
        <p className="text-slate-400 text-xs mt-1 font-mono tracking-wider">Modern Corporate UI</p>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-6 py-3.5 text-left transition-all duration-150 group relative ${
                isActive
                  ? 'bg-slate-800/80 text-white font-medium border-l-4 border-sky-400'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={`material-symbols-outlined transition-colors ${
                    isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="text-[14px]">{item.label}</span>
              </div>
              {item.badge && item.badge > 0 && (
                <span className="bg-sky-500 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-6 mt-auto space-y-4">
        <button
          onClick={onNewTaskClick}
          className="w-full py-3 bg-sky-500 text-[#131b2e] hover:bg-sky-400 font-bold rounded-lg flex items-center justify-center gap-2 transition-colors duration-150 shadow-md shadow-sky-950/20 active:translate-y-[1px]"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span className="text-[14px]">New Task</span>
        </button>

        <div className="pt-4 border-t border-slate-800 space-y-1">
          <button
            onClick={() => alert('Settings module loaded. Custom API Keys can be configured in the Secrets pane.')}
            className="w-full flex items-center gap-3.5 py-2 px-2 text-[13px] text-slate-400 hover:text-white hover:bg-slate-800/35 rounded transition-all duration-150 text-left"
          >
            <span className="material-symbols-outlined text-lg text-slate-500">settings</span>
            <span>Settings</span>
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to sign out of the corporate portal?')) {
                alert('Session ended successfully.');
              }
            }}
            className="w-full flex items-center gap-3.5 py-2 px-2 text-[13px] text-slate-400 hover:text-rose-400 hover:bg-rose-950/10 rounded transition-all duration-150 text-left"
          >
            <span className="material-symbols-outlined text-lg text-slate-500">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
