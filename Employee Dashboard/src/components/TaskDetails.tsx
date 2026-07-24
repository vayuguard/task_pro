import React, { useState } from 'react';
import { Task, SubTask, Comment, TaskStatus, TaskPriority } from '../types';
import { 
  Paperclip, 
  MessageSquare, 
  Calendar, 
  CheckSquare, 
  Square, 
  Plus, 
  Send, 
  FileText, 
  CornerDownRight, 
  Search,
  CheckCircle2,
  Bookmark
} from 'lucide-react';

interface TaskDetailsProps {
  tasks: Task[];
  selectedTask: Task | null;
  onSelectTask: (task: Task) => void;
  onUpdateTaskStatus: (id: string, status: TaskStatus) => void;
  onUpdateTaskPriority: (id: string, priority: TaskPriority) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onAddComment: (taskId: string, content: string) => void;
  onAddAttachment: (taskId: string, filename: string) => void;
  teamMembers: Array<{ name: string; avatar: string }>;
}

export default function TaskDetails({
  tasks,
  selectedTask,
  onSelectTask,
  onUpdateTaskStatus,
  onUpdateTaskPriority,
  onToggleSubtask,
  onAddSubtask,
  onAddComment,
  onAddAttachment,
  teamMembers
}: TaskDetailsProps) {
  const [taskSearch, setTaskSearch] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // Filter tasks in the sidebar list
  const filteredTasksList = tasks.filter(t => 
    t.title.toLowerCase().includes(taskSearch.toLowerCase()) || 
    t.project.toLowerCase().includes(taskSearch.toLowerCase())
  );

  const currentTask = selectedTask || tasks[0];

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim() && currentTask) {
      onAddSubtask(currentTask.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
    }
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCommentText.trim() && currentTask) {
      onAddComment(currentTask.id, newCommentText.trim());
      setNewCommentText('');
    }
  };

  const handleSimulatedAttachment = () => {
    const filename = prompt('Enter the name of the file to attach:', 'Architecture_Design_v2.pdf');
    if (filename && currentTask) {
      onAddAttachment(currentTask.id, filename);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm animate-fadeIn">
      
      {/* Sidebar List (Left pane) */}
      <div className="w-full lg:w-80 border-r border-slate-200 flex flex-col h-1/3 lg:h-full flex-shrink-0 bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search specs list..."
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100">
          {filteredTasksList.map((t) => {
            const isSelected = currentTask && currentTask.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTask(t)}
                className={`w-full text-left p-4 transition-colors cursor-pointer block ${
                  isSelected ? 'bg-white border-l-4 border-blue-500 shadow-sm' : 'hover:bg-white/80'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <h4 className={`text-xs font-bold leading-relaxed ${isSelected ? 'text-blue-600' : 'text-slate-700'}`}>
                    {t.title}
                  </h4>
                  <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    t.priority === 'urgent' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {t.priority}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">{t.project}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                  <span className="capitalize bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-semibold">{t.status.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>{t.subtasks.filter(s=>s.completed).length}/{t.subtasks.length} steps</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Inspector Details (Right pane) */}
      {currentTask ? (
        <div className="flex-1 flex flex-col h-2/3 lg:h-full overflow-hidden bg-white">
          
          {/* Header Toolbar */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{currentTask.project}</span>
              <h3 className="text-lg font-bold text-slate-800 mt-1">{currentTask.title}</h3>
            </div>
            
            {/* Direct Select Editors */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Select */}
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">Status</label>
                <select
                  value={currentTask.status}
                  onChange={(e) => onUpdateTaskStatus(currentTask.id, e.target.value as TaskStatus)}
                  className="bg-white border border-slate-200 text-xs font-bold rounded-lg px-2.5 py-1 text-slate-700 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Priority Select */}
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">Priority</label>
                <select
                  value={currentTask.priority}
                  onChange={(e) => onUpdateTaskPriority(currentTask.id, e.target.value as TaskPriority)}
                  className="bg-white border border-slate-200 text-xs font-bold rounded-lg px-2.5 py-1 text-slate-700 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Details Scroll Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            
            {/* Description card */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Bookmark size={12} />
                Technical Specifications
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {currentTask.description || 'No additional technical requirements defined for this task.'}
              </p>
            </div>

            {/* Subtasks checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircle2 size={12} />
                Execution Checklist ({currentTask.subtasks.filter(s=>s.completed).length}/{currentTask.subtasks.length} completed)
              </h4>
              
              <div className="space-y-1 bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                {currentTask.subtasks.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => onToggleSubtask(currentTask.id, st.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 text-left transition-colors cursor-pointer group"
                  >
                    {st.completed ? (
                      <CheckSquare size={16} className="text-blue-500 flex-shrink-0" />
                    ) : (
                      <Square size={16} className="text-slate-300 group-hover:text-slate-500 flex-shrink-0" />
                    )}
                    <span className={`text-xs ${st.completed ? 'line-through text-slate-400 font-medium' : 'text-slate-700 font-medium'}`}>
                      {st.title}
                    </span>
                  </button>
                ))}

                {/* Inline add subtask form */}
                <form onSubmit={handleAddSubtaskSubmit} className="flex gap-2 mt-2 pt-2 border-t border-slate-100">
                  <input 
                    type="text" 
                    placeholder="Add step to checkout checklist..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg px-3 text-xs flex items-center justify-center transition-all cursor-pointer"
                  >
                    Add Step
                  </button>
                </form>
              </div>
            </div>

            {/* Attachments Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Paperclip size={12} />
                  Shared Attachments ({currentTask.files} files)
                </h4>
                <button
                  onClick={handleSimulatedAttachment}
                  className="text-[10px] text-blue-500 hover:text-blue-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  + Link Asset File
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-3 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-700 truncate">Q3_System_Modernization_v1.pdf</p>
                    <span className="text-[9px] text-slate-400 block font-semibold">2.4 MB • Tech Specs</span>
                  </div>
                </div>
                
                {currentTask.files > 1 && (
                  <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-3 flex items-center gap-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-700 truncate">Core_UI_Tokens_Audit.json</p>
                      <span className="text-[9px] text-slate-400 block font-semibold">142 KB • Data Tokens</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Thread Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <MessageSquare size={12} />
                Activity Discussions ({currentTask.comments.length} comments)
              </h4>

              {/* Comments list */}
              <div className="space-y-4">
                {currentTask.comments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No discussions recorded. Type a review comment below.</p>
                ) : (
                  currentTask.comments.map((cmt) => (
                    <div key={cmt.id} className="flex gap-3 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                      <img 
                        src={cmt.avatar} 
                        alt={cmt.author} 
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 mt-0.5" 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xs font-bold text-slate-800">{cmt.author}</span>
                          <span className="text-[10px] text-slate-400">{cmt.timestamp}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold">{cmt.role}</p>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">{cmt.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add comment box */}
              <form onSubmit={handleAddCommentSubmit} className="flex gap-3 pt-2">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT1jtDA7el1WpSvRQpYrCb4gOoavKhjM8ckwZ5geOgJclzrsJ8MLETWnDpYogNDGdn42U4dL6HjC0945Fqvf61PkuVw0ZiVtTgrn2Gx5c6YPEkEeP7Bx_A93_YtNuuXYfEPUGskKYz_1OkiCMkLpoGaozUDBADf-1M4lS_mYxX0iU0JJwFrIF_6Zf6nYTXV5wnMU5GetDRf1ANE7oMqR-Wdhx-8LyagWiiJuXTUCHIns3R1M7Llq9-IFZmrBvu32tHEBRNNEqNODOa" 
                  alt="My Avatar" 
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 mt-1"
                />
                <div className="flex-1 relative">
                  <textarea 
                    placeholder="Ask a question, propose specs adjustments, or request code review..."
                    rows={2}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2.5 bottom-2.5 p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:scale-95 transition-all cursor-pointer"
                  >
                    <Send size={12} />
                  </button>
                </div>
              </form>

            </div>

          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400 italic text-sm">
          Select a task to view comprehensive technical details.
        </div>
      )}

    </div>
  );
}
