import { useState, useMemo } from 'react';
import { 
  Bolt, 
  CheckCircle, 
  Smile, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Download, 
  Share2,
  RefreshCw,
  Search
} from 'lucide-react';
import { Employee, ProjectHealth } from '../types';

interface PerformanceProps {
  employees: Employee[];
  projectsHealth: ProjectHealth[];
  searchQuery: string;
}

export default function PerformanceDashboard({ employees, projectsHealth, searchQuery }: PerformanceProps) {
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly'>('monthly');
  const [showFilters, setShowFilters] = useState(false);
  
  // Table filters
  const [filterMinVelocity, setFilterMinVelocity] = useState<number | null>(null);
  const [filterMinCompletion, setFilterMinCompletion] = useState<number | null>(null);
  const [filterTrend, setFilterTrend] = useState<'positive' | 'all'>('all');
  const [sortField, setSortField] = useState<keyof Employee>('velocity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Chart data definitions
  const monthlyData = [
    { label: 'Jan', value: 45, displayValue: '45%' },
    { label: 'Feb', value: 62, displayValue: '62%' },
    { label: 'Mar', value: 58, displayValue: '58%' },
    { label: 'Apr', value: 88, displayValue: '88%' },
    { label: 'May', value: 74, displayValue: '74%' },
    { label: 'Jun', value: 92, displayValue: '92%' },
    { label: 'Jul', value: 81, displayValue: '81%' },
  ];

  const quarterlyData = [
    { label: 'Q3 2025', value: 68, displayValue: '68%' },
    { label: 'Q4 2025', value: 78, displayValue: '78%' },
    { label: 'Q1 2026', value: 73, displayValue: '73%' },
    { label: 'Q2 2026', value: 89, displayValue: '89%' },
  ];

  const activeChartData = timeframe === 'monthly' ? monthlyData : quarterlyData;

  // Star Rating renderer helper
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star key={i} className="w-3.5 h-3.5 fill-black text-black" />
        );
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(
          <div key={i} className="relative inline-block text-black">
            <Star className="w-3.5 h-3.5 text-black" />
            <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
              <Star className="w-3.5 h-3.5 fill-black text-black" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-3.5 h-3.5 text-slate-300" />
        );
      }
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  // Sorting handler
  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filter & Search table employees
  const processedEmployees = useMemo(() => {
    let filtered = [...employees];

    // Search filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(q) || 
        emp.role.toLowerCase().includes(q)
      );
    }

    // Min Velocity
    if (filterMinVelocity !== null) {
      filtered = filtered.filter(emp => emp.velocity >= filterMinVelocity);
    }

    // Min Completion
    if (filterMinCompletion !== null) {
      filtered = filtered.filter(emp => emp.completionRate >= filterMinCompletion);
    }

    // Trend Direction
    if (filterTrend === 'positive') {
      filtered = filtered.filter(emp => emp.trend > 0);
    }

    // Sort
    filtered.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        valA = (valA as string).toLowerCase();
        valB = (valB as string).toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [employees, searchQuery, filterMinVelocity, filterMinCompletion, filterTrend, sortField, sortOrder]);

  // Paginated employees
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedEmployees.slice(startIndex, startIndex + itemsPerPage);
  }, [processedEmployees, currentPage]);

  const totalPages = Math.ceil(processedEmployees.length / itemsPerPage);

  // Status Chip helper for Project Health
  const getStatusChip = (status: 'on_track' | 'delayed' | 'active') => {
    switch (status) {
      case 'on_track':
        return <span className="text-[10px] font-bold text-[#065F46] bg-[#10B9811A] px-2 py-0.5 rounded uppercase tracking-wider">On Track</span>;
      case 'delayed':
        return <span className="text-[10px] font-bold text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded uppercase tracking-wider">Delayed</span>;
      case 'active':
        return <span className="text-[10px] font-bold text-[#3a485c] bg-[#d5e3fd] px-2 py-0.5 rounded uppercase tracking-wider">Active</span>;
    }
  };

  // Simulated reports & download interaction
  const triggerDownload = () => {
    alert('Preparing custom performance enterprise audit. Your PDF report download will initiate shortly.');
  };

  const triggerShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Copied secure share view link for this dashboard state to your clipboard!');
  };

  return (
    <div id="performance-dashboard-container" className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-64px)]">
      
      {/* Key Metrics Overview Row */}
      <div id="metrics-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div id="metric-card-velocity" className="bg-white p-6 rounded-xl border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Average Velocity</p>
            <Bolt className="text-black w-5 h-5" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mt-2">42.8</h3>
          <div className="flex items-center gap-1 text-emerald-700 mt-2 text-xs font-semibold">
            <TrendingUp className="w-4 h-4" />
            <span>+12% vs last month</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div id="metric-card-tasks" className="bg-white p-6 rounded-xl border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Tasks Completed</p>
            <CheckCircle className="text-black w-5 h-5" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mt-2">1,204</h3>
          <div className="flex items-center gap-1 text-emerald-700 mt-2 text-xs font-semibold">
            <TrendingUp className="w-4 h-4" />
            <span>+5.2% vs last month</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div id="metric-card-morale" className="bg-white p-6 rounded-xl border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Team Morale</p>
            <Smile className="text-black w-5 h-5" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mt-2">
            4.8<span className="text-lg text-slate-400 font-normal">/5.0</span>
          </h3>
          <div className="flex items-center gap-1 text-slate-500 mt-2 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>Consistent with Q2</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div id="metric-card-health" className="bg-white p-6 rounded-xl border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Health Score</p>
            <ShieldAlert className="text-black w-5 h-5" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mt-2">
            94<span className="text-lg text-slate-400 font-normal">%</span>
          </h3>
          <div className="flex items-center gap-1 text-red-600 mt-2 text-xs font-semibold">
            <TrendingDown className="w-4 h-4" />
            <span>-2.1% (Pending Critical)</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div id="charts-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Team Productivity Bar Chart */}
        <div id="productivity-chart-card" className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
            <div>
              <h4 className="text-lg font-bold text-slate-900">Team Productivity</h4>
              <p className="text-xs text-slate-400 mt-0.5">Task completion rate by department</p>
            </div>
            
            {/* Monthly / Quarterly switch */}
            <div id="timeframe-toggle-container" className="flex bg-slate-100 p-1 rounded-lg">
              <button
                id="toggle-timeframe-monthly"
                onClick={() => setTimeframe('monthly')}
                className={`px-4 py-1.5 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                  timeframe === 'monthly'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                Monthly
              </button>
              <button
                id="toggle-timeframe-quarterly"
                onClick={() => setTimeframe('quarterly')}
                className={`px-4 py-1.5 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                  timeframe === 'quarterly'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                Quarterly
              </button>
            </div>
          </div>

          {/* Interactive Chart Rendering with inline styling for exact mockup proportions */}
          <div id="svg-bars-container" className="h-64 flex items-end justify-between gap-4 px-2 pt-4 border-b border-slate-100">
            {activeChartData.map((data, index) => {
              const barHeightPercent = `${data.value}%`;
              return (
                <div 
                  id={`productivity-bar-col-${index}`}
                  key={data.label} 
                  className="flex flex-col items-center gap-3 w-full group cursor-pointer"
                >
                  <div className="w-full bg-[#131b2e] rounded-t-sm hover:bg-indigo-900 transition-all duration-500 relative flex flex-col justify-end" style={{ height: barHeightPercent }}>
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      Productivity: {data.displayValue}
                    </div>
                  </div>
                  <span className="font-mono text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-2">
                    {data.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Health Scores (Circular Ring Charts) */}
        <div id="project-health-card" className="bg-white p-8 rounded-xl border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex flex-col">
          <h4 className="text-lg font-bold text-slate-900">Project Health</h4>
          <p className="text-xs text-slate-400 mt-0.5 mb-6">Real-time status tracking</p>
          
          <div id="project-health-items" className="flex-grow space-y-6">
            {projectsHealth.map((proj) => {
              // Calculate SVG Dash values
              const radius = 20;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference - (proj.percentage / 100) * circumference;

              return (
                <div id={`health-item-${proj.id}`} key={proj.id} className="flex items-center gap-4 group hover:bg-slate-50/50 p-2 rounded-lg transition-colors">
                  {/* SVG Circular Ring */}
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle 
                        className="text-slate-100" 
                        cx="24" 
                        cy="24" 
                        fill="transparent" 
                        r={radius} 
                        stroke="currentColor" 
                        strokeWidth="4" 
                      />
                      <circle 
                        className="text-slate-900 transition-all duration-1000 ease-out" 
                        cx="24" 
                        cy="24" 
                        fill="transparent" 
                        r={radius} 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-slate-800">
                      {proj.percentage}%
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-xs text-slate-800">{proj.name}</p>
                      {getStatusChip(proj.status)}
                    </div>
                    {/* Linear Micro Progress Bar */}
                    <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="bg-slate-900 h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${proj.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Employee Rankings Section */}
      <div id="rankings-table-card" className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h4 className="text-lg font-bold text-slate-900">Individual Performance Rankings</h4>
            <p className="text-xs text-slate-400 mt-0.5">Based on task completion velocity and peer feedback</p>
          </div>
          
          <div className="flex items-center gap-3 relative">
            <button
              id="filter-criteria-dropdown-btn"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                showFilters || filterMinVelocity || filterMinCompletion || filterTrend !== 'all'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filter Criteria
            </button>

            {/* Criteria Filters Panel */}
            {showFilters && (
              <div id="criteria-filters-panel" className="absolute right-0 top-11 w-72 bg-white border border-slate-200 rounded-lg shadow-xl p-4 z-30 space-y-4 text-slate-800">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="font-bold text-xs">Filter Settings</span>
                  <button 
                    onClick={() => {
                      setFilterMinVelocity(null);
                      setFilterMinCompletion(null);
                      setFilterTrend('all');
                      setShowFilters(false);
                    }}
                    className="text-[10px] text-red-600 font-bold hover:underline"
                  >
                    Reset All
                  </button>
                </div>

                {/* Min Velocity Filter */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Min Velocity (pts/wk)</label>
                  <div className="flex gap-2">
                    {[10, 12, 14].map((v) => (
                      <button
                        key={v}
                        onClick={() => setFilterMinVelocity(filterMinVelocity === v ? null : v)}
                        className={`flex-1 py-1 rounded border text-[10px] font-semibold transition-colors ${
                          filterMinVelocity === v 
                            ? 'bg-slate-900 text-white border-slate-900' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {v}+ pts
                      </button>
                    ))}
                  </div>
                </div>

                {/* Min Completion Rate */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Min Completion Rate</label>
                  <div className="flex gap-2">
                    {[85, 90, 95].map((c) => (
                      <button
                        key={c}
                        onClick={() => setFilterMinCompletion(filterMinCompletion === c ? null : c)}
                        className={`flex-1 py-1 rounded border text-[10px] font-semibold transition-colors ${
                          filterMinCompletion === c 
                            ? 'bg-slate-900 text-white border-slate-900' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {c}%+
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trend Filter */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Trend Direction</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterTrend('all')}
                      className={`flex-1 py-1 rounded border text-[10px] font-semibold ${
                        filterTrend === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      All Trends
                    </button>
                    <button
                      onClick={() => setFilterTrend('positive')}
                      className={`flex-1 py-1 rounded border text-[10px] font-semibold ${
                        filterTrend === 'positive' ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Positive (+)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div id="rankings-table-wrapper" className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4 cursor-pointer hover:text-slate-700 select-none" onClick={() => handleSort('name')}>
                  Employee {sortField === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-700 select-none" onClick={() => handleSort('velocity')}>
                  Velocity {sortField === 'velocity' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-700 select-none" onClick={() => handleSort('completionRate')}>
                  Completion % {sortField === 'completionRate' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-700 select-none" onClick={() => handleSort('feedbackScore')}>
                  Feedback {sortField === 'feedbackScore' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-slate-700 select-none text-right" onClick={() => handleSort('trend')}>
                  Trend {sortField === 'trend' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-semibold">
                    No team members found matching your search or filter settings.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                    {/* Employee Profile Cell */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${emp.avatarBg} text-white flex items-center justify-center font-bold text-[10px] shadow-sm`}>
                          {emp.initials}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 group-hover:text-slate-950">{emp.name}</p>
                          <p className="text-[10px] text-slate-400">{emp.role}</p>
                        </div>
                      </div>
                    </td>

                    {/* Velocity Cell */}
                    <td className="px-6 py-4 font-mono font-medium text-slate-700">
                      {emp.velocity} pts/wk
                    </td>

                    {/* Completion Cell */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-medium text-slate-700 w-8">{emp.completionRate}%</span>
                        <div className="w-24 bg-slate-100 h-1 rounded-full overflow-hidden hidden sm:block">
                          <div 
                            className="bg-slate-900 h-full rounded-full group-hover:bg-indigo-900 transition-all duration-500" 
                            style={{ width: `${emp.completionRate}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Feedback Rating Cell */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {renderStars(emp.feedbackScore)}
                        <span className="text-[9px] text-slate-400 font-bold">{emp.feedbackScore} stars avg</span>
                      </div>
                    </td>

                    {/* Trend Percent Cell */}
                    <td className="px-6 py-4 text-right">
                      <span className={`font-mono text-[11px] font-bold ${
                        emp.trend >= 0 ? 'text-[#065F46] bg-emerald-50 px-2 py-0.5 rounded' : 'text-red-600 bg-red-50 px-2 py-0.5 rounded'
                      }`}>
                        {emp.trend >= 0 ? `+${emp.trend}%` : `${emp.trend}%`}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {processedEmployees.length > 0 && (
          <div id="table-pagination-bar" className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center px-6">
            <p className="text-xs text-slate-500">
              Showing <b>{Math.min((currentPage - 1) * itemsPerPage + 1, processedEmployees.length)}</b> to <b>{Math.min(currentPage * itemsPerPage, processedEmployees.length)}</b> of <b>{processedEmployees.length}</b> employees
            </p>
            <div className="flex gap-2">
              <button
                id="pagination-prev-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-md bg-white hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="pagination-next-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-md bg-white hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer synchronization & actions */}
      <div id="performance-footer" className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 pb-12">
        <div className="flex items-center gap-8 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400 animate-pulse"></div>
            <span className="text-xs font-semibold text-slate-500">Data synchronized 2m ago</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm animate-pulse"></div>
            <span className="text-xs font-semibold text-slate-500">All systems operational</span>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            id="download-report-btn"
            onClick={triggerDownload}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
          <button
            id="share-view-btn"
            onClick={triggerShare}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            Share View
          </button>
        </div>
      </div>
    </div>
  );
}
