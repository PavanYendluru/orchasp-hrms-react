/** Manages live leave requests for HR users. */
import { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/Input';
import { StatCard } from '../components/common/StatCard';
import { Spinner } from '../components/ui/Spinner';
import { api } from '../services/api';
import { toast } from 'sonner';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';

const initialForm = { employeeId: '', leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' };
const statusVariant = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' };

export function LeavePage() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [leaveData, employeeData] = await Promise.all([api.leaves.list(), api.employees.all()]);
      setLeaves(leaveData || []);
      setEmployees(employeeData || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load leave requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => ({
    total: leaves.length,
    pending: leaves.filter((leave) => leave.status === 'PENDING').length,
    approved: leaves.filter((leave) => leave.status === 'APPROVED').length,
    rejected: leaves.filter((leave) => leave.status === 'REJECTED').length,
  }), [leaves]);

  const submit = async (event) => {
    event.preventDefault();
    if (form.endDate < form.startDate) return toast.error('End date must be on or after the start date.');
    setSaving(true);
    try {
      await api.leaves.create({ ...form, employeeId: Number(form.employeeId) });
      toast.success('Leave request submitted.');
      setApplyOpen(false);
      setForm(initialForm);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to submit leave request.');
    } finally {
      setSaving(false);
    }
  };

  const decide = async (leaveId, action) => {
    try {
      await api.leaves[action](leaveId);
      toast.success(`Leave request ${action === 'approve' ? 'approved' : 'rejected'}.`);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update leave request.');
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Leave Management" description="Review and manage live employee leave requests" actions={<Button onClick={() => setApplyOpen(true)}><EventAvailableOutlinedIcon className="h-4 w-4" /> Apply Leave</Button>} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} label="Total Requests" value={stats.total} icon={<EventAvailableOutlinedIcon className="h-5 w-5" />} accent="primary" />
        <StatCard index={1} label="Pending" value={stats.pending} icon={<PendingOutlinedIcon className="h-5 w-5" />} accent="warning" />
        <StatCard index={2} label="Approved" value={stats.approved} icon={<CheckCircleOutlinedIcon className="h-5 w-5" />} accent="success" />
        <StatCard index={3} label="Rejected" value={stats.rejected} icon={<PendingOutlinedIcon className="h-5 w-5" />} accent="danger" />
      </div>
      <Card>
        <CardHeader><CardTitle>Leave Requests</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? <div className="flex justify-center py-10"><Spinner className="h-6 w-6" /></div> : <table className="w-full text-sm">
            <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="py-2">Employee</th><th>Employee ID</th><th>Type</th><th>Dates</th><th>Days</th><th>Reason</th><th>Status</th><th>Applied</th><th>Actions</th></tr></thead>
            <tbody>{leaves.map((leave) => <tr key={leave.id} className="border-b border-border"><td className="py-3 font-medium">{leave.employeeName}</td><td>{leave.employeeId}</td><td className="capitalize">{leave.leaveType?.toLowerCase()}</td><td>{moment(leave.startDate).format('MMM D')} – {moment(leave.endDate).format('MMM D, YYYY')}</td><td>{moment(leave.endDate).diff(moment(leave.startDate), 'days') + 1}</td><td className="max-w-48 truncate" title={leave.reason}>{leave.reason}</td><td><Badge variant={statusVariant[leave.status] || 'muted'}>{leave.status}</Badge></td><td>{leave.appliedAt ? moment(leave.appliedAt).format('MMM D, YYYY') : '—'}</td><td>{leave.status === 'PENDING' && <div className="flex gap-1"><Button size="sm" variant="success" onClick={() => decide(leave.id, 'approve')}>Approve</Button><Button size="sm" variant="danger" onClick={() => decide(leave.id, 'reject')}>Reject</Button></div>}</td></tr>)}{!leaves.length && <tr><td colSpan="9" className="py-10 text-center text-muted-foreground">No leave requests found.</td></tr>}</tbody>
          </table>}
        </CardContent>
      </Card>
      <Modal open={applyOpen} onOpenChange={setApplyOpen} title="Apply for Leave"><form onSubmit={submit} className="space-y-4"><FormField label="Employee"><select required className="input-base" value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })}><option value="">Select employee</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}</option>)}</select></FormField><FormField label="Leave Type"><select className="input-base" value={form.leaveType} onChange={(event) => setForm({ ...form, leaveType: event.target.value })}>{['ANNUAL', 'SICK', 'PERSONAL', 'UNPAID'].map((type) => <option key={type}>{type}</option>)}</select></FormField><div className="grid grid-cols-2 gap-4"><FormField label="Start Date"><input required min={new Date().toISOString().slice(0, 10)} type="date" className="input-base" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} /></FormField><FormField label="End Date"><input required min={form.startDate || new Date().toISOString().slice(0, 10)} type="date" className="input-base" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} /></FormField></div><FormField label="Reason"><textarea required minLength="5" className="input-base min-h-24" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} /></FormField><div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setApplyOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Submitting…' : 'Submit'}</Button></div></form></Modal>
    </div>
  );
}
