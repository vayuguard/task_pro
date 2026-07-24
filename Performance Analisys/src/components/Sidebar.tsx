import { 
  LayoutDashboard, 
  UserCheck, 
  Trello, 
  FileText, 
  BarChart3, 
  MessageSquare, 
  Settings as SettingsIcon, 
  LogOut, 
  Plus 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewTaskClick: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onNewTaskClick }: SidebarProps) {
  const navItems = [
    { id: 'admin', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'employee', label: 'Employee Dashboard', icon: UserCheck },
    { id: 'kanban', label: 'Kanban Board', icon: Trello },
    { id: 'tasks', label: 'Task Details', icon: FileText },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'chat', label: 'Team Chat', icon: MessageSquare },
  ];

  return (
    <aside id="sidebar-container" className="fixed left-0 top-0 h-full w-[280px] bg-brand-blue flex flex-col py-6 z-50 overflow-y-auto border-r border-slate-800">
      {/* Brand Header */}
      <div id="sidebar-brand-header" className="px-6 mb-8">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          TaskPro Enterprise
        </h1>
        <p className="text-slate-400 text-xs mt-1 font-medium tracking-wider">
          Modern Corporate UI
        </p>
      </div>

      {/* Main Navigation */}
      <nav id="sidebar-navigation" className="flex-grow space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              id={`nav-item-${item.id}`}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-all duration-150 text-left group border-l-4 ${
                isActive 
                  ? 'bg-slate-800 text-white border-[#dae2fd]' 
                  : 'text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 ${
                isActive ? 'scale-105' : 'group-hover:scale-105'
              }`} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Utility Actions */}
      <div id="sidebar-footer" className="px-4 mt-auto space-y-1">
        <button
          id="sidebar-new-task-btn"
          onClick={onNewTaskClick}
          className="w-full bg-[#3a485c] hover:bg-slate-700 text-white py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 mb-6 transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>

        <button
          id="sidebar-settings-btn"
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-6 py-3 transition-colors text-left group ${
            activeTab === 'settings' 
              ? 'bg-slate-800 text-white' 
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
          }`}
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="font-medium text-sm">Settings</span>
        </button>

        <button
          id="sidebar-logout-btn"
          onClick={() => alert('Logout simulated. Redirecting to splash screen (simulated).')}
          className="w-full flex items-center gap-3 px-6 py-3 text-slate-400 hover:bg-red-950/20 hover:text-red-400 transition-colors text-left group"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
