import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';

const links = [
  { to: '/employee/dashboard', label: 'Dashboard' },
  { to: '/employee/profile', label: 'My Profile' },
  { to: '/employee/leave', label: 'Leave Requests' },
  { to: '/employee/payslips', label: 'My Payslips' },
  { to: '/employee/assets', label: 'My Assets' },
];

export function EmployeeAppShell() {
  const { employee, logout } = useEmployeeAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/employee/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6">
          <div><p className="font-display text-lg font-bold text-foreground">Orchasp Employee Portal</p><p className="text-xs text-muted-foreground">{employee?.name} · {employee?.employeeId}</p></div>
          <Button variant="outline" size="sm" onClick={handleLogout}>Sign out</Button>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr] lg:px-6">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col">
          {links.map((link) => <NavLink key={link.to} to={link.to} className={({ isActive }) => `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>{link.label}</NavLink>)}
        </nav>
        <main><Outlet /></main>
      </div>
    </div>
  );
}
