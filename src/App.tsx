import React, { useState, useEffect } from 'react';
import { ActiveScreen, Task, EmployeeMetrics, ProgressLog, ProjectHealth, User } from './types';
import { projectsHealth } from './initialData';
import { useAuth } from './auth/AuthContext';
import {
  canAccessScreen,
  canCreateTasks,
  defaultScreenForRole
} from './auth/auth';
import { getVisibleTasks, normalizeTasks, enrichUserWithEmail } from './utils/tasks';
import {
  apiBootstrap,
  apiCreateTask,
  apiUpdateTask
} from './api/client';
import LoginPage from './components/LoginPage';
import MfaPage from './components/MfaPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TaskDetailsView from './components/TaskDetailsView';
import AdminDashboardView from './components/AdminDashboardView';
import EmployeeDashboardView from './components/EmployeeDashboardView';
import KanbanBoardView from './components/KanbanBoardView';
import PerformanceView from './components/PerformanceView';
import TeamChatView from './components/TeamChatView';
import SettingsView from './components/SettingsView';
import NewTaskModal from './components/NewTaskModal';
import AccessDenied from './components/AccessDenied';
import { AnimatePresence, motion, staggerContainer, staggerItem, pageVariants, pageFadeVariants } from './components/ui/motion';
import { LiquidBackground } from './components/ui/Glass';
import { syncWorkingHours, transitionTaskStatus } from './utils/taskTiming';

