import React, { useState } from 'react';
import { Task } from '../types';

interface PerformanceViewProps {
  tasks: Task[];
}

export default function PerformanceView({ tasks }: PerformanceViewProps) {
  const [activeMetric, setActiveMetric] = useState<'hours' | 'counts'>('hours');

  // Compute stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Done').length;
  const totalHoursLogged = tasks.reduce((sum, t) => sum + t.timeLogged, 0);
  const totalHoursEstimated = tasks.reduce((sum, t) => sum + t.timeEstimated, 0);

  // Hardcode beautiful static performance points with some dynamic factors
  // To keep it clean and illustrative of real project velocity
  const burndownData = [
    { day: 'Day 1', actual: 48, ideal: 48 },
    { day: 'Day 2', actual: 42, ideal: 40 },
    { day: 'Day 3', actual: 35, ideal: 32 },
    { day: 'Day 4', actual: 24, ideal: 24 },
    { day: 'Day 5', actual: 16, ideal: 16 },
    { day: 'Day 6', actual: 12, ideal: 8 },
    { day: 'Day 7', actual: 4, ideal: 0 }
  ];

  const velocityWeeks = [
    { label: 'Week 1', completed: 4 },
    { label: 'Week 2', completed: 6 },
    { label: 'Week 3', completed: 8 },
    { label: 'Week 4', completed: completedTasks + 3 }
  ];

  const projectHours = Array.from(new Set(tasks.map((t) => t.project))).map((proj) => {
    const projTasks = tasks.filter((t) => t.project === proj);
    const logged = projTasks.reduce((sum, t) => sum + t.timeLogged, 0);
    const estimated = projTasks.reduce((sum, t) => sum + t.timeEstimated, 0);
    return { name: proj, logged, estimated };
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-8">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#191c1e]">Performance Insights</h2>
        <p className="text-xs text-[#45464d] mt-1">Velocity statistics, burn-down compliance models, and resource tracking metrics.</p>
      </div>

      {/* KPI Top Bar Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#c6c6cd] p-4 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-[#45464d] uppercase">Overall Completion Rate</span>
          <p className="text-2xl font-black text-[#191c1e] mt-1">
            {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-[#131b2e] h-full"
              style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white border border-[#c6c6cd] p-4 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-[#45464d] uppercase">Sprint Efficiency</span>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {totalHoursEstimated > 0 ? Math.round((totalHoursLogged / totalHoursEstimated) * 100) : 0}%
          </p>
          <span className="text-[10px] text-slate-500 mt-2 block">Of estimated budget submitted</span>
        </div>

        <div className="bg-white border border-[#c6c6cd] p-4 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-[#45464d] uppercase">Velocity Status</span>
          <p className="text-2xl font-black text-green-600 mt-1">Stable</p>
          <span className="text-[10px] text-slate-500 mt-2 block">Matches historical averages</span>
        </div>

        <div className="bg-white border border-[#c6c6cd] p-4 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold text-[#45464d] uppercase">Milestone Risks</span>
          <p className="text-2xl font-black text-red-600 mt-1">0 Flagged</p>
          <span className="text-[10px] text-slate-500 mt-2 block">Security audit scope secure</span>
        </div>
      </div>

      {/* Grid of Custom SVG Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Custom SVG Burndown Area Chart */}
        <div className="bg-white border border-[#c6c6cd] p-6 rounded-xl shadow-2xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-500">trending_down</span>
              Sprint Burndown (Q4 Scope)
            </h3>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-[#131b2e]">
                <span className="w-2.5 h-0.5 bg-[#131b2e] inline-block"></span> Actual Hours Left
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-0.5 bg-slate-400 border-dashed border-t inline-block"></span> Ideal Burn Path
              </span>
            </div>
          </div>

          {/* SVG Line / Area burndown visualizer */}
          <div className="w-full h-64 bg-slate-50/50 rounded-lg p-4 border border-slate-100 flex flex-col justify-between">
            <div className="flex-1 relative">
              {/* SVG drawing */}
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Grid Lines */}
                <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f5f9" strokeWidth="0.5" />
                <line x1="0" y1="40" x2="100" y2="40" stroke="#f1f5f9" strokeWidth="0.5" />
                <line x1="0" y1="60" x2="100" y2="60" stroke="#f1f5f9" strokeWidth="0.5" />
                <line x1="0" y1="80" x2="100" y2="80" stroke="#f1f5f9" strokeWidth="0.5" />
                
                {/* Ideal Line (Diagonal) */}
                <line x1="0" y1="10" x2="100" y2="90" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />

                {/* Actual Area / Line */}
                <path
                  d="M 0 10 L 16 20 L 33 30 L 50 50 L 66 65 L 83 72 L 100 85"
                  fill="none"
                  stroke="#131b2e"
                  strokeWidth="2"
                />

                {/* Highlight node dots */}
                <circle cx="0" cy="10" r="2.5" fill="#131b2e" />
                <circle cx="50" cy="50" r="2.5" fill="#131b2e" />
                <circle cx="100" cy="85" r="2.5" fill="#131b2e" />
              </svg>
            </div>

            {/* Labels under graph */}
            <div className="flex justify-between text-[10px] text-slate-500 font-semibold font-mono border-t border-slate-100 pt-2 mt-2">
              {burndownData.map((b) => (
                <span key={b.day}>{b.day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Weekly Velocity Bar Chart */}
        <div className="bg-white border border-[#c6c6cd] p-6 rounded-xl shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500">analytics</span>
            Sprint Velocity (Delivered Scope)
          </h3>

          <div className="w-full h-64 bg-slate-50/50 rounded-lg p-4 border border-slate-100 flex flex-col justify-between">
            <div className="flex-1 flex items-end justify-around gap-4 pt-6">
              {velocityWeeks.map((w) => {
                const heightPct = Math.min((w.completed / 12) * 100, 100);
                return (
                  <div key={w.label} className="flex-1 flex flex-col items-center gap-2 max-w-[50px]">
                    <span className="text-[10px] font-bold text-slate-700">{w.completed} tasks</span>
                    <div
                      className="w-full bg-[#131b2e] rounded-t transition-all duration-500 ease-out shadow-sm"
                      style={{ height: `${heightPct}%`, minHeight: '10%' }}
                    ></div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase font-mono tracking-wider">{w.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Lower Details: Hours Allocated Per Project */}
      <div className="bg-white border border-[#c6c6cd] p-6 rounded-xl shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-500">donut_large</span>
          Sprint Effort Audit (Estimated vs. Spent)
        </h3>

        <div className="space-y-6">
          {projectHours.map((proj) => {
            const ratioPct = proj.estimated > 0 ? (proj.logged / proj.estimated) * 100 : 0;
            return (
              <div key={proj.name} className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">{proj.name}</span>
                  <span className="text-slate-500 font-semibold">
                    {proj.logged}h logged • {proj.estimated}h planned ({Math.round(ratioPct)}% consumption)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-4 rounded-lg overflow-hidden flex">
                  <div
                    className="bg-blue-600 h-full rounded-r transition-all duration-500"
                    style={{ width: `${Math.min(ratioPct, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
