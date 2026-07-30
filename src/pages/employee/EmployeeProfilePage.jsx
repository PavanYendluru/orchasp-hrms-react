import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/Input';
import { api } from '../../services/api';
import { toast } from 'sonner';

/** Displays profile data returned by the employee's authenticated backend account. */
export function EmployeeProfilePage() {
  const [employee, setEmployee] = useState(null);
  const [details, setDetails] = useState({ phone: '', address: '', emergencyContact: '', profilePicture: '' });
  useEffect(() => { api.profile.me().then((user) => api.employees.get(user.employeeId)).then((data) => { setEmployee(data); setDetails({ phone: data.phone || '', address: data.address || '', emergencyContact: data.emergencyContact || '', profilePicture: data.profilePicture || '' }); }).catch(() => toast.error('Unable to load your profile.')); }, []);
  const save = async (event) => { event.preventDefault(); try { const updated = await api.profile.update(details); setEmployee(updated); toast.success('Personal profile updated.'); } catch (error) { toast.error(error.response?.data?.message || 'Unable to save profile.'); } };
  if (!employee) return <p className="p-6 text-sm text-muted-foreground">Loading profile…</p>;
  return <div className="space-y-5"><div><h1 className="font-display text-2xl font-bold text-foreground">My profile</h1><p className="mt-1 text-sm text-muted-foreground">Update your personal contact details. HR manages employment information.</p></div><div className="grid gap-5 lg:grid-cols-2"><Card><CardHeader><CardTitle>{employee.firstName} {employee.lastName}</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p><b>Employee ID:</b> {employee.employeeId}</p><p><b>Work email:</b> {employee.email}</p><p><b>Department:</b> {employee.departmentName || 'Not assigned'}</p><p><b>Job title:</b> {employee.jobTitle}</p><p><b>Location:</b> {employee.location}</p><p><b>Hire date:</b> {employee.hireDate}</p></CardContent></Card><Card><CardHeader><CardTitle>Personal contact details</CardTitle></CardHeader><CardContent><form className="space-y-4" onSubmit={save}><FormField label="Phone"><input required className="input-base" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} /></FormField><FormField label="Address"><input className="input-base" value={details.address} onChange={(e) => setDetails({ ...details, address: e.target.value })} /></FormField><FormField label="Emergency Contact"><input className="input-base" value={details.emergencyContact} onChange={(e) => setDetails({ ...details, emergencyContact: e.target.value })} /></FormField><FormField label="Profile Picture URL"><input className="input-base" value={details.profilePicture} onChange={(e) => setDetails({ ...details, profilePicture: e.target.value })} /></FormField><Button type="submit">Save personal details</Button></form></CardContent></Card></div></div>;
}
