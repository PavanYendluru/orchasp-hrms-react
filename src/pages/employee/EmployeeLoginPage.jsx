import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '../../components/layouts/AuthLayout';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/Input';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { INITIAL_EMPLOYEE_PASSWORD } from '../../services/employeeAuthService';

export function EmployeeLoginPage() {
  const { login } = useEmployeeAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [credentials, setCredentials] = useState({ employeeId: '', password: '' });
  const [error, setError] = useState('');
  const submit = (event) => {
    event.preventDefault();
    try {
      login(credentials);
      navigate(location.state?.from || '/employee/dashboard', { replace: true });
    } catch (err) { setError(err.message); }
  };
  return <AuthLayout title="Employee sign in" subtitle="Use the employee credentials issued by HR.">
    <form className="space-y-5" onSubmit={submit}>
      {error && <p className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{error}</p>}
      <FormField label="Employee ID"><input className="input-base" value={credentials.employeeId} onChange={(e) => setCredentials({ ...credentials, employeeId: e.target.value })} placeholder="EMP-002" autoComplete="username" required /></FormField>
      <FormField label="Password"><input className="input-base" type="password" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} autoComplete="current-password" required /></FormField>
      <Button type="submit" className="w-full" size="lg">Sign in to employee portal</Button>
      <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">Demo: use any active employee ID (for example <strong>EMP-002</strong>) with password <strong>{INITIAL_EMPLOYEE_PASSWORD}</strong>.</p>
      <p className="text-center text-sm text-muted-foreground">HR administrator? <Link to="/login" className="font-medium text-primary hover:underline">Sign in to HRMS</Link></p>
    </form>
  </AuthLayout>;
}
