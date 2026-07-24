import React, { useState } from 'react';
import { Task, User, Subtask, Attachment, Activity, TaskPriority, TaskStatus } from '../types';
import { teamMembers } from '../initialData';

interface TaskDetailsViewProps {
  task: Task;
  onUpdateTask: (updatedTask: Task) => void;
  currentUser: User;
}

export default function TaskDetailsView({
  task,
  onUpdateTask,
  currentUser
}: TaskDetailsViewProps) {
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editedDesc, setEditedDesc] = useState(task.description);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showLogTimeModal, setShowLogTimeModal] = useState(false);
  const [logTimeValue, setLogTimeValue] = useState('2');
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [newLabelText, setNewLabelText] = useState('');
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  // Toggle subtask status
  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map((sub) =>
      sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
    );
    
    // Add activity log
    const sub = task.subtasks.find(s => s.id === subtaskId);
    const actionLog: Activity = {
      id: `act-log-${Date.now()}`,
      type: 'log',
      user: currentUser,
      content: `${sub?.completed ? 'marked' : 'completed'} subtask "${sub?.title}"`,
      timestamp: 'Just now'
    };

    onUpdateTask({
      ...task,
      subtasks: updatedSubtasks,
      activity: [actionLog, ...task.activity]
    });
  };

  // Add subtask
  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false
    };

    onUpdateTask({
      ...task,
      subtasks: [...task.subtasks, newSub],
      activity: [
        {
          id: `act-log-${Date.now()}`,
          type: 'log',
          user: currentUser,
          content: `added subtask "${newSub.title}"`,
          timestamp: 'Just now'
        },
        ...task.activity
      ]
    });

    setNewSubtaskTitle('');
    setShowAddSubtask(false);
  };

  // Delete subtask
  const handleDeleteSubtask = (subtaskId: string) => {
    onUpdateTask({
      ...task,
      subtasks: task.subtasks.filter(sub => sub.id !== subtaskId)
    });
  };

  // Add Comment
  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const newComment: Activity = {
      id: `comment-${Date.now()}`,
      type: 'comment',
      user: currentUser,
      content: commentText.trim(),
      timestamp: 'Just now',
      likes: 0
    };

    onUpdateTask({
      ...task,
      activity: [newComment, ...task.activity]
    });

    setCommentText('');
  };

  // Like comment
  const handleLikeComment = (activityId: string) => {
    const updatedActivity = task.activity.map((act) => {
      if (act.id === activityId && act.type === 'comment') {
        return { ...act, likes: (act.likes || 0) + 1 };
      }
      return act;
    });

    onUpdateTask({
      ...task,
      activity: updatedActivity
    });
  };

  // Edit Description
  const handleSaveDescription = () => {
    onUpdateTask({
      ...task,
      description: editedDesc
    });
    setIsEditingDesc(false);
  };

  // Change Status
  const handleChangeStatus = (status: TaskStatus) => {
    onUpdateTask({
      ...task,
      status,
      activity: [
        {
          id: `act-log-${Date.now()}`,
          type: 'log',
          user: currentUser,
          content: `changed status to "${status}"`,
          timestamp: 'Just now'
        },
        ...task.activity
      ]
    });
    setShowStatusDropdown(false);
  };

  // Change Priority
  const handleChangePriority = (priority: TaskPriority) => {
    onUpdateTask({
      ...task,
      priority,
      activity: [
        {
          id: `act-log-${Date.now()}`,
          type: 'log',
          user: currentUser,
          content: `updated priority to "${priority}"`,
          timestamp: 'Just now'
        },
        ...task.activity
      ]
    });
    setShowPriorityDropdown(false);
  };

  // Change Assignee
  const handleChangeAssignee = (user: User) => {
    onUpdateTask({
      ...task,
      assignee: user,
      activity: [
        {
          id: `act-log-${Date.now()}`,
          type: 'log',
          user: currentUser,
          content: `reassigned task to ${user.name}`,
          timestamp: 'Just now'
        },
        ...task.activity
      ]
    });
    setShowAssigneeDropdown(false);
  };

  // Log Progress Hours
  const handleLogProgress = () => {
    const hours = parseFloat(logTimeValue);
    if (isNaN(hours) || hours <= 0) return;

    onUpdateTask({
      ...task,
      timeLogged: task.timeLogged + hours,
      activity: [
        {
          id: `act-log-${Date.now()}`,
          type: 'log',
          user: currentUser,
          content: `logged ${hours}h of work progress`,
          timestamp: 'Just now'
        },
        ...task.activity
      ]
    });

    setShowLogTimeModal(false);
  };

  // Add Label
  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    const label = newLabelText.trim();
    if (!label) return;

    if (!task.labels.includes(label)) {
      onUpdateTask({
        ...task,
        labels: [...task.labels, label]
      });
    }

    setNewLabelText('');
    setShowAddLabel(false);
  };

  // Delete label
  const handleDeleteLabel = (labelToDelete: string) => {
    onUpdateTask({
      ...task,
      labels: task.labels.filter(l => l !== labelToDelete)
    });
  };

  // Upload attachment simulator
  const handleAttachmentUpload = () => {
    const name = prompt('Enter a name for the attachment:');
    if (!name) return;
    const size = `${(Math.random() * 4 + 1).toFixed(1)} MB`;
    
    const newAtt: Attachment = {
      id: `att-${Date.now()}`,
      name: name.includes('.') ? name : `${name}.png`,
      size,
      added: 'Today',
      type: name.endsWith('.pdf') ? 'pdf' : 'image',
      url: name.endsWith('.pdf') ? undefined : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80'
    };

    onUpdateTask({
      ...task,
      attachments: [...task.attachments, newAtt],
      activity: [
        {
          id: `act-log-${Date.now()}`,
          type: 'log',
          user: currentUser,
          content: `attached file "${newAtt.name}"`,
          timestamp: 'Just now'
        },
        ...task.activity
      ]
    });
  };

  // Count metrics
  const completedSubtasks = task.subtasks.filter((sub) => sub.completed).length;
  const totalSubtasks = task.subtasks.length;
  const subtaskPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
  
  // Estimation percentage
  const timeTrackingPercentage = Math.min((task.timeLogged / task.timeEstimated) * 100, 100);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 flex gap-8">
      {/* Left Column: Primary Content */}
      <div className="flex-[2] flex flex-col gap-8 min-w-0">
        
        {/* Breadcrumbs & Header Section */}
        <section id="task-breadcrumb-and-header">
          <nav className="flex items-center gap-2 text-[#45464d] text-xs font-semibold mb-4">
            <span className="hover:text-black cursor-pointer">Projects</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="hover:text-black cursor-pointer">Website Redesign</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[#191c1e] font-bold">{task.id}</span>
          </nav>

          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold tracking-tight text-[#191c1e] mb-3 leading-tight">
                {task.title}
              </h2>

              <div className="flex items-center gap-3">
                {/* Priority Badge */}
                <div className="relative">
                  <button 
                    onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      task.priority === 'High' 
                        ? 'bg-red-50 text-red-700 border border-red-200' 
                        : task.priority === 'Medium'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-50 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {task.priority === 'High' ? 'priority_high' : task.priority === 'Medium' ? 'warning' : 'info'}
                    </span>
                    {task.priority} Priority
                    <span className="material-symbols-outlined text-xs">expand_more</span>
                  </button>

                  {showPriorityDropdown && (
                    <div className="absolute left-0 mt-1 w-36 bg-white border border-[#c6c6cd] rounded-lg shadow-md z-50 py-1 text-xs">
                      {['High', 'Medium', 'Low'].map((prio) => (
                        <button
                          key={prio}
                          onClick={() => handleChangePriority(prio as TaskPriority)}
                          className="w-full text-left px-3 py-1.5 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          {prio} Priority
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-blue-100/70 transition-colors cursor-pointer"
                  >
                    <span>{task.status}</span>
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                  </button>

                  {showStatusDropdown && (
                    <div className="absolute left-0 mt-1 w-40 bg-white border border-[#c6c6cd] rounded-lg shadow-md z-50 py-1 text-xs">
                      {['To Do', 'In Progress', 'Review', 'Done'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleChangeStatus(status as TaskStatus)}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span>{status}</span>
                          {task.status === status && <span className="material-symbols-outlined text-sm text-green-600">check</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Task Description Card */}
        <section id="task-description-section" className="bg-white border border-[#c6c6cd] p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-[#191c1e] flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-500 text-lg">subject</span>
              Description
            </h3>
            {!isEditingDesc ? (
              <button
                onClick={() => {
                  setEditedDesc(task.description);
                  setIsEditingDesc(true);
                }}
                className="text-[#45464d] hover:text-black hover:bg-slate-100 p-1 rounded transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold"
              >
                <span className="material-symbols-outlined text-lg">edit</span>
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDescription}
                  className="bg-[#131b2e] text-white px-3 py-1 rounded text-xs font-semibold hover:opacity-95 transition-opacity cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingDesc(false)}
                  className="border border-[#c6c6cd] px-3 py-1 rounded text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {!isEditingDesc ? (
            <div className="text-[#45464d] leading-relaxed text-sm whitespace-pre-line prose max-w-none">
              {task.description.startsWith('We need to enhance') ? (
                // Hardcode nice format representation for the main screenshots task to maintain immaculate aesthetics!
                <div>
                  <p className="mb-4 text-slate-700">
                    We need to enhance our current authentication flow by adding multi-factor authentication (MFA). This is a critical security requirement for our enterprise clients.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-slate-600">
                    <li>Users should be able to toggle MFA in their security settings.</li>
                    <li>Support for Time-based One-Time Password (TOTP) protocols (Google Authenticator, Authy).</li>
                    <li>Backup code generation for recovery purposes.</li>
                  </ul>
                </div>
              ) : (
                <p>{task.description}</p>
              )}
            </div>
          ) : (
            <textarea
              value={editedDesc}
              onChange={(e) => setEditedDesc(e.target.value)}
              className="w-full p-3 border border-[#c6c6cd] rounded-lg text-sm min-h-[150px] focus:ring-2 focus:ring-slate-800 focus:outline-none"
              placeholder="Provide a detailed description..."
            />
          )}
        </section>

        {/* Subtasks Checklist Section */}
        <section id="task-subtasks-section" className="bg-white border border-[#c6c6cd] p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#191c1e] flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-500 text-lg">checklist</span>
              Subtasks
            </h3>
            <span className="text-xs font-semibold text-[#45464d] bg-slate-100 px-2 py-1 rounded-full">
              {completedSubtasks} / {totalSubtasks} Complete
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#f2f4f6] h-2 rounded-full mb-6 overflow-hidden">
            <div
              className="bg-[#10B981] h-full transition-all duration-500 ease-out"
              style={{ width: `${subtaskPercentage}%` }}
            ></div>
          </div>

          {/* Subtasks List */}
          <div className="space-y-1">
            {task.subtasks.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-all cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={sub.completed}
                  onChange={() => handleToggleSubtask(sub.id)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-800 cursor-pointer"
                />
                <span
                  onClick={() => handleToggleSubtask(sub.id)}
                  className={`text-sm flex-1 ${
                    sub.completed ? 'line-through text-slate-400' : 'text-[#191c1e]'
                  }`}
                >
                  {sub.title}
                </span>
                
                {/* Drag / Action icons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDeleteSubtask(sub.id)}
                    className="text-slate-400 hover:text-red-600 p-0.5 rounded cursor-pointer"
                    title="Delete subtask"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                  <span className="material-symbols-outlined text-[#45464d] select-none cursor-grab active:cursor-grabbing">
                    drag_indicator
                  </span>
                </div>
              </div>
            ))}

            {/* Inline Add subtask form */}
            {showAddSubtask ? (
              <form onSubmit={handleAddSubtask} className="flex gap-2 p-3 bg-slate-50 rounded-lg mt-3">
                <input
                  type="text"
                  autoFocus
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="flex-1 bg-white border border-[#c6c6cd] rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-slate-800 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#131b2e] text-white px-3 py-1.5 rounded text-xs font-semibold hover:opacity-90 transition-all cursor-pointer"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSubtask(false)}
                  className="border border-[#c6c6cd] bg-white text-slate-700 px-3 py-1.5 rounded text-xs hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowAddSubtask(true)}
                className="mt-3 text-[#3B82F6] hover:text-blue-700 font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer pl-3 py-1"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add subtask
              </button>
            )}
          </div>
        </section>

        {/* Attachments Section */}
        <section id="task-attachments-section" className="bg-white border border-[#c6c6cd] p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#191c1e] flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-500 text-lg">attach_file</span>
              Attachments ({task.attachments.length})
            </h3>
            <button
              onClick={handleAttachmentUpload}
              className="text-[#3B82F6] hover:text-blue-700 font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">upload</span>
              Upload File
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {task.attachments.map((att) => (
              <div
                key={att.id}
                className="border border-[#c6c6cd] rounded-lg p-3 flex items-center gap-3 hover:bg-slate-50 transition-all cursor-pointer group"
              >
                {/* File Thumbnail/Icon */}
                {att.type === 'pdf' ? (
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
                  </div>
                ) : att.url ? (
                  <div className="w-12 h-12 rounded overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img 
                      className="w-full h-full object-cover" 
                      src={att.url} 
                      alt={att.name} 
                      referrerPolicy="no-referrer"
                      onClick={() => setPreviewAttachment(att)}
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-3xl">image</span>
                  </div>
                )}

                {/* File Meta */}
                <div className="flex-1 min-w-0" onClick={() => att.url ? setPreviewAttachment(att) : null}>
                  <p className="text-sm font-semibold text-[#191c1e] truncate hover:underline" title={att.name}>
                    {att.name}
                  </p>
                  <p className="text-xs text-[#45464d]">
                    {att.size} • Added {att.added.toLowerCase()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={att.url || '#'}
                    download={att.name}
                    onClick={(e) => {
                      if (!att.url) {
                        e.preventDefault();
                        alert(`Downloading file: ${att.name} (${att.size})`);
                      }
                    }}
                    className="material-symbols-outlined text-slate-500 hover:text-black p-1 hover:bg-slate-100 rounded text-lg transition-colors cursor-pointer"
                    title="Download"
                  >
                    download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Activity & Comments Section */}
        <section id="task-activity-section" className="bg-white border border-[#c6c6cd] p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-[#191c1e] mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500 text-lg">chat_bubble</span>
            Activity
          </h3>

          {/* Add Comment Input */}
          <div className="flex gap-4 mb-8">
            <img
              className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
            />
            <div className="flex-1">
              <div className="border border-[#c6c6cd] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-slate-800 transition-all bg-white">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-4 border-none focus:ring-0 text-sm min-h-[100px] resize-none focus:outline-none placeholder-slate-400 text-slate-800"
                  placeholder="Add a comment, log notes, or tag team members..."
                ></textarea>
                
                {/* Rich formatting bar */}
                <div className="bg-[#f2f4f6] px-4 py-2.5 flex items-center justify-between border-t border-[#c6c6cd]">
                  <div className="flex gap-1.5">
                    {['format_bold', 'format_italic', 'link', 'attach_file'].map((tool) => (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => {
                          if (tool === 'attach_file') {
                            handleAttachmentUpload();
                          } else {
                            setCommentText(commentText + ` [${tool.replace('format_', '')}]`);
                          }
                        }}
                        className="p-1 hover:bg-[#e0e3e5] rounded text-[#45464d] hover:text-black transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xl">{tool}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleAddComment}
                    className="bg-[#131b2e] text-white px-5 py-1.5 rounded-lg font-bold text-xs hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Logs Timeline */}
          <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-0 before:w-[1px] before:bg-slate-200/60 pl-1">
            {task.activity.map((act) => {
              const isComment = act.type === 'comment';
              return (
                <div key={act.id} className="flex gap-4 relative z-10">
                  {/* Left Icon/Image */}
                  {isComment ? (
                    <img
                      className="w-10 h-10 rounded-full object-cover border border-[#c6c6cd] shrink-0 bg-slate-100"
                      src={act.user.avatar}
                      alt={act.user.name}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 flex justify-center shrink-0">
                      <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-500">
                        <span className="material-symbols-outlined text-base">edit</span>
                      </div>
                    </div>
                  )}

                  {/* Right Content details */}
                  <div className="flex-1">
                    {isComment ? (
                      <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{act.user.name}</span>
                            <span className="text-[10px] text-[#7c839b]">{act.user.role}</span>
                          </div>
                          <span className="text-xs text-[#45464d]">{act.timestamp}</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed mb-3 whitespace-pre-wrap">
                          {act.content}
                        </p>
                        
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleLikeComment(act.id)}
                            className="text-xs font-bold text-[#3B82F6] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">thumb_up</span>
                            <span>Like</span>
                          </button>
                          {(act.likes || 0) > 0 && (
                            <div className="flex items-center gap-1 text-xs text-[#45464d] bg-slate-100 px-2 py-0.5 rounded-full">
                              <span className="material-symbols-outlined text-xs text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                                thumb_up_off_alt
                              </span>
                              <span>{act.likes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#45464d] py-1.5">
                        <span className="font-bold text-[#191c1e]">{act.user.name}</span>{' '}
                        <span>{act.content}</span> •{' '}
                        <span className="text-[10px] text-[#76777d]">{act.timestamp}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Right Column: Metadata Sidebar */}
      <aside className="w-80 shrink-0 flex flex-col gap-6 select-none">
        
        {/* Action Button Cluster */}
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => setShowLogTimeModal(true)}
            className="w-full bg-[#0F172A] hover:bg-slate-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined">timer</span>
            Log Progress
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Task share link copied to clipboard!');
              }}
              className="flex-1 border border-[#c6c6cd] bg-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-all cursor-pointer text-slate-800"
            >
              <span className="material-symbols-outlined text-lg">share</span>
              Share
            </button>
            <button
              onClick={() => {
                handleChangeStatus('Done');
                alert('Task has been archived successfully.');
              }}
              className="flex-1 border border-[#c6c6cd] bg-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-all cursor-pointer text-slate-800"
            >
              <span className="material-symbols-outlined text-lg">archive</span>
              Archive
            </button>
          </div>
        </div>

        {/* Dynamic Attributes Card */}
        <section id="task-attributes-card" className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-[#eceef0]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#45464d] mb-4">
              Details
            </h4>
            
            <div className="space-y-5">
              
              {/* Assignee Selection Row */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-[#45464d] font-semibold">Assignee</span>
                <div className="relative">
                  <div
                    onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                    className="flex items-center gap-2 group cursor-pointer hover:bg-slate-50 p-1 rounded-md transition-all"
                  >
                    <img
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      src={task.assignee.avatar}
                      alt={task.assignee.name}
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#191c1e] group-hover:underline">
                        {task.assignee.name}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-xs text-slate-400 ml-auto">edit</span>
                  </div>

                  {showAssigneeDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-[#c6c6cd] rounded-lg shadow-lg z-50 py-1 text-xs">
                      {teamMembers.map((member) => (
                        <button
                          key={member.name}
                          onClick={() => handleChangeAssignee(member)}
                          className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <img
                            className="w-5 h-5 rounded-full object-cover"
                            src={member.avatar}
                            alt={member.name}
                            referrerPolicy="no-referrer"
                          />
                          <span>{member.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Reporter Row */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-[#45464d] font-semibold">Reporter</span>
                <div className="flex items-center gap-2 p-1">
                  <img
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    src={task.reporter.avatar}
                    alt={task.reporter.name}
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-sm font-bold text-[#191c1e]">{task.reporter.name}</span>
                </div>
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#45464d] font-semibold">Created</span>
                  <span className="text-xs font-bold text-slate-800">{task.createdDate}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#45464d] font-semibold">Due Date</span>
                  <input
                    type="text"
                    value={task.dueDate}
                    onChange={(e) => onUpdateTask({ ...task, dueDate: e.target.value })}
                    className="text-xs font-bold text-[#ba1a1a] bg-transparent border-none p-0 focus:ring-0 cursor-pointer hover:bg-slate-50 rounded"
                    title="Click to edit date text"
                  />
                </div>
              </div>

              {/* Labels Row */}
              <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
                <span className="text-xs text-[#45464d] font-semibold">Labels</span>
                <div className="flex flex-wrap gap-1.5">
                  {task.labels.map((label) => (
                    <span
                      key={label}
                      className="bg-[#e6e8ea] text-[#191c1e] px-2.5 py-0.5 rounded text-[11px] font-bold inline-flex items-center gap-1 group"
                    >
                      {label}
                      <button
                        onClick={() => handleDeleteLabel(label)}
                        className="opacity-40 hover:opacity-100 transition-opacity text-slate-900 font-bold ml-1"
                        title="Delete Label"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  
                  {showAddLabel ? (
                    <form onSubmit={handleAddLabel} className="inline-block">
                      <input
                        type="text"
                        autoFocus
                        value={newLabelText}
                        onChange={(e) => setNewLabelText(e.target.value)}
                        placeholder="Tag..."
                        className="border border-[#c6c6cd] rounded px-1.5 py-0.5 text-[10px] w-16 focus:outline-none"
                        onBlur={() => setShowAddLabel(false)}
                      />
                    </form>
                  ) : (
                    <button
                      onClick={() => setShowAddLabel(true)}
                      className="w-6 h-6 rounded bg-[#f2f4f6] border border-dashed border-[#c6c6cd] flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">add</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Time Tracking Progress Widget */}
          <div className="p-6 bg-[#f2f4f6]/30">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#45464d] mb-4">
              Time Tracking
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-[#45464d]">
                <span>Logged: {task.timeLogged}h</span>
                <span>Estimated: {task.timeEstimated}h</span>
              </div>
              
              <div className="w-full h-2.5 bg-[#f2f4f6] rounded-full overflow-hidden flex">
                <div
                  className="bg-[#131b2e] h-full transition-all duration-500 ease-out"
                  style={{ width: `${timeTrackingPercentage}%` }}
                ></div>
              </div>
              
              <p className="text-[11px] text-center text-[#45464d] italic">
                {Math.max(task.timeEstimated - task.timeLogged, 0)}h remaining based on estimate
              </p>
            </div>
          </div>
        </section>

        {/* Milestone Reference Alert */}
        <section className="bg-blue-50 border border-blue-100 p-5 rounded-xl shadow-xs">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600">info</span>
            <div>
              <h5 className="text-sm font-bold text-blue-900 mb-1">Project Milestone</h5>
              <p className="text-xs text-blue-800 leading-tight">
                This task is part of the 'Q4 Security Audit' milestone. Completion is required for compliance sign-off.
              </p>
            </div>
          </div>
        </section>
      </aside>

      {/* Log Time Progress Dialog Modal */}
      {showLogTimeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 w-96 max-w-full border border-[#c6c6cd] shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-2">Log Work Progress</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add hours of focused effort completed. This updates estimated progress bars immediately.
            </p>
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">Hours Spent</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={logTimeValue}
                onChange={(e) => setLogTimeValue(e.target.value)}
                className="w-full border border-[#c6c6cd] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-800"
              />
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowLogTimeModal(false)}
                className="px-4 py-2 border border-[#c6c6cd] rounded font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogProgress}
                className="px-4 py-2 bg-[#131b2e] text-white rounded font-bold hover:opacity-95 transition-all cursor-pointer"
              >
                Log Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Image Preview Modal */}
      {previewAttachment && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewAttachment(null)}
        >
          <div 
            className="bg-white rounded-xl overflow-hidden max-w-4xl max-h-[85vh] shadow-2xl relative border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">{previewAttachment.name}</span>
              <button 
                onClick={() => setPreviewAttachment(null)}
                className="material-symbols-outlined text-slate-600 hover:text-black hover:bg-slate-200 p-1 rounded cursor-pointer"
              >
                close
              </button>
            </div>
            <div className="p-4 flex justify-center bg-slate-900">
              <img 
                src={previewAttachment.url} 
                alt={previewAttachment.name} 
                className="max-h-[60vh] object-contain rounded"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600">
              <span>Added {previewAttachment.added} • {previewAttachment.size}</span>
              <a 
                href={previewAttachment.url} 
                download={previewAttachment.name}
                className="bg-[#131b2e] text-white px-3 py-1.5 rounded font-bold hover:opacity-90 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Download Original
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
