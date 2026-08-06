/** Shows an individual employee's profile, history, and related records (backend-driven). */
import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import moment from 'moment';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { api } from '../services/api';
import { formatCurrency } from '../lib/utils';
import { toast } from 'sonner';

const statusVariant = {
  ACTIVE: 'success',
  ON_LEAVE: 'warning',
  INACTIVE: 'muted',
  TERMINATED: 'danger',
};

export function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [department, setDepartment] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([
      api.employees.get(id),
      api.departments.list(),
    ])
      .then(([emp, depts]) => {
        if (!isMounted) return;
        setEmployee(emp);
        setDepartment(depts.find((d) => String(d.id) === String(emp?.departmentId)) || null);
        Promise.allSettled([api.attendance.forEmployee(id), api.leaves.forEmployee(id)]).then(([att, lev]) => {
          if (!isMounted) return;
          if (att.status === 'fulfilled') setAttendance(att.value || []);
          if (lev.status === 'fulfilled') setLeaves(lev.value || []);
        });
      })
      .catch((err) => {
        console.error('Failed loading employee detail:', err);
        if (isMounted) {
          setEmployee(null);
          toast.error(err?.response?.data?.message || 'Unable to load employee detail.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [id]);

  const attendanceTrend = useMemo(
    () =>
      attendance.slice(0, 14).reverse().map((a) => ({
        date: moment(a.date).format('DD'),
        hours: Number(a.workingHours) || 0,
      })),
    [attendance]
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!employee) {
    return (
      <EmptyState
        title="Employee not found"
        description="The employee you're looking for doesn't exist or could not be loaded."
        action={<Button onClick={() => navigate('/employees')}>Back to Employees</Button>}
      />
    );
  }

  const statusKey = employee.status ? String(employee.status).toUpperCase() : 'ACTIVE';

  return (
    <div className="space-y-5">
      <Link to="/employees" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowBackIcon className="h-4 w-4" /> Back to Employees
      </Link>

      {/* Header card */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar name={`${employee.firstName} ${employee.lastName}`} src={employee.profilePicture} size="xl" />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold text-foreground">{employee.firstName} {employee.lastName}</h1>
              <Badge variant={statusVariant[statusKey] || 'primary'} className="capitalize">{employee.status || 'ACTIVE'}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{employee.jobTitle} · {department?.name || 'N/A'}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MailOutlineOutlinedIcon className="h-4 w-4" /> {employee.email}</span>
              <span className="flex items-center gap-1"><PhoneOutlinedIcon className="h-4 w-4" /> {employee.phone || '—'}</span>
              <span className="flex items-center gap-1"><LocationOnOutlinedIcon className="h-4 w-4" /> {employee.location || 'N/A'}</span>
              <span className="flex items-center gap-1"><BusinessOutlinedIcon className="h-4 w-4" /> {department?.name || 'N/A'}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/employees')}>Back</Button>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Personal Info</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Employee ID</span><span className="font-medium">{employee.employeeId || employee.id}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Department</span><span className="font-medium">{department?.name || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Employment Type</span><span className="font-medium capitalize">{employee.employmentType || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Date of Birth</span><span className="font-medium">{employee.dateOfBirth ? moment(employee.dateOfBirth).format('MMM D, YYYY') : 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Hire Date</span><span className="font-medium">{employee.hireDate ? moment(employee.hireDate).format('MMM D, YYYY') : 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span className="font-medium">{employee.location || 'N/A'}</span></div>
<div className="flex justify-between"><span className="text-muted-foreground">Salary</span><span className="font-medium">{formatCurrency(Number(employee.salary || 0))}</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium">{employee.email}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-medium">{employee.phone || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span className="font-medium">{employee.address || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Emergency Contact</span><span className="font-medium">{employee.emergencyContact || '—'}</span></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader><CardTitle>Recent Attendance</CardTitle></CardHeader>
            <CardContent>
              {attendance.length === 0 ? (
                <EmptyState title="No attendance records" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="py-2">Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th></tr></thead>
                    <tbody>
                      {attendance.slice(0, 10).map((a) => (
                        <tr key={a.id} className="border-b border-border">
                          <td className="py-2">{moment(a.date).format('MMM D, YYYY')}</td>
                          <td>{a.checkIn || '—'}</td>
                          <td>{a.checkOut || '—'}</td>
                          <td>{a.workingHours ? `${a.workingHours}h` : '—'}</td>
                          <td><Badge variant={a.status === 'ACTIVE' ? 'success' : a.status === 'INACTIVE' ? 'muted' : a.status === 'ABSENT' ? 'danger' : 'primary'} className="capitalize">{a.status || '—'}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave">
          <Card>
            <CardHeader><CardTitle>Leave History</CardTitle></CardHeader>
            <CardContent>
              {leaves.length === 0 ? (
                <EmptyState title="No leave records" />
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="py-2">Type</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
                  <tbody>
                    {leaves.map((l) => (
                      <tr key={l.id} className="border-b border-border">
                        <td className="py-2 capitalize">{l.leaveType || l.type}</td>
                        <td>{moment(l.startDate).format('MMM D')}</td>
                        <td>{moment(l.endDate).format('MMM D')}</td>
                        <td><Badge variant={l.status === 'APPROVED' ? 'success' : l.status === 'REJECTED' ? 'danger' : l.status === 'PENDING' ? 'warning' : 'muted'} className="capitalize">{l.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
