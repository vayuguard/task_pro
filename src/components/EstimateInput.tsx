import { EstimateParts, estimatePartsToHours, formatEstimate, hoursToEstimateParts } from '../utils/estimate';

function UnitField({
  id,
  label,
  suffix,
  value,
  step,
  onChange
}: {
  id: string;
  label: string;
  suffix: string;
  value: number;
  step: number;
  onChange: (raw: string) => void;
}) {
  return (
    <label htmlFor={id} className="flex-1 min-w-0">
      <span className="block text-[10px] font-semibold uppercase tracking-wide text-ink-muted mb-1">{label}</span>
      <span className="relative block">
        <input
          id={id}
          type="number"
          min={0}
          step={step}
          inputMode="numeric"
          className="input py-2 pr-8 text-center tabular-nums"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-faint">
          {suffix}
        </span>
      </span>
    </label>
  );
}

export function EstimateInput({
  hours,
  onChange,
  hint
}: {
  hours: number;
  onChange: (hours: number) => void;
  hint?: string;
}) {
  const parts = hoursToEstimateParts(hours);

  const setPart = (key: keyof EstimateParts, raw: string) => {
    const n = parseFloat(raw);
    onChange(
      estimatePartsToHours({
        ...parts,
        [key]: Number.isNaN(n) ? 0 : Math.max(0, n)
      })
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <UnitField
          id="estimate-days"
          label="Days"
          suffix="d"
          value={parts.days}
          step={1}
          onChange={(raw) => setPart('days', raw)}
        />
        <UnitField
          id="estimate-hours"
          label="Hours"
          suffix="h"
          value={parts.hours}
          step={1}
          onChange={(raw) => setPart('hours', raw)}
        />
        <UnitField
          id="estimate-minutes"
          label="Mins"
          suffix="m"
          value={parts.minutes}
          step={5}
          onChange={(raw) => setPart('minutes', raw)}
        />
      </div>
      <p className="text-xs text-ink-muted">
        Total <span className="font-semibold text-ink">{formatEstimate(hours)}</span>
        <span className="text-ink-faint"> · {hours.toFixed(1)} business hours</span>
      </p>
      <p className="text-[11px] text-ink-faint">{hint || '1 day = 8 business hours. Combine any mix of units.'}</p>
    </div>
  );
}
