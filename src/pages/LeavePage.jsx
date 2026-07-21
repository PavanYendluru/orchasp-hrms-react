import { useMemo, useState  } from 'react';
import moment from 'moment';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format  } from 'date-fns/format';
import { parse  } from 'date-fns/parse';
import { startOfWeek  } from 'date-fns/startOfWeek';
import { getDay  } from 'date-fns/getDay';
import { enUS  } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { PageHeader  } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent  } from '../components/ui/Card';
import { Badge  } from '../components/ui/Badge';
import { Button  } from '../components/ui/Button';
import { Modal  } from '../components/ui/Modal';
import { FormField  } from '../components/ui/Input';
import { useFormWithYup  } from '../components/forms/Form';
import { StatCard  } from '../components/common/StatCard';
import { db  } from '../data/db';
import * as yup from 'yup';
import { toast  } from 'sonner';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const schema = yup.object({
  type: yup.string().required('Leave type is required'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup.string().required('End date is required'),
  reason: yup.string().required('Reason is required').min(5, 'Too short'),
});

export function LeavePage() {
  const [view, setView] = useState('list');
  const [applyOpen, setApplyOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useFormWithYup(schema);

  const leaves = useMemo(() => db.leaves.map((l) => {
    const emp = db.employees.find((e) => e.id === l.employeeId);
    return { ...l, employee: emp };
  }), []);

  const calendarEvents = leaves.map((l) => ({
    title: `${l.employee?.firstName} ${l.employee?.lastName} — ${l.type}`,
    start: new Date(l.startDate),
    end: new Date(l.endDate),
    resource: l,
  }));

  const onSubmit = (data) => {
    toast.success('Leave request submitted');
    reset();
    setApplyOpen(false);
  };

  const stats = {
    pending: db.leaves.filter((l) => l.status === 'pending').length,
    approved: db.leaves.filter((l) => l.status === 'approved').length,
    rejected: db.leaves.filter((l) => l.status === 'rejected').length,
    total: db.leaves.length,
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Leave Management"
        description="Apply, approve, and track employee leave requests"
        actions={<Button onClick={() => setApplyOpen(true)}><EventAvailableOutlinedIcon className="h-4 w-4" /> Apply Leave</Button>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} label="Total Requests" value={stats.total} icon={<EventAvailableOutlinedIcon className="h-5 w-5" />} accent="primary" />
        <StatCard index={1} label="Pending" value={stats.pending} icon={<PendingOutlinedIcon className="h-5 w-5" />} accent="warning" />
        <StatCard index={2} label="Approved" value={stats.approved} icon={<CheckCircleOutlinedIcon className="h-5 w-5" />} accent="success" />
        <StatCard index={3} label="Rejected" value={stats.rejected} icon={<PendingOutlinedIcon className="h-5 w-5" />} accent="danger" />
      </div>

      <div className="flex gap-2">
        <Button variant={view === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setView('list')}>List View</Button>
        <Button variant={view === 'calendar' ? 'default' : 'outline'} size="sm" onClick={() => setView('calendar')}>Calendar View</Button>
      </div>

      {view === 'list' ? (
        <Card>
          <CardHeader><CardTitle>Leave Requests</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="py-2">Employee</th><th>Type</th><th>Start</th><th>End</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {leaves.slice(0, 15).map((l) => (
                    <tr key={l.id} className="border-b border-border">
                      <td className="py-2 font-medium">{l.employee?.firstName} {l.employee?.lastName}</td>
                      <td className="capitalize">{l.type}</td>
                      <td>{moment(l.startDate).format('MMM D')}</td>
                      <td>{moment(l.endDate).format('MMM D')}</td>
                      <td className="text-muted-foreground">{l.reason}</td>
                      <td><Badge variant={l.status === 'approved' ? 'success' : l.status === 'rejected' ? 'danger' : l.status === 'pending' ? 'warning' : 'muted'} className="capitalize">{l.status}</Badge></td>
                      <td>
                        {l.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="success" onClick={() => toast.success('Leave approved')}>Approve</Button>
                            <Button size="sm" variant="danger" onClick={() => toast.error('Leave rejected')}>Reject</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <BigCalendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              views={['month', 'week', 'day']}
              popup
            />
          </CardContent>
        </Card>
      )}

      <Modal
        open={applyOpen}
        onOpenChange={setApplyOpen}
        title="Apply for Leave"
        footer={<><Button variant="outline" onClick={() => setApplyOpen(false)}>Cancel</Button><Button onClick={handleSubmit(onSubmit)}>Submit</Button></>}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Leave Type" error={errors.type?.message}>
            <select {...register('type')} className="input-base">
              <option value="">Select…</option>
              <option value="annual">Annual</option>
              <option value="sick">Sick</option>
              <option value="personal">Personal</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date" error={errors.startDate?.message}>
              <input type="date" {...register('startDate')} className="input-base" />
            </FormField>
            <FormField label="End Date" error={errors.endDate?.message}>
              <input type="date" {...register('endDate')} className="input-base" />
            </FormField>
          </div>
          <FormField label="Reason" error={errors.reason?.message}>
            <textarea {...register('reason')} className="input-base" rows={3} placeholder="Brief reason for leave…" />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
