import React, { useState } from "react";
import { Task, Member } from "../types";
import { 
  Sparkles, TrendingUp, Award, ClipboardCheck, Users, 
  BarChart2, FileDown, RefreshCw, Star, ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PerformanceViewProps {
  tasks: Task[];
  members: Member[];
}

export default function PerformanceView({ tasks, members }: PerformanceViewProps) {
  const [reportText, setReportText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Compute metrics
  const performanceList = members.map(m => {
    const total = tasks.filter(t => t.assigneeId === m.id).length;
    const completed = tasks.filter(t => t.assigneeId === m.id && t.status === "done").length;
    const active = total - completed;
    const ratio = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Overall score combines base efficiency with completion ratio
    const overallScore = Math.round((m.efficiency * 0.6) + (ratio * 0.4));

    return {
      ...m,
      total,
      completed,
      active,
      ratio,
      overallScore
    };
  }).sort((a, b) => b.overallScore - a.overallScore);

  // Trigger AI Report
  const generateAiReport = async () => {
    setIsGenerating(true);
    setReportText("");

    try {
      const response = await fetch("/api/ai/performance-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      setReportText(data.report || "No evaluation could be synthesized.");
    } catch (err) {
      console.error(err);
      setReportText("### ⚠️ API Operational Error\nUnable to reach server-side Gemini module. Verify your project structure is building cleanly.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="performance-view" className="flex flex-col gap-6 w-full h-full">
      {/* View Title */}
      <div>
        <h2 className="text-3xl font-bold font-headline-lg text-slate-900 tracking-tight">Team Performance</h2>
        <p className="text-sm text-slate-500 mt-1">Live sprint velocity auditing, individual efficiency quotas, and automated operational write-ups.</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Team Leaderboard & Efficiency Index */}
        <div className="lg:col-span-2 space-y-6">
          {/* Leaders Board */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award size={18} className="text-slate-600 animate-pulse" />
              Sprint Efficiency Leaderboard
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Colleague</th>
                    <th className="pb-3">Completed / Total</th>
                    <th className="pb-3">Base Quota</th>
                    <th className="pb-3">Completion Velocity</th>
                    <th className="pb-3 pr-2 text-right">Performance Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {performanceList.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* Member Info */}
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            <img src={m.avatarUrl} alt={m.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-100" />
                            {idx === 0 && (
                              <div className="absolute -top-1 -right-1 bg-yellow-400 text-white p-0.5 rounded-full" title="Top Contributor">
                                <Star size={8} fill="currentColor" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{m.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{m.role}</p>
                          </div>
                        </div>
                      </td>

                      {/* Completed / Total Ratio */}
                      <td className="py-3.5 text-slate-600 font-medium font-mono">
                        {m.completed} / {m.total} tasks
                      </td>

                      {/* Efficiency */}
                      <td className="py-3.5 text-slate-500 font-mono font-bold">
                        {m.efficiency}%
                      </td>

                      {/* Progress visual bar */}
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5 max-w-[120px]">
                          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-50">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${m.ratio}%` }}></div>
                          </div>
                          <span className="font-bold text-slate-700 font-mono text-[10px]">{m.ratio}%</span>
                        </div>
                      </td>

                      {/* Performance Score */}
                      <td className="py-3.5 text-right pr-2 font-mono font-bold text-slate-900 text-sm">
                        <span className={`px-2 py-1 rounded-md ${
                          m.overallScore >= 90 
                            ? "bg-indigo-50 text-indigo-700" 
                            : m.overallScore >= 80 
                              ? "bg-blue-50 text-blue-700" 
                              : "bg-slate-50 text-slate-600"
                        }`}>
                          {m.overallScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Core Insights card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Stat Box 1 */}
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Sprint Velocity</span>
                <ArrowUpRight size={16} className="text-emerald-500" />
              </div>
              <p className="text-xl font-bold text-slate-900">
                {performanceList[0]?.name || "None"}
              </p>
              <p className="text-[10px] text-slate-400">
                Holding the premier score of **{performanceList[0]?.overallScore || 0}** this cycle.
              </p>
            </div>

            {/* Stat Box 2 */}
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Team Efficiency Average</span>
                <Users size={16} className="text-slate-400" />
              </div>
              <p className="text-xl font-bold text-slate-900">
                {Math.round(members.reduce((acc, m) => acc + m.efficiency, 0) / members.length)}%
              </p>
              <p className="text-[10px] text-slate-400">
                Maintained team base workload efficiency target successfully.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: AI Performance Writer */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col h-full">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm tracking-tight uppercase">
              <Sparkles size={16} className="text-indigo-600 animate-pulse" />
              Executive Review Writer
            </h3>
            <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
              Review Board
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Run real-time operations write-ups evaluating collective velocity, strength matrices, and growth opportunities.
          </p>

          {/* Report output terminal */}
          <div className="flex-1 min-h-[290px] max-h-[380px] overflow-y-auto border border-slate-100 bg-slate-50/50 rounded-lg p-4 mb-4 text-xs leading-relaxed text-slate-700">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800">Synthesizing Executive Audits...</p>
                  <p className="text-[10px] text-slate-400 animate-pulse">Running resource strength heuristics and structural recommendations...</p>
                </div>
              </div>
            ) : reportText ? (
              <div className="space-y-2 whitespace-pre-wrap font-sans">
                {reportText}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-3 text-slate-400">
                <Star size={32} className="text-slate-300 mb-2 animate-bounce" />
                <p className="font-semibold">Review file empty</p>
                <p className="text-[10px] text-slate-400">Click compile below to invoke Gemini 3.5-flash.</p>
              </div>
            )}
          </div>

          {/* Compile trigger */}
          <button
            onClick={generateAiReport}
            disabled={isGenerating}
            className="w-full py-2.5 px-4 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 font-semibold text-sm rounded-md flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
            {isGenerating ? "Compiling Report..." : "Generate Performance Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
