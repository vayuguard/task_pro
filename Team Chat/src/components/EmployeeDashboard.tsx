import React, { useState, useEffect } from "react";
import { 
  Play, 
  Square, 
  CheckSquare, 
  SquareDot, 
  Clock, 
  CheckCircle, 
  Trophy, 
  ChevronRight, 
  User, 
  Calendar, 
  Zap, 
  Briefcase 
} from "lucide-react";
import { Task } from "../types";

interface EmployeeDashboardProps {
  tasks: Task[];
  onUpdateTaskStatus: (taskId: string, newStatus: any) => void;
  onAddTask: (title: string, description: string, priority: any, assigneeName: string, status: any) => void;
}

export default function EmployeeDashboard({ tasks, onUpdateTaskStatus, onAddTask }: EmployeeDashboardProps) {
  // Check-in check-out stopwatch state
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [personalTodo, setPersonalTodo] = useState<string>("");

  // Filter tasks assigned to User
  const myTasks = tasks.filter(t => t.assignee.name === "User");
  const myCompletedTasks = myTasks.filter(t => t.status === "done").length;
  const myPendingTasks = myTasks.filter(t => t.status !== "done").length;

  useEffect(() => {
    let interval: any = null;
    if (isCheckedIn) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn]);

  // Format stopwatch time
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600).toString().padStart(2, "0");
    const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, "0");
    const secs = (totalSecs % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const handleToggleCheckIn = () => {
    setIsCheckedIn(!isCheckedIn);
  };

  const handleAddPersonalTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalTodo.trim()) return;
    
    // Add task to general Kanban state as todo
    onAddTask(
      personalTodo,
      "Self-logged personal deliverable",
      "medium",
      "User",
      "todo"
    );
    setPersonalTodo("");
  };

  // Achievements
  const achievements = [
    { title: "First Flight", desc: "Onboarded and established environment", unlocked: true },
    { title: "Enterprise Communicator", desc: "Sent a message in project-alpha", unlocked: true },
    { title: "Sprint Champion", desc: "Complete 3 tasks in a single cycle", unlocked: myCompletedTasks >= 3 },
    { title: "SecOps Auditor", desc: "Completed code-level security checklist", unlocked: tasks.some(t => t.id === "task-4" && t.status === "done") }
  ];

  return (
    <div id="employee-dashboard-view" className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC] space-y-8 font-sans">
      {/* Employee Welcome banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            Corporate Space
          </div>
          <h2 className="text-xl font-bold mt-1 tracking-tight">Good Day, Operator!</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-md">
            Welcome to your executive dashboard. Work logs, check-ins, and pending deliverables are synced with corporate servers in real-time.
          </p>
        </div>

        {/* Stopwatch Check In / Check Out Card */}
        <div className="flex items-center gap-4 bg-slate-850 p-4 rounded-xl border border-slate-800 w-full md:w-auto">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Time Card Clock</p>
            <p className="text-xl font-mono font-bold text-white mt-1">
              {formatTime(elapsedSeconds)}
            </p>
          </div>
          <button
            id="btn-toggle-clock"
            onClick={handleToggleCheckIn}
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
              isCheckedIn 
                ? "bg-rose-600 hover:bg-rose-700 text-white" 
                : "bg-sky-400 hover:bg-sky-500 text-slate-950"
            }`}
          >
            {isCheckedIn ? (
              <>
                <Square className="w-3.5 h-3.5 fill-white" />
                Clock Out
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                Clock In
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main split row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: My Assigned Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">My Deliverables Queue</h3>
                <p className="text-xs text-slate-400 mt-0.5">Toggle checkboxes to dynamically update Team Momentum progress</p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                {myCompletedTasks} / {myTasks.length} Done
              </span>
            </div>

            {/* Form to log quick task */}
            <form onSubmit={handleAddPersonalTodo} className="mb-6 flex gap-2">
              <input 
                type="text"
                placeholder="Log a quick personal deliverable..."
                value={personalTodo}
                onChange={(e) => setPersonalTodo(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
              />
              <button 
                id="btn-add-quick-todo"
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Add
              </button>
            </form>

            {/* Tasks list */}
            <div className="space-y-3.5">
              {myTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No deliverables assigned to you yet. Use the quick add box to create one!
                </div>
              ) : (
                myTasks.map((task) => {
                  const isDone = task.status === "done";
                  return (
                    <div 
                      key={task.id}
                      className={`p-3.5 border rounded-lg flex items-center justify-between transition-all ${
                        isDone ? "bg-slate-50 border-slate-200 opacity-75" : "bg-white border-slate-200 hover:border-slate-350"
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <button
                          id={`btn-checkbox-${task.id}`}
                          onClick={() => onUpdateTaskStatus(task.id, isDone ? "inprogress" : "done")}
                          className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          <CheckCircle className={`w-5 h-5 ${isDone ? "text-indigo-600 fill-indigo-50" : "text-slate-300"}`} />
                        </button>
                        <div className="overflow-hidden">
                          <h4 className={`text-xs font-bold ${isDone ? "line-through text-slate-400" : "text-slate-800"}`}>
                            {task.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{task.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          task.priority === "high" 
                            ? "bg-rose-50 text-rose-700" 
                            : task.priority === "medium" 
                              ? "bg-amber-50 text-amber-700" 
                              : "bg-sky-50 text-sky-700"
                        }`}>
                          {task.priority}
                        </span>
                        
                        <span className="text-[10px] text-slate-400 font-mono">{task.dueDate}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Achievements & Rewards */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500 fill-amber-100" />
              <h3 className="font-semibold text-slate-800 text-sm">Achievements & Gamification</h3>
            </div>
            
            <p className="text-xs text-slate-400 mb-6">Unlock corporate awards and productivity badges as you complete tasks.</p>

            <div className="space-y-4">
              {achievements.map((ach, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 border rounded-lg flex items-center gap-3 transition-all ${
                    ach.unlocked ? "bg-amber-50/30 border-amber-200" : "bg-slate-50 border-slate-100 opacity-60"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    ach.unlocked ? "bg-amber-100 text-amber-600" : "bg-slate-200 text-slate-400"
                  }`}>
                    <Trophy className="w-4.5 h-4.5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className={`text-xs font-bold ${ach.unlocked ? "text-amber-900" : "text-slate-500"}`}>{ach.title}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
