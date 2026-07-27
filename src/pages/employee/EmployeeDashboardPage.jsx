import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { db } from '../../data/db';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { ChartJSDoughnut } from '../../components/charts/ChartJS';

export function EmployeeDashboardPage() {
  const { employee } = useEmployeeAuth();
  const data = useMemo(() => ({
    leaves: db.leaves.filter((leave) => leave.employeeId === employee.id),
    attendance: db.attendance.filter((entry) => entry.employeeId === employee.id),
    announcements: db.announcements.slice(0, 3),
  }), [employee.id]);
  const pending = data.leaves.filter((leave) => leave.status === 'pending').length;
  const recentAttendance = data.attendance.slice(0, 5);
  const attendanceBreakdown = ['present', 'late', 'remote', 'absent'].map((status) => data.attendance.filter((item) => item.status === status).length);

  return <div className="space-y-5">
    <div><h1 className="font-display text-2xl font-bold text-foreground">Welcome, {employee.firstName}</h1><p className="mt-1 text-sm text-muted-foreground">Here is a snapshot of your work information.</p></div>
    <div className="grid gap-4 sm:grid-cols-3">
      <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Leave requests</p><p className="mt-2 font-display text-3xl font-bold">{data.leaves.length}</p></CardContent></Card>
      <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Pending leave</p><p className="mt-2 font-display text-3xl font-bold">{pending}</p></CardContent></Card>
      <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Attendance records</p><p className="mt-2 font-display text-3xl font-bold">{data.attendance.length}</p></CardContent></Card>
    </div>
    <div className="grid gap-5 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>Attendance overview</CardTitle></CardHeader><CardContent><ChartJSDoughnut labels={['Present', 'Late', 'Remote', 'Absent']} data={attendanceBreakdown} height={240} /></CardContent></Card>
      <Card><CardHeader className="flex-row items-center justify-between"><CardTitle>Recent attendance</CardTitle><Link to="/employee/profile"><Button variant="ghost" size="sm">View profile</Button></Link></CardHeader><CardContent className="space-y-3">{recentAttendance.map((item) => <div key={item.id} className="flex items-center justify-between border-b border-border pb-3 text-sm"><span>{item.date}</span><span>{item.checkIn} – {item.checkOut}</span><Badge variant={item.status === 'late' ? 'warning' : 'success'} className="capitalize">{item.status}</Badge></div>)}</CardContent></Card>
      <Card><CardHeader className="flex-row items-center justify-between"><CardTitle>Latest announcements</CardTitle><Link to="/employee/leave"><Button size="sm">Apply for leave</Button></Link></CardHeader><CardContent className="space-y-4">{data.announcements.map((item) => <div key={item.id}><p className="font-medium text-foreground">{item.title}</p><p className="mt-1 text-sm text-muted-foreground">{item.body}</p></div>)}</CardContent></Card>
    </div>
  </div>;
}
