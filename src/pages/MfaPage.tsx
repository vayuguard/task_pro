import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function MfaPage() {
  const { session, verifyMfa, logout } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await verifyMfa(code);
    setLoading(false);
    if (!result.ok) {
      setError('error' in result ? result.error : 'Verification failed');
      return;
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md panel p-6">
        <h1 className="font-display text-xl font-semibold">Verify your identity</h1>
        <p className="text-sm text-ink-muted mt-1">Enter the 6-digit code for {session?.email}</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {error && <div className="text-sm text-danger">{error}</div>}
          <Input label="Verification code" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={6} required />
          <Button type="submit" className="w-full" loading={loading}>
            Verify
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={logout}>
            Back to login
          </Button>
        </form>
      </div>
    </div>
  );
}
