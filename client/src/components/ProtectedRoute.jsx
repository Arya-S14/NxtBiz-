import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../features/auth/auth.store.js';

export default function ProtectedRoute() {
  const { user, ready } = useAuthStore();
  if (!ready) return <div className="grid min-h-screen place-items-center text-slate-500">Loading NxtBiz…</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
