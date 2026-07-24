import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Activity, 
  ShieldCheck, 
  Briefcase, 
  AlertTriangle, 
  Send, 
  Sparkles,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Employee, Task, ActivityLog } from '../types';

interface AdminProps {
  employees: Employee[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  activityLogs: ActivityLog[];
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
  onNewTaskClick: () => void;
}

export default function AdminDashboard({ 
  employees, 
  tasks, 
  setTasks, 
  activityLogs, 
  setActivityLogs,
  onNewTaskClick
}: AdminProps) {
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Computed administrative metrics
  const stats = useMemo(() => {
    const totalPoints = tasks.reduce((sum, t) => sum + t.points, 0);
    const completedPoints = tasks.filter(t => t.status === 'done').reduce((sum, t) => sum + t.points, 0);
    const avgVelocity = (employees.reduce((sum, e) => sum + e.velocity, 0) / employees.length).toFixed(1);
    const sprintHealth = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length === 0 ? 'Optimal' : 'Needs Attention';

    return {
      totalPoints,
      completedPoints,
      avgVelocity,
      sprintHealth,
      completionPercent: Math.round((completedPoints / (totalPoints || 1)) * 100)
    };
  }, [tasks, employees]);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    // Log the broadcast action
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      text: `SYSTEM ANNOUNCEMENT: "${broadcastMessage}" published to all channels.`,
      timestamp: 'Just now',
      type: 'status_changed'
    };

    setActivityLogs([newLog, ...activityLogs]);
    setBroadcastMessage('');
    alert(`Announced to team: "${broadcastMessage}"`);
  };

  const syncState = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      // Generate some dummy logs or rebalance velocity slightly
      const randomLog: ActivityLog = {
        id: `log-${Date.now()}`,
        text: 'Database schema sync complete. Staging synchronized with Production-A.',
        timestamp: 'Just now',
        type: 'status_changed'
      };
      setActivityLogs([randomLog, ...activityLogs]);
    }, 1200);
  };

  const rebalanceWeights = () => {
    alert('Velocity weights rebalanced based on the last 30-day task completion. Model synced successfully.');
  };

  return (
    <div id="admin-dashboard-container" className="p-8 space-y-8 overflow-y-auto max-h-[calc(100vh-64px)]">
      
      {/* Overview stats block */}
      <div id="admin-stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Employees</span>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mt-2">{employees.length}</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold">6 Online • 0 Remote/Offline</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Sprint Velocity</span>
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mt-2">{stats.avgVelocity} <span className="text-xs text-slate-400">avg</span></h3>
          <p className="text-[10px] text-emerald-600 mt-1 font-semibold">Optimal task completion speed</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Sprint Burn-Up</span>
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mt-2">{stats.completionPercent}%</h3>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold">{stats.completedPoints} of {stats.totalPoints} points burned</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Sprint Security</span>
            <ShieldCheck className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className={`text-3xl font-bold mt-2 ${stats.sprintHealth === 'Optimal' ? 'text-emerald-700' : 'text-amber-600'}`}>
            {stats.sprintHealth}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1 font-semibold">Zero critical security roadblocks</p>
        </div>
      </div>

      <div id="admin-main-row" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Operations panel */}
        <div id="admin-operations-panel" className="bg-white p-6 rounded-xl border border-slate-200 lg:col-span-1 space-y-6">
          <div>
            <h4 className="font-bold text-sm text-slate-800">Operational Controls</h4>
            <p className="text-xs text-slate-400 mt-0.5">Automated actions for resource allocation</p>
          </div>

          <div className="space-y-3">
            <button
              id="admin-create-task-btn"
              onClick={onNewTaskClick}
              className="w-full flex items-center justify-between p-3.5 border border-slate-200 hover:border-slate-400 rounded-lg text-left transition-colors cursor-pointer"
            >
              <div>
                <p className="text-xs font-bold text-slate-800">Add Live Sprint Task</p>
                <p className="text-[10px] text-slate-400">Manually insert task into sprint queue</p>
              </div>
              <Plus className="w-4 h-4 text-slate-500" />
            </button>

            <button
              id="admin-sync-state-btn"
              onClick={syncState}
              disabled={isSyncing}
              className="w-full flex items-center justify-between p-3.5 border border-slate-200 hover:border-slate-400 rounded-lg text-left transition-colors cursor-pointer"
            >
              <div>
                <p className="text-xs font-bold text-slate-800">Synchronize DB Nodes</p>
                <p className="text-[10px] text-slate-400">
                  {isSyncing ? 'Syncing staging records...' : 'Verify staging databases alignment'}
                </p>
              </div>
              <RefreshCw className={`w-4 h-4 text-slate-500 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>

            <button
              id="admin-rebalance-btn"
              onClick={rebalanceWeights}
              className="w-full flex items-center justify-between p-3.5 border border-slate-200 hover:border-slate-400 rounded-lg text-left transition-colors cursor-pointer"
            >
              <div>
                <p className="text-xs font-bold text-slate-800">Rebalance Velocity Metrics</p>
                <p className="text-[10px] text-slate-400">Recalculate weights based on task size</p>
              </div>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </button>
          </div>

          {/* Alert Broadcast form */}
          <form id="admin-broadcast-form" onSubmit={handleBroadcast} className="border-t border-slate-100 pt-6 space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Broadcast Enterprise Alert
              </label>
              <p className="text-[10px] text-slate-400">Push crucial system notice instantly</p>
            </div>

            <div className="relative">
              <input
                id="admin-broadcast-input"
                type="text"
                placeholder="Database maintenance scheduled..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 outline-none"
              />
              <button
                id="admin-broadcast-submit"
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-indigo-600" />
              </button>
            </div>
          </form>
        </div>

        {/* Real-time audit Activity Log */}
        <div id="admin-activity-log-card" className="bg-white p-6 rounded-xl border border-slate-200 lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-sm text-slate-800">Sprint Security Audit Log</h4>
              <p className="text-xs text-slate-400 mt-0.5">Automated tracking of workspace modifications</p>
            </div>
            <span className="text-[10px] text-indigo-600 bg-indigo-50 font-bold px-2 py-0.5 rounded-full">
              LIVE BROADCAST
            </span>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {activityLogs.map((log) => (
              <div id={`log-item-${log.id}`} key={log.id} className="flex gap-4 border-b border-slate-50 pb-3 last:border-0 last:pb-0 text-xs">
                <div className="w-2 h-2 rounded-full bg-slate-950 mt-1.5 flex-shrink-0" />
                <div className="flex-1 space-y-0.5">
                  <p className="text-slate-700 leading-normal font-medium">{log.text}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{log.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
