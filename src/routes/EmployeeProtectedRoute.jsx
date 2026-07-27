import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEmployeeAuth } from '../context/EmployeeAuthContext';

export function EmployeeProtectedRoute() {
  const { isAuthenticated } = useEmployeeAuth();
  const location = useLocation();
  return isAuthenticated ? <Outlet /> : <Navigate to="/employee/login" replace state={{ from: location.pathname }} />;
}
