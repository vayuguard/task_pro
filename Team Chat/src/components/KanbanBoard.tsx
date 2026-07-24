import React, { useState } from "react";
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  CheckSquare, 
  Calendar, 
  AlertCircle, 
  FolderPlus, 
  Maximize2,
  Trash2,
  X
} from "lucide-react";
import { Task } from "../types";

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateTaskStatus: (taskId: string, newStatus: any) => void;
  onAddTask: (title: string, description: string, priority: any, assigneeName: string, status: any) => void;
  onNavigateToTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function KanbanBoard({ 
  tasks, 
  onUpdateTaskStatus, 
  onAddTask, 
  onNavigateToTask,
  onDeleteTask
}: KanbanBoardProps) {
  const [showAddFormColumn, setShowAddFormColumn] = useState<string | null>(null);
  
  // Quick Add Form field states
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>("medium");
  const [newAssignee, setNewAssignee] = useState("Sarah Chen");

  const columns = [
    { id: "todo", title: "To Do", bg: "bg-slate-100/80 border-slate-200" },
    { id: "inprogress", title: "In Progress", bg: "bg-sky-50/50 border-sky-100" },
    { id: "review", title: "Under Review", bg: "bg-amber-50/40 border-amber-100" },
    { id: "done", title: "Completed", bg: "bg-emerald-50/30 border-emerald-100" }
  ] as const;

  const handleOpenAddForm = (colId: string) => {
    setShowAddFormColumn(colId);
    setNewTitle("");
    setNewDesc("");
    setNewPriority("medium");
    setNewAssignee("Sarah Chen");
  };

  const handleFormSubmit = (e: React.FormEvent, colId: string) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(newTitle, newDesc, newPriority, newAssignee, colId);
    setShowAddFormColumn(null);
  };

  const getPriorityColor = (prio: string) => {
    switch (prio) {
      case "high": return "bg-rose-50 text-rose-700 border-rose-200";
      case "medium": return "bg-amber-50 text-amber-700 border-amber-200";
      default: return "bg-sky-50 text-sky-700 border-sky-200";
    }
  };

  const statusFlow = ["todo", "inprogress", "review", "done"];

  const handleMoveCard = (taskId: string, currentStatus: string, direction: 'left' | 'right') => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (direction === 'right' && currentIndex < statusFlow.length - 1) {
      nextIndex += 1;
    } else if (direction === 'left' && currentIndex > 0) {
      nextIndex -= 1;
    }

    if (nextIndex !== currentIndex) {
      onUpdateTaskStatus(taskId, statusFlow[nextIndex]);
    }
  };

  return (
    <div id="kanban-board-view" className="flex-1 flex flex-col p-8 bg-[#F8FAFC] h-full overflow-hidden font-sans">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Kanban Workspace</h2>
          <p className="text-sm text-slate-500 mt-1">Deploy, assign, and transition tasks dynamically through delivery pipelines</p>
        </div>
      </div>

      {/* Main columns grid container */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-5 overflow-x-auto pb-4 h-full items-start">
        {columns.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.id);
          const isAdding = showAddFormColumn === col.id;

          return (
            <div 
              id={`kanban-column-${col.id}`}
              key={col.id} 
              className={`flex flex-col max-h-full rounded-xl border p-4 shadow-sm h-full ${col.bg}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">{col.title}</span>
                  <span className="text-xs font-semibold text-slate-400 bg-white border px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>

                <button 
                  id={`btn-col-add-${col.id}`}
                  onClick={() => handleOpenAddForm(col.id)}
                  className="p-1 text-slate-500 hover:text-indigo-600 rounded-md hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer"
                  title="Add Task to Column"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Column Cards Feed */}
              <div className="flex-1 overflow-y-auto space-y-3.5 hide-scrollbar pr-1 pb-4">
                {/* Inline Quick Add form */}
                {isAdding && (
                  <form 
                    onSubmit={(e) => handleFormSubmit(e, col.id)}
                    className="p-4 bg-white border border-slate-300 rounded-xl shadow-md space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                      <span className="text-xs font-bold text-slate-700">Quick Task Deploy</span>
                      <button 
                        type="button" 
                        onClick={() => setShowAddFormColumn(null)} 
                        className="text-slate-400 hover:text-black cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <input 
                        id="new-task-title-input"
                        type="text" 
                        placeholder="Task Title..." 
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
                      />
                      <textarea 
                        placeholder="Description..." 
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-slate-400 focus:bg-white text-slate-800"
                        rows={2}
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Priority</label>
                          <select 
                            value={newPriority}
                            onChange={(e: any) => setNewPriority(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-slate-400 mt-1"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Assignee</label>
                          <select 
                            value={newAssignee}
                            onChange={(e) => setNewAssignee(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-slate-400 mt-1"
                          >
                            <option value="Sarah Chen">Sarah Chen</option>
                            <option value="Alex Rivers">Alex Rivers</option>
                            <option value="David Miller">David Miller</option>
                            <option value="User">User (You)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button 
                      id="btn-quick-task-deploy"
                      type="submit" 
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded-lg text-xs cursor-pointer shadow-sm mt-1"
                    >
                      Deploy Task
                    </button>
                  </form>
                )}

                {/* List Cards */}
                {columnTasks.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                    Empty Queue
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    // Calculate completed subtasks
                    const subCount = task.subtasks.length;
                    const completedSubCount = task.subtasks.filter((s) => s.completed).length;
                    const subPercent = subCount > 0 ? Math.round((completedSubCount / subCount) * 100) : 0;

                    return (
                      <div 
                        id={`kanban-card-${task.id}`}
                        key={task.id}
                        className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-slate-350 transition-all group relative flex flex-col justify-between"
                      >
                        {/* Upper indicators */}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                            
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                id={`btn-delete-${task.id}`}
                                onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-50 cursor-pointer"
                                title="Delete task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                id={`btn-details-${task.id}`}
                                onClick={() => onNavigateToTask(task.id)}
                                className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-50 cursor-pointer"
                                title="Maximize Inspector"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h3 
                            onClick={() => onNavigateToTask(task.id)}
                            className="text-xs font-bold text-slate-800 cursor-pointer group-hover:text-indigo-600 transition-colors leading-snug"
                          >
                            {task.title}
                          </h3>
                          <p className="text-[10px] text-slate-400 mt-1 leading-normal line-clamp-2">{task.description}</p>
                          
                          {/* Subtask checklist progress meter */}
                          {subCount > 0 && (
                            <div className="mt-3">
                              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 mb-1">
                                <span className="flex items-center gap-1">
                                  <CheckSquare className="w-3 h-3" />
                                  {completedSubCount}/{subCount} Subtasks
                                </span>
                                <span>{subPercent}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                <div className="bg-slate-400 h-full rounded-full" style={{ width: `${subPercent}%` }}></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer details + Arrows navigation block */}
                        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200">
                              <img className="w-full h-full object-cover" src={task.assignee.avatar} alt="assignee" referrerPolicy="no-referrer" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 truncate max-w-20">{task.assignee.name}</span>
                          </div>

                          {/* Arrows panel to shift cards */}
                          <div className="flex items-center gap-1 border border-slate-100 rounded bg-slate-50/50 p-0.5">
                            <button
                              id={`btn-move-left-${task.id}`}
                              onClick={() => handleMoveCard(task.id, col.id, "left")}
                              disabled={col.id === "todo"}
                              className="p-1 hover:bg-white text-slate-400 hover:text-indigo-600 rounded disabled:opacity-30 disabled:hover:text-slate-400 transition-all cursor-pointer"
                              title="Move Left"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`btn-move-right-${task.id}`}
                              onClick={() => handleMoveCard(task.id, col.id, "right")}
                              disabled={col.id === "done"}
                              className="p-1 hover:bg-white text-slate-400 hover:text-indigo-600 rounded disabled:opacity-30 disabled:hover:text-slate-400 transition-all cursor-pointer"
                              title="Move Right"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
