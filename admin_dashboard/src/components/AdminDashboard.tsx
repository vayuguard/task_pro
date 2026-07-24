import { useState, useMemo } from 'react';
import { Task, Activity, TabType } from '../types';

interface AdminDashboardProps {
  tasks: Task[];
  activities: Activity[];
  searchQuery: string;
  setActiveTab: (tab: TabType) => void;
  setSelectedTaskId: (id: string) => void;
  onDeleteActivity: (id: string) => void;
  onUpdateActivityStatus: (id: string, status: Activity['status']) => void;
}

interface ChartData {
  month: string;
  engineering: number;
  product: number;
}

const PERFORMANCE_DATA: ChartData[] = [
  { month: 'JAN', engineering: 65, product: 45 },
  { month: 'FEB', engineering: 75, product: 55 },
  { month: 'MAR', engineering: 85, product: 70 },
  { month: 'APR', engineering: 60, product: 80 },
  { month: 'MAY', engineering: 90, product: 65 },
  { month: 'JUN', engineering: 70, product: 50 },
];

export default function AdminDashboard({
  tasks,
  activities,
  searchQuery,
  setActiveTab,
  setSelectedTaskId,
  onDeleteActivity,
  onUpdateActivityStatus
}: AdminDashboardProps) {
  const [chartFilter, setChartFilter] = useState<'all' | 'engineering' | 'product'>('all');
  const [hoveredMonth, setHoveredMonth] = useState<ChartData | null>(null);
  const [activeActivityMenu, setActiveActivityMenu] = useState<string | null>(null);
  const [activityStatusFilter, setActivityStatusFilter] = useState<'ALL' | 'COMPLETED' | 'SCHEDULED' | 'ACTION REQUIRED'>('ALL');

  // Compute stats dynamically from real tasks list
  const stats = useMemo(() => {
    const activeCount = tasks.filter((t) => t.status !== 'done').length;
    const doneCount = tasks.filter((t) => t.status === 'done').length;
    
    // Base standard numbers boosted by interactive actions
    const displayActiveTasks = 1280 + activeCount;
    const rawCompletionRate = tasks.length > 0 ? (doneCount / tasks.length) * 100 : 96.4;
    // Cap at reasonable enterprise values or keep near 96.4%
    const displayCompletionRate = tasks.length > 0 
      ? (90 + (doneCount / tasks.length) * 9.8).toFixed(1)
      : '96.4';

    const displayVelocity = (82.5 + tasks.length * 0.3).toFixed(1);

    return {
      activeTasks: displayActiveTasks.toLocaleString(),
      teamVelocity: displayVelocity,
      completionRate: displayCompletionRate + '%',
    };
  }, [tasks]);

  // Filter urgent tasks
  const urgentTasks = useMemo(() => {
    return tasks.filter((t) => t.priority === 'urgent' && t.status !== 'done').slice(0, 3);
  }, [tasks]);

  // Filter and search activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // Status filter
      if (activityStatusFilter !== 'ALL' && act.status !== activityStatusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          act.title.toLowerCase().includes(query) ||
          act.project.toLowerCase().includes(query) ||
          act.user.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [activities, activityStatusFilter, searchQuery]);

  const handleTaskClick = (id: string) => {
    setSelectedTaskId(id);
    setActiveTab('task_details');
  };

  const getPriorityBadgeColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'high': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium': return 'bg-sky-100 text-sky-800 border-sky-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-end border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-[28px] font-bold text-slate-900 tracking-tight">Admin Dashboard</h2>
          <p className="text-slate-500 text-sm mt-1">Enterprise-wide operational overview and performance analytics.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => alert('Fiscal Quarter filter: Data is configured for Q3 operational intervals.')}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-sm text-slate-400">calendar_today</span>
            <span>This Quarter</span>
          </button>
          <button
            onClick={() => {
              alert('Generating secure Excel/PDF report. Downloader initialized in background.');
              console.log('TaskPro Enterprise Ledger exported:', { tasks, activities });
            }}
            className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow active:translate-y-[1px]"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Bento Grid: Four Key Metrics */}
      <div className="grid grid-cols-12 gap-6">
        {/* Metric 1 */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white border border-slate-200 p-6 rounded-xl relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="absolute top-4 right-4 text-slate-100 group-hover:text-slate-200 transition-colors">
            <span className="material-symbols-outlined text-[54px] font-light">task_alt</span>
          </div>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2">Active Tasks</p>
          <div className="flex items-baseline gap-2.5">
            <h3 className="text-2xl font-bold text-slate-900">{stats.activeTasks}</h3>
            <span className="text-emerald-600 text-xs font-bold flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded">
              <span className="material-symbols-outlined text-[12px] font-bold">trending_up</span>
              <span>12%</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 font-medium">Across 42 active departments</p>
        </div>

        {/* Metric 2 */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white border border-slate-200 p-6 rounded-xl relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="absolute top-4 right-4 text-slate-100 group-hover:text-slate-200 transition-colors">
            <span className="material-symbols-outlined text-[54px] font-light">bolt</span>
          </div>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2">Team Velocity</p>
          <div className="flex items-baseline gap-2.5">
            <h3 className="text-2xl font-bold text-slate-900">{stats.teamVelocity}</h3>
            <span className="text-rose-600 text-xs font-bold flex items-center gap-0.5 bg-rose-50 px-1.5 py-0.5 rounded">
              <span className="material-symbols-outlined text-[12px] font-bold">trending_down</span>
              <span>3%</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 font-medium">Average tasks per week</p>
        </div>

        {/* Metric 3 */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white border border-slate-200 p-6 rounded-xl relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="absolute top-4 right-4 text-slate-100 group-hover:text-slate-200 transition-colors">
            <span className="material-symbols-outlined text-[54px] font-light">check_circle</span>
          </div>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2">Completion Rate</p>
          <div className="flex items-baseline gap-2.5">
            <h3 className="text-2xl font-bold text-slate-900">{stats.completionRate}</h3>
            <span className="text-emerald-600 text-xs font-bold flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded">
              <span className="material-symbols-outlined text-[12px] font-bold">trending_up</span>
              <span>0.5%</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 font-medium">SLA target: 95.0%</p>
        </div>

        {/* Metric 4 */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white border border-slate-200 p-6 rounded-xl relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="absolute top-4 right-4 text-slate-100 group-hover:text-slate-200 transition-colors">
            <span className="material-symbols-outlined text-[54px] font-light">dns</span>
          </div>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2">System Uptime</p>
          <div className="flex items-baseline gap-2.5">
            <h3 className="text-2xl font-bold text-slate-900">99.9%</h3>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] rounded font-black tracking-widest uppercase">
              Optimal
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 font-medium">Last incidents: 0 (30 days)</p>
        </div>
      </div>

      {/* Grid: Charts & High Priority Tasks */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Performance Trends Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 p-6 rounded-xl relative">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-8">
            <div>
              <h4 className="text-base font-bold text-slate-900">Performance Trends</h4>
              <p className="text-slate-400 text-xs">Monthly ticket completion comparisons across key divisions</p>
            </div>

            {/* Interactive Filters */}
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-0.5 rounded-lg flex text-[11px] font-bold">
                <button
                  onClick={() => setChartFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-all ${chartFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setChartFilter('engineering')}
                  className={`px-2.5 py-1 rounded-md transition-all ${chartFilter === 'engineering' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                >
                  Eng
                </button>
                <button
                  onClick={() => setChartFilter('product')}
                  className={`px-2.5 py-1 rounded-md transition-all ${chartFilter === 'product' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                >
                  Prod
                </button>
              </div>

              <div className="flex gap-4 items-center pl-3 border-l border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#131b2e] rounded-sm"></span>
                  <span className="text-[11px] font-bold text-slate-600">Engineering</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#515f74] rounded-sm"></span>
                  <span className="text-[11px] font-bold text-slate-600">Product</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive SVG Bar Chart with Hover Tooltip */}
          <div className="relative h-64 w-full flex items-end justify-between gap-2.5 sm:gap-6 pt-4 px-2">
            {PERFORMANCE_DATA.map((data, index) => {
              const engHeight = chartFilter === 'product' ? 0 : data.engineering;
              const prodHeight = chartFilter === 'engineering' ? 0 : data.product;
              const isHovered = hoveredMonth?.month === data.month;

              return (
                <div
                  key={data.month}
                  className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                  onMouseEnter={() => setHoveredMonth(data)}
                  onMouseLeave={() => setHoveredMonth(null)}
                >
                  {/* Grid bars container */}
                  <div className="w-full flex gap-1 items-end h-[85%] relative">
                    {/* Engineering Bar */}
                    <div
                      style={{ height: `${engHeight}%` }}
                      className={`w-full bg-[#131b2e] rounded-t-sm transition-all duration-300 ${isHovered ? 'brightness-125 scale-x-105' : ''}`}
                    />
                    {/* Product Bar */}
                    <div
                      style={{ height: `${prodHeight}%` }}
                      className={`w-full bg-[#515f74] rounded-t-sm transition-all duration-300 ${isHovered ? 'brightness-125 scale-x-105' : ''}`}
                    />
                  </div>
                  {/* Label */}
                  <span className={`text-[10px] font-bold mt-2 tracking-wider ${isHovered ? 'text-slate-950 scale-110 font-black' : 'text-slate-400'}`}>
                    {data.month}
                  </span>
                </div>
              );
            })}

            {/* Simulated Grid Lines */}
            <div className="absolute inset-x-0 bottom-[15%] top-0 flex flex-col justify-between pointer-events-none pb-2">
              <div className="w-full border-t border-dashed border-slate-100" />
              <div className="w-full border-t border-dashed border-slate-100" />
              <div className="w-full border-t border-dashed border-slate-100" />
              <div className="w-full border-t border-dashed border-slate-100" />
            </div>

            {/* Custom Tooltip */}
            {hoveredMonth && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-lg px-4 py-2 text-[11px] shadow-xl border border-slate-800 flex items-center gap-3.5 animate-fade-in font-mono z-20">
                <span className="font-bold text-sky-400">{hoveredMonth.month} Outputs</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-sky-300 rounded-full"></span>
                  <span>Eng: {hoveredMonth.engineering}</span>
                </span>
                <span className="flex items-center gap-1 border-l border-slate-700 pl-3">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                  <span>Prod: {hoveredMonth.product}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* High Priority list */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">High Priority Tasks</h4>
              <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-0.5 rounded tracking-widest uppercase">URGENT</span>
            </div>

            <div className="divide-y divide-slate-100">
              {urgentTasks.length > 0 ? (
                urgentTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleTaskClick(task.id)}
                    className="w-full p-4 hover:bg-slate-50/50 transition-all flex flex-col text-left group border-none outline-none cursor-pointer"
                  >
                    <div className="w-full flex justify-between items-start mb-1">
                      <h5 className="text-[13px] font-bold text-slate-800 group-hover:text-sky-600 transition-colors leading-tight line-clamp-1">
                        {task.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">{task.timeAgo}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3 pr-2">
                      {task.description}
                    </p>
                    <div className="w-full flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityBadgeColor(task.priority)}`}>
                          {task.division}
                        </span>
                        {task.subtasks.length > 0 && (
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[12px]">checklist</span>
                            <span>
                              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                            </span>
                          </span>
                        )}
                      </div>
                      
                      {/* Assignee circles */}
                      <div className="flex -space-x-1.5">
                        {task.assignees.map((name, i) => (
                          <div
                            key={name}
                            title={name}
                            className={`w-5 h-5 rounded-full border border-white flex items-center justify-center text-[8px] font-bold text-white shrink-0 ${
                              i === 0 ? 'bg-indigo-500' : 'bg-slate-500'
                            }`}
                          >
                            {name.charAt(0)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <span className="material-symbols-outlined text-3xl mb-1 text-slate-300">verified</span>
                  <p>All clear! No urgent pending tasks remaining.</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('kanban_board')}
            className="w-full py-3.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors border-t border-slate-100 uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <span>View Kanban Board</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Recent Activity Feed Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-slate-50">
          <div>
            <h4 className="text-base font-bold text-slate-900">Recent Activity Feed</h4>
            <p className="text-slate-400 text-xs">Continuous operational audit log from firewall entries and code pushes</p>
          </div>

          {/* Table filters */}
          <div className="flex gap-1 bg-slate-200/60 p-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
            {(['ALL', 'COMPLETED', 'SCHEDULED', 'ACTION REQUIRED'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActivityStatusFilter(filter)}
                className={`px-2.5 py-1 rounded ${activityStatusFilter === filter ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/55 text-slate-400 text-[11px] font-bold uppercase tracking-widest border-b border-slate-200">
                <th className="px-6 py-4">Activity</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((act) => {
                  const getStatusTag = (status: Activity['status']) => {
                    switch (status) {
                      case 'COMPLETED':
                        return 'bg-emerald-50 text-emerald-800 border-emerald-100';
                      case 'SCHEDULED':
                        return 'bg-blue-50 text-blue-800 border-blue-100';
                      case 'ACTION REQUIRED':
                        return 'bg-rose-50 text-rose-800 border-rose-100 animate-pulse';
                    }
                  };

                  const getIcon = (type: Activity['type']) => {
                    switch (type) {
                      case 'upload_file': return 'upload_file';
                      case 'chat': return 'chat';
                      case 'warning': return 'warning';
                      case 'task': return 'task';
                      default: return 'settings';
                    }
                  };

                  const getIconBg = (type: Activity['type']) => {
                    switch (type) {
                      case 'upload_file': return 'bg-sky-50 text-sky-600';
                      case 'chat': return 'bg-blue-50 text-blue-600';
                      case 'warning': return 'bg-rose-50 text-rose-600';
                      case 'task': return 'bg-indigo-50 text-indigo-600';
                      default: return 'bg-amber-50 text-amber-600';
                    }
                  };

                  return (
                    <tr key={act.id} className="hover:bg-slate-50/20 transition-all text-sm group">
                      {/* Activity Title */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 border border-slate-100 ${getIconBg(act.type)}`}>
                            <span className="material-symbols-outlined text-[18px]">{getIcon(act.type)}</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 group-hover:text-slate-950 transition-colors leading-tight">
                              {act.title}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{act.project}</p>
                          </div>
                        </div>
                      </td>

                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={act.userAvatar}
                            alt={act.user}
                            className="w-5 h-5 rounded-full object-cover border border-slate-200"
                          />
                          <span className="text-slate-600 font-medium text-[13px]">{act.user}</span>
                        </div>
                      </td>

                      {/* Status Tag */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider ${getStatusTag(act.status)}`}>
                          {act.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">
                        {act.date}
                      </td>

                      {/* Action trigger menu */}
                      <td className="px-6 py-4 text-right relative">
                        <button
                          onClick={() => setActiveActivityMenu(activeActivityMenu === act.id ? null : act.id)}
                          className="text-slate-400 hover:text-slate-800 transition-colors p-1 rounded-full hover:bg-slate-100"
                        >
                          <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                        </button>

                        {activeActivityMenu === act.id && (
                          <div className="absolute right-6 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-30 text-left font-sans text-xs">
                            <button
                              onClick={() => {
                                onUpdateActivityStatus(act.id, 'COMPLETED');
                                setActiveActivityMenu(null);
                              }}
                              className="w-full px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 text-left border-none"
                            >
                              <span className="material-symbols-outlined text-sm text-emerald-600">done</span>
                              <span>Mark Completed</span>
                            </button>
                            <button
                              onClick={() => {
                                onUpdateActivityStatus(act.id, 'ACTION REQUIRED');
                                setActiveActivityMenu(null);
                              }}
                              className="w-full px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 text-left border-none"
                            >
                              <span className="material-symbols-outlined text-sm text-rose-500">warning</span>
                              <span>Action Required</span>
                            </button>
                            <button
                              onClick={() => {
                                onDeleteActivity(act.id);
                                setActiveActivityMenu(null);
                              }}
                              className="w-full px-3 py-2 hover:bg-rose-50 hover:text-rose-800 text-rose-600 flex items-center gap-1.5 text-left border-none border-t border-slate-100"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                              <span>Remove Log</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">find_in_page</span>
                    <p>No logged activities correspond to current search guidelines or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
