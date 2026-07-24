import React, { useState } from "react";
import { Task, Member } from "../types";
import { 
  Plus, MoreHorizontal, Edit2, Share2, Filter, 
  Trash2, X, AlertTriangle, Clock, CheckCircle2, Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface KanbanBoardProps {
  tasks: Task[];
  members: Member[];
  onUpdateTask: (task: Task) => Promise<void>;
  onAddTask: (task: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onSelectTaskForDetails: (task: Task) => void;
}

export default function KanbanBoard({
  tasks,
  members,
  onUpdateTask,
  onAddTask,
  onDeleteTask,
  onSelectTaskForDetails
}: KanbanBoardProps) {
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPriority, setSelectedPriority] = useState<string>("All");
  const [selectedAssignee, setSelectedAssignee] = useState<string>("All");
  const [showFilters, setShowFilters] = useState(false);
  const [copied, setCopied] = useState(false);

  // Add Task Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [targetColumn, setTargetColumn] = useState<Task["status"]>("todo");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<Task["category"]>("Product");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("Medium");
  const [newAssignee, setNewAssignee] = useState(members[0]?.id || "alex-rivera");
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split("T")[0]);

  // Handle Share Click
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent, status: Task["status"]) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, status: Task["status"]) => {
    e.preventDefault();
    setDragOverColumn(null);
    const id = e.dataTransfer.getData("text/plain") || draggedTaskId;
    if (id) {
      const task = tasks.find(t => t.id === id);
      if (task && task.status !== status) {
        await onUpdateTask({ ...task, status });
      }
    }
    setDraggedTaskId(null);
  };

  const handleOpenAddModal = (status: Task["status"]) => {
    setTargetColumn(status);
    setNewTitle("");
    setNewDesc("");
    setNewCategory("Product");
    setNewPriority("Medium");
    setNewAssignee(members[0]?.id || "alex-rivera");
    setNewDueDate(new Date().toISOString().split("T")[0]);
    setIsAddOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await onAddTask({
      title: newTitle.trim(),
      description: newDesc.trim(),
      status: targetColumn,
      priority: newPriority,
      category: newCategory,
      assigneeId: newAssignee,
      dueDate: newDueDate
    });

    setIsAddOpen(false);
  };

  // Filter Logic
  const filteredTasks = tasks.filter(t => {
    const matchesCat = selectedCategory === "All" || t.category === selectedCategory;
    const matchesPri = selectedPriority === "All" || t.priority === selectedPriority;
    const matchesAss = selectedAssignee === "All" || t.assigneeId === selectedAssignee;
    return matchesCat && matchesPri && matchesAss;
  });

  const columns: { id: Task["status"]; label: string; colorClass: string; dotClass: string }[] = [
    { id: "todo", label: "To Do", colorClass: "bg-gray-100 text-gray-700", dotClass: "bg-slate-400" },
    { id: "in_progress", label: "In Progress", colorClass: "bg-blue-100 text-blue-700", dotClass: "bg-blue-500" },
    { id: "review", label: "Review", colorClass: "bg-amber-100 text-amber-800", dotClass: "bg-amber-500" },
    { id: "done", label: "Done", colorClass: "bg-green-100 text-green-700", dotClass: "bg-green-600" }
  ];

  // Helper for Category Styling
  const getCategoryColor = (cat: Task["category"]) => {
    switch (cat) {
      case "Product": return "bg-blue-50 text-blue-700 border-blue-100";
      case "Design": return "bg-purple-50 text-purple-700 border-purple-100";
      case "Dev": return "bg-green-50 text-green-700 border-green-100";
      case "Marketing": return "bg-amber-50 text-amber-700 border-amber-100";
      case "Ops": return "bg-slate-50 text-slate-700 border-slate-100";
      case "Success": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      default: return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  // Helper for Priority Styling
  const getPriorityColor = (pri: Task["priority"]) => {
    switch (pri) {
      case "High": return "bg-red-50 text-red-700 border-red-100 font-bold";
      case "Medium": return "bg-yellow-50 text-yellow-800 border-yellow-100";
      case "Low": return "bg-gray-100 text-gray-600 border-gray-200";
      default: return "bg-gray-50 text-gray-600";
    }
  };

  return (
    <div id="kanban-view" className="flex flex-col gap-6 w-full h-full">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-headline-lg text-slate-900 tracking-tight">Kanban Board</h2>
          <p className="text-sm text-slate-500 mt-1">Overseeing Enterprise-wide team progress and bottleneck management.</p>
        </div>

        {/* Board Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Avatar Pile */}
          <div className="flex -space-x-2 mr-2">
            {members.slice(0, 4).map((member) => (
              <img
                key={member.id}
                className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm"
                src={member.avatarUrl}
                alt={member.name}
              />
            ))}
            {members.length > 4 && (
              <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                +{members.length - 4}
              </div>
            )}
          </div>

          {/* Filters Toggle */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3.5 py-1.5 border border-slate-200 rounded-md text-sm font-medium transition-all shadow-sm ${
              showFilters || selectedCategory !== "All" || selectedPriority !== "All" || selectedAssignee !== "All"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Filter size={15} />
            Filters
          </button>

          {/* Share Board Button */}
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-3.5 py-1.5 border border-slate-200 bg-white rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm relative"
          >
            {copied ? <Check size={15} className="text-green-600" /> : <Share2 size={15} />}
            <span>{copied ? "Copied Link!" : "Share Board"}</span>
          </button>
        </div>
      </div>

      {/* Filter Options Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden"
          >
            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:ring-1 focus:ring-slate-900"
              >
                <option value="All">All Categories</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Dev">Dev</option>
                <option value="Marketing">Marketing</option>
                <option value="Ops">Ops</option>
                <option value="Success">Success</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:ring-1 focus:ring-slate-900"
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Assignee Filter */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Assignee</label>
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded px-2.5 py-1.5 bg-slate-50 focus:ring-1 focus:ring-slate-900"
              >
                <option value="All">All Assignees</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start w-full">
        {columns.map((column) => {
          const columnTasks = filteredTasks.filter(t => t.status === column.id);
          const isDoneCol = column.id === "done";

          return (
            <div 
              key={column.id} 
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`flex flex-col gap-4 p-2 rounded-xl transition-all duration-200 ${
                dragOverColumn === column.id 
                  ? "bg-slate-200/60 ring-2 ring-slate-400 ring-dashed" 
                  : "bg-transparent"
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${column.dotClass}`}></span>
                  <h3 className="font-semibold text-slate-800 text-sm tracking-wide uppercase">{column.label}</h3>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-[10px] font-bold">
                    {columnTasks.length}
                  </span>
                </div>
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                  <MoreHorizontal size={15} />
                </button>
              </div>

              {/* Task Cards Column */}
              <div className="flex flex-col gap-3 min-h-[400px]">
                <AnimatePresence mode="popLayout">
                  {columnTasks.map((task) => {
                    const assignee = members.find(m => m.id === task.assigneeId);

                    return (
                      <motion.div
                        key={task.id}
                        layoutId={task.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className={`bg-white border border-slate-200 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-slate-300 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.05)] relative group ${
                          isDoneCol ? "opacity-65 grayscale bg-slate-50" : ""
                        }`}
                      >
                        {/* Card Top Label & Edit Action */}
                        <div className="flex justify-between items-start mb-3">
                          <span className={`px-2 py-0.5 border text-[10px] font-bold uppercase rounded ${getCategoryColor(task.category)}`}>
                            {task.category}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => onSelectTaskForDetails(task)}
                              className="p-1 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded transition-colors"
                              title="Edit Task Details"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button 
                              onClick={() => onDeleteTask(task.id)}
                              className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                              title="Delete Task"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className={`text-slate-900 font-medium text-[15px] mb-4 leading-snug cursor-pointer ${
                          isDoneCol ? "line-through text-slate-500" : ""
                        }`}
                        onClick={() => onSelectTaskForDetails(task)}
                        >
                          {task.title}
                        </h4>

                        {/* Description Preview (truncated) */}
                        {task.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                            {task.description}
                          </p>
                        )}

                        {/* Card Bottom Meta */}
                        <div className="flex justify-between items-end pt-1">
                          <div className="flex items-center gap-2.5">
                            {assignee ? (
                              <img 
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-100" 
                                src={assignee.avatarUrl} 
                                alt={assignee.name} 
                                title={assignee.name}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-semibold uppercase">
                                Un
                              </div>
                            )}
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                                {isDoneCol ? "Completed" : "Due Date"}
                              </p>
                              <p className="text-xs font-mono font-medium text-slate-700">
                                {isDoneCol 
                                  ? (task.completedDate || task.dueDate) 
                                  : task.dueDate}
                              </p>
                            </div>
                          </div>
                          
                          {isDoneCol ? (
                            <span className="text-green-600 flex items-center" title="Task Completed">
                              <CheckCircle2 size={18} />
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 border text-[10px] font-bold uppercase rounded ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Add Task Dotted Button */}
                <button 
                  onClick={() => handleOpenAddModal(column.id)}
                  className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 transition-all group duration-150"
                >
                  <Plus size={15} className="group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-semibold">Add Task</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
                  Create Task (Column: <span className="capitalize">{targetColumn.replace("_", " ")}</span>)
                </h3>
                <button 
                  onClick={() => setIsAddOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Implement User Auth"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea
                    placeholder="Short description of technical goals..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={3}
                    className="w-full text-sm border border-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
                  />
                </div>

                {/* Grid Fields */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as Task["category"])}
                      className="w-full text-sm border border-slate-200 rounded px-3 py-2 bg-white focus:ring-1 focus:ring-slate-900"
                    >
                      <option value="Product">Product</option>
                      <option value="Design">Design</option>
                      <option value="Dev">Dev</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Ops">Ops</option>
                      <option value="Success">Success</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as Task["priority"])}
                      className="w-full text-sm border border-slate-200 rounded px-3 py-2 bg-white focus:ring-1 focus:ring-slate-900"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                {/* Assignee & Due Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Assignee</label>
                    <select
                      value={newAssignee}
                      onChange={(e) => setNewAssignee(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded px-3 py-2 bg-white focus:ring-1 focus:ring-slate-900"
                    >
                      {members.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Due Date</label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded px-3 py-2 focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded text-sm hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 text-white rounded text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    Save Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
