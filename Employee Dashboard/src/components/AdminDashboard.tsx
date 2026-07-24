import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { ProjectMetrics, TeamMember, Task } from '../types';
import { Shield, Activity, DollarSign, Users, CheckCircle2, AlertTriangle, Play } from 'lucide-react';

interface AdminDashboardProps {
  projects: ProjectMetrics[];
  teamMembers: TeamMember[];
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onTabChange: (tab: string) => void;
}

export default function AdminDashboard({ projects, teamMembers, tasks, onSelectTask, onTabChange }: AdminDashboardProps) {
  // Aggregate stats
  const totalBudget = '$300,000';
  const overallVelocity = 86; // %
  const activeBlockers = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length;
  const totalTeamSize = teamMembers.length;

  // Recharts Sprint Performance Area Data
  const sprintPerformanceData = [
    { sprint: 'Sprint 70', committed: 20, delivered: 18 },
    { sprint: 'Sprint 71', committed: 24, delivered: 22 },
    { sprint: 'Sprint 72', committed: 25, delivered: 21 },
    { sprint: 'Sprint 73', committed: 28, delivered: 26 },
    { sprint: 'Sprint 74', committed: 30, delivered: 28 }, // Current
  ];

  // Pie chart task distribution
  const taskDistributionByStatus = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: '#94A3B8' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#3B82F6' },
    { name: 'Review', value: tasks.filter(t => t.status === 'review').length, color: '#F59E0B' },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#10B981' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Admin & Operations Control Center</h2>
        <p className="text-slate-500 text-sm md:text-base mt-1">Cross-project resource allocation, velocity metrics, and compliance logs.</p>
      </div>

      {/* High-Level KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Core Budget</p>
            <h4 className="text-xl font-bold text-slate-800">{totalBudget}</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sprint Velocity</p>
            <h4 className="text-xl font-bold text-slate-800">{overallVelocity}% Delivery</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Urgent Blockers</p>
            <h4 className="text-xl font-bold text-slate-800">{activeBlockers} Tasks</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Staff Alloc</p>
            <h4 className="text-xl font-bold text-slate-800">{totalTeamSize} Engineers</h4>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sprint delivery trends */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800">Sprint Delivery Velocity</h3>
            <p className="text-[11px] text-slate-400 font-semibold">Committed points versus successfully delivered points per sprint cycle</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sprintPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCommitted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="sprint" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="committed" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorCommitted)" name="Committed Pts" />
                <Area type="monotone" dataKey="delivered" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorDelivered)" name="Delivered Pts" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Distribution status donut chart */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Task Status Breakdown</h3>
            <p className="text-[11px] text-slate-400 font-semibold">Proportional volume of tasks by Kanban lane</p>
          </div>
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskDistributionByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {taskDistributionByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-500">
            {taskDistributionByStatus.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                <span>{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects and Resource Allocations */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Projects List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Enterprise Project Portfolios</h3>
            <p className="text-[11px] text-slate-400 font-semibold">Track real-time completion speed and operational budget status</p>
          </div>

          <div className="divide-y divide-slate-100">
            {projects.map(proj => {
              const rate = Math.round((proj.completedTasks / proj.totalTasks) * 100);
              return (
                <div key={proj.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: proj.color }}></span>
                      <h4 className="text-xs font-bold text-slate-700 truncate">{proj.name}</h4>
                    </div>
                    {/* Completion bar */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ width: `${rate}%`, backgroundColor: proj.color }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{rate}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0 text-right">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Budget Alloc</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{proj.budget}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      proj.status === 'On Track' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {proj.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Allocation lists */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800">Resource Assignments</h3>
            <p className="text-[11px] text-slate-400 font-semibold">Active workload index and core efficiency rating</p>
          </div>

          <div className="space-y-4">
            {teamMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2">
                  <img 
                    src={member.avatar} 
                    alt={member.name} 
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-slate-200" 
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">{member.name}</h4>
                    <p className="text-[10px] text-slate-400">{member.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold">Efficiency</p>
                  <p className="text-xs font-extrabold text-blue-600 mt-0.5">{member.efficiency}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Immediate Attention Needed tasks (urgent) */}
      <section className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800">Critical Attention Log</h3>
          <p className="text-[11px] text-slate-400 font-semibold">Incomplete high priority and urgent issues</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').map(task => (
            <div 
              key={task.id}
              onClick={() => onSelectTask(task)}
              className="p-3.5 border border-rose-100 bg-rose-50/20 hover:bg-rose-50/40 rounded-xl transition-all cursor-pointer flex justify-between items-center"
            >
              <div>
                <h5 className="text-xs font-bold text-slate-800">{task.title}</h5>
                <p className="text-[10px] text-slate-400 mt-1">{task.project}</p>
              </div>
              <span className="bg-rose-100 text-rose-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                {task.status}
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
