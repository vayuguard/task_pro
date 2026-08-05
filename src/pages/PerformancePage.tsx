import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useAuth } from '../auth/AuthContext';
import { useData } from '../context/DataContext';
import { apiGetPerformance, type PerformanceScoreDto } from '../api/client';
import { PageHeader, Panel } from '../components/ui/Panel';
import { PageLoading } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

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
  a.download = `taskpro-performance-${period}.csv`;
  a.click();
  URL.revokeObjectURL(url);
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

  return (
    <div>
      <PageHeader
        title="Performance"
        subtitle="Analytics only — not for salary decisions"
        action={
          isAdmin && teamScores.length > 0 ? (
            <Button variant="secondary" onClick={() => exportCsv(teamScores, period)}>
              Export CSV
            </Button>
          ) : undefined
        }
      />
      <Panel className="mb-6 border-amber-200 bg-amber-50/50">
        <p className="text-sm text-amber-900">
          Certified business hours (Mon–Sat 10:00–18:00 IST) · WFH uses the same rules · Legacy tasks excluded
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
      ) : isAdmin && !selectedUser && teamScores.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamScores.map((s) => (
            <div key={s.userId} className="panel p-4">
              <p className="font-semibold">{s.userName}</p>
              <p className="text-3xl font-bold mt-1">{s.overall ?? '—'}</p>
              <p className="text-xs text-ink-muted">{s.eligibleTasks} tasks · {s.confidence}</p>
            </div>
          ))}
        </div>
      ) : display ? (
        <div className="space-y-6">
          <Panel>
            <p className="text-4xl font-bold">{display.overall ?? '—'}</p>
            <p className="text-sm text-ink-muted">{display.eligibleTasks} eligible tasks · {display.confidence} confidence</p>
          </Panel>
          <div className="grid sm:grid-cols-2 gap-4">
            {display.components.map((c) => (
              <div key={c.id} className="panel p-4">
                <div className="flex justify-between text-sm font-semibold">
                  <span>{c.label} ({c.weight}%)</span>
                  <span>{c.score ?? '—'}</span>
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
                <p className="text-xs text-ink-muted mt-1">{c.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-faint">{display.disclaimer}</p>
        </div>
      ) : (
        <Panel><p className="text-sm text-ink-muted">Insufficient certified completed work in this period.</p></Panel>
      )}
    </div>
  );
}
