import { Input } from './ui/Input';
import { EstimateParts, estimatePartsToHours, hoursToEstimateParts } from '../utils/estimate';

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
        [key]: Number.isNaN(n) ? 0 : n
      })
    );
  };

  return (
    <div className="space-y-2">
      <p className="label">Estimate</p>
      <div className="grid grid-cols-3 gap-2">
        <Input
          label="Days"
          type="number"
          min={0}
          step={1}
          value={parts.days || ''}
          onChange={(e) => setPart('days', e.target.value)}
        />
        <Input
          label="Hours"
          type="number"
          min={0}
          step={1}
          value={parts.hours || ''}
          onChange={(e) => setPart('hours', e.target.value)}
        />
        <Input
          label="Minutes"
          type="number"
          min={0}
          step={5}
          value={parts.minutes || ''}
          onChange={(e) => setPart('minutes', e.target.value)}
        />
      </div>
      <p className="text-xs text-ink-faint">
        {hint || 'Mix days, hours, and minutes. 1 day = 8 business hours.'}
      </p>
    </div>
  );
}