function AppShell() {
  const { session, isLoggedIn, requiresMfa, login, verifyMfa, logout } = useAuth();

  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('employee-dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [employees, setEmployees] = useState<EmployeeMetrics[]>([]);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [health, setHealth] = useState<ProjectHealth[]>(projectsHealth);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const reloadBootstrap = () => {
    apiBootstrap()
      .then((data) => {
        setTasks(normalizeTasks(data.tasks));
        setEmployees(data.employees as EmployeeMetrics[]);
        setProgressLogs(data.progressLogs as ProgressLog[]);
        setHealth((data.projectsHealth as ProjectHealth[]) || projectsHealth);
        setTeamMembers((data.teamMembers as User[]) || []);
        setDbReady(true);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (session?.role) {
      setActiveScreen(defaultScreenForRole(session.role));
    }
  }, [session?.userId]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => {
      if (mq.matches) setSidebarOpen(false);
    };
    mq.addEventListener('change', closeOnDesktop);
    return () => mq.removeEventListener('change', closeOnDesktop);
  }, []);

  // Load all data from MongoDB when authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      setDbReady(false);
      return;
    }

    let cancelled = false;
    setLoadingData(true);
    setDbError('');

    apiBootstrap()
      .then((data) => {
        if (cancelled) return;
        setTasks(normalizeTasks(data.tasks));
        setEmployees(data.employees as EmployeeMetrics[]);
        setProgressLogs(data.progressLogs as ProgressLog[]);
        setHealth((data.projectsHealth as ProjectHealth[]) || projectsHealth);
        setTeamMembers((data.teamMembers as User[]) || []);
        setDbReady(true);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setDbError(err instanceof Error ? err.message : 'Failed to load data from MongoDB');
        setDbReady(true);
      })
      .finally(() => {
        if (!cancelled) setLoadingData(false);
      });

    return () => { cancelled = true; };
  }, [isLoggedIn, session?.userId]);

  if (!session) {
    return <LoginPage onLogin={login} />;
  }

  if (requiresMfa) {
    return (
      <MfaPage
        email={session.email}
        onVerify={verifyMfa}
        onLogout={logout}
      />
    );
  }

  if (!isLoggedIn || !session) {
    return <LoginPage onLogin={login} />;
  }

  const currentUser = enrichUserWithEmail(session.profile);
  const userRole = session.role;
  const visibleTasks = getVisibleTasks(tasks, currentUser, userRole);

  // Keep live work hours fresh for In Motion tasks
  useEffect(() => {
    const id = window.setInterval(() => {
      setTasks((prev) => {
        let changed = false;
        const next = prev.map((t) => {
          if (t.status !== 'In Progress') return t;
          const synced = syncWorkingHours(t);
          if (synced.timeLogged !== t.timeLogged) changed = true;
          return synced;
        });
        return changed ? next : prev;
      });
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const handleUpdateTask = (updatedTask: Task) => {
    const prev = tasks.find((t) => t.id === updatedTask.id);
    let toSave = updatedTask;
    if (prev && prev.status !== updatedTask.status) {
      // Prefer timing-aware transition if caller only flipped status
      const alreadyTimed =
        Array.isArray(updatedTask.statusHistory) &&
        updatedTask.statusHistory.length > (prev.statusHistory?.length || 0);
      if (!alreadyTimed) {
        toSave = transitionTaskStatus(
          { ...prev, ...updatedTask, status: prev.status, statusHistory: prev.statusHistory },
          updatedTask.status,
          currentUser
        );
      }
    } else if (updatedTask.status === 'In Progress') {
      toSave = syncWorkingHours(updatedTask);
    }

    const normalized = normalizeTasks([toSave])[0];
    setTasks((prevTasks) => prevTasks.map((t) => (t.id === normalized.id ? normalized : t)));
    apiUpdateTask(normalized).catch(console.error);
  };

  const handleAddTask = (newTask: Task) => {
    const normalized = normalizeTasks([newTask])[0];
    setTasks((prev) => [normalized, ...prev]);
    setActiveTaskId(normalized.id);
    setActiveScreen('task-details');
    apiCreateTask(normalized).catch(console.error);
  };

  const handleSelectTask = (task: Task) => {
    setActiveTaskId(task.id);
    setActiveScreen('task-details');
  };

  const handleScreenChange = (screen: ActiveScreen) => {
    if (canAccessScreen(userRole, screen)) {
      setActiveScreen(screen);
      setSearchQuery('');
    } else {
      setActiveScreen(screen);
    }
    setSidebarOpen(false);
  };

  const activeTask = visibleTasks.find((t) => t.id === activeTaskId) || visibleTasks[0];
  const filteredSearch = searchQuery.trim()
    ? visibleTasks.filter((t) => {
        const q = searchQuery.toLowerCase();
        return t.title.toLowerCase().includes(q) || t.project.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
      })
    : [];

  const renderScreen = () => {
    if (!canAccessScreen(userRole, activeScreen)) {
      return (
        <AccessDenied
          screenName={activeScreen.replace('-', ' ')}
          onGoBack={() => setActiveScreen(defaultScreenForRole(userRole))}
        />
      );
    }

    switch (activeScreen) {
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
            tasks={visibleTasks}
            currentUser={currentUser}
            onTaskSelect={handleSelectTask}
            onUpdateTask={handleUpdateTask}
          />
        );
      case 'kanban-board':
        return (
          <KanbanBoardView
            tasks={visibleTasks}
            currentUser={currentUser}
            onTaskSelect={handleSelectTask}
            onUpdateTask={handleUpdateTask}
          />
        );
      case 'task-details':
        return activeTask ? (
          <TaskDetailsView
            task={activeTask}
            onUpdateTask={handleUpdateTask}
            currentUser={currentUser}
            teamMembers={teamMembers}
          />
        ) : (
          <div className="p-12 text-center">
            <div className="liquid-glass rounded-2xl p-10 max-w-md mx-auto">
              <span className="material-symbols-outlined text-5xl text-neutral-300">assignment</span>
              <p className="text-slate-600 font-medium mt-3">No task selected</p>
              <p className="text-sm text-slate-400 mt-1">Pick a task from My Tasks or Kanban.</p>
              <button
                onClick={() => setActiveScreen(userRole === 'admin' ? 'admin-dashboard' : 'employee-dashboard')}
                className="btn-accent mt-5 px-5 py-2 text-sm"
              >
                Browse Tasks
              </button>
            </div>
          </div>
        );
      case 'performance':
        return (
          <PerformanceView
            tasks={tasks}
            employees={employees}
            progressLogs={progressLogs}
            projectsHealth={health}
            teamMembers={teamMembers}
            onTaskSelect={handleSelectTask}
          />
        );
      case 'team-chat':
        return (
          <TeamChatView
            currentUser={currentUser}
            teamMembers={teamMembers}
            isAdmin={userRole === 'admin'}
            userRole={userRole}
          />
        );
      case 'settings':
        return (
          <SettingsView
            currentUser={currentUser}
            isAdmin={userRole === 'admin'}
            onTeamChanged={reloadBootstrap}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen overflow-hidden gradient-mesh text-ink font-sans relative overscroll-none">
      <LiquidBackground />

      <Sidebar
        activeScreen={activeScreen}
        userRole={userRole}
        onScreenChange={handleScreenChange}
        onNewTaskClick={() => setShowNewTaskModal(true)}
        onLogout={logout}
        canCreateTasks={canCreateTasks(userRole)}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Header
        currentUser={currentUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLogout={logout}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <main
        className={`ml-0 lg:ml-[280px] mt-14 sm:mt-16 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] custom-scrollbar ${
          activeScreen === 'team-chat' ? 'overflow-hidden' : 'overflow-y-auto'
        }`}
      >
        {dbError && (
          <div className="mx-3 sm:mx-6 mt-4 liquid-glass rounded-xl px-3 sm:px-4 py-3 text-sm text-amber-800 border border-amber-200/60">
            MongoDB sync warning: {dbError}. Using local fallback data.
          </div>
        )}
        {loadingData && !dbReady && (
          <div className="flex items-center justify-center h-64 text-slate-500 text-sm gap-2 px-4">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Loading from MongoDB…
          </div>
        )}
        <AnimatePresence mode="wait">
          {searchQuery.trim() ? (
            <motion.div
              key="search"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                Search: &quot;{searchQuery}&quot;
              </h2>
              <p className="text-xs text-slate-500 mb-6">{filteredSearch.length} result(s)</p>
              {filteredSearch.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 glass rounded-2xl"
                >
                  <span className="material-symbols-outlined text-5xl text-slate-300">search_off</span>
                  <p className="text-sm text-slate-400 mt-3">No tasks found</p>
                </motion.div>
              ) : (
                <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-3">
                  {filteredSearch.map((task) => (
                    <motion.button
                      key={task.id}
                      variants={staggerItem}
                      whileHover={{ scale: 1.01, x: 4 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => { handleSelectTask(task); setSearchQuery(''); }}
                      className="glass rounded-xl p-4 text-left card-hover cursor-pointer"
                    >
                      <p className="text-xs text-neutral-700 font-mono font-medium">{task.id}</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{task.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{task.project} · {task.status}</p>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={activeScreen}
              variants={activeScreen === 'team-chat' ? pageFadeVariants : pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={activeScreen === 'team-chat' ? 'h-full min-h-0' : undefined}
            >
              {renderScreen()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {showNewTaskModal && (
        <NewTaskModal
          onClose={() => setShowNewTaskModal(false)}
          onAddTask={handleAddTask}
          currentUser={currentUser}
          userRole={userRole}
          teamMembers={teamMembers}
        />
      )}
    </div>
  );
}

export default function App() {
  return <AppShell />;
}
