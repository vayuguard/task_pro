import { useState, useEffect } from 'react';
import { TabType, Task, Activity, Channel, Message, TaskStatus } from './types';
import { INITIAL_TASKS, INITIAL_ACTIVITIES, INITIAL_CHANNELS, INITIAL_MESSAGES } from './initialData';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import NewTaskModal from './components/NewTaskModal';

// Tab Views
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import KanbanBoard from './components/KanbanBoard';
import TaskDetailsView from './components/TaskDetailsView';
import PerformanceView from './components/PerformanceView';
import TeamChatView from './components/TeamChatView';

export default function App() {
  // Initialize state from localStorage or seed fallback
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem('taskpro_tasks');
    return stored ? JSON.parse(stored) : INITIAL_TASKS;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const stored = localStorage.getItem('taskpro_activities');
    return stored ? JSON.parse(stored) : INITIAL_ACTIVITIES;
  });

  const [channels, setChannels] = useState<Channel[]>(() => {
    const stored = localStorage.getItem('taskpro_channels');
    return stored ? JSON.parse(stored) : INITIAL_CHANNELS;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const stored = localStorage.getItem('taskpro_messages');
    return stored ? JSON.parse(stored) : INITIAL_MESSAGES;
  });

  // Navigation and filters
  const [activeTab, setActiveTab] = useState<TabType>('admin_dashboard');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>('task-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  // Sync state mutations directly to client localStorage
  useEffect(() => {
    localStorage.setItem('taskpro_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskpro_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('taskpro_channels', JSON.stringify(channels));
  }, [channels]);

  useEffect(() => {
    localStorage.setItem('taskpro_messages', JSON.stringify(messages));
  }, [messages]);

  // Compute unread count for notifications
  const notificationsCount = activities.filter(a => a.status === 'ACTION REQUIRED').length;

  // Add standard new task
  const handleAddTask = (newTaskDetails: Omit<Task, 'id' | 'timeAgo' | 'dateCreated' | 'comments'>) => {
    const freshId = `task-${Date.now()}`;
    const freshTask: Task = {
      ...newTaskDetails,
      id: freshId,
      timeAgo: 'Just now',
      dateCreated: new Date().toISOString().slice(0, 10),
      comments: []
    };

    setTasks([freshTask, ...tasks]);
    setSelectedTaskId(freshId);

    // Record activity log
    const freshActivity: Activity = {
      id: `act-${Date.now()}`,
      type: 'task',
      title: `Task Deployed: ${freshTask.title}`,
      project: `${freshTask.division} Division`,
      user: 'Marcus Thorne',
      userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKWPkJfegr9YENVXozHwAK3Xtv6oBBqUylwH3ZfjPCcjB59-QlIEAn1xy9Kc3rK8GcO-UEfUuUWkmVulLZyxMTdPIOleQd9kr_1fKLb2Oj-py3jCa6sObu5maRlA8jpqTVSwOxtZAhzAUxyv56q0m_RtYQasPpif1WfriwzO3nfRZ66adACpjhmPoybkQ8_cj9_M4ydArSa0yXweEkEs4w5Jsaf18eKzgczVL8n6P9-lyoewCx3IXIliZUeiAZvtQNcNY8nyiHEJZS',
      status: 'COMPLETED',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setActivities([freshActivity, ...activities]);
  };

  // Modify task details or subtask elements
  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  // Move task status across pipeline lanes
  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;

    setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));

    // Record activity log
    const freshActivity: Activity = {
      id: `act-${Date.now()}`,
      type: 'settings',
      title: `Ticket Shipped to "${status.toUpperCase().replace('_', ' ')}"`,
      project: `${taskToUpdate.title}`,
      user: 'Marcus Thorne',
      userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKWPkJfegr9YENVXozHwAK3Xtv6oBBqUylwH3ZfjPCcjB59-QlIEAn1xy9Kc3rK8GcO-UEfUuUWkmVulLZyxMTdPIOleQd9kr_1fKLb2Oj-py3jCa6sObu5maRlA8jpqTVSwOxtZAhzAUxyv56q0m_RtYQasPpif1WfriwzO3nfRZ66adACpjhmPoybkQ8_cj9_M4ydArSa0yXweEkEs4w5Jsaf18eKzgczVL8n6P9-lyoewCx3IXIliZUeiAZvtQNcNY8nyiHEJZS',
      status: 'COMPLETED',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setActivities([freshActivity, ...activities]);
  };

  // Delete task completely
  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
  };

  // Chat message addition
  const handleSendMessage = (channelId: string, text: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      channelId,
      user: 'Marcus Thorne',
      userRole: 'Chief Operations',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKWPkJfegr9YENVXozHwAK3Xtv6oBBqUylwH3ZfjPCcjB59-QlIEAn1xy9Kc3rK8GcO-UEfUuUWkmVulLZyxMTdPIOleQd9kr_1fKLb2Oj-py3jCa6sObu5maRlA8jpqTVSwOxtZAhzAUxyv56q0m_RtYQasPpif1WfriwzO3nfRZ66adACpjhmPoybkQ8_cj9_M4ydArSa0yXweEkEs4w5Jsaf18eKzgczVL8n6P9-lyoewCx3IXIliZUeiAZvtQNcNY8nyiHEJZS',
      text,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    setMessages([...messages, newMessage]);
  };

  // Clear channel unread notification badge
  const handleClearUnreads = (channelId: string) => {
    setChannels(channels.map(c => c.id === channelId ? { ...c, unreadCount: 0 } : c));
  };

  // Receiving automatic response from simulated team member
  const handleReceiveSimulatedMessage = (
    channelId: string,
    user: string,
    role: string,
    avatar: string,
    text: string
  ) => {
    const simMessage: Message = {
      id: `msg-${Date.now()}`,
      channelId,
      user,
      userRole: role,
      avatar,
      text,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    setMessages(prev => [...prev, simMessage]);

    // Record activity feed entry
    const simActivity: Activity = {
      id: `act-${Date.now()}`,
      type: 'chat',
      title: `${user} posted update in Channel`,
      project: text.slice(0, 30) + '...',
      user,
      userAvatar: avatar,
      status: 'COMPLETED',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setActivities(prev => [simActivity, ...prev]);

    // Increment unreads if we are not actively looking at this channel
    setChannels(prev => {
      const activeTabIsChat = activeTab === 'team_chat';
      const isViewingThatChannel = activeTabIsChat && selectedTaskId === channelId; // Using selectedTaskId in context as Active Channel ID in state
      return prev.map(c => {
        if (c.id === channelId && !isViewingThatChannel) {
          return { ...c, unreadCount: c.unreadCount + 1 };
        }
        return c;
      });
    });
  };

  // Activity Feed manipulation
  const handleDeleteActivity = (actId: string) => {
    setActivities(activities.filter(a => a.id !== actId));
  };

  const handleUpdateActivityStatus = (actId: string, status: Activity['status']) => {
    setActivities(activities.map(a => a.id === actId ? { ...a, status } : a));
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex selection:bg-sky-100">
      
      {/* Fixed sidebar layout */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewTaskClick={() => setIsNewTaskModalOpen(true)}
      />

      {/* Main viewport area fluid */}
      <div className="ml-[280px] w-[calc(100%-280px)] min-h-screen flex flex-col relative">
        
        {/* Fixed Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notificationsCount={notificationsCount}
        />

        {/* Viewport Content Area padding offset top header */}
        <main className="flex-1 pt-16 px-10 pb-10 max-w-[1440px] mx-auto w-full">
          
          {/* Active Tab Router Layouts */}
          {activeTab === 'admin_dashboard' && (
            <AdminDashboard
              tasks={tasks}
              activities={activities}
              searchQuery={searchQuery}
              setActiveTab={setActiveTab}
              setSelectedTaskId={setSelectedTaskId}
              onDeleteActivity={handleDeleteActivity}
              onUpdateActivityStatus={handleUpdateActivityStatus}
            />
          )}

          {activeTab === 'employee_dashboard' && (
            <EmployeeDashboard
              tasks={tasks}
              searchQuery={searchQuery}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              setActiveTab={setActiveTab}
              setSelectedTaskId={setSelectedTaskId}
            />
          )}

          {activeTab === 'kanban_board' && (
            <KanbanBoard
              tasks={tasks}
              searchQuery={searchQuery}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              setActiveTab={setActiveTab}
              setSelectedTaskId={setSelectedTaskId}
            />
          )}

          {activeTab === 'task_details' && (
            <TaskDetailsView
              tasks={tasks}
              selectedTaskId={selectedTaskId}
              setSelectedTaskId={setSelectedTaskId}
              onUpdateTask={handleUpdateTask}
            />
          )}

          {activeTab === 'performance' && (
            <PerformanceView
              tasks={tasks}
            />
          )}

          {activeTab === 'team_chat' && (
            <TeamChatView
              channels={channels}
              messages={messages}
              onSendMessage={handleSendMessage}
              onClearUnreads={handleClearUnreads}
              onReceiveSimulatedMessage={handleReceiveSimulatedMessage}
            />
          )}

          {/* Footer Metadata */}
          <footer className="mt-12 flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-widest gap-4">
            <div className="flex gap-6">
              <button
                onClick={() => alert('Data Integrity Directive: All transactions and audit logs are secure.')}
                className="hover:text-slate-700 hover:underline transition-colors uppercase"
              >
                Data Integrity Policy
              </button>
              <span className="w-1.5 h-1.5 bg-slate-200 rounded-full shrink-0 self-center hidden sm:block" />
              <button
                onClick={() => alert('Enterprise Service Level guarantees optimal host clusters uptime at 99.99%.')}
                className="hover:text-slate-700 hover:underline transition-colors uppercase"
              >
                Enterprise Terms
              </button>
              <span className="w-1.5 h-1.5 bg-slate-200 rounded-full shrink-0 self-center hidden sm:block" />
              <button
                onClick={() => alert('All API and TLS handshakes are online.')}
                className="hover:text-slate-700 hover:underline transition-colors uppercase"
              >
                API Status
              </button>
            </div>
            <div>
              © {new Date().getFullYear()} TaskPro Enterprise Solutions. Build v4.12.0
            </div>
          </footer>

        </main>
      </div>

      {/* New Task creation form modal */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSave={handleAddTask}
      />

    </div>
  );
}
