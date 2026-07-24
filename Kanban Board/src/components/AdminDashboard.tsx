import React, { useState } from "react";
import { Task, Member } from "../types";
import { 
  Sparkles, TrendingUp, AlertCircle, Clock, CheckCircle, 
  Users, RefreshCw, BarChart2, ShieldAlert, Zap 
} from "lucide-react";
import { motion } from "motion/react";

interface AdminDashboardProps {
  tasks: Task[];
  members: Member[];
}

export default function AdminDashboard({ tasks, members }: AdminDashboardProps) {
  const [aiReport, setAiReport] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Statistics Computations
  const totalTasks = tasks.length;
  const inProgressCount = tasks.filter(t => t.status === "in_progress").length;
  const reviewCount = tasks.filter(t => t.status === "review").length;
  const completedCount = tasks.filter(t => t.status === "done").length;
  const criticalCount = tasks.filter(t => t.priority === "High" && t.status !== "done").length;

  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Workload distributions
  const memberWorkload = members.map(m => {
    const totalAssigned = tasks.filter(t => t.assigneeId === m.id).length;
    const activeAssigned = tasks.filter(t => t.assigneeId === m.id && t.status !== "done").length;
    return {
      name: m.name,
      avatar: m.avatarUrl,
      role: m.role,
      total: totalAssigned,
      active: activeAssigned,
    };
  }).sort((a, b) => b.active - a.active);

  // Trigger AI analysis
  const runAiAnalysis = async () => {
    setIsLoading(true);
    setLoadingStep(0);
    setAiReport("");

    // Simulate analysis steps to show a gorgeous progressive loading status
    const stepIntervals = [1200, 2400, 3600];
    const stepText = [
      "Parsing active task status distribution...",
      "Analyzing assignees and workload balance index...",
      "Consulting Gemini 3.5-flash model for strategic recommendations..."
    ];

    setTimeout(() => setLoadingStep(1), 1000);
    setTimeout(() => setLoadingStep(2), 2200);

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      setAiReport(data.insights || "No report returned");
    } catch (err) {
      console.error(err);
      setAiReport("### ⚠️ API Connection Error\nFailed to establish server-side tunnel to Gemini API. Please check your network and workspace secrets.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="admin-dashboard-view" className="flex flex-col gap-6 w-full h-full">
      {/* View Title */}
      <div>
        <h2 className="text-3xl font-bold font-headline-lg text-slate-900 tracking-tight">Admin Dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">Real-time team throughput metrics, workload analytics, and automated bottleneck audits.</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Backlog</p>
            <p className="text-3xl font-bold text-slate-900">{totalTasks}</p>
            <p className="text-[11px] text-slate-400 font-medium">Sprint total scope</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg text-slate-600">
            <BarChart2 size={24} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Progress</p>
            <p className="text-3xl font-bold text-slate-900">{inProgressCount}</p>
            <p className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
              <RefreshCw size={10} className="animate-spin" /> Active Dev Cycle
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-lg">
            <Clock size={24} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bottlenecks (Review)</p>
            <p className="text-3xl font-bold text-slate-900">{reviewCount}</p>
            <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
              <AlertCircle size={10} /> Pending QA/Verification
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-lg">
            <ShieldAlert size={24} />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sprint Progress</p>
            <p className="text-3xl font-bold text-slate-900">{completionRate}%</p>
            <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${completionRate}%` }}></div>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* Main Content Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Workloads & Custom Visual Heuristic Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users size={18} className="text-slate-600" />
              Active Workload Balance Heuristics
            </h3>

            {/* Custom SVG/CSS Bar Chart Grid */}
            <div className="space-y-4 pt-2">
              {memberWorkload.map((m, idx) => {
                const maxActive = Math.max(...memberWorkload.map(x => x.active), 1);
                const percent = (m.active / maxActive) * 100;
                
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <div className="flex items-center gap-2">
                        <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full object-cover" />
                        <div>
                          <span className="text-slate-900 font-semibold">{m.name}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5">{m.role}</span>
                        </div>
                      </div>
                      <span className="text-slate-700 font-mono font-bold">{m.active} open / {m.total} total</span>
                    </div>
                    {/* Visual Bar Container */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-50 h-3 border border-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                          className={`h-full rounded-full ${
                            m.active >= 3 
                              ? "bg-red-500" 
                              : m.active >= 2 
                                ? "bg-amber-500" 
                                : "bg-blue-500"
                          }`}
                        ></motion.div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        m.active >= 3 
                          ? "bg-red-50 text-red-700" 
                          : m.active >= 2 
                            ? "bg-amber-50 text-amber-700" 
                            : "bg-blue-50 text-blue-700"
                      }`}>
                        {m.active >= 3 ? "Overloaded" : m.active >= 2 ? "Balanced" : "Optimal"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Informational Panel on Critical Tasks */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10 text-white pointer-events-none">
              <Zap size={240} />
            </div>
            <div className="space-y-1 z-10">
              <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Zap size={16} className="text-amber-400" />
                Active Urgent Tasks Remaining: {criticalCount}
              </h4>
              <p className="text-xs text-slate-400">High priority backlog items require immediate coordination to sustain board momentum.</p>
            </div>
            <button 
              onClick={() => {
                const element = document.getElementById("kanban-tab");
                if (element) element.click();
              }}
              className="px-4 py-2 bg-white text-slate-900 rounded font-semibold text-xs hover:bg-slate-50 transition-all z-10 shrink-0 shadow-sm"
            >
              Verify High Priority Board
            </button>
          </div>
        </div>

        {/* Column 3: AI Board Health Analyzer Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm tracking-tight uppercase">
              <Sparkles size={16} className="text-indigo-600" />
              AI Board Health Analyzer
            </h3>
            <span className="text-[9px] bg-slate-100 text-slate-600 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
              Gemini 3.5
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Synthesize all open sprint deliverables, workload stress levels, and deadline risks. Run AI deep analysis to audit board health instantly.
          </p>

          {/* Report Output Canvas */}
          <div className="flex-1 min-h-[250px] max-h-[360px] overflow-y-auto border border-slate-100 bg-slate-50/50 rounded-lg p-4 mb-4 text-xs leading-relaxed text-slate-700">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <div className="relative">
                  <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <Sparkles size={14} className="text-indigo-600 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-800">Reviewing Board State</p>
                  <p className="text-[10px] text-slate-400 font-medium animate-pulse">
                    {loadingStep === 0 && "Parsing active task status distribution..."}
                    {loadingStep === 1 && "Analyzing assignees and workload balance index..."}
                    {loadingStep >= 2 && "Consulting Gemini 3.5-flash model..."}
                  </p>
                </div>
              </div>
            ) : aiReport ? (
              <div className="space-y-2 whitespace-pre-wrap font-sans">
                {aiReport}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-3 text-slate-400">
                <Sparkles size={32} className="text-slate-300 mb-2 animate-bounce" />
                <p className="font-semibold">Heuristic analysis ready</p>
                <p className="text-[10px] text-slate-400">Click the button below to parse board metrics.</p>
              </div>
            )}
          </div>

          {/* Trigger Button */}
          <button
            onClick={runAiAnalysis}
            disabled={isLoading}
            className="w-full py-2 px-4 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 font-semibold text-sm rounded-md flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Sparkles size={14} className="text-amber-400" />
            {isLoading ? "Running Heuristics..." : "Analyze Board with AI"}
          </button>
        </div>
      </div>
    </div>
  );
}
