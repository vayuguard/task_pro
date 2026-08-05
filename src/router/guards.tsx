import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { PageLoading } from '../components/ui/Skeleton';

export function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { session, isLoggedIn, requiresMfa, loading } = useAuth();

  if (loading) return <PageLoading />;
  if (!session) return <Navigate to="/login" replace />;
  if (requiresMfa) return <Navigate to="/mfa" replace />;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (adminOnly && session.role !== 'admin') return <Navigate to="/" replace />;

  return <Outlet />;
}

export function GuestRoute() {
  const { session, isLoggedIn, requiresMfa, loading } = useAuth();
  if (loading) return <PageLoading />;
  if (session && requiresMfa) return <Navigate to="/mfa" replace />;
  if (isLoggedIn) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function MfaRoute() {
  const { session, requiresMfa, loading } = useAuth();
  if (loading) return <PageLoading />;
  if (!session) return <Navigate to="/login" replace />;
  if (!requiresMfa) return <Navigate to="/" replace />;
  return <Outlet />;
}
