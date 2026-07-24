import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckSquare, 
  Square, 
  Calendar, 
  Paperclip, 
  MessageSquare, 
  TrendingUp, 
  Star, 
  Clock, 
  Edit3, 
  ArrowRight,
  ListTodo,
  CheckCircle,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { Task, TeamUpdate, TeamMember } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface EmployeeDashboardProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  updates: TeamUpdate[];
  onToggleTaskComplete: (id: string) => void;
  onSelectTask: (task: Task) => void;
  onLogProgressClick: () => void;
  onTabChange: (tab: string) => void;
}

export default function EmployeeDashboard({
  tasks,
  teamMembers,
  updates,
  onToggleTaskComplete,
  onSelectTask,
  onLogProgressClick,
  onTabChange
}: EmployeeDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'high' | 'in_progress'>('all');

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filter === 'high') return task.priority === 'urgent' && task.status !== 'completed';
    if (filter === 'in_progress') return task.status === 'in_progress';
    return true; // 'all'
  });

  // Count high-priority incomplete tasks
  const highPriorityIncompleteCount = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length;

  // Render weekly performance static chart data or dynamic data
  const performanceChartData = [
    { name: 'Mon', completed: 3 },
    { name: 'Tue', completed: 5 },
    { name: 'Wed', completed: 4 },
    { name: 'Thu', completed: 6 },
    { name: 'Fri', completed: 8, current: true },
    { name: 'Sat', completed: 2 },
    { name: 'Sun', completed: 1 },
  ];

  // Calculate efficiency & completed
  const alexProfile = teamMembers.find(m => m.name === 'Alex Rivera') || teamMembers[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Greeting Banner & Log Progress */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Good Morning, Alex
          </h2>
          <p className="text-slate-500 text-sm md:text-base mt-1 font-medium">
            You have <span className="text-rose-600 font-bold">{highPriorityIncompleteCount}</span> high-priority tasks requiring attention today.
          </p>
        </div>
        <button 
          onClick={onLogProgressClick}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-98 shadow-md shadow-slate-900/10 cursor-pointer"
        >
          <Edit3 size={15} />
          Log Progress
        </button>
      </section>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Weekly Performance Bar Chart Card */}
        <div className="md:col-span-2 bg-white border border-slate-200 p-6 rounded-xl flex flex-col justify-between relative group shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Weekly Performance
            </p>
            <h3 className="text-xl font-bold text-slate-800">
              {alexProfile.tasksCompleted} Tasks Completed
            </h3>
            <p className="text-emerald-600 text-xs font-semibold flex items-center gap-1 mt-1.5">
              <TrendingUp size={14} />
              12% increase from last week
            </p>
          </div>

          {/* Styled Bar Chart */}
          <div className="mt-4 h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Tooltip 
                  cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} 
                  contentStyle={{ background: '#0F172A', border: 'none', borderRadius: '6px' }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 'bold', fontSize: '10px' }}
                  itemStyle={{ color: '#FFF', fontSize: '11px', padding: '0px' }}
                />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }} 
                />
                <Bar dataKey="completed" radius={[2, 2, 0, 0]}>
                  {performanceChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.current ? '#0F172A' : '#E2E8F0'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Efficiency Metric */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
          <div className="relative flex items-center justify-center w-16 h-16 mb-2">
            {/* Minimal SVG circular chart */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="#F1F5F9" strokeWidth="4" fill="transparent" />
              <circle cx="32" cy="32" r="28" stroke="#0F172A" strokeWidth="4" fill="transparent"
                strokeDasharray={175}
                strokeDashoffset={175 - (175 * alexProfile.efficiency) / 100}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-bold text-slate-800">{alexProfile.efficiency}%</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Efficiency
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            Optimal Range
          </p>
        </div>

        {/* Peer Kudos Metric */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-3">
            <Star size={24} fill="currentColor" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Peer Kudos
          </p>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
            {alexProfile.kudos}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 italic">
            Top 5% Contributor
          </p>
        </div>

      </section>

      {/* Main Content Layout: Tasks + Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Tasks Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ListTodo size={18} className="text-slate-700" />
              My Tasks
            </h3>
            
            {/* Filter buttons */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg self-start">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('high')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  filter === 'high'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                High Priority
              </button>
              <button
                onClick={() => setFilter('in_progress')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  filter === 'in_progress'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                In Progress
              </button>
            </div>
          </div>

          {/* Task list container */}
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
                <CheckCircle size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">No tasks found matching this filter.</p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isCompleted = task.status === 'completed';
                return (
                  <motion.div
                    key={task.id}
                    whileHover={{ x: 3 }}
                    className="group bg-white border border-slate-200 p-5 rounded-xl transition-all hover:shadow-md flex gap-4 cursor-pointer"
                  >
                    {/* Checkbox wrapper with line effect */}
                    <div className="flex flex-col items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleTaskComplete(task.id);
                        }}
                        className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center cursor-pointer ${
                          isCompleted
                            ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                            : 'border-slate-300 hover:border-slate-800 text-transparent hover:text-slate-400'
                        }`}
                      >
                        <CheckCircle size={14} className={isCompleted ? 'stroke-[3px]' : ''} />
                      </button>
                      <div className="w-0.5 flex-1 bg-slate-100 mt-2 group-last:hidden"></div>
                    </div>

                    {/* Task details wrapper */}
                    <div 
                      className="flex-1"
                      onClick={() => onSelectTask(task)}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className={`text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                            {task.title}
                          </h4>
                          <p className="text-slate-400 text-xs mt-1 font-medium">{task.project}</p>
                        </div>

                        {/* Priority Badge */}
                        <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-full tracking-wider ${
                          task.priority === 'urgent'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : task.priority === 'medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Metadata row */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-slate-500 text-xs font-semibold">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Calendar size={14} className="text-slate-400" />
                          <span>
                            {task.dueDate === '2026-07-20' ? 'Due Today' : `Due ${task.dueDate}`}
                            {task.dueTime ? `, ${task.dueTime}` : ''}
                          </span>
                        </div>
                        
                        {task.files > 0 && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Paperclip size={14} />
                            <span>{task.files} Files</span>
                          </div>
                        )}

                        {task.commentsCount > 0 && (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <MessageSquare size={14} />
                            <span>{task.commentsCount} Comments</span>
                          </div>
                        )}

                        {/* Assignees visual pile */}
                        <div className="flex -space-x-1.5 ml-auto">
                          {task.assignees.slice(0, 3).map((name, i) => {
                            const member = teamMembers.find(m => m.name === name);
                            return (
                              <img
                                key={name}
                                src={member?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT1jtDA7el1WpSvRQpYrCb4gOoavKhjM8ckwZ5geOgJclzrsJ8MLETWnDpYogNDGdn42U4dL6HjC0945Fqvf61PkuVw0ZiVtTgrn2Gx5c6YPEkEeP7Bx_A93_YtNuuXYfEPUGskKYz_1OkiCMkLpoGaozUDBADf-1M4lS_mYxX0iU0JJwFrIF_6Zf6nYTXV5wnMU5GetDRf1ANE7oMqR-Wdhx-8LyagWiiJuXTUCHIns3R1M7Llq9-IFZmrBvu32tHEBRNNEqNODOa'}
                                alt={name}
                                title={name}
                                referrerPolicy="no-referrer"
                                className="w-5.5 h-5.5 rounded-full border-2 border-white object-cover"
                              />
                            );
                          })}
                          {task.assignees.length > 3 && (
                            <div className="w-5.5 h-5.5 rounded-full border-2 border-white bg-slate-900 text-[9px] text-white flex items-center justify-center font-bold">
                              +{task.assignees.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Deadlines + Updates Feed */}
        <div className="space-y-6">
          
          {/* Critical Deadlines Card */}
          <div className="bg-[#0F172A] text-white p-6 rounded-xl relative overflow-hidden shadow-lg shadow-slate-950/20">
            <h3 className="text-lg font-bold mb-4 relative z-10 flex items-center gap-2">
              <Clock size={16} className="text-blue-400" />
              Critical Deadlines
            </h3>
            
            <div className="space-y-5 relative z-10">
              <div className="flex gap-3.5 items-center">
                <div className="flex flex-col items-center justify-center bg-white/10 rounded-lg w-12 h-12 flex-shrink-0 border border-white/5">
                  <span className="text-[10px] uppercase font-extrabold text-blue-300">Jul</span>
                  <span className="text-base font-black leading-tight">20</span>
                </div>
                <div>
                  <h5 className="text-sm font-bold leading-tight">Security Audit Submission</h5>
                  <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
                    2 hours remaining
                  </p>
                </div>
              </div>

              <div className="flex gap-3.5 items-center">
                <div className="flex flex-col items-center justify-center bg-white/10 rounded-lg w-12 h-12 flex-shrink-0 border border-white/5">
                  <span className="text-[10px] uppercase font-extrabold text-blue-300">Jul</span>
                  <span className="text-base font-black leading-tight">23</span>
                </div>
                <div>
                  <h5 className="text-sm font-bold leading-tight">Client Feedback Integration</h5>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-semibold">
                    3 days remaining
                  </p>
                </div>
              </div>
            </div>

            {/* Atmospheric icon effect */}
            <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
              <Clock size={180} />
            </div>
          </div>

          {/* Team Updates activity feed */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-800">
                Team Updates
              </h3>
              <button 
                onClick={() => onTabChange('chat')}
                className="text-xs text-blue-500 hover:text-blue-600 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                Join Chat <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-4">
              {updates.map((update) => (
                <div key={update.id} className="flex items-start gap-3 hover:bg-slate-50 p-1.5 rounded transition-colors">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden border border-slate-100">
                    <img 
                      className="w-full h-full object-cover" 
                      src={update.avatar} 
                      alt={update.author} 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 leading-normal">
                      <span className="font-bold text-slate-800">{update.author}</span> {update.text}
                    </p>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-1">{update.time}</span>
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
