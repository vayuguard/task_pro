import { Suspense, lazy, type ReactNode } from 'react';
import { useReducedMotion } from 'motion/react';

const Canvas = lazy(() =>
  import('@react-three/fiber').then((m) => ({ default: m.Canvas }))
);

export function SceneCanvas({
  children,
  className = '',
  fallback
}: {
  children: ReactNode;
  className?: string;
  fallback?: ReactNode;
}) {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        {fallback ?? <div className="absolute inset-0 bg-gradient-to-br from-accent-soft/40 to-surface-sunken" />}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Suspense
        fallback={
          fallback ?? <div className="absolute inset-0 bg-gradient-to-br from-accent-soft/40 to-surface-sunken" />
        }
      >
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 4.2], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          style={{ position: 'absolute', inset: 0 }}
        >
          {children}
        </Canvas>
      </Suspense>
    </div>
  );
}
