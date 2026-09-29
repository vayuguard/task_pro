import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoginScene } from '../components/scene/LoginScene';
import type { GeoPoint } from '../api/client';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const readLocation = (): Promise<GeoPoint | undefined> =>
    new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(undefined);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          }),
        () => resolve(undefined),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const location = await readLocation();
    const result = await login(email, password, location);
    setLoading(false);
    if (!result.ok) {
      setError('error' in result ? result.error : 'Login failed');
      return;
    }
    if (result.mfaRequired) navigate('/mfa');
    else navigate('/');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      <LoginScene className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-surface/90 pointer-events-none" />
      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="text-center mb-8">
          <img
            src="/Team_Task_Pro.png"
            alt="TaskPro"
            className="mx-auto h-16 w-16 rounded-2xl object-contain shadow-lg ring-1 ring-white/20"
          />
          <h1 className="font-display text-3xl font-semibold text-white mt-4 drop-shadow">TaskPro</h1>
          <p className="text-sm text-white/75 mt-2">Sign in to your workspace</p>
          <p className="text-xs text-white/55 mt-2">
            Employee windows: 9:00–10:00 AM &amp; 1:30–2:30 PM IST · Sunday weekly off
          </p>
        </div>
        <form onSubmit={onSubmit} className="panel p-6 space-y-4 shadow-float backdrop-blur-sm">
          {error && (
            <div className="text-sm text-danger bg-danger-soft border border-danger/20 rounded-lg px-3 py-2">{error}</div>
          )}
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          <Button type="submit" className="w-full" loading={loading}>
            Sign in
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
