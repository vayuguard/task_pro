import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: string;
  iconRight?: string;
  children?: ReactNode;
};

const variants: Record<Variant, string> = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  ghost: 'btn btn-ghost',
  danger: 'btn btn-danger'
};

const sizes: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5',
  md: ''
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  iconRight,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span
          className="inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
          aria-hidden
        />
      ) : (
        icon && <span className="material-symbols-outlined text-[18px] leading-none">{icon}</span>
      )}
      {children}
      {iconRight && !loading && (
        <span className="material-symbols-outlined text-[18px] leading-none">{iconRight}</span>
      )}
    </button>
  );
}

export function IconButton({
  icon,
  label,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon: string; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`btn-ghost p-2 rounded-lg ${className}`}
      {...props}
    >
      <span className="material-symbols-outlined text-[20px] leading-none">{icon}</span>
    </button>
  );
}
