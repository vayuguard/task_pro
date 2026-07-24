import React, { useState, useEffect } from "react";
import { Task, Member, ViewType } from "./types";
import { 
  LayoutDashboard, UserCheck, Kanban, FileText, TrendingUp, 
  MessageSquare, Plus, Search, Bell, HelpCircle, Grid, Settings, LogOut, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Import modular components
import KanbanBoard from "./components/KanbanBoard";
import AdminDashboard from "./components/AdminDashboard";
import EmployeeDashboard from "./components/EmployeeDashboard";
import TaskDetails from "./components/TaskDetails";
import PerformanceView from "./components/PerformanceView";
import TeamChat from "./components/TeamChat";

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewType>("kanban");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingState, setIsLoadingState] = useState(true);

  // Selected Task Focus (for boarding edit redirection)
  const [focusedTask, setFocusedTask] = useState<Task | null>(null);

  // Load initial dataset from Express API
  const loadData = async () => {
    try {
      const tasksRes = await fetch("/api/tasks");
      const tasksData = await tasksRes.json();
      setTasks(tasksData);

      const membersRes = await fetch("/api/members");
      const membersData = await membersRes.json();
      setMembers(membersData);
    } catch (err) {
      console.error("Failed loading data from API:", err);
    } finally {
      setIsLoadingState(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // API Call: Add Task
  const handleAddTask = async (taskData: Partial<Task>) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
      });
      if (response.ok) {
        await loadData();
      }
    } catch (err) {
      console.error("Failed adding task:", err);
    }
  };

  // API Call: Update Task
  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      const response = await fetch(`/api/tasks/${updatedTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask)
      });
      if (response.ok) {
        await loadData();
      }
    } catch (err) {
      console.error("Failed updating task:", err);
    }
  };

  // API Call: Delete Task
  const handleDeleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        await loadData();
      }
    } catch (err) {
      console.error("Failed deleting task:", err);
    }
  };

  // Redirection focus handle
  const handleSelectTaskForDetails = (task: Task) => {
    setFocusedTask(task);
    setActiveTab("task_details");
  };

  // Quick "+ New Task" sidebar button handler
  const handleSidebarNewTask = () => {
    setActiveTab("kanban");
    // Open modal by selecting kanban board which lists custom triggers
    const timer = setTimeout(() => {
      const addBtns = document.querySelectorAll(".kanban-column button");
      if (addBtns.length > 0) {
        (addBtns[0] as HTMLButtonElement).click();
      }
    }, 100);
  };

  if (isLoadingState) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-slate-900 animate-spin" />
        <div className="text-center space-y-1">
          <p className="font-bold text-slate-800 text-lg">TaskPro Enterprise</p>
          <p className="text-xs text-slate-400 font-medium animate-pulse">Initializing modern corporate database records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] font-sans text-slate-800 flex overflow-hidden selection:bg-slate-200">
      
      {/* 1. Dark Theme Fixed Sidebar */}
      <aside className="w-[280px] bg-[#131b2e] text-[#eceef0] h-screen fixed left-0 top-0 flex flex-col justify-between py-6 z-50 overflow-y-auto">
        <div className="space-y-8">
          {/* Brand Header */}
          <div className="px-6">
            <h1 className="text-xl font-bold font-headline-md text-white tracking-tight">TaskPro Enterprise</h1>
            <p className="text-[11px] text-[#7c839b] font-medium tracking-wide uppercase mt-1">Modern Corporate UI</p>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 space-y-1">
            {[
              { id: "dashboard", label: "Admin Dashboard", icon: LayoutDashboard },
              { id: "employee_dashboard", label: "Employee Dashboard", icon: UserCheck },
              { id: "kanban", label: "Kanban Board", icon: Kanban },
              { id: "task_details", label: "Task Details", icon: FileText },
              { id: "performance", label: "Performance", icon: TrendingUp },
              { id: "chat", label: "Team Chat", icon: MessageSquare }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`${item.id}-tab`}
                  onClick={() => {
                    setActiveTab(item.id as ViewType);
                    if (item.id !== "task_details") {
                      setFocusedTask(null);
                    }
                  }}
                  className={`w-full flex items-center gap-3.5 px-6 py-3 text-sm font-medium transition-all text-left ${
                    isActive
                      ? "bg-[#3a485c] text-white border-l-4 border-[#dae2fd]"
                      : "text-[#3f465c] hover:bg-[#3a485c]/40 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Create Button */}
          <div className="px-6 pt-2">
            <button 
              onClick={handleSidebarNewTask}
              className="w-full py-3 px-4 bg-[#dae2fd] text-[#131b2e] font-bold text-xs uppercase tracking-wider rounded-md flex items-center justify-center gap-2 hover:bg-white hover:scale-[1.02] transition-all shadow-sm cursor-pointer"
            >
              <Plus size={14} strokeWidth={3} />
              New Task
            </button>
          </div>
        </div>

        {/* Bottom utility links */}
        <div className="space-y-1">
          <a href="#" className="flex items-center gap-3.5 px-6 py-3 text-sm font-medium text-[#3f465c] hover:text-white transition-colors">
            <Settings size={18} />
            <span>Settings</span>
          </a>
          <a href="#" className="flex items-center gap-3.5 px-6 py-3 text-sm font-medium text-[#3f465c] hover:text-white transition-colors">
            <LogOut size={18} />
            <span>Logout</span>
          </a>
        </div>
      </aside>

      {/* 2. Main Content Canvas */}
      <div className="ml-[280px] flex-1 flex flex-col min-h-screen relative">
        
        {/* Top Header Navbar */}
        <header className="fixed top-0 right-0 w-[calc(100%-280px)] h-16 bg-white border-b border-slate-100 flex justify-between items-center px-6 z-40 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
          
          {/* Header Left: Search Bar */}
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-80 max-w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search tasks, teams, or projects..."
                className="w-full pl-10 pr-4 py-2 bg-[#f2f4f6] border-none rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs text-slate-700"
              />
            </div>
          </div>

          {/* Header Right: Profile and Actions */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-r border-slate-100 pr-6">
              <button className="text-slate-500 hover:bg-slate-50 p-2 rounded-lg transition-colors cursor-pointer relative">
                <Bell size={16} />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              </button>
              <button className="text-slate-500 hover:bg-slate-50 p-2 rounded-lg transition-colors cursor-pointer">
                <HelpCircle size={16} />
              </button>
              <button className="text-slate-500 hover:bg-slate-50 p-2 rounded-lg transition-colors cursor-pointer">
                <Grid size={16} />
              </button>
            </div>

            {/* Profile Info matching Mockup exactly */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800">Alex Rivera</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Admin</p>
              </div>
              <img
                className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJjv1wgSNQTwWcBx1-XAbxXpG2QHxPgUZV2zK4ljF6DuvTLTTp9kQj72EOrh0cQxaL_ceDXlPCLd0opTmufODIR2Tt45sV7AGbEznP_SgCBn5OP4CGnlwMLbapipMnGNg4icF4SDGQgSdaTeGv8Vh6O04VSWXmq1niCuujqtIVxJeHp1f2M1I1dTxWYUBkJgV8anoBtMxBlfvyfKpPbG0MoSbv6hfAGyl9tZTNz70g4-t5NeysmT-AwaIYSY3k0ohz2541XHXJXR8G"
                alt="Alex Rivera Admin"
              />
            </div>
          </div>
        </header>

        {/* 3. Render Canvas Container (Page content mount point) */}
        <main className="pt-22 pb-8 px-8 flex-1 overflow-y-auto w-full max-w-[1440px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              {activeTab === "kanban" && (
                <KanbanBoard
                  tasks={tasks}
                  members={members}
                  onUpdateTask={handleUpdateTask}
                  onAddTask={handleAddTask}
                  onDeleteTask={handleDeleteTask}
                  onSelectTaskForDetails={handleSelectTaskForDetails}
                />
              )}

              {activeTab === "dashboard" && (
                <AdminDashboard
                  tasks={tasks}
                  members={members}
                />
              )}

              {activeTab === "employee_dashboard" && (
                <EmployeeDashboard
                  tasks={tasks}
                  members={members}
                  onUpdateTask={handleUpdateTask}
                />
              )}

              {activeTab === "task_details" && (
                <TaskDetails
                  tasks={tasks}
                  members={members}
                  onUpdateTask={handleUpdateTask}
                  onAddTask={handleAddTask}
                  onDeleteTask={handleDeleteTask}
                  selectedTaskFromBoard={focusedTask}
                />
              )}

              {activeTab === "performance" && (
                <PerformanceView
                  tasks={tasks}
                  members={members}
                />
              )}

              {activeTab === "chat" && (
                <TeamChat
                  members={members}
                  currentMemberId="alex-rivera"
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
