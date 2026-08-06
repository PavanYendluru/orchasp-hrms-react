import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { ChartJSDoughnut } from '../../components/charts/ChartJS';
import { api } from '../../services/api';
import { toast } from 'sonner';
import moment from 'moment';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

export function EmployeeDashboardPage() {
  const { employee } = useEmployeeAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [punchLoading, setPunchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadEmployeeDashboard() {
      setLoading(true);
      setError(null);
try {
        const empId = employee.employeeId ?? employee.id;
        const [dash, attendance, leaves, summary] = await Promise.all([
          api.dashboard.employee(empId),
          api.attendance.forEmployee(empId),
          api.leaves.forEmployee(empId),
          api.attendance.summary(empId),
        ]);
        if (isMounted) {
          setDashboardData(dash);
          setAttendanceData(attendance || []);
          setLeaveData(leaves || []);
          setTodayAttendance(summary || null);
        }
      } catch (err) {
        console.error('Failed loading employee dashboard:', err);
        setError('Could not load dashboard data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadEmployeeDashboard();
    return () => { isMounted = false; };
}, [employee.id, employee.employeeId]);

  const handlePunchIn = async () => {
    setPunchLoading(true);
    try {
      const record = await api.attendance.punchIn(employee.employeeId ?? employee.id);
      setTodayAttendance(record);
      toast.success('Punched in successfully');
    } catch (err) {
      console.error('Punch in failed:', err);
      toast.error(err?.response?.data?.message || 'Punch in failed. Already punched in?');
    } finally {
      setPunchLoading(false);
    }
  };

  const handlePunchOut = async () => {
    setPunchLoading(true);
    try {
      const record = await api.attendance.punchOut(employee.employeeId ?? employee.id);
      setTodayAttendance(record);
      toast.success('Punched out. Have a great day!');
    } catch (err) {
      console.error('Punch out failed:', err);
      toast.error(err?.response?.data?.message || 'Punch out failed. Please check in first.');
    } finally {
      setPunchLoading(false);
    }
  };

  const stats = useMemo(() => ({
    totalLeaves: dashboardData?.totalLeaves ?? leaveData.length,
    pendingLeaves: dashboardData?.pendingLeaves ?? leaveData.filter((l) => l.status === 'PENDING' || l.status === 'pending').length,
    attendanceRecords: dashboardData?.attendanceRecords ?? attendanceData.length,
    attendanceBreakdown: dashboardData?.attendanceBreakdown || {
      present: attendanceData.filter((a) => a.status === 'PRESENT' || a.status === 'present').length,
      late: attendanceData.filter((a) => a.status === 'LATE' || a.status === 'late').length,
      remote: attendanceData.filter((a) => a.status === 'REMOTE' || a.status === 'remote').length,
      absent: attendanceData.filter((a) => a.status === 'ABSENT' || a.status === 'absent').length,
    },
  }), [dashboardData, leaveData, attendanceData]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

if (error) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Welcome, {employee.name || employee.firstName || employee.employeeCode}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const attendanceBreakdown = [
    stats.attendanceBreakdown.present || 0,
    stats.attendanceBreakdown.late || 0,
    stats.attendanceBreakdown.remote || 0,
    stats.attendanceBreakdown.absent || 0,
  ];

  return (
    <div className="space-y-5">
      <div>
<h1 className="font-display text-2xl font-bold text-foreground">Welcome, {employee.name || employee.firstName || employee.employeeCode}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          <span className="inline-block mr-2">{moment().format('dddd, MMMM D, YYYY')}</span>
          <span className="inline-block text-muted-foreground/70">{moment().format('h:mm A')}</span>
        </p>
      </div>
{/* Attendance Card */}
      <Card className="p-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full ${todayAttendance && todayAttendance.checkIn ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
              {todayAttendance && todayAttendance.checkIn && !todayAttendance.checkOut ? (
                <LogoutIcon className="h-7 w-7" />
              ) : todayAttendance && todayAttendance.checkOut ? (
                <LogoutIcon className="h-7 w-7" />
              ) : (
                <LoginIcon className="h-7 w-7" />
              )}
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-foreground">
                {todayAttendance && todayAttendance.checkIn && !todayAttendance.checkOut
                  ? 'Active (Working)'
                  : todayAttendance && todayAttendance.checkOut
                  ? 'Checked Out'
                  : 'Not Punched In'}
              </p>
              <p className="text-sm text-muted-foreground">
                {todayAttendance && todayAttendance.checkIn
                  ? `Punch In ${moment(todayAttendance.checkIn, 'HH:mm:ss').format('h:mm A')}`
                  : moment().format('dddd, MMM D')}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 sm:items-end">
            <div className="flex gap-2">
              <Button
                variant="success"
                size="lg"
                disabled={punchLoading || (todayAttendance && todayAttendance.checkIn && !todayAttendance.checkOut) || Boolean(todayAttendance && todayAttendance.checkOut)}
                onClick={handlePunchIn}
              >
                {punchLoading ? <Spinner className="h-4 w-4" /> : 'Punch In'}
              </Button>
              <Button
                variant="danger"
                size="lg"
                disabled={punchLoading || !todayAttendance || !todayAttendance.checkIn || Boolean(todayAttendance && todayAttendance.checkOut)}
                onClick={handlePunchOut}
              >
                {punchLoading ? <Spinner className="h-4 w-4" /> : 'Punch Out'}
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>Date: <span className="font-medium text-foreground">{moment().format('YYYY-MM-DD')}</span></span>
              {todayAttendance && todayAttendance.checkIn && (
                <span>Punch In: <span className="font-medium text-foreground">{moment(todayAttendance.checkIn, 'HH:mm:ss').format('h:mm A')}</span></span>
              )}
              {todayAttendance && todayAttendance.checkOut && (
                <span>Punch Out: <span className="font-medium text-foreground">{moment(todayAttendance.checkOut, 'HH:mm:ss').format('h:mm A')}</span></span>
              )}
              {todayAttendance && todayAttendance.workingHours && (
                <span>Working Hours: <span className="font-medium text-foreground">{todayAttendance.workingHours}h</span></span>
              )}
              {todayAttendance && (
                <Badge variant={todayAttendance.status === 'ACTIVE' ? 'success' : todayAttendance.status === 'INACTIVE' ? 'muted' : 'primary'} className="capitalize">
                  {todayAttendance.status}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="cursor-pointer" onClick={() => window.location.hash = '/employee/leave'}>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Leave Requests</p>
            <p className="mt-2 font-display text-3xl font-bold">{stats.totalLeaves}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Pending Leave</p>
            <p className="mt-2 font-display text-3xl font-bold">{stats.pendingLeaves}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Attendance Records</p>
            <p className="mt-2 font-display text-3xl font-bold">{stats.attendanceRecords}</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Attendance Overview</CardTitle></CardHeader>
          <CardContent>
            <ChartJSDoughnut
              labels={['Present', 'Late', 'Remote', 'Absent']}
              data={attendanceBreakdown}
              height={240}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent Attendance</CardTitle>
            <Link to="/employee/profile">
              <Button variant="ghost" size="sm">View Profile</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {attendanceData.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-border pb-3 text-sm">
                <span>{item.date}</span>
                <span>{item.checkIn || '--'} – {item.checkOut || '--'}</span>
                <Badge variant={item.status === 'LATE' || item.status === 'late' ? 'warning' : item.status === 'ABSENT' || item.status === 'absent' ? 'danger' : 'success'} className="capitalize">
                  {item.status}
                </Badge>
              </div>
            ))}
            {attendanceData.length === 0 && (
              <p className="text-sm text-muted-foreground">No attendance records found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
