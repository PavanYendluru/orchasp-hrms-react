import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { FormField } from '../../components/ui/Input';
import { api } from '../../services/api';
import { toast } from 'sonner';

const statusVariant = { ACTIVE: 'success', ON_LEAVE: 'warning', TERMINATED: 'danger', INACTIVE: 'muted' };

/** Displays profile data returned by the employee's authenticated backend account. */
export function EmployeeProfilePage() {
  const [employee, setEmployee] = useState(null);
  const [details, setDetails] = useState({ phone: '', address: '', emergencyContact: '', profilePicture: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .profile
      .me()
      .then((me) => api.employees.get(me.employeeId))
      .then((data) => {
        setEmployee(data);
        setDetails({
          phone: data.phone || '',
          address: data.address || '',
          emergencyContact: data.emergencyContact || '',
          profilePicture: data.profilePicture || '',
        });
      })
      .catch(() => toast.error('Unable to load your profile.'));
  }, []);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await api.profile.update(details);
      setEmployee(updated);
      toast.success('Personal profile updated.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!employee) return <p className="p-6 text-sm text-muted-foreground">Loading profile…</p>;

  const name = `${employee.firstName} ${employee.lastName}`;
  const employmentInfo = [
    { label: 'Employee ID', value: employee.employeeId || '—' },
    { label: 'Department', value: employee.departmentName || 'Not assigned' },
    { label: 'Job Title', value: employee.jobTitle || '—' },
    { label: 'Location', value: employee.location || '—' },
    { label: 'Employment Type', value: employee.employmentType ? employee.employmentType.replace('-', ' ') : '—' },
    { label: 'Hire Date', value: employee.hireDate || '—' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">My Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your employment details and personal contact information.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_1.2fr]">
        {/* Identity card */}
        <Card className="h-fit">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <Avatar name={name} src={employee.profilePicture} size="xl" className="h-20 w-20 text-xl" />
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">{name}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{employee.jobTitle || 'Team Member'}</p>
              <p className="mt-1 text-xs text-muted-foreground">{employee.email}</p>
            </div>
            <Badge variant={statusVariant[employee.status] || 'muted'} className="capitalize">
              {(employee.status || 'active').toLowerCase()}
            </Badge>
            <dl className="mt-2 grid w-full gap-3 border-t border-border pt-4 text-left text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Employee ID</dt>
                <dd className="font-medium text-foreground">{employee.employeeId || '—'}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Department</dt>
                <dd className="font-medium text-foreground">{employee.departmentName || 'Not assigned'}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Location</dt>
                <dd className="font-medium text-foreground">{employee.location || '—'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Employment details */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base font-semibold">Employment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {employmentInfo.map((item) => (
                  <div key={item.label} className="flex flex-col gap-1">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</dt>
                    <dd className="text-sm font-medium text-foreground">{item.value}</dd>
                  </div>
                ))}
                <div className="flex flex-col gap-1">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date of Birth</dt>
                  <dd className="text-sm font-medium text-foreground">{employee.dateOfBirth || '—'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Personal contact details */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base font-semibold">Personal Contact Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={save}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Phone">
                    <input required className="input-base" value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} />
                  </FormField>
                  <FormField label="Emergency Contact">
                    <input className="input-base" value={details.emergencyContact} onChange={(e) => setDetails({ ...details, emergencyContact: e.target.value })} />
                  </FormField>
                </div>
                <FormField label="Address">
                  <textarea className="input-base min-h-24" value={details.address} onChange={(e) => setDetails({ ...details, address: e.target.value })} />
                </FormField>
                <FormField label="Profile Picture URL">
                  <input className="input-base" value={details.profilePicture} onChange={(e) => setDetails({ ...details, profilePicture: e.target.value })} />
                </FormField>
                <div className="pt-1">
                  <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                    {saving ? 'Saving…' : 'Save personal details'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
