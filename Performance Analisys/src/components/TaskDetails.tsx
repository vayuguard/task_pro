import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  User, 
  Calendar, 
  Award, 
  FileText, 
  Paperclip,
  CheckCircle,
  Plus
} from 'lucide-react';
import { Task, Employee, Comment, TaskStatus, TaskPriority } from '../types';

interface TaskDetailsProps {
  selectedTask: Task | null;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  employees: Employee[];
  onClose: () => void;
}

export default function TaskDetails({ 
  selectedTask, 
  tasks, 
  setTasks, 
  employees, 
  onClose 
}: TaskDetailsProps) {
  const [newComment, setNewComment] = useState('');

  if (!selectedTask) {
    return (
      <div id="no-task-details" className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
        <FileText className="w-12 h-12 text-slate-300 mx-auto" />
        <h4 className="font-bold text-sm">No Task Selected</h4>
        <p className="text-xs max-w-sm">
          Please select a task from the Employee Dashboard, Kanban Board, or click on a quick link to inspect its properties and comment history.
        </p>
      </div>
    );
  }

  // Find actual current state of this task in our main array
  const task = tasks.find(t => t.id === selectedTask.id) || selectedTask;
  const currentAssignee = employees.find(e => e.id === task.assigneeId);

  const handleUpdateField = <K extends keyof Task>(field: K, value: Task[K]) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, [field]: value } : t));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const added: Comment = {
      id: `comment-${Date.now()}`,
      authorName: 'Sarah Jenkins', // Logged in profile context
      authorInitials: 'SJ',
      content: newComment,
      timestamp: 'Just now'
    };

    const updatedComments = [...task.comments, added];
    handleUpdateField('comments', updatedComments);
    setNewComment('');
  };

  return (
    <div id={`task-details-pane-${task.id}`} className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-64px)] h-full">
      {/* Title & Close Header */}
      <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">
              {task.id}
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase font-sans">
              {task.category}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-2 leading-snug">
            {task.title}
          </h3>
        </div>
        <button
          id="close-task-details-btn"
          onClick={onClose}
          className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Metadata Controls Grid */}
      <div id="task-metadata-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
        {/* Assignee Selection */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <User className="w-3.5 h-3.5" /> Assignee
          </label>
          <select
            id="details-assignee-select"
            value={task.assigneeId}
            onChange={(e) => handleUpdateField('assigneeId', e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 w-full outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
            ))}
          </select>
        </div>

        {/* Task Status */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Status Stage
          </label>
          <select
            id="details-status-select"
            value={task.status}
            onChange={(e) => handleUpdateField('status', e.target.value as TaskStatus)}
            className="text-xs bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 w-full outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">In Review</option>
            <option value="done">Completed</option>
          </select>
        </div>

        {/* Task Priority */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> Priority Rating
          </label>
          <select
            id="details-priority-select"
            value={task.priority}
            onChange={(e) => handleUpdateField('priority', e.target.value as TaskPriority)}
            className="text-xs bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 w-full outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Due Date & Points */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Points / Due Date
          </label>
          <div className="flex gap-2">
            <input
              id="details-points-input"
              type="number"
              value={task.points}
              onChange={(e) => handleUpdateField('points', parseInt(e.target.value) || 0)}
              className="text-xs bg-white border border-slate-200 rounded-lg py-1 w-14 text-center focus:ring-1 focus:ring-slate-900"
              title="Complexity points"
            />
            <input
              id="details-date-input"
              type="date"
              value={task.dueDate}
              onChange={(e) => handleUpdateField('dueDate', e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg py-1 px-2.5 flex-grow focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description</label>
        <textarea
          id="details-description-textarea"
          value={task.description}
          onChange={(e) => handleUpdateField('description', e.target.value)}
          rows={3}
          className="w-full text-xs p-3 border border-slate-200 rounded-xl bg-white focus:ring-1 focus:ring-slate-900 outline-none leading-relaxed"
        />
      </div>

      {/* Attachments panel */}
      <div className="space-y-2.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Paperclip className="w-3.5 h-3.5" /> Attachments
        </label>
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-[10px] font-semibold cursor-pointer">
            schema_v2_draft.sql (24 KB)
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-[10px] font-semibold cursor-pointer">
            performance_metrics_q2.pdf (1.2 MB)
          </span>
          <button 
            onClick={() => alert('Integrated browser upload prompt triggered.')}
            className="flex items-center gap-1.5 px-3 py-1 border border-dashed border-slate-300 hover:border-slate-500 hover:bg-slate-50 text-slate-500 rounded-full text-[10px] font-semibold cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Add file
          </button>
        </div>
      </div>

      {/* Comments section */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" /> Work Discussion ({task.comments.length})
        </label>

        {/* List of comments */}
        <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
          {task.comments.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic text-center py-4">
              No comments posted on this task yet. Start the conversation!
            </p>
          ) : (
            task.comments.map(c => (
              <div id={`comment-${c.id}`} key={c.id} className="flex gap-3 text-xs leading-normal">
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[9px] shadow-xs flex-shrink-0">
                  {c.authorInitials || 'SJ'}
                </div>
                <div className="flex-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800">{c.authorName}</span>
                    <span className="text-[9px] text-slate-400">{c.timestamp}</span>
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed">{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* New comment input */}
        <form id="add-comment-form" onSubmit={handleAddComment} className="flex gap-2">
          <input
            id="new-comment-input"
            type="text"
            placeholder="Type your message..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-slate-400 bg-slate-50 focus:bg-white"
          />
          <button
            id="new-comment-submit"
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
          >
            Reply
          </button>
        </form>
      </div>
    </div>
  );
}
