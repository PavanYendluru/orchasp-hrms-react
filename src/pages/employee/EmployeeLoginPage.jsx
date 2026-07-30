import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '../../components/layouts/AuthLayout';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/Input';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

export function EmployeeLoginPage() {
  const { login } = useEmployeeAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [credentials, setCredentials] = useState({ employeeId: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    try {
      await login(credentials);
      navigate(location.state?.from || '/employee/dashboard', { replace: true });
    } catch (err) { setError(err.response?.data?.message || 'Invalid employee ID or password.'); }
  };
  return <AuthLayout title="Employee sign in" subtitle="Use the employee credentials issued by HR.">
    <form className="space-y-5" onSubmit={submit}>
      {error && <p className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</p>}
      <FormField label="Employee ID"><input className="input-base" value={credentials.employeeId} onChange={(e) => setCredentials({ ...credentials, employeeId: e.target.value })} placeholder="EMP-002" autoComplete="username" required /></FormField>
      {/* Password visibility gives employees a safe way to verify their typed credentials. */}
      <FormField label="Password"><div className="relative"><input className="input-base pr-10" type={showPassword ? 'text' : 'password'} value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} autoComplete="current-password" required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <VisibilityOffOutlinedIcon className="h-4 w-4" /> : <VisibilityOutlinedIcon className="h-4 w-4" />}</button></div></FormField>
      <Button type="submit" className="w-full" size="lg">Sign in to employee portal</Button>
      <p className="text-center text-sm text-muted-foreground">HR administrator? <Link to="/login" className="font-medium text-primary hover:underline">Sign in to HRMS</Link></p>
    </form>
  </AuthLayout>;
}
