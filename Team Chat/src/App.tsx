import React, { useState, useEffect } from "react";
import { 
  Bell, 
  HelpCircle, 
  Grid, 
  Search, 
  Plus, 
  X, 
  CheckCircle2, 
  Settings, 
  LogOut,
  SlidersHorizontal,
  CloudLightning,
  Sparkles
} from "lucide-react";
import { ActiveView, Task } from "./types";
import Sidebar from "./components/Sidebar";
import TeamChat from "./components/TeamChat";
import AdminDashboard from "./components/AdminDashboard";
import EmployeeDashboard from "./components/EmployeeDashboard";
import KanbanBoard from "./components/KanbanBoard";
import TaskDetails from "./components/TaskDetails";
import Performance from "./components/Performance";

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>("team-chat");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  // Modals / Popups toggles
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  // Quick deploy task form states
  const [modalTitle, setModalTitle] = useState("");
  const [modalDesc, setModalDesc] = useState("");
  const [modalPriority, setModalPriority] = useState<'low' | 'medium' | 'high'>("medium");
  const [modalAssignee, setModalAssignee] = useState("Sarah Chen");

  // Load avatar from template
  const headerAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuC094eM06sW5W0zl9Qc6ZEH3Mc66wfumLvkjiUFBlVKnQV8ct9IbJuXYpYWRoYuhkaJgLHqCUxVi7GdNb5y3fQ4lbXPPTALfvX3euW1KhZlyultm0Ma-HDtYs-5iVEbdJxZuBAoElJB3JEFe1MiWLxB2HHT-Lm2DVIn_1KIRO9ekTLFIKtjnNG8uVTtxKLHJlQDzJRM9fXYJCZ9eIdJCl_JdMCOyxLcpA16UBAiDObFQckmyGXezstzbHwZAXPNuXXVMzDralR_hJqa";

  // Load tasks on startup
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    fetch("/api/tasks")
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        if (data.length > 0 && !selectedTaskId) {
          setSelectedTaskId(data[0].id);
        }
      })
      .catch(err => console.error("Error loading tasks:", err));
  };

  // Task operation callbacks
  const handleAddTask = (title: string, description: string, priority: 'low' | 'medium' | 'high', assigneeName: string, status: string = "todo") => {
    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, priority, assigneeName, status })
    })
      .then(res => res.json())
      .then(newTask => {
        setTasks(prev => [...prev, newTask]);
        setSelectedTaskId(newTask.id);
      })
      .catch(err => console.error("Error creating task:", err));
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: string) => {
    fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(updatedTask => {
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      })
      .catch(err => console.error("Error updating status:", err));
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    })
      .then(res => res.json())
      .then(updatedTask => {
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      })
      .catch(err => console.error("Error updating task details:", err));
  };

  const handleDeleteTask = (taskId: string) => {
    // Local state deletion simulation for UI safety
    setTasks(prev => {
      const next = prev.filter(t => t.id !== taskId);
      if (selectedTaskId === taskId) {
        setSelectedTaskId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
  };

  const handleNavigateToTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setActiveView("task-details");
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim()) return;

    handleAddTask(modalTitle, modalDesc, modalPriority, modalAssignee, "todo");
    
    // Close and reset
    setShowNewTaskModal(false);
    setModalTitle("");
    setModalDesc("");
    setModalPriority("medium");
    setModalAssignee("Sarah Chen");
    
    // Redirect to Kanban Board to see the task immediately
    setActiveView("kanban-board");
  };

  // Get completed and total counts for Team Momentum sidebar widget
  const completedCount = tasks.filter(t => t.status === "done").length;
  const totalCount = tasks.length;

  return (
    <div id="taskpro-root" className="min-h-screen bg-slate-50 flex text-slate-800 antialiased overflow-hidden select-none">
      
      {/* Dark Sidebar Navigation panel */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        completedTasksCount={completedCount}
        totalTasksCount={totalCount}
        onNewTaskClick={() => setShowNewTaskModal(true)}
        onSettingsClick={() => setShowSettingsModal(true)}
        onLogoutClick={() => setShowLogoutAlert(true)}
      />

      {/* Global Right Panel Canvas Area */}
      <div id="main-panel-container" className="flex-1 ml-[280px] h-screen flex flex-col overflow-hidden">
        
        {/* Top Header Navigation bar */}
        <header id="app-header-bar" className="fixed top-0 right-0 w-[calc(100%-280px)] h-16 bg-white border-b border-outline-variant flex justify-between items-center px-6 z-40">
          
          {/* Quick search panel */}
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-70" />
              <input 
                type="text" 
                placeholder="Search messages, files, or people..." 
                className="w-full bg-slate-50 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white text-slate-800 transition-all font-sans"
              />
            </div>
          </div>

          {/* Action icon links */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-on-surface-variant hover:bg-slate-50 rounded-full transition-colors relative cursor-pointer">
              <Bell className="w-5 h-5 text-slate-600 hover:text-slate-900" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-slate-50 rounded-full transition-colors cursor-pointer">
              <HelpCircle className="w-5 h-5 text-slate-600 hover:text-slate-900" />
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-slate-50 rounded-full transition-colors cursor-pointer">
              <Grid className="w-5 h-5 text-slate-600 hover:text-slate-900" />
            </button>
            
            {/* User Profile Avatar headshot */}
            <div 
              onClick={() => setActiveView("employee-dashboard")}
              className="h-9 w-9 rounded-full overflow-hidden border border-outline-variant ml-2 cursor-pointer hover:brightness-95 transition-all shadow-sm"
              title="Employee Profile Workspace"
            >
              <img className="w-full h-full object-cover" src={headerAvatar} alt="My headshot" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        {/* Content Box dynamically loaded based on Active Tab */}
        <main id="view-content-wrapper" className="pt-16 h-full flex flex-col overflow-hidden bg-[#F8FAFC]">
          {activeView === "admin-dashboard" && (
            <AdminDashboard 
              tasks={tasks} 
              onNavigateToView={setActiveView} 
              onNavigateToTask={handleNavigateToTask}
            />
          )}

          {activeView === "employee-dashboard" && (
            <EmployeeDashboard 
              tasks={tasks} 
              onUpdateTaskStatus={handleUpdateTaskStatus} 
              onAddTask={handleAddTask}
            />
          )}

          {activeView === "kanban-board" && (
            <KanbanBoard 
              tasks={tasks} 
              onUpdateTaskStatus={handleUpdateTaskStatus} 
              onAddTask={handleAddTask} 
              onNavigateToTask={handleNavigateToTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeView === "task-details" && (
            <TaskDetails 
              tasks={tasks} 
              selectedTaskId={selectedTaskId} 
              onSelectTask={setSelectedTaskId} 
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeView === "performance" && (
            <Performance tasks={tasks} />
          )}

          {activeView === "team-chat" && (
            <TeamChat onTasksUpdated={fetchTasks} />
          )}
        </main>
      </div>

      {/* Deploy New Task Modal panel */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4.5 h-4.5 text-sky-400" />
                Deploy Corporate Task
              </h3>
              <button 
                onClick={() => setShowNewTaskModal(false)}
                className="text-slate-300 hover:text-white cursor-pointer bg-slate-800 p-1 rounded"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <form onSubmit={handleModalSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Task Title</label>
                <input 
                  id="modal-title-input"
                  type="text" 
                  placeholder="e.g. Audit Express backend router specs" 
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Task Description</label>
                <textarea 
                  placeholder="Specify requirements, deadlines, and deliverables..." 
                  value={modalDesc}
                  onChange={(e) => setModalDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Priority Rating</label>
                  <select 
                    value={modalPriority}
                    onChange={(e: any) => setModalPriority(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2 text-xs text-slate-850 mt-1 focus:ring-1 focus:ring-slate-400 font-medium"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Assignee</label>
                  <select 
                    value={modalAssignee}
                    onChange={(e) => setModalAssignee(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg p-2 text-xs text-slate-850 mt-1 focus:ring-1 focus:ring-slate-400 font-medium"
                  >
                    <option value="Sarah Chen">Sarah Chen</option>
                    <option value="Alex Rivers">Alex Rivers</option>
                    <option value="David Miller">David Miller</option>
                    <option value="User">User (You)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 border border-slate-250 bg-slate-50 hover:bg-slate-100 rounded text-xs font-semibold cursor-pointer text-slate-600"
                >
                  Cancel
                </button>
                <button 
                  id="btn-modal-deploy"
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer shadow-sm"
                >
                  Deploy Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal panel */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Settings className="w-4.5 h-4.5 text-sky-400 animate-spin" />
                TaskPro Settings panel
              </h3>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-300 hover:text-white cursor-pointer bg-slate-800 p-1 rounded"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 text-slate-700">
              <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs">
                <CloudLightning className="w-5 h-5 text-indigo-600 fill-indigo-100" />
                <div>
                  <p className="font-bold text-indigo-900">TaskPro Cloud Sync Connected</p>
                  <p className="text-indigo-700 mt-0.5">Real-time telemetry streams are active and secure.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-400">Environment Host:</span>
                  <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">Cloud Run Sandbox</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-400">Gemini LLM Provider:</span>
                  <span className="font-mono text-[10px] bg-violet-50 px-2 py-0.5 rounded text-violet-700 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-violet-600" />
                    gemini-3.5-flash
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-400">Security Encryptions:</span>
                  <span className="text-slate-700 font-semibold text-xs">AES-256 System-Locked</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Close Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Alert popup */}
      {showLogoutAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Terminate Active Session?</h3>
              <p className="text-xs text-slate-400 mt-1">This will log you out of TaskPro Enterprise and return you to terminal. Confirm action?</p>
            </div>
            
            <div className="flex gap-2 justify-center pt-2">
              <button 
                onClick={() => setShowLogoutAlert(false)}
                className="px-4 py-2 border border-slate-250 bg-slate-50 hover:bg-slate-100 rounded text-xs font-semibold cursor-pointer text-slate-600"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowLogoutAlert(false);
                  alert("Logged out successfully! Refresh the page to log back in.");
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold cursor-pointer shadow-sm"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
