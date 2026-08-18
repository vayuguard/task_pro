import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
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
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 }
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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold text-ink">TaskPro</h1>
          <p className="text-sm text-ink-muted mt-2">Sign in to your workspace</p>
        </div>
        <form onSubmit={onSubmit} className="panel p-6 space-y-4">
          {error && (
            <div className="text-sm text-danger bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>
          )}
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          <Button type="submit" className="w-full" loading={loading}>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
