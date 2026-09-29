import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import type { Mesh } from 'three';
import { SceneCanvas } from './SceneCanvas';

function StatusOrb({ tone }: { tone: 'idle' | 'live' | 'office' }) {
  const ref = useRef<Mesh>(null);
  const color = tone === 'office' ? '#0d9488' : tone === 'live' ? '#4f46e5' : '#64748b';
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.5;
  });
  return (
    <Float speed={1.2} floatIntensity={0.45}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <mesh rotation={[Math.PI / 2.4, 0.2, 0]}>
        <torusGeometry args={[1.15, 0.04, 12, 48]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.4} transparent opacity={0.5} />
      </mesh>
    </Float>
  );
}

export function DashboardScene({
  tone = 'idle',
  className = ''
}: {
  tone?: 'idle' | 'live' | 'office';
  className?: string;
}) {
  return (
    <SceneCanvas
      className={className}
      fallback={<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-soft to-surface-sunken" />}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 2, 3]} intensity={0.9} />
      <StatusOrb tone={tone} />
    </SceneCanvas>
  );
}

export function AttendanceScene({
  tone = 'idle',
  className = ''
}: {
  tone?: 'idle' | 'live' | 'office';
  className?: string;
}) {
  return <DashboardScene tone={tone} className={className} />;
}
