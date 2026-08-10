import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import SettingsBrightnessOutlinedIcon from '@mui/icons-material/SettingsBrightnessOutlined';

const links = [
  { to: '/employee/dashboard', label: 'Dashboard' },
  { to: '/employee/profile', label: 'My Profile' },
  { to: '/employee/leave', label: 'Leave Requests' },
  { to: '/employee/tasks', label: 'My Tasks' },
  { to: '/employee/projects', label: 'My Projects' },
  { to: '/employee/performance', label: 'My Performance' },
  { to: '/employee/payslips', label: 'My Payslips' },
  { to: '/employee/assets', label: 'My Assets' },
];

const themeOptions = [
  { key: 'light', label: 'Light', icon: <LightModeOutlinedIcon className="h-4 w-4" /> },
  { key: 'dark', label: 'Dark', icon: <DarkModeOutlinedIcon className="h-4 w-4" /> },
  { key: 'system', label: 'System', icon: <SettingsBrightnessOutlinedIcon className="h-4 w-4" /> },
];

export function EmployeeAppShell() {
  const { employee, logout } = useEmployeeAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/employee/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 lg:px-6">
          <div><p className="font-display text-lg font-bold text-foreground">Orchasp Employee Portal</p><p className="text-xs text-muted-foreground">{employee?.name} · {employee?.employeeId}</p></div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border bg-background p-0.5" role="group" aria-label="Theme">
              {themeOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setTheme(option.key)}
                  title={`${option.label} theme`}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                    theme === option.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {option.icon}
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>Sign out</Button>
          </div>
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
