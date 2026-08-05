import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  icon?: string;
};

export function Input({ label, error, hint, icon, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span
            className="material-symbols-outlined text-[18px] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--ink-faint)' }}
          >
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`input ${icon ? 'pl-10' : ''}`}
          style={error ? { borderColor: 'var(--danger)' } : undefined}
          aria-invalid={error ? true : undefined}
          {...props}
        />
      </div>
      {error && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{error}</p>}
      {hint && !error && <p className="text-xs text-ink-faint mt-1">{hint}</p>}
    </div>
  );
}

export function Textarea({
  label,
  className = '',
  id,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  const fieldId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={className}>
      {label && (
        <label htmlFor={fieldId} className="label">
          {label}
        </label>
      )}
      <textarea id={fieldId} className="input min-h-24 resize-y" {...props} />
    </div>
  );
}

export function Select({
  label,
  className = '',
  children,
  id,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; children: ReactNode }) {
  const fieldId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={className}>
      {label && (
        <label htmlFor={fieldId} className="label">
          {label}
        </label>
      )}
      <select id={fieldId} className="input cursor-pointer" {...props}>
        {children}
      </select>
    </div>
  );
}
