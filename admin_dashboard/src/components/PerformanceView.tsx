import { useState, useMemo } from 'react';
import { Task } from '../types';

interface PerformanceViewProps {
  tasks: Task[];
}

export default function PerformanceView({ tasks }: PerformanceViewProps) {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [hoveredMetric, setHoveredMetric] = useState<{ label: string; value: string } | null>(null);

  // Calculate dynamic metrics
  const analytics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const review = tasks.filter(t => t.status === 'in_review').length;
    const active = tasks.filter(t => t.status === 'in_progress').length;
    const backlog = tasks.filter(t => t.status === 'todo').length;

    // Division workload calculation
    const divisionCounts: Record<string, number> = {
      Engineering: 0,
      Product: 0,
      Operations: 0,
      Security: 0,
      Marketing: 0
    };
    tasks.forEach(t => {
      if (divisionCounts[t.division] !== undefined) {
        divisionCounts[t.division] += 1;
      } else {
        divisionCounts[t.division] = 1;
      }
    });

    const divisionRates = Object.entries(divisionCounts).map(([name, count]) => {
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return { name, count, percentage };
    });

    return {
      total,
      completed,
      review,
      active,
      backlog,
      divisionRates,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [tasks]);

  // Telemetry items for timeline chart representation
  const telemetryData = [
    { hour: '00:00', memory: 42, cpu: 12, latency: 45 },
    { hour: '04:00', memory: 44, cpu: 18, latency: 48 },
    { hour: '08:00', memory: 65, cpu: 52, latency: 95 },
    { hour: '12:00', memory: 72, cpu: 68, latency: 120 },
    { hour: '16:00', memory: 58, cpu: 45, latency: 75 },
    { hour: '20:00', memory: 48, cpu: 22, latency: 50 },
    { hour: '24:00', memory: 43, cpu: 15, latency: 42 }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-[28px] font-bold text-slate-900 tracking-tight">Performance Analytics</h2>
          <p className="text-slate-500 text-sm mt-1">Deep-dive operations insights, continuous deployment velocity, and infrastructure health.</p>
        </div>

        {/* Timeframe picker */}
        <div className="bg-slate-100 p-0.5 rounded-lg flex text-xs font-bold text-slate-600">
          {(['daily', 'weekly', 'monthly'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3.5 py-1.5 rounded-md transition-all uppercase tracking-wider ${timeframe === tf ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-400 hover:text-slate-700'}`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics KPI counters */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* KPI 1 */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white border border-slate-200 p-6 rounded-xl text-center">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Resolution Completion</p>
          <p className="text-3xl font-black text-slate-900 font-mono">{analytics.completionRate}%</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#131b2e] h-full rounded-full" style={{ width: `${analytics.completionRate}%` }} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white border border-slate-200 p-6 rounded-xl text-center">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Ongoing Active Load</p>
          <p className="text-3xl font-black text-slate-900 font-mono">{analytics.active}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-2.5 flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-xs">sync_saved_locally</span>
            <span>All nodes stable</span>
          </p>
        </div>

        {/* KPI 3 */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white border border-slate-200 p-6 rounded-xl text-center">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Staged For Review</p>
          <p className="text-3xl font-black text-slate-900 font-mono">{analytics.review}</p>
          <p className="text-[11px] text-slate-400 font-medium mt-2.5">Awaiting manager validation signoff</p>
        </div>

        {/* KPI 4 */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white border border-slate-200 p-6 rounded-xl text-center">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Total Deployed Tickets</p>
          <p className="text-3xl font-black text-slate-900 font-mono">{analytics.total}</p>
          <p className="text-[11px] text-slate-400 font-medium mt-2.5">Aggregated task tracking ledger</p>
        </div>
      </div>

      {/* Grid: Workload Division & Telemetry charts */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Workload Division Distribution */}
        <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200 p-6 rounded-xl space-y-6">
          <div>
            <h4 className="text-base font-bold text-slate-900">Workload Division Distribution</h4>
            <p className="text-xs text-slate-400">Proportional load mapping across key branches of TaskPro</p>
          </div>

          <div className="space-y-4 pt-2">
            {analytics.divisionRates.map((div) => (
              <div key={div.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-700">{div.name} Division</span>
                  <span className="text-slate-400 font-mono">{div.count} Tickets ({div.percentage}%)</span>
                </div>
                {/* Visual bar */}
                <div className="w-full bg-slate-100 h-3 rounded-md overflow-hidden relative group cursor-pointer">
                  <div
                    className="bg-[#131b2e] h-full rounded-md group-hover:bg-sky-500 transition-colors duration-250"
                    style={{ width: `${div.percentage}%` }}
                    title={`${div.name}: ${div.percentage}%`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System telemetry logs timeline */}
        <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200 p-6 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-base font-bold text-slate-900">Infrastructure Telemetry</h4>
                <p className="text-xs text-slate-400">Continuous 24h CPU and Response Latency intervals</p>
              </div>

              {/* Legends */}
              <div className="flex gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="w-2 h-2 bg-sky-500 rounded-full" /> CPU Load
                </span>
                <span className="flex items-center gap-1 text-slate-600 border-l border-slate-200 pl-3">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full" /> Latency (ms)
                </span>
              </div>
            </div>

            {/* Custom SVG line-plot area */}
            <div className="relative h-44 w-full">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Horizontal grid lines */}
                <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="3,3" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="3,3" />
                <line x1="0" y1="80" x2="100" y2="80" stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="3,3" />

                {/* Plot 1: CPU load line (Sky 500) */}
                <path
                  d="M 0 88 C 15 82, 15 48, 30 48 C 45 48, 45 32, 60 32 C 75 32, 75 78, 100 85"
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="1.5"
                  className="transition-all duration-300"
                />

                {/* Plot 2: Latency load line (Indigo 500) */}
                <path
                  d="M 0 65 C 15 62, 15 5, 30 5 C 45 5, 45 95, 60 95 C 75 95, 75 60, 100 62"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="1.5"
                  className="transition-all duration-300"
                />
              </svg>

              {/* Grid timeline annotations underneath */}
              <div className="absolute inset-x-0 bottom-0 flex justify-between px-1 text-[9px] text-slate-400 font-mono font-bold pt-1.5 border-t border-slate-100">
                {telemetryData.map(td => (
                  <span key={td.hour} className="hover:text-slate-800 transition-colors cursor-pointer" title={`CPU: ${td.cpu}%, Latency: ${td.latency}ms`}>
                    {td.hour}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-600 font-bold font-mono">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span>TLS Handshake Gateway 100% stable</span>
            </span>
            <span className="font-mono">Node ID: tokyo-cluster-2</span>
          </div>
        </div>

      </div>
    </div>
  );
}
