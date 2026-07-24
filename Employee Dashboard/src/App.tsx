import { useState, useEffect } from 'react';
import { Task, TeamMember, TeamUpdate, ChatMessage, ProgressLog, ProjectMetrics, TaskStatus, TaskPriority, Comment, SubTask } from './types';
import { 
  INITIAL_TASKS, 
  INITIAL_TEAM_MEMBERS, 
  INITIAL_UPDATES, 
  INITIAL_CHAT_MESSAGES, 
  INITIAL_PROJECT_METRICS, 
  INITIAL_PROGRESS_LOGS 
} from './data';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EmployeeDashboard from './components/EmployeeDashboard';
import AdminDashboard from './components/AdminDashboard';
import KanbanBoard from './components/KanbanBoard';
import TaskDetails from './components/TaskDetails';
import Performance from './components/Performance';
import TeamChat from './components/TeamChat';
import { NewTaskModal, LogProgressModal } from './components/Modals';

export default function App() {
  // Tab control
  const [activeTab, setActiveTab] = useState<string>('employee');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Core App states (persisted/loaded via localStorage if available)
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('taskpro_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('taskpro_members');
    return saved ? JSON.parse(saved) : INITIAL_TEAM_MEMBERS;
  });

  const [updates, setUpdates] = useState<TeamUpdate[]>(() => {
    const saved = localStorage.getItem('taskpro_updates');
    return saved ? JSON.parse(saved) : INITIAL_UPDATES;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('taskpro_chats');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });

  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>(() => {
    const saved = localStorage.getItem('taskpro_progress');
    return saved ? JSON.parse(saved) : INITIAL_PROGRESS_LOGS;
  });

  const [projects, setProjects] = useState<ProjectMetrics[]>(() => {
    const saved = localStorage.getItem('taskpro_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECT_METRICS;
  });

  // Selected Task state for details tab inspector
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<Array<{ id: string; text: string; time: string; read: boolean }>>([
    { id: 'n-1', text: 'Sarah Chen tagged you in #design-system discussion', time: '15 mins ago', read: false },
    { id: 'n-2', text: 'Security Audit submission is due in 2 hours!', time: '1 hour ago', read: false },
    { id: 'n-3', text: 'Project layout schema review approved by Lila Vance', time: '3 hours ago', read: true }
  ]);

  // Modal controls
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isLogProgressOpen, setIsLogProgressOpen] = useState(false);
  const [preselectedStatus, setPreselectedStatus] = useState<TaskStatus | undefined>(undefined);

  // Sync to LocalStorage on modifications
  useEffect(() => {
    localStorage.setItem('taskpro_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskpro_members', JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem('taskpro_updates', JSON.stringify(updates));
  }, [updates]);

  useEffect(() => {
    localStorage.setItem('taskpro_chats', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('taskpro_progress', JSON.stringify(progressLogs));
  }, [progressLogs]);

  useEffect(() => {
    localStorage.setItem('taskpro_projects', JSON.stringify(projects));
  }, [projects]);

  // Search filter
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const searchedTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Task selection details helper
  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setActiveTab('tasks'); // Route to details tab
  };

  // Notification handlers
  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const addNotification = (text: string) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      text,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Complete / Incomplete toggle
  const handleToggleTaskComplete = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const isCurrentlyCompleted = t.status === 'completed';
        const updatedStatus: TaskStatus = isCurrentlyCompleted ? 'in_progress' : 'completed';
        
        // Add alert
        addNotification(`Task "${t.title}" status updated to ${updatedStatus}`);

        // Update Project Metrics count if valid project
        if (updatedStatus === 'completed') {
          setProjects(p => p.map(pr => pr.name === t.project ? { ...pr, completedTasks: pr.completedTasks + 1 } : pr));
          setTeamMembers(m => m.map(mem => mem.name === 'Alex Rivera' ? { ...mem, tasksCompleted: mem.tasksCompleted + 1, efficiency: Math.min(mem.efficiency + 1, 99) } : mem));
          
          // Append automatic team activity feed update
          const newUpdate: TeamUpdate = {
            id: `update-auto-${Date.now()}`,
            author: 'Alex Rivera',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT1jtDA7el1WpSvRQpYrCb4gOoavKhjM8ckwZ5geOgJclzrsJ8MLETWnDpYogNDGdn42U4dL6HjC0945Fqvf61PkuVw0ZiVtTgrn2Gx5c6YPEkEeP7Bx_A93_YtNuuXYfEPUGskKYz_1OkiCMkLpoGaozUDBADf-1M4lS_mYxX0iU0JJwFrIF_6Zf6nYTXV5wnMU5GetDRf1ANE7oMqR-Wdhx-8LyagWiiJuXTUCHIns3R1M7Llq9-IFZmrBvu32tHEBRNNEqNODOa',
            text: `completed the task: "${t.title}"`,
            time: 'Just now',
            category: 'approval'
          };
          setUpdates(u => [newUpdate, ...u]);
        } else {
          setProjects(p => p.map(pr => pr.name === t.project ? { ...pr, completedTasks: Math.max(0, pr.completedTasks - 1) } : pr));
          setTeamMembers(m => m.map(mem => mem.name === 'Alex Rivera' ? { ...mem, tasksCompleted: Math.max(0, mem.tasksCompleted - 1) } : mem));
        }

        const updated = { ...t, status: updatedStatus };
        if (selectedTask && selectedTask.id === id) {
          setSelectedTask(updated);
        }
        return updated;
      }
      return t;
    }));
  };

  // Move task status columns (e.g. Kanban transition)
  const handleMoveTask = (id: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        addNotification(`Moved task "${t.title}" to column: ${newStatus.replace('_', ' ')}`);
        
        // Handle metric counts on transition to completed
        if (newStatus === 'completed' && t.status !== 'completed') {
          setProjects(p => p.map(pr => pr.name === t.project ? { ...pr, completedTasks: pr.completedTasks + 1 } : pr));
        } else if (t.status === 'completed' && newStatus !== 'completed') {
          setProjects(p => p.map(pr => pr.name === t.project ? { ...pr, completedTasks: Math.max(pr.completedTasks - 1, 0) } : pr));
        }

        const updated = { ...t, status: newStatus };
        if (selectedTask && selectedTask.id === id) {
          setSelectedTask(updated);
        }
        return updated;
      }
      return t;
    }));
  };

  // Delete task
  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (taskToDelete) {
      addNotification(`Deleted task "${taskToDelete.title}"`);
      // Update counts if it was completed
      if (taskToDelete.status === 'completed') {
        setProjects(p => p.map(pr => pr.name === taskToDelete.project ? { ...pr, completedTasks: Math.max(pr.completedTasks - 1, 0) } : pr));
      }
      setProjects(p => p.map(pr => pr.name === taskToDelete.project ? { ...pr, totalTasks: Math.max(pr.totalTasks - 1, 1) } : pr));
    }
    setTasks(prev => prev.filter(t => t.id !== id));
    if (selectedTask && selectedTask.id === id) {
      setSelectedTask(null);
    }
  };

  // Create task submit
  const handleCreateTaskSubmit = (newTaskData: Omit<Task, 'id' | 'comments' | 'commentsCount' | 'files'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      files: 0,
      commentsCount: 0,
      comments: []
    };

    setTasks(prev => [newTask, ...prev]);
    setIsNewTaskOpen(false);
    addNotification(`Created new enterprise task: "${newTask.title}"`);

    // Increment corresponding project total tasks
    setProjects(prev => prev.map(pr => pr.name === newTask.project ? { ...pr, totalTasks: pr.totalTasks + 1 } : pr));

    // Post to updates feed
    const newUpdate: TeamUpdate = {
      id: `update-new-${Date.now()}`,
      author: 'Alex Rivera',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT1jtDA7el1WpSvRQpYrCb4gOoavKhjM8ckwZ5geOgJclzrsJ8MLETWnDpYogNDGdn42U4dL6HjC0945Fqvf61PkuVw0ZiVtTgrn2Gx5c6YPEkEeP7Bx_A93_YtNuuXYfEPUGskKYz_1OkiCMkLpoGaozUDBADf-1M4lS_mYxX0iU0JJwFrIF_6Zf6nYTXV5wnMU5GetDRf1ANE7oMqR-Wdhx-8LyagWiiJuXTUCHIns3R1M7Llq9-IFZmrBvu32tHEBRNNEqNODOa',
      text: `created the specification: "${newTask.title}"`,
      time: 'Just now',
      category: 'system'
    };
    setUpdates(prev => [newUpdate, ...prev]);
  };

  const handleAddTaskToColumn = (column: TaskStatus) => {
    setPreselectedStatus(column);
    setIsNewTaskOpen(true);
  };

  // Submit Progress Log
  const handleLogProgressSubmit = (logData: { taskId: string; hours: number; notes: string }) => {
    const task = tasks.find(t => t.id === logData.taskId);
    if (!task) return;

    const newLog: ProgressLog = {
      id: `progress-${Date.now()}`,
      taskId: logData.taskId,
      taskTitle: task.title,
      hours: logData.hours,
      notes: logData.notes,
      timestamp: 'Today, Just Now',
      author: 'Alex Rivera'
    };

    setProgressLogs(prev => [newLog, ...prev]);
    addNotification(`Logged ${logData.hours} hours against "${task.title}"`);

    // Update user stats (kudos/completed tasks)
    setTeamMembers(prev => prev.map(m => {
      if (m.name === 'Alex Rivera') {
        return {
          ...m,
          kudos: m.kudos + 1, // Reward Kudos for log entries!
          efficiency: Math.min(99, m.efficiency + 2) // Boost efficiency
        };
      }
      return m;
    }));

    // Post to updates feed
    const newUpdate: TeamUpdate = {
      id: `update-log-${Date.now()}`,
      author: 'Alex Rivera',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT1jtDA7el1WpSvRQpYrCb4gOoavKhjM8ckwZ5geOgJclzrsJ8MLETWnDpYogNDGdn42U4dL6HjC0945Fqvf61PkuVw0ZiVtTgrn2Gx5c6YPEkEeP7Bx_A93_YtNuuXYfEPUGskKYz_1OkiCMkLpoGaozUDBADf-1M4lS_mYxX0iU0JJwFrIF_6Zf6nYTXV5wnMU5GetDRf1ANE7oMqR-Wdhx-8LyagWiiJuXTUCHIns3R1M7Llq9-IFZmrBvu32tHEBRNNEqNODOa',
      text: `logged progress (${logData.hours}h): "${logData.notes.substring(0, 45)}..."`,
      time: 'Just now',
      category: 'attachment'
    };
    setUpdates(prev => [newUpdate, ...prev]);
  };

  // Inline Subtask Toggle inside inspector
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = t.subtasks.map(st => 
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        const updated = { ...t, subtasks: updatedSubtasks };
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(updated);
        }
        return updated;
      }
      return t;
    }));
  };

  // Inline Add Subtask inside inspector
  const handleAddSubtask = (taskId: string, title: string) => {
    const newSub: SubTask = {
      id: `sub-${Date.now()}`,
      title,
      completed: false
    };

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updated = { ...t, subtasks: [...t.subtasks, newSub] };
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(updated);
        }
        return updated;
      }
      return t;
    }));
  };

  // Inline Add Comment inside inspector
  const handleAddComment = (taskId: string, content: string) => {
    const newCmt: Comment = {
      id: `comment-${Date.now()}`,
      author: 'Alex Rivera',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT1jtDA7el1WpSvRQpYrCb4gOoavKhjM8ckwZ5geOgJclzrsJ8MLETWnDpYogNDGdn42U4dL6HjC0945Fqvf61PkuVw0ZiVtTgrn2Gx5c6YPEkEeP7Bx_A93_YtNuuXYfEPUGskKYz_1OkiCMkLpoGaozUDBADf-1M4lS_mYxX0iU0JJwFrIF_6Zf6nYTXV5wnMU5GetDRf1ANE7oMqR-Wdhx-8LyagWiiJuXTUCHIns3R1M7Llq9-IFZmrBvu32tHEBRNNEqNODOa',
      role: 'Product Designer',
      content,
      timestamp: 'Today, Just Now'
    };

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updated = { 
          ...t, 
          comments: [...t.comments, newCmt],
          commentsCount: t.commentsCount + 1
        };
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(updated);
        }
        return updated;
      }
      return t;
    }));
  };

  // Inline Add Attachment inside inspector
  const handleAddAttachment = (taskId: string, filename: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updated = { ...t, files: t.files + 1 };
        addNotification(`Attached file "${filename}" to task specs.`);
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(updated);
        }
        return updated;
      }
      return t;
    }));
  };

  // Direct status update in inspector
  const handleUpdateTaskStatus = (id: string, status: TaskStatus) => {
    handleMoveTask(id, status);
  };

  // Direct priority update in inspector
  const handleUpdateTaskPriority = (id: string, priority: TaskPriority) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        addNotification(`Updated task "${t.title}" priority to: ${priority}`);
        const updated = { ...t, priority };
        if (selectedTask && selectedTask.id === id) {
          setSelectedTask(updated);
        }
        return updated;
      }
      return t;
    }));
  };

  // Pre-aggregate projects to sync dynamic task lengths
  const synchronizedProjects = projects.map(p => {
    const projTasks = tasks.filter(t => t.project === p.name);
    return {
      ...p,
      totalTasks: projTasks.length,
      completedTasks: projTasks.filter(t => t.status === 'completed').length
    };
  });

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onNewTaskClick={() => { setPreselectedStatus(undefined); setIsNewTaskOpen(true); }}
        onLogProgressClick={() => setIsLogProgressOpen(true)}
        urgentTasksCount={tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length}
      />

      {/* Main Container */}
      <main className="ml-[280px] w-[calc(100%-280px)] min-h-screen flex flex-col relative">
        
        {/* Header toolbar */}
        <Header 
          searchQuery={searchQuery}
          onSearch={handleSearch}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
        />

        {/* Dynamic page content container */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
          
          {activeTab === 'employee' && (
            <EmployeeDashboard 
              tasks={searchedTasks}
              teamMembers={teamMembers}
              updates={updates}
              onToggleTaskComplete={handleToggleTaskComplete}
              onSelectTask={handleSelectTask}
              onLogProgressClick={() => setIsLogProgressOpen(true)}
              onTabChange={setActiveTab}
            />
          )}

          {activeTab === 'admin' && (
            <AdminDashboard 
              projects={synchronizedProjects}
              teamMembers={teamMembers}
              tasks={searchedTasks}
              onSelectTask={handleSelectTask}
              onTabChange={setActiveTab}
            />
          )}

          {activeTab === 'kanban' && (
            <KanbanBoard 
              tasks={searchedTasks}
              onMoveTask={handleMoveTask}
              onSelectTask={handleSelectTask}
              onDeleteTask={handleDeleteTask}
              onAddTaskToColumn={handleAddTaskToColumn}
              teamMembers={teamMembers}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskDetails 
              tasks={searchedTasks}
              selectedTask={selectedTask}
              onSelectTask={setSelectedTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onUpdateTaskPriority={handleUpdateTaskPriority}
              onToggleSubtask={handleToggleSubtask}
              onAddSubtask={handleAddSubtask}
              onAddComment={handleAddComment}
              onAddAttachment={handleAddAttachment}
              teamMembers={teamMembers}
            />
          )}

          {activeTab === 'performance' && (
            <Performance 
              teamMembers={teamMembers}
              progressLogs={progressLogs}
            />
          )}

          {activeTab === 'chat' && (
            <TeamChat 
              initialMessages={chatMessages}
              teamMembers={teamMembers}
            />
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl bg-white border border-slate-200 rounded-xl p-8 space-y-6 animate-fadeIn shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Workspace Configurations</h2>
                <p className="text-slate-400 text-xs mt-1">Configure workspace parameters, API keys, and notification triggers.</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Workspace Environment</label>
                  <input type="text" readOnly value="TaskPro-Enterprise-Vault" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500 font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Cloud Run Sync Endpoint</label>
                  <input type="text" readOnly value="https://ais-dev-npvr4vhfoagio7krkeqzak-553317103875.asia-east1.run.app" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500 font-mono" />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" id="emailnotifs" defaultChecked className="rounded text-blue-500 focus:ring-blue-500" />
                  <label htmlFor="emailnotifs" className="text-xs font-semibold text-slate-700">Receive system-wide digest reports</label>
                </div>
                <button 
                  onClick={() => alert('Configurations saved successfully.')}
                  className="bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Modals declarations */}
      <NewTaskModal 
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        onSubmit={handleCreateTaskSubmit}
        projects={projects.map(p => p.name)}
        teamMembers={teamMembers}
      />

      <LogProgressModal 
        isOpen={isLogProgressOpen}
        onClose={() => setIsLogProgressOpen(false)}
        tasks={tasks.filter(t => t.status !== 'completed')}
        onSubmit={handleLogProgressSubmit}
      />

    </div>
  );
}
