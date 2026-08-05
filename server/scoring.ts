import type { Task, User } from '../src/types.ts';
import { getCertifiedWorkingHours } from './taskService.ts';
import { getTaskPerformance } from '../src/utils/taskTiming.ts';
import { isTaskAssignedToUser } from '../src/utils/tasks.ts';

export const SCORE_FORMULA_VERSION = 'balanced-v1';

export interface ScoreComponent {
  id: string;
  label: string;
  weight: number;
  score: number | null;
  detail: string;
}

export interface PerformanceScore {
  formulaVersion: string;
  periodStart: string;
  periodEnd: string;
  userId: string;
  userName: string;
  overall: number | null;
  confidence: 'low' | 'medium' | 'high';
  eligibleTasks: number;
  components: ScoreComponent[];
  disclaimer: string;
}

function clip(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function parseDue(due: string): Date | null {
  const d = new Date(due);
  return Number.isNaN(d.getTime()) ? null : d;
}

function inPeriod(iso: string | undefined, start: Date, end: Date): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  return d >= start && d <= end;
}

export function computePerformanceScore(
  tasks: Task[],
  user: User,
  periodStart: Date,
  periodEnd: Date
): PerformanceScore {
  const userKey = (user.email || user.name).toLowerCase();
  const mine = tasks.filter(
    (t) =>
      isTaskAssignedToUser(t, user) &&
      t.status === 'Done' &&
      t.timingTrust === 'certified' &&
      inPeriod(t.completedAt, periodStart, periodEnd)
  );

  const eligible = mine.length;
  let confidence: PerformanceScore['confidence'] = 'low';
  if (eligible >= 8) confidence = 'high';
  else if (eligible >= 3) confidence = 'medium';

  if (eligible === 0) {
    return {
      formulaVersion: SCORE_FORMULA_VERSION,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      userId: userKey,
      userName: user.name,
      overall: null,
      confidence: 'low',
      eligibleTasks: 0,
      components: [],
      disclaimer: 'Analytics only — not for salary decisions. Insufficient certified completed work in period.'
    };
  }

  // Delivery 30% — on-time completion
  const onTime = mine.filter((t) => {
    const due = parseDue(t.dueDate);
    const done = t.completedAt ? new Date(t.completedAt) : null;
    if (!due || !done) return true;
    return done <= due;
  });
  const deliveryScore = clip((onTime.length / eligible) * 100, 0, 100);

  // Quality 30% — first-pass (no rework: never returned to In Progress after Review)
  const firstPass = mine.filter((t) => {
    const hist = t.statusHistory || [];
    let sawReview = false;
    for (const s of hist) {
      if (s.status === 'Review') sawReview = true;
      if (sawReview && s.status === 'In Progress') return false;
    }
    return true;
  });
  const qualityScore = clip((firstPass.length / eligible) * 100, 0, 100);

  // Predictability 20% — business hours vs locked estimate
  const predictScores: number[] = [];
  for (const t of mine) {
    const est = t.timeEstimated || 0;
    if (est <= 0) continue;
    const spent = getCertifiedWorkingHours(t);
    const ratio = spent / est;
    const pts = clip(100 - Math.abs(1 - ratio) * 100, 0, 100);
    predictScores.push(pts);
  }
  const predictScore =
    predictScores.length > 0
      ? predictScores.reduce((a, b) => a + b, 0) / predictScores.length
      : 50;

  // Ownership 10% — started within 2 business days of assign (proxy: has In Progress segment)
  const started = mine.filter((t) => (t.statusHistory || []).some((s) => s.status === 'In Progress'));
  const ownershipScore = clip((started.length / eligible) * 100, 0, 100);

  // Collaboration 10% — has reviewer comment activity (proxy)
  const collab = mine.filter((t) =>
    t.activity.some((a) => a.type === 'comment' && a.user.name !== user.name)
  );
  const collabScore = clip((collab.length / eligible) * 100, 0, 100);

  const components: ScoreComponent[] = [
    {
      id: 'delivery',
      label: 'Delivery reliability',
      weight: 30,
      score: Math.round(deliveryScore),
      detail: `${onTime.length}/${eligible} on time`
    },
    {
      id: 'quality',
      label: 'Quality',
      weight: 30,
      score: Math.round(qualityScore),
      detail: `${firstPass.length}/${eligible} first-pass`
    },
    {
      id: 'predictability',
      label: 'Predictability',
      weight: 20,
      score: Math.round(predictScore),
      detail: `${predictScores.length} tasks with estimates`
    },
    {
      id: 'ownership',
      label: 'Ownership',
      weight: 10,
      score: Math.round(ownershipScore),
      detail: `${started.length}/${eligible} started work`
    },
    {
      id: 'collaboration',
      label: 'Collaboration',
      weight: 10,
      score: Math.round(collabScore),
      detail: `${collab.length}/${eligible} with peer input`
    }
  ];

  const overall = Math.round(
    (deliveryScore * 30 + qualityScore * 30 + predictScore * 20 + ownershipScore * 10 + collabScore * 10) /
      100
  );

  return {
    formulaVersion: SCORE_FORMULA_VERSION,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    userId: userKey,
    userName: user.name,
    overall,
    confidence,
    eligibleTasks: eligible,
    components,
    disclaimer: 'Analytics only — not for salary decisions.'
  };
}

export function computeTeamPerformance(
  tasks: Task[],
  members: User[],
  periodStart: Date,
  periodEnd: Date
): PerformanceScore[] {
  return members.map((m) => computePerformanceScore(tasks, m, periodStart, periodEnd));
}
