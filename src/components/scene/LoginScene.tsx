import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import type { Mesh } from 'three';
import { SceneCanvas } from './SceneCanvas';

function Orb() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.35;
    ref.current.rotation.x += delta * 0.12;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.6}>
      <mesh ref={ref} scale={1.15}>
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial
          color="#0d9488"
          emissive="#0f766e"
          emissiveIntensity={0.25}
          roughness={0.25}
          metalness={0.45}
          distort={0.28}
          speed={1.5}
        />
      </mesh>
      <mesh scale={1.55}>
        <torusGeometry args={[1.05, 0.035, 16, 64]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.35} transparent opacity={0.55} />
      </mesh>
    </Float>
  );
}

export function LoginScene({ className = '' }: { className?: string }) {
  return (
    <SceneCanvas
      className={className}
      fallback={<div className="absolute inset-0 bg-gradient-to-br from-teal-900/30 via-slate-900/20 to-transparent" />}
    >
      <color attach="background" args={['#070f18']} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 3, 2]} intensity={1.1} color="#ccfbf1" />
      <pointLight position={[-3, -1, 2]} intensity={0.5} color="#5eead4" />
      <Orb />
    </SceneCanvas>
  );
}
