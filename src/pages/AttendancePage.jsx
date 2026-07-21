/** Tracks employee attendance records and daily punch-in activity. */
import { useMemo, useState  } from 'react';
import moment from 'moment';
import { PageHeader  } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent  } from '../components/ui/Card';
import { Badge  } from '../components/ui/Badge';
import { Button  } from '../components/ui/Button';
import { Avatar  } from '../components/ui/Avatar';
import { LineChartCard  } from '../components/charts/Recharts';
import { db  } from '../data/db';
import { toast  } from 'sonner';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

export function AttendancePage() {
  const [punched, setPunched] = useState(false);
  const [punchTime, setPunchTime] = useState(null);

  const today = moment().format('YYYY-MM-DD');
  const todayRecords = useMemo(
    () => db.attendance.filter((a) => a.date === today).slice(0, 10),
    [today]
  );

  const trend = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = moment().subtract(i, 'days').format('YYYY-MM-DD');
      const recs = db.attendance.filter((a) => a.date === d);
      days.push({
        date: moment(d).format('ddd'),
        present: recs.filter((r) => r.status === 'present').length,
        late: recs.filter((r) => r.status === 'late').length,
        absent: recs.filter((r) => r.status === 'absent').length,
      });
    }
    return days;
  }, []);

  const handlePunch = () => {
    if (!punched) {
      setPunched(true);
      setPunchTime(moment().format('h:mm A'));
      toast.success('Punched in successfully');
    } else {
      setPunched(false);
      toast.info('Punched out. Have a great day!');
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Attendance" description="Track daily attendance and punch in/out" />

      {/* Punch card */}
      <Card className="p-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full ${punched ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
              {punched ? <LogoutIcon className="h-7 w-7" /> : <LoginIcon className="h-7 w-7" />}
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-foreground">{punched ? 'Clocked In' : 'Not Clocked In'}</p>
              <p className="text-sm text-muted-foreground">{punched ? `Since ${punchTime}` : moment().format('dddd, MMM D')}</p>
            </div>
          </div>
          <Button variant={punched ? 'danger' : 'success'} size="lg" onClick={handlePunch}>
            {punched ? 'Punch Out' : 'Punch In'}
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Weekly Attendance Trend</CardTitle></CardHeader>
        <CardContent>
          <LineChartCard data={trend} xKey="date" series={[{ key: 'present', name: 'Present', color: '#16a34a' }, { key: 'late', name: 'Late', color: '#ea580c' }, { key: 'absent', name: 'Absent', color: '#dc2626' }]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Today's Attendance</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="py-2">Employee</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th></tr></thead>
              <tbody>
                {todayRecords.map((a) => {
                  const emp = db.employees.find((e) => e.id === a.employeeId);
                  if (!emp) return null;
                  return (
                    <tr key={a.id} className="border-b border-border">
                      <td className="py-2"><div className="flex items-center gap-2"><Avatar name={`${emp.firstName} ${emp.lastName}`} size="sm" /><span className="font-medium">{emp.firstName} {emp.lastName}</span></div></td>
                      <td>{a.checkIn || '—'}</td>
                      <td>{a.checkOut || '—'}</td>
                      <td>{a.workHours}h</td>
                      <td><Badge variant={a.status === 'present' ? 'success' : a.status === 'absent' ? 'danger' : a.status === 'late' ? 'warning' : 'primary'} className="capitalize">{a.status}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
