import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckSquare, 
  Square, 
  Clock, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { Employee, Task, TaskStatus } from '../types';

interface EmployeeDashboardProps {
  currentUser: { name: string; role: string; avatar: string; id: string | null };
  employees: Employee[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onTaskSelect: (task: Task) => void;
}

export default function EmployeeDashboard({ 
  currentUser, 
  employees, 
  tasks, 
  setTasks,
  onTaskSelect
}: EmployeeDashboardProps) {
  // Timer State for Focus Session
  const [timerSeconds, setTimerSeconds] = useState(1500); // 25 mins
  const [timerActive, setTimerActive] = useState(false);
  
  // Checklist State
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Review team pull requests for Cloud Migration', done: false },
    { id: 2, text: 'Update sprint points metrics on Performance board', done: true },
    { id: 3, text: 'Finalize interface touch-targets with Sarah Chen', done: false },
    { id: 4, text: 'Check dev server ingress port 3000 mapping', done: true },
  ]);
  const [newTodoText, setNewTodoText] = useState('');

  // Ticking Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
      alert('Focus Session completed! Time for a short break.');
      setTimerSeconds(1500);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleTodo = (id: number) => {
    setChecklist(list => list.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    setChecklist([...checklist, { id: Date.now(), text: newTodoText, done: false }]);
    setNewTodoText('');
  };

  // Filter tasks specifically assigned to currently logged-in user
  const assignedTasks = useMemo(() => {
    const userId = currentUser.id || 'emp-1'; // Default fallback to Alex Murphy if generic Sarah Jenkins
    return tasks.filter(task => task.assigneeId === userId);
  }, [tasks, currentUser]);

  const personalEmployeeStats = useMemo(() => {
    const matchingEmp = employees.find(e => e.id === currentUser.id);
    return {
      velocity: matchingEmp ? matchingEmp.velocity : 13.5,
      completionRate: matchingEmp ? matchingEmp.completionRate : 95,
      completedCount: assignedTasks.filter(t => t.status === 'done').length,
      totalCount: assignedTasks.length
    };
  }, [employees, currentUser, assignedTasks]);

  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  return (
    <div id="employee-workspace-container" className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-64px)]">
      
      {/* Workspace Header banner */}
      <div id="workspace-greeting-banner" className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-xl p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-6 shadow-[0_4px_12px_rgba(15,23,42,0.1)]">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Welcome back, {currentUser.name}!</h3>
          <p className="text-slate-300 text-xs mt-1">
            Persisted under {currentUser.role} credentials. Let's make today productive.
          </p>
        </div>
        
        {/* Simple personal metrics chip */}
        <div className="flex gap-4">
          <div className="bg-white/10 px-4 py-2 rounded-lg text-center backdrop-blur-xs">
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Velocity</p>
            <p className="text-lg font-bold">{personalEmployeeStats.velocity} pts</p>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-lg text-center backdrop-blur-xs">
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Completion</p>
            <p className="text-lg font-bold">{personalEmployeeStats.completionRate}%</p>
          </div>
        </div>
      </div>

      <div id="workspace-body-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Focus Timer & Checklist */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Focus Session Clock */}
          <div id="focus-timer-card" className="bg-white p-6 rounded-xl border border-slate-200 text-center space-y-4 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
            <div>
              <h4 className="font-bold text-sm text-slate-800 flex items-center justify-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-600" />
                Deep Focus Session
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Toggle pomodoro sprint timer</p>
            </div>

            <div className="text-4xl font-mono font-bold text-slate-900 bg-slate-50 py-4 rounded-xl tracking-wider">
              {formatTime(timerSeconds)}
            </div>

            <div className="flex justify-center gap-2">
              <button
                id="timer-toggle-play"
                onClick={() => setTimerActive(!timerActive)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  timerActive 
                    ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {timerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {timerActive ? 'Pause' : 'Start Focus'}
              </button>

              <button
                id="timer-reset"
                onClick={() => { setTimerActive(false); setTimerSeconds(1500); }}
                className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg cursor-pointer transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Daily Checklist manager */}
          <div id="checklist-card" className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-slate-600" />
              My Scratchpad To-Do List
            </h4>

            {/* Checklist items */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {checklist.map(item => (
                <div 
                  id={`todo-item-${item.id}`}
                  key={item.id} 
                  onClick={() => handleToggleTodo(item.id)}
                  className="flex items-start gap-2.5 cursor-pointer group text-xs text-slate-600 leading-tight select-none"
                >
                  {item.done ? (
                    <CheckSquare className="w-4 h-4 text-slate-800 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0 mt-0.5" />
                  )}
                  <span className={`${item.done ? 'line-through text-slate-400' : ''}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Add Todo inline form */}
            <form id="add-todo-form" onSubmit={handleAddTodo} className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                id="todo-inline-input"
                type="text"
                placeholder="Add secondary task log..."
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-400"
              />
              <button
                id="todo-inline-submit"
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Add
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Assigned Tasks workspace */}
        <div id="assigned-tasks-workspace" className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 space-y-6 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-sm text-slate-800">My Assigned Workspace Tasks</h4>
              <p className="text-xs text-slate-400 mt-0.5">Tasks bound to your profile</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              {personalEmployeeStats.completedCount} of {personalEmployeeStats.totalCount} Done
            </span>
          </div>

          <div className="space-y-4 max-h-[34rem] overflow-y-auto pr-1">
            {assignedTasks.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Award className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-xs">All caught up! No active tasks assigned.</p>
                <p className="text-[10px]">Use the profile switcher in the header to view tasks of other developers.</p>
              </div>
            ) : (
              assignedTasks.map(task => (
                <div 
                  id={`my-task-card-${task.id}`}
                  key={task.id} 
                  className="p-4 border border-slate-100 hover:border-slate-300 rounded-lg bg-slate-50/50 hover:bg-white transition-all space-y-3 relative group"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="cursor-pointer flex-1" onClick={() => onTaskSelect(task)}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase font-mono">
                          {task.id}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          task.priority === 'urgent' ? 'bg-red-50 text-red-600' :
                          task.priority === 'high' ? 'bg-amber-50 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <h5 className="font-bold text-xs text-slate-800 mt-1.5 hover:text-indigo-600 group-hover:underline flex items-center gap-1">
                        {task.title}
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 inline" />
                      </h5>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 leading-normal">
                        {task.description}
                      </p>
                    </div>

                    {/* Quick status dropdown selector */}
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Change Status</span>
                      <select
                        id={`my-task-status-select-${task.id}`}
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value as TaskStatus)}
                        className="text-xs bg-white border border-slate-200 rounded-md py-1 pl-2 pr-6 outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">In Review</option>
                        <option value="done">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
