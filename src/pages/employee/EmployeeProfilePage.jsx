/**
 * Separates self-service contact details from HR-managed employment fields.
 * Employees can update personal information without altering their job record.
 */
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/Input';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { hrmsStore, useHrmsData } from '../../services/hrmsStore';
import { toast } from 'sonner';

export function EmployeeProfilePage() {
  const { employee: sessionEmployee } = useEmployeeAuth();
  const data = useHrmsData();
  const employee = data.employees.find((item) => item.id === sessionEmployee?.id) || sessionEmployee;
  const department = data.departments.find((item) => item.id === employee.departmentId);
  const [details, setDetails] = useState(() => ({ phone: employee.phone || '', address: employee.address || '', emergencyContact: employee.emergencyContact || '', profilePicture: employee.profilePicture || '' }));
  const workFields = useMemo(() => [
    ['Employee ID', `EMP-${employee.id.replace(/\D/g, '').padStart(3, '0')}`], ['Work email', employee.email], ['Department', department?.name || 'Not assigned'], ['Job title', employee.jobTitle], ['Location', employee.location], ['Employment type', employee.employmentType], ['Hire date', employee.hireDate],
  ], [employee, department]);

  /** Saves only the fields an employee is allowed to manage themselves. */
  const save = (event) => { event.preventDefault(); hrmsStore.employees.update(employee.id, details); toast.success('Personal profile updated.'); };

  return <div className="space-y-5"><div><h1 className="font-display text-2xl font-bold text-foreground">My profile</h1><p className="mt-1 text-sm text-muted-foreground">Update your personal contact details. HR manages employment information.</p></div><div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]"><Card><CardHeader><div className="flex items-center gap-4"><div className="h-14 w-14 overflow-hidden rounded-full bg-primary text-center text-xl font-bold leading-[3.5rem] text-primary-foreground">{details.profilePicture ? <img src={details.profilePicture} alt={`${employee.firstName} ${employee.lastName}`} className="h-full w-full object-cover" /> : <>{employee.firstName?.[0]}{employee.lastName?.[0]}</>}</div><div><CardTitle>{employee.firstName} {employee.lastName}</CardTitle><p className="text-sm text-muted-foreground">{employee.jobTitle}</p></div><Badge variant="success" className="ml-auto capitalize">{employee.status}</Badge></div></CardHeader><CardContent className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">{workFields.map(([label, value]) => <div key={label}><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 text-sm text-foreground">{value || '—'}</p></div>)}</CardContent></Card>
    <Card><CardHeader><CardTitle>Personal contact details</CardTitle></CardHeader><CardContent><form className="space-y-4" onSubmit={save}><FormField label="Phone"><input className="input-base" value={details.phone} onChange={(event) => setDetails({ ...details, phone: event.target.value })} required /></FormField><FormField label="Address"><input className="input-base" value={details.address} onChange={(event) => setDetails({ ...details, address: event.target.value })} /></FormField><FormField label="Emergency Contact"><input className="input-base" value={details.emergencyContact} onChange={(event) => setDetails({ ...details, emergencyContact: event.target.value })} placeholder="Name · relationship · phone" /></FormField><FormField label="Profile Picture URL"><input className="input-base" value={details.profilePicture} onChange={(event) => setDetails({ ...details, profilePicture: event.target.value })} placeholder="https://…" /></FormField><div className="flex justify-end"><Button type="submit">Save personal details</Button></div></form></CardContent></Card></div></div>;
}
