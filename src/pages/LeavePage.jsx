/** Manages live leave requests for HR users. */
import { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { PageHeader } from '../components/common/PageHeader';
import { ImportExcelButton } from '../components/common/ImportExcelButton';
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
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

const statusVariant = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' };

export function LeavePage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  // Date range filter state
  const [dateFilterStart, setDateFilterStart] = useState('');
  const [dateFilterEnd, setDateFilterEnd] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const leaveData = await api.leaves.list();
      setLeaves(leaveData || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load leave requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filter leaves by date range (start date only; leave can span multiple days)
  const filteredLeaves = useMemo(() => {
    if (!dateFilterStart && !dateFilterEnd) return leaves;
    return leaves.filter((leave) => {
      const leaveStart = moment(leave.startDate);
      if (dateFilterStart && dateFilterEnd) {
        return leaveStart.isBetween(moment(dateFilterStart), moment(dateFilterEnd), 'day', '[]');
      }
      if (dateFilterStart) return leaveStart.isSameOrAfter(moment(dateFilterStart), 'day');
      if (dateFilterEnd) return leaveStart.isSameOrBefore(moment(dateFilterEnd), 'day');
      return true;
    });
  }, [leaves, dateFilterStart, dateFilterEnd]);

  const stats = useMemo(() => ({
    total: filteredLeaves.length,
    pending: filteredLeaves.filter((leave) => leave.status === 'PENDING').length,
    approved: filteredLeaves.filter((leave) => leave.status === 'APPROVED').length,
    rejected: filteredLeaves.filter((leave) => leave.status === 'REJECTED').length,
  }), [filteredLeaves]);

  const decide = async (leaveId, action) => {
    try {
      await api.leaves[action](leaveId);
      toast.success(`Leave request ${action === 'approve' ? 'approved' : 'rejected'}.`);
      if (selectedLeave?.id === leaveId) {
        setSelectedLeave((prev) => ({ ...prev, status: action === 'approve' ? 'APPROVED' : 'REJECTED' }));
      }
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update leave request.');
    }
  };

  const openDetail = (leave) => {
    setSelectedLeave(leave);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Leave Management" description="Review and manage live employee leave requests" actions={<ImportExcelButton module="leaves" onImported={() => window.location.reload()} />} />
      
      {/* Date range filter */}
      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <FormField label="Start Date">
            <input type="date" className="input-base" value={dateFilterStart} onChange={(e) => setDateFilterStart(e.target.value)} />
          </FormField>
          <FormField label="End Date">
            <input type="date" className="input-base" value={dateFilterEnd} onChange={(e) => setDateFilterEnd(e.target.value)} />
          </FormField>
          {(dateFilterStart || dateFilterEnd) && (
            <Button variant="ghost" size="sm" onClick={() => { setDateFilterStart(''); setDateFilterEnd(''); }}>
              Clear filter
            </Button>
          )}
        </CardContent>
      </Card>

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
            <tbody>{filteredLeaves.map((leave) => <tr key={leave.id} className="border-b border-border"><td className="py-3 font-medium">{leave.employeeName}</td><td>{leave.employeeId}</td><td className="capitalize">{leave.leaveType?.toLowerCase()}</td><td>{moment(leave.startDate).format('MMM D')} – {moment(leave.endDate).format('MMM D, YYYY')}</td><td>{moment(leave.endDate).diff(moment(leave.startDate), 'days') + 1}</td><td className="max-w-48 truncate" title={leave.reason}>{leave.reason}</td><td><Badge variant={statusVariant[leave.status] || 'muted'}>{leave.status}</Badge></td><td>{leave.appliedAt ? moment(leave.appliedAt).format('MMM D, YYYY') : '—'}</td><td><div className="flex gap-1"><Button size="sm" variant="ghost" title="View details" onClick={() => openDetail(leave)}><VisibilityOutlinedIcon className="h-4 w-4" /></Button>{leave.status === 'PENDING' && <><Button size="sm" variant="success" onClick={() => decide(leave.id, 'approve')}>Approve</Button><Button size="sm" variant="danger" onClick={() => decide(leave.id, 'reject')}>Reject</Button></>}</div></td></tr>)}{!filteredLeaves.length && <tr><td colSpan="9" className="py-10 text-center text-muted-foreground">No leave requests found.</td></tr>}</tbody>
          </table>}
        </CardContent>
      </Card>

      {/* View Details Modal */}
      <Modal open={detailOpen} onOpenChange={setDetailOpen} title="Leave Request Details" className="max-w-xl">
        {selectedLeave && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Employee</p>
                <p className="mt-1 text-sm font-medium text-foreground">{selectedLeave.employeeName}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Employee ID</p>
                <p className="mt-1 text-sm font-medium text-foreground">{selectedLeave.employeeId}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Leave Type</p>
                <p className="mt-1 text-sm font-medium capitalize text-foreground">{selectedLeave.leaveType?.toLowerCase()}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
                <Badge variant={statusVariant[selectedLeave.status] || 'muted'} className="mt-1 capitalize">{selectedLeave.status?.toLowerCase()}</Badge>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Start Date</p>
                <p className="mt-1 text-sm font-medium text-foreground">{selectedLeave.startDate ? moment(selectedLeave.startDate).format('MMM D, YYYY') : '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">End Date</p>
                <p className="mt-1 text-sm font-medium text-foreground">{selectedLeave.endDate ? moment(selectedLeave.endDate).format('MMM D, YYYY') : '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Duration</p>
                <p className="mt-1 text-sm font-medium text-foreground">{selectedLeave.startDate && selectedLeave.endDate ? moment(selectedLeave.endDate).diff(moment(selectedLeave.startDate), 'days') + 1 + ' day(s)' : '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Applied On</p>
                <p className="mt-1 text-sm font-medium text-foreground">{selectedLeave.appliedAt ? moment(selectedLeave.appliedAt).format('MMM D, YYYY h:mm A') : '—'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Reason</p>
              <p className="mt-1 text-sm text-foreground">{selectedLeave.reason || 'No reason provided.'}</p>
            </div>
            {selectedLeave.reviewedAt && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Reviewed On</p>
                <p className="mt-1 text-sm font-medium text-foreground">{moment(selectedLeave.reviewedAt).format('MMM D, YYYY h:mm A')}</p>
              </div>
            )}
            <div className="flex gap-2 border-t border-border pt-4">
              {selectedLeave.status === 'PENDING' && (
                <>
                  <Button variant="success" onClick={() => { decide(selectedLeave.id, 'approve'); setDetailOpen(false); }}>Approve</Button>
                  <Button variant="danger" onClick={() => { decide(selectedLeave.id, 'reject'); setDetailOpen(false); }}>Reject</Button>
                </>
              )}
              <Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
