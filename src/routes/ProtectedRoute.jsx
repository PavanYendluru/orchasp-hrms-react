/**
 * Guards every HR route. This keeps the URL and visible screen in sync after
 * a session ends, even if a user manually revisits a previously open route.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  return user
    ? <Outlet />
    : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
