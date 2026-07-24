import { 
  LayoutDashboard, 
  Briefcase, 
  Trello, 
  FileText, 
  TrendingUp, 
  MessageSquare, 
  Plus, 
  Settings, 
  LogOut 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNewTaskClick: () => void;
  onLogProgressClick: () => void;
  urgentTasksCount: number;
}

export default function Sidebar({ 
  activeTab, 
  onTabChange, 
  onNewTaskClick, 
  urgentTasksCount 
}: SidebarProps) {
  const menuItems = [
    { id: 'admin', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'employee', label: 'Employee Dashboard', icon: Briefcase, count: urgentTasksCount > 0 ? urgentTasksCount : undefined },
    { id: 'kanban', label: 'Kanban Board', icon: Trello },
    { id: 'tasks', label: 'Task Details', icon: FileText },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'chat', label: 'Team Chat', icon: MessageSquare, badge: 'New' },
  ];

  return (
    <aside 
      id="sidebar" 
      className="fixed left-0 top-0 h-full w-[280px] bg-[#0F172A] text-slate-300 flex flex-col py-6 z-50 border-r border-slate-800"
    >
      {/* Brand Logo */}
      <div className="px-6 mb-8">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center text-white font-extrabold text-sm">
            TP
          </span>
          TaskPro Enterprise
        </h1>
        <p className="text-xs text-slate-400 mt-1">Modern Corporate UI</p>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-6 py-3 transition-all duration-200 text-left ${
                isActive
                  ? 'bg-slate-800 text-white border-l-4 border-blue-500 font-medium'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? 'text-blue-400' : 'text-slate-400'} />
                <span className="text-sm">{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.count}
                </span>
              )}
              {item.badge && !isActive && (
                <span className="bg-blue-500/20 text-blue-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer Actions */}
      <div className="mt-auto pt-6 px-6 space-y-3 border-t border-slate-800">
        <button 
          onClick={onNewTaskClick}
          className="w-full py-2.5 px-4 bg-blue-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 active:scale-98 transition-all shadow-lg shadow-blue-500/10 cursor-pointer"
        >
          <Plus size={18} />
          New Task
        </button>

        <button 
          onClick={() => onTabChange('settings')}
          className={`w-full flex items-center gap-3 py-2 text-sm transition-colors text-left ${
            activeTab === 'settings' ? 'text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings size={18} />
          Settings
        </button>
        
        <button 
          onClick={() => {
            if (confirm('Are you sure you want to logout?')) {
              alert('Logged out. Reloading presentation data...');
              window.location.reload();
            }
          }}
          className="w-full flex items-center gap-3 py-2 text-sm text-slate-400 hover:text-rose-400 transition-colors text-left"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
