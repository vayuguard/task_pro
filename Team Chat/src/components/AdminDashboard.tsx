import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Users, 
  ArrowUpRight, 
  Play, 
  CheckSquare 
} from "lucide-react";
import { Task } from "../types";

interface AdminDashboardProps {
  tasks: Task[];
  onNavigateToView: (view: any) => void;
  onNavigateToTask: (taskId: string) => void;
}

export default function AdminDashboard({ tasks, onNavigateToView, onNavigateToTask }: AdminDashboardProps) {
  // Compute metrics dynamically from Kanban data
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const inProgressTasks = tasks.filter(t => t.status === "inprogress").length;
  const reviewTasks = tasks.filter(t => t.status === "review").length;
  const todoTasks = tasks.filter(t => t.status === "todo").length;

  const targetProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Render weekly workload chart data
  const weeklyTrendData = [
    { name: "Mon", Completed: 3, Target: 5 },
    { name: "Tue", Completed: 6, Target: 6 },
    { name: "Wed", Completed: 4, Target: 7 },
    { name: "Thu", Completed: 8, Target: 7 },
    { name: "Fri", Completed: 9, Target: 8 },
    { name: "Sat", Completed: 2, Target: 4 },
    { name: "Sun", Completed: 12, Target: 10 },
  ];

  // Workload count per team member
  const memberWorkloads: Record<string, { count: number, color: string }> = {
    "Sarah Chen": { count: 0, color: "#6366f1" },
    "Alex Rivers": { count: 0, color: "#06b6d4" },
    "David Miller": { count: 0, color: "#f59e0b" },
    "User": { count: 0, color: "#10b981" }
  };

  tasks.forEach(t => {
    const name = t.assignee.name;
    if (memberWorkloads[name]) {
      memberWorkloads[name].count += 1;
    } else {
      memberWorkloads[name] = { count: 1, color: "#64748b" };
    }
  });

  const memberChartData = Object.entries(memberWorkloads).map(([name, val]) => ({
    name,
    Tasks: val.count,
    color: val.color
  }));

  // Activity feed items
  const recentActivities = [
    { text: "Sarah Chen completed typography mapping and uploaded final specs", time: "1 hour ago", category: "UI/UX" },
    { text: "Alex Rivers completed security audit scan on server routes", time: "2 hours ago", category: "Security" },
    { text: "User moved 'Verify security rules' to Done", time: "Yesterday", category: "Kanban" },
    { text: "Alex Rivers initiated database migration for project-alpha", time: "Yesterday", category: "Backend" },
  ];

  return (
    <div id="admin-dashboard-view" className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC] space-y-8 font-sans">
      {/* Upper Title block */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Management Terminal</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time telemetry and resource allocation reports</p>
        </div>
        <button 
          id="btn-goto-kanban"
          onClick={() => onNavigateToView("kanban-board")}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer shadow-sm"
        >
          Manage Kanban Board
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="p-5 bg-white border border-slate-200 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Tasks</p>
            <p className="text-2xl font-bold text-slate-800">{totalTasks}</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Completed Tasks</p>
            <p className="text-2xl font-bold text-slate-800">{completedTasks}</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Sprint Progress</p>
            <p className="text-2xl font-bold text-emerald-600">{targetProgress}%</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Under Review</p>
            <p className="text-2xl font-bold text-amber-600">{reviewTasks}</p>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Sprint Completion Velocity</h3>
              <p className="text-xs text-slate-400 mt-0.5">Historical sprint trend compared to targets</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Active Sprint</span>
          </div>

          <div className="flex-1 h-72 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="Completed" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                <Area type="monotone" dataKey="Target" stroke="#cbd5e1" strokeDasharray="5 5" strokeWidth={1} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Workload Allocation Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="font-semibold text-slate-800 text-sm">Workload Allocation</h3>
            <p className="text-xs text-slate-400 mt-0.5">Tasks assigned per corporate personnel</p>
          </div>

          <div className="flex-1 h-72 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Bar dataKey="Tasks" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {memberChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Content split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Active Task Queue */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Active Deliverables Tracker</h3>
              <p className="text-xs text-slate-400 mt-0.5">High-priority and pending actions</p>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Showing {tasks.slice(0, 4).length} tasks</span>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {tasks.slice(0, 4).map((task) => (
              <div 
                key={task.id}
                onClick={() => onNavigateToTask(task.id)}
                className="py-3.5 flex items-center justify-between group cursor-pointer hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    task.priority === "high" 
                      ? "bg-rose-500" 
                      : task.priority === "medium" 
                        ? "bg-amber-400" 
                        : "bg-sky-400"
                  }`} />
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-semibold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">
                      {task.title}
                    </h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{task.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-sans ${
                    task.status === "done" 
                      ? "bg-emerald-50 text-emerald-700" 
                      : task.status === "inprogress"
                        ? "bg-sky-50 text-sky-700"
                        : task.status === "review"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-50 text-slate-700"
                  }`}>
                    {task.status}
                  </span>
                  
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200">
                    <img className="w-full h-full object-cover" src={task.assignee.avatar} alt="assignee" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log / Event Feed */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-800 text-sm">Sprint Audit Feed</h3>
            <p className="text-xs text-slate-400 mt-0.5">Collaborative system events and updates</p>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-72 pr-1 hide-scrollbar">
            {recentActivities.map((act, i) => (
              <div key={i} className="flex gap-3 text-xs leading-relaxed">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-slate-600 font-medium">{act.text}</p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                    <span>{act.time}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-indigo-500 uppercase">{act.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
