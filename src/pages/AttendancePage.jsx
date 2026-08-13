/** Tracks employee attendance records and daily punch-in activity. */
import { useEffect, useMemo, useState  } from 'react';
import moment from 'moment';
import { PageHeader  } from '../components/common/PageHeader';
import { ImportExcelButton } from '../components/common/ImportExcelButton';
import { Card, CardHeader, CardTitle, CardContent  } from '../components/ui/Card';
import { Badge  } from '../components/ui/Badge';
import { Button  } from '../components/ui/Button';
import { Avatar  } from '../components/ui/Avatar';
import { LineChartCard  } from '../components/charts/Recharts';
import { db  } from '../data/db';
import { Spinner  } from '../components/ui/Spinner';
import { api  } from '../services/api';
import { toast  } from 'sonner';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

export function AttendancePage() {
  const [punched, setPunched] = useState(false);
  const [punchTime, setPunchTime] = useState(null);
  const [todayRecords, setTodayRecords] = useState([]);
  const [loadingToday, setLoadingToday] = useState(true);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadToday() {
      setLoadingToday(true);
      try {
        const records = await api.attendance.today();
        if (isMounted) setTodayRecords(records || []);
      } catch (err) {
        console.error('Failed loading today attendance:', err);
        if (isMounted) toast.error('Could not load today\'s attendance.');
      } finally {
        if (isMounted) setLoadingToday(false);
      }
    }
    loadToday();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      setLoadingHistory(true);
      try {
        const records = await api.attendance.history();
        if (isMounted) setHistoryRecords(records || []);
      } catch (err) {
        console.error('Failed loading attendance history:', err);
        if (isMounted) toast.error('Could not load attendance history.');
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    }
    loadHistory();
    return () => { isMounted = false; };
  }, []);

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
      <PageHeader title="Attendance" description="Track daily attendance and punch in/out" actions={<ImportExcelButton module="attendance" onImported={() => window.location.reload()} />} />

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
          {loadingToday ? (
            <div className="flex items-center justify-center py-10">
              <Spinner className="h-6 w-6" />
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="py-2">Employee</th><th>Department</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th></tr></thead>
              <tbody>
                {todayRecords.map((a) => (
                  <tr key={a.id} className="border-b border-border">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <Avatar name={a.employeeName} size="sm" />
                        <div>
                          <span className="font-medium block">{a.employeeName}</span>
                          <span className="text-xs text-muted-foreground">ID: {a.employeeCode || a.employeeId}</span>
                        </div>
                      </div>
                    </td>
                    <td>{a.departmentName || 'N/A'}</td>
                    <td>{a.checkIn ? moment(a.checkIn, 'HH:mm:ss').format('hh:mm A') : '—'}</td>
                    <td>{a.checkOut ? moment(a.checkOut, 'HH:mm:ss').format('hh:mm A') : '—'}</td>
                    <td>{a.workingHours ? `${a.workingHours}h` : '—'}</td>
                    <td>
                      <Badge variant={a.status === 'ACTIVE' ? 'success' : a.status === 'INACTIVE' ? 'muted' : 'primary'} className="capitalize">
                        {a.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {todayRecords.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No attendance records for today yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Attendance History</CardTitle></CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="flex items-center justify-center py-10">
              <Spinner className="h-6 w-6" />
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="py-2">Date</th><th>Employee</th><th>Department</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th></tr></thead>
              <tbody>
                {historyRecords.slice(0, 10).map((a) => (
                  <tr key={a.id} className="border-b border-border">
                    <td className="py-2">{a.date}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <Avatar name={a.employeeName} size="sm" />
                        <div>
                          <span className="font-medium block">{a.employeeName}</span>
                          <span className="text-xs text-muted-foreground">ID: {a.employeeCode || a.employeeId}</span>
                        </div>
                      </div>
                    </td>
                    <td>{a.departmentName || 'N/A'}</td>
                    <td>{a.checkIn ? moment(a.checkIn, 'HH:mm:ss').format('hh:mm A') : '—'}</td>
                    <td>{a.checkOut ? moment(a.checkOut, 'HH:mm:ss').format('hh:mm A') : '—'}</td>
                    <td>{a.workingHours ? `${a.workingHours}h` : '—'}</td>
                    <td>
                      <Badge variant={a.status === 'ACTIVE' ? 'success' : a.status === 'INACTIVE' ? 'muted' : 'primary'} className="capitalize">
                        {a.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {historyRecords.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No attendance history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
