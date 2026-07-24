import { useState, useMemo } from 'react';
import { Task, TabType, TaskStatus } from '../types';

interface EmployeeDashboardProps {
  tasks: Task[];
  searchQuery: string;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  setActiveTab: (tab: TabType) => void;
  setSelectedTaskId: (id: string) => void;
}

const EMPLOYEES = [
  { name: 'Sarah Chen', role: 'Lead Engineer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120' },
  { name: 'Marcus Thorne', role: 'Chief Operations', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120' },
  { name: 'Emily Rose', role: 'Product Director', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120' },
  { name: 'System Admin', role: 'Infrastructure Lead', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120' }
];

export default function EmployeeDashboard({
  tasks,
  searchQuery,
  onUpdateTaskStatus,
  setActiveTab,
  setSelectedTaskId
}: EmployeeDashboardProps) {
  const [selectedEmployee, setSelectedEmployee] = useState(EMPLOYEES[0]);

  // Filter tasks based on selected employee and search query
  const employeeTasks = useMemo(() => {
    return tasks.filter((t) => {
      const isAssigned = t.assignees.includes(selectedEmployee.name);
      if (!isAssigned) return false;

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query);
      }
      return true;
    });
  }, [tasks, selectedEmployee, searchQuery]);

  // Metrics specific to employee
  const employeeStats = useMemo(() => {
    const totalAssigned = tasks.filter((t) => t.assignees.includes(selectedEmployee.name)).length;
    const completed = tasks.filter((t) => t.assignees.includes(selectedEmployee.name) && t.status === 'done').length;
    const pending = totalAssigned - completed;
    const completionPercent = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 100;

    return {
      total: totalAssigned,
      completed,
      pending,
      percent: completionPercent
    };
  }, [tasks, selectedEmployee]);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'high': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'medium': return 'text-sky-600 bg-sky-50 border-sky-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'done': return 'bg-emerald-50 text-emerald-800 border-emerald-100';
      case 'in_review': return 'bg-amber-50 text-amber-800 border-amber-100';
      case 'in_progress': return 'bg-sky-50 text-sky-800 border-sky-100';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleTaskClick = (id: string) => {
    setSelectedTaskId(id);
    setActiveTab('task_details');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Selector & Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-[28px] font-bold text-slate-900 tracking-tight">Employee Hub</h2>
          <p className="text-slate-500 text-sm mt-1">Personal assignment dashboard, work logs, and performance tracking.</p>
        </div>

        {/* Dynamic Select */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Viewing Profile:</label>
          <div className="relative">
            <select
              value={selectedEmployee.name}
              onChange={(e) => {
                const found = EMPLOYEES.find(emp => emp.name === e.target.value);
                if (found) setSelectedEmployee(found);
              }}
              className="appearance-none pl-10 pr-8 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 focus:outline-none focus:border-slate-400 cursor-pointer shadow-sm"
            >
              {EMPLOYEES.map(emp => (
                <option key={emp.name} value={emp.name}>{emp.name} ({emp.role})</option>
              ))}
            </select>
            {/* Avatar inside selection */}
            <img
              src={selectedEmployee.avatar}
              alt=""
              className="w-5 h-5 rounded-full absolute left-3 top-2 object-cover border border-slate-200"
            />
            <span className="material-symbols-outlined absolute right-2 top-2 text-slate-400 pointer-events-none text-base">
              keyboard_arrow_down
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Personal Bio & Metrics Row */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Personal details */}
        <div className="col-span-12 md:col-span-5 bg-white border border-slate-200 p-6 rounded-xl flex items-center gap-5">
          <img
            src={selectedEmployee.avatar}
            alt={selectedEmployee.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-slate-100 shadow-md shadow-slate-100 shrink-0"
          />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 leading-tight">{selectedEmployee.name}</h3>
            <p className="text-xs text-sky-600 font-semibold tracking-wide uppercase">{selectedEmployee.role}</p>
            <p className="text-xs text-slate-400 font-medium">TaskPro Enterprise Operations • Active Staged Role</p>
            <div className="flex items-center gap-1.5 pt-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping shrink-0" />
              <span className="text-[11px] font-bold text-emerald-800 font-mono">ONLINE & DEPLOYED</span>
            </div>
          </div>
        </div>

        {/* Personal stats cards */}
        <div className="col-span-12 md:col-span-7 bg-white border border-slate-200 p-6 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Velocity Progression</p>
              <h4 className="text-sm font-bold text-slate-800 mt-1">Task Completion Score: {employeeStats.percent}%</h4>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
              {employeeStats.completed} / {employeeStats.total} Resolved
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-5">
            <div
              className="bg-slate-900 h-full rounded-full transition-all duration-500"
              style={{ width: `${employeeStats.percent}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4 text-center">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned</p>
              <p className="text-lg font-bold text-slate-800 mt-1 font-mono">{employeeStats.total}</p>
            </div>
            <div className="border-x border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending</p>
              <p className="text-lg font-bold text-slate-800 mt-1 font-mono text-sky-600">{employeeStats.pending}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Uptime Factor</p>
              <p className="text-lg font-bold text-slate-800 mt-1 font-mono text-emerald-600">100%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Task lists & Personal Schedule */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Task lists table container */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">My Active Assignments</h4>
            <span className="text-slate-400 text-xs font-mono">Filtered: {employeeTasks.length} Tickets</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[420px]">
            {employeeTasks.length > 0 ? (
              employeeTasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-slate-50/40 transition-all flex justify-between items-center group">
                  <div className="space-y-1.5 max-w-[70%]">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium font-mono">{task.division}</span>
                    </div>
                    <button
                      onClick={() => handleTaskClick(task.id)}
                      className="text-slate-800 font-bold hover:text-sky-600 text-sm block text-left font-sans transition-colors border-none"
                    >
                      {task.title}
                    </button>
                    <p className="text-xs text-slate-400 line-clamp-1">{task.description}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status selection widget */}
                    <div className="relative">
                      <select
                        value={task.status}
                        onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-md border appearance-none pr-6 cursor-pointer focus:outline-none ${getStatusColor(task.status)}`}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="in_review">In Review</option>
                        <option value="done">Done</option>
                      </select>
                      <span className="material-symbols-outlined text-[12px] absolute right-1.5 top-2 text-slate-400 pointer-events-none">
                        expand_more
                      </span>
                    </div>

                    <button
                      onClick={() => handleTaskClick(task.id)}
                      className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs">
                <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">check_circle</span>
                <p>No tickets currently assigned to {selectedEmployee.name}. Awesome work!</p>
              </div>
            )}
          </div>
        </div>

        {/* Personal calendar schedule */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Today's Schedule</h4>
          </div>

          <div className="p-4 space-y-4">
            <div className="border-l-4 border-sky-400 bg-sky-50/50 p-3 rounded-r-lg">
              <div className="flex justify-between items-start">
                <h5 className="text-[12px] font-bold text-slate-800">Q3 Standup Sync</h5>
                <span className="text-[10px] font-mono text-slate-500 font-medium">09:30 AM</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">General Operations Hub room 4B</p>
            </div>

            <div className="border-l-4 border-amber-400 bg-amber-50/50 p-3 rounded-r-lg">
              <div className="flex justify-between items-start">
                <h5 className="text-[12px] font-bold text-slate-800">Deploy Security Release</h5>
                <span className="text-[10px] font-mono text-slate-500 font-medium">11:00 AM</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Review validation suite on Tokyo branch</p>
            </div>

            <div className="border-l-4 border-slate-400 bg-slate-50 p-3 rounded-r-lg">
              <div className="flex justify-between items-start">
                <h5 className="text-[12px] font-bold text-slate-800">Operational SLA Review</h5>
                <span className="text-[10px] font-mono text-slate-500 font-medium">02:30 PM</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Align with Chief Operations Marcus Thorne</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
