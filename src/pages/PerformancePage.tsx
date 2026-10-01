import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useAuth } from '../auth/AuthContext';
import { useData } from '../context/DataContext';
import { apiGetPerformance, type PerformanceScoreDto } from '../api/client';
import { PageHeader, Panel } from '../components/ui/Panel';
import { PageLoading } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { ProgressRing } from '../components/ui/Progress';

type Period = '7d' | '30d' | '90d';

function exportCsv(scores: PerformanceScoreDto[], period: Period) {
  const rows = [['Name', 'Overall', 'Confidence', 'Eligible tasks', 'Delivery', 'Quality', 'Predictability', 'Ownership', 'Collaboration']];
  for (const s of scores) {
    const c = Object.fromEntries(s.components.map((x) => [x.id, x.score ?? '']));
    rows.push([
      s.userName,
      String(s.overall ?? ''),
      s.confidence,
      String(s.eligibleTasks),
      String(c.delivery ?? ''),
      String(c.quality ?? ''),
      String(c.predictability ?? ''),
      String(c.ownership ?? ''),
      String(c.collaboration ?? '')
    ]);
  }
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vayudesk-performance-${period}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function meaningOf(score: PerformanceScoreDto): string {
  if (score.overall == null) return 'Not enough certified completed work yet to score this period.';
  if (score.confidence === 'low') return 'Early signal only — keep completing certified tasks for a steadier picture.';
  if (score.overall >= 80) return 'Strong delivery against plan. Keep estimates honest and timers accurate.';
  if (score.overall >= 60) return 'Solid mid-range performance. Watch overdue work and estimate drift.';
  return 'Room to improve. Focus on finishing In Progress work within estimates.';
}

export default function PerformancePage() {
  const { session } = useAuth();
  const { teamMembers } = useData();
  const { toast } = useToast();
  const isAdmin = session?.role === 'admin';
  const reducedMotion = useReducedMotion();
  const [period, setPeriod] = useState<Period>('30d');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [score, setScore] = useState<PerformanceScoreDto | null>(null);
  const [teamScores, setTeamScores] = useState<PerformanceScoreDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const userId = isAdmin && selectedUser ? selectedUser : session?.email;
    apiGetPerformance(period, userId || undefined)
      .then((res) => {
        if ('scores' in res) {
          setTeamScores(res.scores);
          setScore(null);
        } else {
          setScore(res.score);
          setTeamScores([]);
        }
      })
      .catch(() => toast('Could not load performance data', 'error'))
      .finally(() => setLoading(false));
  }, [period, selectedUser, isAdmin, session?.email, toast]);

  const display = score || (teamScores.length === 1 ? teamScores[0] : null);
  const sortedTeam = useMemo(
    () => [...teamScores].sort((a, b) => (b.overall ?? -1) - (a.overall ?? -1)),
    [teamScores]
  );

  return (
    <div>
      <PageHeader
        title="Performance"
        subtitle="Analytics only — not for salary decisions · Mon–Sat · Sunday weekly off"
        action={
          isAdmin && sortedTeam.length > 0 ? (
            <Button variant="secondary" onClick={() => exportCsv(sortedTeam, period)}>
              Export CSV
            </Button>
          ) : undefined
        }
      />
      <Panel className="mb-6 border-border bg-accent-soft/30">
        <p className="text-sm text-ink">
          Scores use certified business hours (Mon–Sat 10:00–18:00 IST). Sunday and holidays credit zero. Legacy tasks are excluded.
        </p>
      </Panel>
      <div className="flex flex-wrap gap-2 mb-6">
        {(['7d', '30d', '90d'] as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`chip ${period === p ? 'chip-active' : ''}`}
          >
            {p}
          </button>
        ))}
      </div>
      {isAdmin && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button type="button" onClick={() => setSelectedUser('')} className={`chip ${!selectedUser ? 'chip-active' : ''}`}>
            All team
          </button>
          {teamMembers.map((m) => (
            <button
              key={m.email || m.name}
              type="button"
              onClick={() => setSelectedUser((m.email || m.name).toLowerCase())}
              className={`chip ${selectedUser === (m.email || m.name).toLowerCase() ? 'chip-active' : ''}`}
            >
              {m.name}
            </button>
          ))}
        </div>
      )}
      {loading ? (
        <PageLoading />
      ) : isAdmin && !selectedUser && sortedTeam.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTeam.map((s) => (
            <button
              key={s.userId}
              type="button"
              className="panel p-4 text-left hover:border-accent/40 transition-colors"
              onClick={() => setSelectedUser(s.userId)}
            >
              <p className="font-semibold">{s.userName}</p>
              <p className="text-3xl font-bold mt-1 tabular-nums">{s.overall ?? '—'}</p>
              <p className="text-xs text-ink-muted mt-1">
                {s.eligibleTasks} tasks · {s.confidence} confidence
              </p>
              {s.confidence === 'low' && (
                <p className="text-[10px] font-bold uppercase text-warning mt-2">Low confidence</p>
              )}
            </button>
          ))}
        </div>
      ) : display ? (
        <div className="space-y-6">
          <Panel>
            <div className="flex flex-wrap items-center gap-6">
              <ProgressRing value={display.overall ?? 0} size={96} label="Overall" />
              <div className="min-w-0 flex-1">
                <p className="text-4xl font-bold tabular-nums">{display.overall ?? '—'}</p>
                <p className="text-sm text-ink-muted mt-1">
                  {display.eligibleTasks} eligible tasks · {display.confidence} confidence
                </p>
                <p className="text-sm text-ink mt-3">{meaningOf(display)}</p>
              </div>
            </div>
          </Panel>
          <div className="grid sm:grid-cols-2 gap-4">
            {display.components.map((c) => (
              <div key={c.id} className="panel p-4">
                <div className="flex justify-between text-sm font-semibold">
                  <span>
                    {c.label} ({c.weight}%)
                  </span>
                  <span className="tabular-nums">{c.score ?? '—'}</span>
                </div>
                <div className="h-1.5 bg-surface-sunken rounded-full mt-2 overflow-hidden">
                  {(() => {
                    const pct = Math.max(0, Math.min(100, c.score ?? 0));
                    return reducedMotion ? (
                      <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                    ) : (
                      <motion.div
                        className="h-full bg-accent rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      />
                    );
                  })()}
                </div>
                <p className="text-xs text-ink-muted mt-2">{c.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-faint">{display.disclaimer}</p>
        </div>
      ) : (
        <Panel>
          <p className="text-sm text-ink-muted">Insufficient certified completed work in this period.</p>
        </Panel>
      )}
    </div>
  );
}
