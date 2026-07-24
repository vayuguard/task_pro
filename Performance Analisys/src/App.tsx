/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_TASKS, 
  INITIAL_PROJECTS_HEALTH, 
  INITIAL_CHAT_MESSAGES, 
  INITIAL_ACTIVITY_LOGS 
} from './data';
import { Task, Employee, ChatMessage, ActivityLog } from './types';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PerformanceDashboard from './components/PerformanceDashboard';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import KanbanBoard from './components/KanbanBoard';
import TaskDetails from './components/TaskDetails';
import TeamChat from './components/TeamChat';
import SettingsView from './components/SettingsView';
import NewTaskModal from './components/NewTaskModal';

export default function App() {
  // Tab control
  const [activeTab, setActiveTab] = useState('performance');
  
  // Database mock state
  const [employees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [projectsHealth] = useState(INITIAL_PROJECTS_HEALTH);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Active User Context Switcher
  const [currentUser, setCurrentUser] = useState({
    id: null as string | null, // null implies Project Lead Sarah Jenkins
    name: 'Sarah Jenkins',
    role: 'Project Lead',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVPFrOxJGqclwonSnoQXye_wwUaRFQJI6D7ZcQJJdQmkcgaOs3qUSllkY_g8EoJrXKqyZBOTy8H6ZnrIurF46kK_uTTqqggxGJBUN2C7b_kWkNutYMRECOe0mP4JdGo8kARUufNQYRZq5jzJ0c-91-082JtJpwRgAeNqDf7F_6Woh3dopJFUwxM7dxFBaQoxbyaHfx4uhlM5y0Sm-gDdivneAIs_NSfUEdGalcthVPSQgJPF_m5Vth9j2v8ubn5qG05hbeMyQHNLCc'
  });

  // Selected task inspector
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // New task overlay controls
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  // Task selection navigation bridge
  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setActiveTab('tasks');
  };

  // Add new task coordinator
  const handleAddTask = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);

    // Create system audit entry
    const newAuditLog: ActivityLog = {
      id: `log-${Date.now()}`,
      text: `${currentUser.name} created task "${newTask.title}" under ${newTask.category}.`,
      timestamp: 'Just now',
      type: 'task_created'
    };
    setActivityLogs(prev => [newAuditLog, ...prev]);

    // Push automatic notification notice in Team Chat!
    const chatNotification: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'system-agent',
      senderName: 'TaskPro Bot',
      senderInitials: 'TB',
      senderBg: 'bg-indigo-950',
      text: `🚨 NEW SPRINT TASK: "${newTask.title}" registered successfully. Allocated Points: ${newTask.points} pts. Due: ${newTask.dueDate}. Assignee ID: ${newTask.assigneeId}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: '#general'
    };
    setChatMessages(prev => [...prev, chatNotification]);
  };

  // Switcher Tab Panel renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'performance':
        return (
          <PerformanceDashboard 
            employees={employees} 
            projectsHealth={projectsHealth} 
            searchQuery={searchQuery} 
          />
        );
      case 'admin':
        return (
          <AdminDashboard 
            employees={employees} 
            tasks={tasks} 
            setTasks={setTasks} 
            activityLogs={activityLogs} 
            setActivityLogs={setActivityLogs}
            onNewTaskClick={() => setIsNewTaskModalOpen(true)}
          />
        );
      case 'employee':
        return (
          <EmployeeDashboard 
            currentUser={currentUser} 
            employees={employees} 
            tasks={tasks} 
            setTasks={setTasks}
            onTaskSelect={handleTaskSelect}
          />
        );
      case 'kanban':
        return (
          <KanbanBoard 
            tasks={tasks} 
            setTasks={setTasks} 
            employees={employees} 
            onTaskSelect={handleTaskSelect}
            onNewTaskClick={() => setIsNewTaskModalOpen(true)}
          />
        );
      case 'tasks':
        return (
          <TaskDetails 
            selectedTask={selectedTask} 
            tasks={tasks} 
            setTasks={setTasks} 
            employees={employees} 
            onClose={() => {
              setSelectedTask(null);
              setActiveTab('kanban');
            }}
          />
        );
      case 'chat':
        return (
          <TeamChat 
            messages={chatMessages} 
            setMessages={setChatMessages} 
            currentUser={currentUser} 
            employees={employees} 
          />
        );
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <div className="p-8 text-center text-slate-400 font-medium text-xs">
            Section is currently unavailable. Check system logs.
          </div>
        );
    }
  };

  return (
    <div id="applet-viewport-root" className="min-h-screen bg-brand-gray overflow-hidden">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // If switching away from task deep-dive details, clear selection
          if (tab !== 'tasks') {
            setSelectedTask(null);
          }
        }} 
        onNewTaskClick={() => setIsNewTaskModalOpen(true)} 
      />

      {/* Main Container viewport */}
      <main id="applet-main-canvas" className="ml-[280px] w-[calc(100%-280px)] min-h-screen flex flex-col">
        {/* Header toolbar */}
        <Header 
          title={activeTab === 'tasks' ? 'Task Details' : activeTab} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          employees={employees}
        />

        {/* Workspace Display Viewport */}
        <div id="viewport-workspace-content" className="flex-grow">
          {renderTabContent()}
        </div>
      </main>

      {/* Agile Register Task Slide-Over/Backdrop */}
      <NewTaskModal 
        isOpen={isNewTaskModalOpen} 
        onClose={() => setIsNewTaskModalOpen(false)} 
        employees={employees} 
        onAddTask={handleAddTask} 
      />
    </div>
  );
}

