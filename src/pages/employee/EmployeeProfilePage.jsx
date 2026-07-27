import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { db } from '../../data/db';

export function EmployeeProfilePage() {
  const { employee } = useEmployeeAuth();
  const department = db.departments.find((item) => item.id === employee.departmentId);
  const fields = [
    ['Employee ID', employee.employeeId], ['Work email', employee.email], ['Phone', employee.phone],
    ['Department', department?.name || 'Not assigned'], ['Job title', employee.jobTitle], ['Location', employee.location],
    ['Employment type', employee.employmentType], ['Hire date', employee.hireDate],
  ];
  return <div className="space-y-5"><div><h1 className="font-display text-2xl font-bold text-foreground">My profile</h1><p className="mt-1 text-sm text-muted-foreground">Your HR-managed employment details.</p></div><Card><CardHeader><div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">{employee.firstName?.[0]}{employee.lastName?.[0]}</div><div><CardTitle>{employee.name}</CardTitle><p className="text-sm text-muted-foreground">{employee.jobTitle}</p></div><Badge variant="success" className="ml-auto capitalize">{employee.status}</Badge></div></CardHeader><CardContent className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label}><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 text-sm text-foreground">{value || '—'}</p></div>)}</CardContent></Card></div>;
}
