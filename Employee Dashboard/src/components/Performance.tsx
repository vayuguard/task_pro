import { useState } from 'react';
import { TeamMember, ProgressLog } from '../types';
import { Award, Zap, TrendingUp, ShieldAlert, BarChart2, Star, Calendar } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LineChart, Line } from 'recharts';

interface PerformanceProps {
  teamMembers: TeamMember[];
  progressLogs: ProgressLog[];
}

export default function Performance({ teamMembers, progressLogs }: PerformanceProps) {
  // Sort team members by kudos for the leaderboard
  const sortedLeaderboard = [...teamMembers].sort((a, b) => b.kudos - a.kudos);

  const statsTrendData = [
    { day: 'Mon', tasksCompleted: 4, commentsLeft: 12 },
    { day: 'Tue', tasksCompleted: 7, commentsLeft: 19 },
    { day: 'Wed', tasksCompleted: 5, commentsLeft: 14 },
    { day: 'Thu', tasksCompleted: 9, commentsLeft: 22 },
    { day: 'Fri', tasksCompleted: 12, commentsLeft: 28 }, // Current
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Performance & Peer Recognition</h2>
        <p className="text-slate-500 text-sm md:text-base mt-1">Audit team member workload metrics, kudos rankings, and historical progress logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kudos Leaderboard */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Award className="text-amber-500" size={20} />
            <h3 className="text-sm font-bold text-slate-800">Peer Kudos Leaderboard</h3>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold">Weekly peer-awarded feedback and appreciation metrics</p>
          
          <div className="space-y-3">
            {sortedLeaderboard.map((member, idx) => (
              <div 
                key={member.id} 
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  idx === 0 
                    ? 'bg-amber-50/30 border-amber-200 shadow-sm' 
                    : idx === 1 
                    ? 'bg-slate-50 border-slate-200' 
                    : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-5 text-center text-xs font-black ${
                    idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : 'text-slate-400'
                  }`}>
                    #{idx + 1}
                  </span>
                  <img 
                    src={member.avatar} 
                    alt={member.name} 
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-white" 
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">{member.name}</h4>
                    <p className="text-[10px] text-slate-400">{member.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-amber-600">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-extrabold">{member.kudos}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Efficiency analytics charts */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800">Activity & Development Velocity</h3>
            <p className="text-[11px] text-slate-400 font-semibold">Completed tasks and review feedback cycles per work day</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={statsTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="tasksCompleted" stroke="#10B981" strokeWidth={3} name="Tasks Done" activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="commentsLeft" stroke="#3B82F6" strokeWidth={3} name="Review Comments" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Progress Logs list section */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="text-blue-500" size={18} />
          <h3 className="text-sm font-bold text-slate-800">Operational Progress Logs</h3>
        </div>
        <p className="text-[11px] text-slate-400 font-semibold">Audit trail of daily progress submitted via employee dashboards</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Logged By</th>
                <th className="py-3 px-4">Task Reference</th>
                <th className="py-3 px-4">Hours</th>
                <th className="py-3 px-4">Accomplishment notes</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {progressLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">No daily progress logs submitted yet. Click "Log Progress" to write a log!</td>
                </tr>
              ) : (
                progressLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                        <img 
                          src={teamMembers.find(m => m.name === log.author)?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT1jtDA7el1WpSvRQpYrCb4gOoavKhjM8ckwZ5geOgJclzrsJ8MLETWnDpYogNDGdn42U4dL6HjC0945Fqvf61PkuVw0ZiVtTgrn2Gx5c6YPEkEeP7Bx_A93_YtNuuXYfEPUGskKYz_1OkiCMkLpoGaozUDBADf-1M4lS_mYxX0iU0JJwFrIF_6Zf6nYTXV5wnMU5GetDRf1ANE7oMqR-Wdhx-8LyagWiiJuXTUCHIns3R1M7Llq9-IFZmrBvu32tHEBRNNEqNODOa'} 
                          alt={log.author} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span>{log.author}</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-500 font-medium">{log.taskTitle}</td>
                    <td className="py-3 px-4 text-blue-600 font-bold">{log.hours} hrs</td>
                    <td className="py-3 px-4 max-w-md truncate text-slate-500 font-medium">{log.notes}</td>
                    <td className="py-3 px-4 text-right text-slate-400 font-medium">{log.timestamp}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
