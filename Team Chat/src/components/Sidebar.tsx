import { 
  LayoutDashboard, 
  UserCheck, 
  Kanban, 
  FileText, 
  TrendingUp, 
  MessageSquare, 
  Plus, 
  Settings, 
  LogOut, 
  Zap 
} from "lucide-react";
import { ActiveView } from "../types";

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  completedTasksCount: number;
  totalTasksCount: number;
  onNewTaskClick: () => void;
  onSettingsClick: () => void;
  onLogoutClick: () => void;
}

export default function Sidebar({
  activeView,
  setActiveView,
  completedTasksCount,
  totalTasksCount,
  onNewTaskClick,
  onSettingsClick,
  onLogoutClick
}: SidebarProps) {
  // Calculate percentage for momentum
  const momentumPercent = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 0;

  const menuItems = [
    { id: "admin-dashboard", label: "Admin Dashboard", icon: LayoutDashboard },
    { id: "employee-dashboard", label: "Employee Dashboard", icon: UserCheck },
    { id: "kanban-board", label: "Kanban Board", icon: Kanban },
    { id: "task-details", label: "Task Details", icon: FileText },
    { id: "performance", label: "Performance", icon: TrendingUp },
    { id: "team-chat", label: "Team Chat", icon: MessageSquare },
  ] as const;

  return (
    <aside id="app-sidebar" className="fixed left-0 top-0 h-full w-[280px] bg-primary-container flex flex-col py-6 z-50 text-slate-300">
      {/* Brand Header */}
      <div className="px-6 mb-8">
        <h1 className="font-headline-md text-xl font-bold text-white tracking-tight">TaskPro Enterprise</h1>
        <p className="text-xs text-on-primary-container opacity-80 mt-1 font-medium">Modern Corporate UI</p>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              id={`nav-link-${item.id}`}
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3.5 transition-all duration-200 text-left font-sans text-sm ${
                isActive 
                  ? "bg-on-secondary-fixed-variant text-white border-l-4 border-secondary-fixed font-semibold"
                  : "hover:bg-on-secondary-fixed-variant/40 hover:text-white text-slate-400"
              }`}
            >
              <IconComponent className={`w-5 h-5 ${isActive ? "text-secondary-fixed" : ""}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer & Momentum */}
      <div className="mt-auto px-6 space-y-4">
        {/* Team Momentum Widget */}
        <div id="momentum-widget" className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-slate-200">Team Momentum</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mb-1.5 overflow-hidden">
            <div 
              className="bg-sky-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.max(momentumPercent, 10)}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400 font-medium font-sans">
            {completedTasksCount} of {totalTasksCount} tasks completed ({momentumPercent}%)
          </p>
        </div>

        {/* Action button */}
        <button 
          id="btn-sidebar-new-task"
          onClick={onNewTaskClick}
          className="w-full bg-slate-850 hover:bg-slate-800 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold border border-slate-700 hover:border-slate-500 transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>

        {/* Settings / Logout links */}
        <div className="pt-4 border-t border-slate-800 space-y-1.5">
          <button 
            id="btn-sidebar-settings"
            onClick={onSettingsClick}
            className="w-full flex items-center gap-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors text-left"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          <button 
            id="btn-sidebar-logout"
            onClick={onLogoutClick}
            className="w-full flex items-center gap-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
