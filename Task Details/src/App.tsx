import React, { useState, useEffect } from 'react';
import { ActiveScreen, Task, User } from './types';
import { initialTasks, teamMembers } from './initialData';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TaskDetailsView from './components/TaskDetailsView';
import AdminDashboardView from './components/AdminDashboardView';
import EmployeeDashboardView from './components/EmployeeDashboardView';
import KanbanBoardView from './components/KanbanBoardView';
import PerformanceView from './components/PerformanceView';
import TeamChatView from './components/TeamChatView';
import NewTaskModal from './components/NewTaskModal';

export default function App() {
  // Screen routing state (default to 'task-details' so the user's specific detail screenshot view loads immediately on first paint)
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('task-details');
  
  // App state
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('taskpro_tasks');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse cached tasks', e);
    }
    return initialTasks;
  });

  const [activeTaskId, setActiveTaskId] = useState<string>('Task-102');
  const [currentUser, setCurrentUser] = useState<User>(teamMembers[0]); // Marcus Wright
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  // Simulated 2FA settings states (connected directly to Task-102 functionality!)
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [totpRegistered, setTotpRegistered] = useState(false);
  const [backupCodesGenerated, setBackupCodesGenerated] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('taskpro_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleAddTask = (newTask: Task) => {
    setTasks([newTask, ...tasks]);
    setActiveTaskId(newTask.id);
    setActiveScreen('task-details');
  };

  const handleSelectTask = (task: Task) => {
    setActiveTaskId(task.id);
    setActiveScreen('task-details');
  };

  const activeTask = tasks.find((t) => t.id === activeTaskId) || tasks[0];

  // Search filter logic
  const filteredTasksForSearch = searchQuery.trim()
    ? tasks.filter((t) => {
        const query = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(query) ||
          t.project.toLowerCase().includes(query) ||
          t.id.toLowerCase().includes(query) ||
          t.labels.some((lbl) => lbl.toLowerCase().includes(query))
        );
      })
    : [];

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans">
      
      {/* Primary Sidebar Control Plane */}
      <Sidebar
        activeScreen={activeScreen}
        onScreenChange={(screen) => {
          setActiveScreen(screen);
          setSearchQuery(''); // clear search on navigation
        }}
        onNewTaskClick={() => setShowNewTaskModal(true)}
      />

      {/* Top Search & Profile Panel */}
      <Header
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        teamMembers={teamMembers}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Screen Content Body */}
      <main className="ml-[280px] mt-16 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-[#f7f9fb] transition-all">
        {/* If Search Query is Active, Override Screen with instant matching results list! */}
        {searchQuery.trim() ? (
          <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Search Results for "{searchQuery}"</h2>
              <p className="text-xs text-slate-500 mt-1">Found {filteredTasksForSearch.length} matching corporate workspace tasks.</p>
            </div>
            
            {filteredTasksForSearch.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-500 text-sm">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">find_in_page</span>
                <p>No tasks matched your query. Try searching for "Auth", "Redesign", "Stripe", or "Task-102".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTasksForSearch.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleSelectTask(task)}
                    className="bg-white border border-[#c6c6cd] rounded-xl p-5 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">{task.id} • {task.project}</span>
                      <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-bold">{task.priority}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1 hover:text-blue-600 transition-colors">{task.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{task.description}</p>
                    <div className="flex items-center gap-2">
                      <img
                        className="w-5 h-5 rounded-full object-cover"
                        src={task.assignee.avatar}
                        alt={task.assignee.name}
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-xs text-slate-600 font-medium">{task.assignee.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Normal Router Views */
          (() => {
            switch (activeScreen) {
              case 'task-details':
                return (
                  <TaskDetailsView
                    task={activeTask}
                    onUpdateTask={handleUpdateTask}
                    currentUser={currentUser}
                  />
                );
              case 'admin-dashboard':
                return (
                  <AdminDashboardView
                    tasks={tasks}
                    onTaskSelect={handleSelectTask}
                    teamMembers={teamMembers}
                    onNewTaskClick={() => setShowNewTaskModal(true)}
                  />
                );
              case 'employee-dashboard':
                return (
                  <EmployeeDashboardView
                    tasks={tasks}
                    currentUser={currentUser}
                    onTaskSelect={handleSelectTask}
                    onUpdateTask={handleUpdateTask}
                  />
                );
              case 'kanban-board':
                return (
                  <KanbanBoardView
                    tasks={tasks}
                    onTaskSelect={handleSelectTask}
                    onUpdateTask={handleUpdateTask}
                  />
                );
              case 'performance':
                return <PerformanceView tasks={tasks} />;
              case 'team-chat':
                return <TeamChatView currentUser={currentUser} />;
              case 'settings':
                return (
                  <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-8 flex flex-col gap-8 select-none">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-[#191c1e]">Security & Workspace Settings</h2>
                      <p className="text-xs text-[#45464d] mt-1">Configure workspace rules, company branding, and MFA protocols related to Task-102.</p>
                    </div>

                    {/* Simulated Auth Config Widget (Ties directly to Task-102) */}
                    <div className="bg-white border border-[#c6c6cd] p-6 rounded-xl shadow-2xs flex flex-col gap-6">
                      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-500">lock_open</span>
                          Simulate Multi-Factor Auth (Task-102 Prototype)
                        </h3>
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">Compliance Demo</span>
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="text-xs font-bold text-slate-800">Toggle Multi-Factor Auth (MFA)</p>
                            <p className="text-[11px] text-slate-400">Force verification passcode logins for security.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setMfaEnabled(!mfaEnabled);
                              if (!mfaEnabled) {
                                alert('MFA Enabled. Please secure your TOTP authenticator key.');
                              }
                            }}
                            className={`w-12 h-6 rounded-full relative transition-colors ${
                              mfaEnabled ? 'bg-green-600' : 'bg-slate-300'
                            }`}
                          >
                            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-all ${
                              mfaEnabled ? 'right-0.5' : 'left-0.5'
                            }`}></span>
                          </button>
                        </div>

                        {mfaEnabled && (
                          <div className="border border-[#c6c6cd] p-4 rounded-lg flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-xs font-bold text-slate-800">Step 2: Setup Authenticator Key (TOTP)</p>
                                <p className="text-[11px] text-slate-400 mt-1">Scan QR Code or register seed key with Google Authenticator or Authy.</p>
                                <p className="text-[10px] text-slate-500 font-mono mt-2 bg-slate-100 p-1.5 rounded inline-block">Seed: K3RU MD8S ZJS2 YK9F</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setTotpRegistered(true);
                                  alert('TOTP seed verified successfully!');
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                  totpRegistered ? 'bg-green-100 text-green-700' : 'bg-[#131b2e] text-white hover:bg-slate-800'
                                }`}
                              >
                                {totpRegistered ? 'Verified ✓' : 'Verify seed'}
                              </button>
                            </div>

                            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                              <div>
                                <p className="text-xs font-bold text-slate-800">Step 3: Recovery Codes</p>
                                <p className="text-[11px] text-slate-400">Secure emergency codes for logging in if you lose phone access.</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setBackupCodesGenerated(true);
                                  alert("Backup codes generated successfully:\n\n1422-5523\n8834-0012\n9521-7756\n\nPlease keep them secure!");
                                }}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                              >
                                {backupCodesGenerated ? 'Re-generate Codes' : 'Generate Codes'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Workspace Customizations */}
                    <div className="bg-white border border-[#c6c6cd] p-6 rounded-xl shadow-2xs flex flex-col gap-4">
                      <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Corporate Settings</h3>
                      <div className="space-y-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 uppercase mb-1">Enterprise Domain Name</label>
                          <input type="text" readOnly value="taskpro.enterprise.com" className="w-full bg-slate-50 border border-[#c6c6cd] p-2 rounded text-slate-500" />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 uppercase mb-1">Active Integration Hooks</label>
                          <p className="text-[#45464d] leading-relaxed">Stripe Billing sandbox, Cloud Build Runner, Q4 Audit Compliance Signer</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              default:
                return null;
            }
          })()
        )}
      </main>

      {/* New Task Dialog Modal */}
      {showNewTaskModal && (
        <NewTaskModal
          onClose={() => setShowNewTaskModal(false)}
          onAddTask={handleAddTask}
        />
      )}
    </div>
  );
}
