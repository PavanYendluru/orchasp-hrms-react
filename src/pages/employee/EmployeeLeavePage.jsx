import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/Input';
import { api } from '../../services/api';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { toast } from 'sonner';

const initialForm = { leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' };
export function EmployeeLeavePage() {
  const { employee } = useEmployeeAuth();
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const empId = employee.employeeId ?? employee.id;
  const loadLeaves = useCallback(async () => {
    try { setLeaves(await api.leaves.forEmployee(empId)); }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to load leave requests.'); }
  }, [empId]);
  useEffect(() => { loadLeaves(); }, [loadLeaves]);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    if (form.startDate < new Date().toISOString().slice(0, 10)) return toast.error('Leave cannot start in the past.');
    if (form.endDate < form.startDate) return toast.error('End date must be on or after the start date.');
    setSaving(true);
    try {
      await api.leaves.create({ ...form, employeeId: empId });
      setForm(initialForm); await loadLeaves(); toast.success('Leave request sent to HR.');
    } catch (error) { toast.error(error.response?.data?.message || 'Unable to submit leave request.'); }
    finally { setSaving(false); }
  };
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Leave requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">Submit time-off requests and track HR approval.</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader><CardTitle>My requests</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-muted-foreground">
                <tr>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Dates</th>
                  <th className="pb-3 font-medium">Reason</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave.id} className="border-b border-border">
                    <td className="py-3 capitalize">{leave.leaveType || leave.type}</td>
                    <td>{leave.startDate} – {leave.endDate}</td>
                    <td>{leave.reason}</td>
                    <td>
                      <Badge variant={leave.status === 'APPROVED' || leave.status === 'approved' ? 'success' : leave.status === 'REJECTED' || leave.status === 'rejected' ? 'danger' : 'warning'} className="capitalize">
                        {leave.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {!leaves.length && <tr><td colSpan="4" className="py-8 text-center text-muted-foreground">No leave requests yet.</td></tr>}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Apply for leave</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submit}>
              <FormField label="Leave type">
                <select className="input-base" name="leaveType" value={form.leaveType} onChange={update}>
                  <option value="ANNUAL">Annual leave</option>
                  <option value="SICK">Sick leave</option>
                  <option value="PERSONAL">Personal leave</option>
                  <option value="UNPAID">Unpaid leave</option>
                </select>
              </FormField>
              <FormField label="Start date">
                <input className="input-base" name="startDate" type="date" min={new Date().toISOString().slice(0, 10)} value={form.startDate} onChange={update} required />
              </FormField>
              <FormField label="End date">
                <input className="input-base" name="endDate" type="date" value={form.endDate} onChange={update} required />
              </FormField>
              <FormField label="Reason">
                <textarea className="input-base min-h-24" name="reason" value={form.reason} onChange={update} minLength="5" required />
              </FormField>
              <Button className="w-full" type="submit" disabled={saving}>{saving ? 'Submitting…' : 'Submit request'}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
