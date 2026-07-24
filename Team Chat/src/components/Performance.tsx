import React, { useState } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";
import { 
  TrendingUp, 
  Award, 
  Activity, 
  FileCheck, 
  Sparkles, 
  Loader2, 
  Download, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { Task } from "../types";

interface PerformanceProps {
  tasks: Task[];
}

export default function Performance({ tasks }: PerformanceProps) {
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const inProgress = tasks.filter(t => t.status === "inprogress").length;
  const review = tasks.filter(t => t.status === "review").length;
  const todo = tasks.filter(t => t.status === "todo").length;

  // Status chart data
  const statusData = [
    { name: "To Do", value: todo, color: "#94a3b8" },
    { name: "In Progress", value: inProgress, color: "#38bdf8" },
    { name: "Under Review", value: review, color: "#fbbf24" },
    { name: "Completed", value: completedTasks, color: "#10b981" }
  ].filter(d => d.value > 0);

  // Velocity data per user (tasks completed vs active)
  const users = ["Sarah Chen", "Alex Rivers", "David Miller", "User"];
  const velocityData = users.map(user => {
    const userTasks = tasks.filter(t => t.assignee.name === user);
    return {
      name: user === "User" ? "You" : user.split(" ")[0],
      Completed: userTasks.filter(t => t.status === "done").length,
      Active: userTasks.filter(t => t.status !== "done").length,
    };
  });

  // Call server API for Gemini Performance Review report
  const handleGenerateAiReport = async () => {
    setLoading(true);
    setAiReport(null);
    
    // Cycle loading messages for immersive, polished user experience
    const msgs = [
      "Analyzing sprint backlog metrics...",
      "Synthesizing team direct messages logs...",
      "Querying Gemini AI for executive appraisal summary...",
      "Assembling professional deliverables deck..."
    ];
    
    let index = 0;
    setLoadingMsg(msgs[0]);
    const interval = setInterval(() => {
      index = (index + 1) % msgs.length;
      setLoadingMsg(msgs[index]);
    }, 1200);

    try {
      const response = await fetch("/api/gemini/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: "User" })
      });
      const data = await response.json();
      setAiReport(data.report || "Empty report returned.");
    } catch (err) {
      console.error("Error generating AI report:", err);
      setAiReport("⚠️ Failed to generate AI report. Please verify backend connection and API keys.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  // Simple, elegant Markdown text-to-HTML parser to avoid peer-dependency issues
  const parseMarkdownToHtml = (markdown: string) => {
    const lines = markdown.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith("###")) {
        return <h4 key={idx} className="text-sm font-bold text-slate-800 mt-4 mb-2 flex items-center gap-1.5 border-b pb-1">{trimmed.replace("###", "").trim()}</h4>;
      }
      if (trimmed.startsWith("####")) {
        return <h5 key={idx} className="text-xs font-bold text-indigo-700 mt-3 mb-1.5 uppercase tracking-wider">{trimmed.replace("####", "").trim()}</h5>;
      }
      if (trimmed.startsWith("##")) {
        return <h3 key={idx} className="text-base font-extrabold text-slate-900 mt-5 mb-2.5">{trimmed.replace("##", "").trim()}</h3>;
      }
      
      // Bullets
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const text = trimmed.slice(1).trim();
        // Parse bold highlights inside bullets
        return (
          <li key={idx} className="text-xs text-slate-600 list-disc ml-5 mb-1.5">
            {renderFormattedText(text)}
          </li>
        );
      }

      // Normal paragraphs
      if (trimmed === "") return <div key={idx} className="h-2" />;
      
      return <p key={idx} className="text-xs text-slate-600 leading-normal mb-2">{renderFormattedText(trimmed)}</p>;
    });
  };

  const renderFormattedText = (text: string) => {
    // Basic bold parsing **text**
    const parts = text.split("**");
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-bold text-slate-800 bg-slate-50 px-1 rounded">{part}</strong>;
      }
      // Simple code parsing `code`
      const subParts = part.split("`");
      return subParts.map((sub, j) => {
        if (j % 2 === 1) {
          return <code key={j} className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-semibold">{sub}</code>;
        }
        return sub;
      });
    });
  };

  return (
    <div id="performance-view" className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC] space-y-8 font-sans h-full">
      {/* Title */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Performance Analytics</h2>
          <p className="text-sm text-slate-500 mt-1">Velocity statistics, delivery metrics, and AI assessment decks</p>
        </div>
      </div>

      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-white border border-slate-200 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sprint Velocity</p>
            <p className="text-xl font-bold text-slate-800">1.8 Days / Task</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Punctuality Score</p>
            <p className="text-xl font-bold text-emerald-600">94.2%</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Deliveries</p>
            <p className="text-xl font-bold text-slate-800">{completedTasks} Sprint Tasks</p>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-96">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-800 text-sm">Backlog Status Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Ratio of active, completed, and under-review deliverables</p>
          </div>

          <div className="flex-1 relative flex items-center justify-center min-h-[220px]">
            {statusData.length === 0 ? (
              <div className="text-slate-400 text-xs">No active task telemetry found.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Tasks`, "Count"]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* User Completion Velocity Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-96">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-800 text-sm">Team Accomplishment Indexes</h3>
            <p className="text-xs text-slate-400 mt-0.5">Tasks delivered vs active backlog items</p>
          </div>

          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="Active" fill="#64748b" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Performance Review generator panel */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-semibold text-slate-850 text-sm flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-violet-600 fill-violet-100 animate-pulse" />
              Executive AI Appraisal Terminal
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Let Gemini analyze current telemetry and compile a detailed corporate evaluation report</p>
          </div>

          <button
            id="btn-generate-ai-appraisal"
            onClick={handleGenerateAiReport}
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4.5 py-2.5 rounded-lg flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                Processing Review...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                Compile Sprint Evaluation
              </>
            )}
          </button>
        </div>

        {/* Loading placeholder container */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-xs gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            <span className="font-semibold animate-pulse text-violet-850">{loadingMsg}</span>
          </div>
        )}

        {/* AI report output panel */}
        {aiReport && (
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-3 relative shadow-inner">
            <div className="absolute top-4 right-4 flex gap-2">
              <button 
                onClick={() => {
                  alert("Downloading report markdown file...");
                }}
                className="p-1.5 bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-700 cursor-pointer flex items-center gap-1 text-[10px]"
                title="Download report"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
            
            <div className="prose prose-slate max-w-none text-slate-700 font-sans">
              {parseMarkdownToHtml(aiReport)}
            </div>
          </div>
        )}

        {!loading && !aiReport && (
          <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5 text-slate-350" />
            No report loaded in current terminal. Click "Compile Sprint Evaluation" above to invoke generative AI metrics.
          </div>
        )}
      </div>
    </div>
  );
}
