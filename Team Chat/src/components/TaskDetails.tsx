import React, { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  Plus, 
  Trash2, 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  Clock, 
  File, 
  Users, 
  SlidersHorizontal,
  ChevronDown,
  Paperclip
} from "lucide-react";
import { Task, Subtask, TaskComment } from "../types";

interface TaskDetailsProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskDetails({
  tasks,
  selectedTaskId,
  onSelectTask,
  onUpdateTask,
  onDeleteTask
}: TaskDetailsProps) {
  // If no task selected, select the first task as default
  const task = tasks.find(t => t.id === selectedTaskId) || tasks[0];

  const [newSubtask, setNewSubtask] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [taskTime, setTaskTime] = useState(0);

  // Sync state with active task
  useEffect(() => {
    if (task) {
      setTaskTime(task.timeSpent || 0);
      setIsTimerRunning(false);
    }
  }, [task?.id]);

  // Handle task time counting stopwatch
  useEffect(() => {
    let timerInterval: any = null;
    if (isTimerRunning && task) {
      timerInterval = setInterval(() => {
        setTaskTime(prev => {
          const next = prev + 1;
          // Sync with parent state periodically or when paused
          onUpdateTask(task.id, { timeSpent: next });
          return next;
        });
      }, 1000);
    } else {
      clearInterval(timerInterval);
    }
    return () => clearInterval(timerInterval);
  }, [isTimerRunning, task?.id]);

  if (!task) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] p-8 text-slate-400">
        <Clock className="w-12 h-12 text-slate-300 mb-2 animate-spin" />
        <p className="text-sm font-medium">Initializing corporate database... Please deploy a task first.</p>
      </div>
    );
  }

  // Format elapsed time
  const formatTaskTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600).toString().padStart(2, "0");
    const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, "0");
    const secs = (totalSecs % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const handleToggleSubtask = (subId: string, completed: boolean) => {
    const updatedSubs = task.subtasks.map(sub => 
      sub.id === subId ? { ...sub, completed } : sub
    );
    onUpdateTask(task.id, { subtasks: updatedSubs });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;

    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      text: newSubtask,
      completed: false
    };

    onUpdateTask(task.id, { subtasks: [...task.subtasks, newSub] });
    setNewSubtask("");
  };

  const handleDeleteSubtask = (subId: string) => {
    const updatedSubs = task.subtasks.filter(sub => sub.id !== subId);
    onUpdateTask(task.id, { subtasks: updatedSubs });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: TaskComment = {
      id: `c-${Date.now()}`,
      author: "User",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC094eM06sW5W0zl9Qc6ZEH3Mc66wfumLvkjiUFBlVKnQV8ct9IbJuXYpYWRoYuhkaJgLHqCUxVi7GdNb5y3fQ4lbXPPTALfvX3euW1KhZlyultm0Ma-HDtYs-5iVEbdJxZuBAoElJB3JEFe1MiWLxB2HHT-Lm2DVIn_1KIRO9ekTLFIKtjnNG8uVTtxKLHJlQDzJRM9fXYJCZ9eIdJCl_JdMCOyxLcpA16UBAiDObFQckmyGXezstzbHwZAXPNuXXVMzDralR_hJqa",
      text: commentText,
      timestamp: "Just now"
    };

    onUpdateTask(task.id, { comments: [...task.comments, newComment] });
    setCommentText("");
  };

  return (
    <div id="task-details-view" className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC] font-sans h-full">
      {/* Upper header action bar with dropdown */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 flex-shrink-0 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-5 h-5 text-slate-500" />
            <select
              id="task-inspector-select"
              value={task.id}
              onChange={(e) => onSelectTask(e.target.value)}
              className="bg-white border border-slate-250 hover:border-slate-400 font-bold text-base text-slate-800 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-slate-400 max-w-sm"
            >
              {tasks.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">Toggle task selection to inspect files, subtasks, and logs</p>
        </div>

        <button
          id="btn-delete-inspected"
          onClick={() => {
            if (confirm("Are you sure you want to delete this task?")) {
              onDeleteTask(task.id);
            }
          }}
          className="text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-250 bg-rose-50 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
        >
          Delete Task Record
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Properties and Checklists */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            {/* Properties Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-b border-slate-100 pb-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Work Status</label>
                <select
                  id="select-status-inspector"
                  value={task.status}
                  onChange={(e) => onUpdateTask(task.id, { status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 mt-1 focus:bg-white focus:ring-1 focus:ring-slate-400 font-medium"
                >
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="review">Under Review</option>
                  <option value="done">Completed</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Priority Rating</label>
                <select
                  id="select-priority-inspector"
                  value={task.priority}
                  onChange={(e) => onUpdateTask(task.id, { priority: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 mt-1 focus:bg-white focus:ring-1 focus:ring-slate-400 font-medium"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Assignee</label>
                <select
                  id="select-assignee-inspector"
                  value={task.assignee.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const avatarsMap: Record<string, string> = {
                      "Sarah Chen": "https://lh3.googleusercontent.com/aida-public/AB6AXuCBn_a936c4V2fw_LZlU-So4eUga12Eu-kSiEOP7T3dBL6toBiNIiQhsYlPga2xy6b0h-Q5yFX0dB8gugjuSVUqOGf_jvZIBhlZ6ecCgbDrXQtXO2WzhNSvQls4GwBzlXmursud96odF3gszXCOF0j4M3TzOQ8zAXMJhWJp3vF7XJ5v3UY3C8xXuOnCSCxymULpv3j64EaxfBxfyEGtqr3lCMyIzf7xLo36PrWitw19uvKTIZbag086UcHzI3SPIH87RIFB2Zq2ofFx",
                      "Alex Rivers": "https://lh3.googleusercontent.com/aida-public/AB6AXuBlkP6S61HDnanPNbAvqmcVUm38u9wh4DmKCq5YymooHJKnJBFruprlJSdSUnSlCNNc7Jg5z2cPddSCtfNOK_kUDnuDQhxSVuZX4Jsd9EdEfqpQKi6ajVUPS7brHFb-shUGlYjDoVNrzYUa_svi5NY_TavTzNMTupXoenXDUPpaX6dhgAsre7sZoGbB603ziJReZeptO_U4clqfVmd8rLN4e38shLBMnj2CE7vrH7Po1xuQwK7qgEmXVTa9sm2Vxs8qL6OzEfK64npc",
                      "David Miller": "https://lh3.googleusercontent.com/aida-public/AB6AXuAmmzscXXNoFV78sRKoANk0xATK3-DoSTKorkoz4S1QwNfTt3gCiFrZxn3BZyVVJiLdgBvzNrQmd5DujjIBg-98y8diX7WqCbi6LDjCLpk5VfguzoIRmwfVQMxnWE9aDBBVimgeJ9fVB3o5DMS2v8P-qjjbiC3oO_wnLA81xXoT6zcA4KbycCa6FfH14_OAkihP6ln-KprxYwARFGYuPI87Im5a8FQCk9Ice-X2EGHlDtQsp_IWK61R2UrfXufCzmqsunL0zwSd1Y8S",
                      "User": "https://lh3.googleusercontent.com/aida-public/AB6AXuC094eM06sW5W0zl9Qc6ZEH3Mc66wfumLvkjiUFBlVKnQV8ct9IbJuXYpYWRoYuhkaJgLHqCUxVi7GdNb5y3fQ4lbXPPTALfvX3euW1KhZlyultm0Ma-HDtYs-5iVEbdJxZuBAoElJB3JEFe1MiWLxB2HHT-Lm2DVIn_1KIRO9ekTLFIKtjnNG8uVTtxKLHJlQDzJRM9fXYJCZ9eIdJCl_JdMCOyxLcpA16UBAiDObFQckmyGXezstzbHwZAXPNuXXVMzDralR_hJqa"
                    };
                    onUpdateTask(task.id, {
                      assignee: {
                        name,
                        avatar: avatarsMap[name] || avatarsMap["User"]
                      }
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 mt-1 focus:bg-white focus:ring-1 focus:ring-slate-400 font-medium"
                >
                  <option value="Sarah Chen">Sarah Chen</option>
                  <option value="Alex Rivers">Alex Rivers</option>
                  <option value="David Miller">David Miller</option>
                  <option value="User">User (You)</option>
                </select>
              </div>
            </div>

            {/* Description editing Block */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Task Description</label>
              <textarea
                value={task.description}
                onChange={(e) => onUpdateTask(task.id, { description: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-slate-400 rounded-lg p-3 text-xs leading-normal text-slate-800 font-sans"
                rows={3}
              />
            </div>
          </div>

          {/* Subtask Manager panel */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-semibold mb-2">
              <CheckSquare className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm">Subtask Deliverables List</h3>
            </div>

            {/* Create new subtask inline */}
            <form onSubmit={handleAddSubtask} className="flex gap-2 mb-4">
              <input
                id="new-subtask-input"
                type="text"
                placeholder="Log a new subtask action..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
              />
              <button
                id="btn-add-subtask"
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4.5 h-4.5" />
                Add
              </button>
            </form>

            <div className="divide-y divide-slate-100">
              {task.subtasks.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400">No subtasks cataloged. Add one above!</p>
              ) : (
                task.subtasks.map(sub => (
                  <div key={sub.id} className="py-2.5 flex items-center justify-between group">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-sans text-slate-700">
                      <input
                        type="checkbox"
                        checked={sub.completed}
                        onChange={(e) => handleToggleSubtask(sub.id, e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                      <span className={sub.completed ? "line-through text-slate-400" : "font-medium"}>
                        {sub.text}
                      </span>
                    </label>
                    <button
                      id={`btn-delete-sub-${sub.id}`}
                      onClick={() => handleDeleteSubtask(sub.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer transition-opacity"
                      title="Remove subtask"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Comment Stream */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-semibold mb-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm">Technical Comment Stream</h3>
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                id="new-comment-input"
                type="text"
                placeholder="Log a progress updates comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
              />
              <button
                id="btn-add-comment"
                type="submit"
                className="bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer"
              >
                Log
              </button>
            </form>

            <div className="space-y-4 pt-2">
              {task.comments.length === 0 ? (
                <p className="text-center py-4 text-xs text-slate-400">No telemetry log updates yet.</p>
              ) : (
                task.comments.map(c => (
                  <div key={c.id} className="flex items-start gap-3 text-xs leading-normal">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                      <img className="w-full h-full object-cover" src={c.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuC094eM06sW5W0zl9Qc6ZEH3Mc66wfumLvkjiUFBlVKnQV8ct9IbJuXYpYWRoYuhkaJgLHqCUxVi7GdNb5y3fQ4lbXPPTALfvX3euW1KhZlyultm0Ma-HDtYs-5iVEbdJxZuBAoElJB3JEFe1MiWLxB2HHT-Lm2DVIn_1KIRO9ekTLFIKtjnNG8uVTtxKLHJlQDzJRM9fXYJCZ9eIdJCl_JdMCOyxLcpA16UBAiDObFQckmyGXezstzbHwZAXPNuXXVMzDralR_hJqa"} alt={c.author} referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-lg p-3 border border-slate-150">
                      <div className="flex items-center justify-between mb-1.5 font-bold text-slate-800">
                        <span>{c.author}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{c.timestamp}</span>
                      </div>
                      <p className="text-slate-600 font-sans">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Time Spent & Attachments */}
        <div className="space-y-6">
          {/* Time spent clock stopwatch */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center flex flex-col justify-center items-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mb-3 animate-pulse">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm mb-1">Time Spent Tracker</h3>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Stopwatch Log</p>
            
            <p className="text-3xl font-mono font-bold text-slate-850 my-4">
              {formatTaskTimer(taskTime)}
            </p>

            <button
              id="btn-toggle-task-timer"
              onClick={() => setIsTimerRunning(p => !p)}
              className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all ${
                isTimerRunning 
                  ? "bg-amber-500 hover:bg-amber-600 text-white" 
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  Pause Timer
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Start Timer
                </>
              )}
            </button>
          </div>

          {/* Document Attachment manager */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-semibold mb-2">
              <Paperclip className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm">Shared Attachments</h3>
            </div>

            <p className="text-xs text-slate-400 leading-normal">
              Reference resources and Figma specifications logs associated with this release task.
            </p>

            <div className="space-y-2.5">
              {[
                { name: "Alpha_Dashboard_Final.pdf", size: "4.2 MB", type: "PDF" },
                { name: "Figma_Directory_V2.fig", size: "128 KB", type: "Figma Link" }
              ].map((f, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-150 rounded-lg flex items-center justify-between hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <File className="w-4.5 h-4.5 text-slate-400" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-700 truncate">{f.name}</p>
                      <p className="text-[10px] text-slate-400">{f.size} · {f.type}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-indigo-500 font-bold hover:underline cursor-pointer">View</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
