import React, { useState, useEffect } from "react";
import { Task, Member } from "../types";
import { 
  Search, Plus, Sparkles, Save, Trash2, Calendar, 
  AlertTriangle, Check, RefreshCw, FileText, List 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TaskDetailsProps {
  tasks: Task[];
  members: Member[];
  onUpdateTask: (task: Task) => Promise<void>;
  onAddTask: (task: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  selectedTaskFromBoard?: Task | null;
}

export default function TaskDetails({
  tasks,
  members,
  onUpdateTask,
  onAddTask,
  onDeleteTask,
  selectedTaskFromBoard
}: TaskDetailsProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Form Editor Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Task["status"]>("todo");
  const [priority, setPriority] = useState<Task["priority"]>("Medium");
  const [category, setCategory] = useState<Task["category"]>("Product");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [isPolishing, setIsPolishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync selection
  useEffect(() => {
    if (selectedTaskFromBoard) {
      setSelectedTaskId(selectedTaskFromBoard.id);
    } else if (tasks.length > 0 && !selectedTaskId) {
      setSelectedTaskId(tasks[0].id);
    }
  }, [selectedTaskFromBoard, tasks]);

  // Load selected task into form
  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  
  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title);
      setDescription(selectedTask.description || "");
      setStatus(selectedTask.status);
      setPriority(selectedTask.priority);
      setCategory(selectedTask.category);
      setAssigneeId(selectedTask.assigneeId);
      setDueDate(selectedTask.dueDate);
    }
  }, [selectedTaskId, selectedTask]);

  // Handle Save
  const handleSave = async () => {
    if (!selectedTask || !title.trim()) return;
    setIsSaving(true);
    await onUpdateTask({
      ...selectedTask,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      category,
      assigneeId,
      dueDate
    });
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!selectedTaskId) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (confirmDelete) {
      await onDeleteTask(selectedTaskId);
      setSelectedTaskId(tasks[0]?.id || "");
    }
  };

  // Handle Create New Empty Task
  const handleCreateNew = async () => {
    const defaultTask: Partial<Task> = {
      title: "New Epic Epic Deliverable",
      description: "Simple backlog goals summary...",
      status: "todo",
      priority: "Medium",
      category: "Product",
      assigneeId: members[0]?.id || "alex-rivera",
      dueDate: new Date().toISOString().split("T")[0]
    };
    
    // Simulate addTask
    await onAddTask(defaultTask);
  };

  // Handle AI Description Polish (Gemini Spec Builder)
  const handleAiPolish = async () => {
    if (!title.trim()) return;
    setIsPolishing(true);

    try {
      const response = await fetch("/api/ai/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          currentDesc: description.trim(),
          category,
          priority
        })
      });
      const data = await response.json();
      if (data.polished) {
        setDescription(data.polished);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPolishing(false);
    }
  };

  // Filter lists
  const filteredTasks = tasks.filter(t => {
    const matchesQuery = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (t.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || t.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div id="task-details-view" className="flex flex-col gap-6 w-full h-full">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-3xl font-bold font-headline-lg text-slate-900 tracking-tight">Task Specifications</h2>
          <p className="text-sm text-slate-500 mt-1">Detailed scope definitions, acceptance parameters, and AI-assisted specification expansions.</p>
        </div>

        {/* Create New Task Trigger */}
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 py-2 px-4 bg-slate-900 text-white rounded-lg font-semibold text-sm hover:bg-slate-800 shadow-sm transition-all shrink-0"
        >
          <Plus size={16} />
          Create Epic Task
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 items-start">
        {/* Left Master List */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-[520px]">
          {/* Header Search Box */}
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search specs backlog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Quick Status Pill Filters */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["All", "todo", "in_progress", "review", "done"].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full transition-all ${
                    statusFilter === st 
                      ? "bg-slate-900 text-white" 
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {st === "in_progress" ? "In Progress" : st}
                </button>
              ))}
            </div>
          </div>

          {/* Master List Scroll Pane */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <List size={28} className="mx-auto mb-2 text-slate-300 animate-pulse" />
                <p className="font-semibold text-xs">No matching specifications</p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`p-3.5 cursor-pointer transition-colors text-left border-l-3 ${
                    selectedTaskId === task.id
                      ? "bg-slate-50/80 border-slate-900"
                      : "bg-transparent border-transparent hover:bg-slate-50/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                      {task.category}
                    </span>
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                      task.status === "done" 
                        ? "bg-green-50 text-green-700" 
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 mt-1.5 truncate">
                    {task.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {task.description || "No specification drafted."}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Active Editor Form */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTask ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
              {/* Task Header Field */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="text-slate-600" size={18} />
                  <span className="text-xs font-bold font-mono text-slate-400">ID: {selectedTask.id}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    className="p-2 border border-slate-200 hover:border-red-100 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Specification"
                  >
                    <Trash2 size={15} />
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 py-2 px-4 bg-slate-900 text-white rounded-lg font-semibold text-xs hover:bg-slate-800 transition-colors shadow-xs"
                  >
                    {saveSuccess ? (
                      <>
                        <Check size={14} className="text-green-400" />
                        <span>Changes Saved!</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Specification Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-base font-semibold border-b border-slate-100 py-1.5 focus:outline-none focus:border-slate-900 text-slate-800"
                />
              </div>

              {/* Multi-Column Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50/50 border border-slate-100 rounded-xl p-4">
                {/* Status Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">State Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Task["status"])}
                    className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Task["priority"])}
                    className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Task["category"])}
                    className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Dev">Dev</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Ops">Ops</option>
                    <option value="Success">Success</option>
                  </select>
                </div>

                {/* Assignee Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assignee</label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 bg-white focus:ring-1 focus:ring-slate-900"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                {/* Due Date Input */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Milestone</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded px-2 py-1 focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Description & AI Enhancer Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Specification Scope & Acceptance Criteria
                  </label>

                  {/* AI Spec Enhancer Trigger */}
                  <button
                    onClick={handleAiPolish}
                    disabled={isPolishing}
                    className="flex items-center gap-1.5 py-1 px-2.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 disabled:opacity-50 text-[10px] font-bold uppercase rounded transition-all cursor-pointer shadow-xs"
                  >
                    {isPolishing ? (
                      <>
                        <RefreshCw size={11} className="animate-spin" />
                        <span>Polishing Technical Specs...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={11} className="text-indigo-600 animate-pulse" />
                        <span>AI Polish Specification</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Polishing Indicator Overlay */}
                <div className="relative">
                  <AnimatePresence>
                    {isPolishing && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center text-center space-y-2 z-10"
                      >
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-indigo-800">Gemini Specifications Writer Operating...</p>
                        <p className="text-[10px] text-slate-400 animate-pulse">Expanding functional acceptance checkmarks...</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={10}
                    placeholder="Provide deep details on objectives, engineering guidelines, and concrete checklist milestones..."
                    className="w-full text-xs border border-slate-200 rounded px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Render Preview Header */}
              {description && (
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Live Document Visualizer Rendering
                  </h5>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 max-h-[160px] overflow-y-auto text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-sans">
                    {description}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl py-24 text-center text-slate-400">
              <FileText size={32} className="mx-auto mb-2 text-slate-300 animate-bounce" />
              <p className="font-semibold">No specification active</p>
              <p className="text-xs text-slate-400">Select a specification from the master list index to inspect technical details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
