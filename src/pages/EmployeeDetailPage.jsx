/** Shows an individual employee's profile, history, and related records. */
import { useMemo, useState  } from 'react';
import { useParams, useNavigate, Link  } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import moment from 'moment';
import { db  } from '../data/db';
import { Avatar  } from '../components/ui/Avatar';
import { Badge  } from '../components/ui/Badge';
import { Button  } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent  } from '../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent  } from '../components/ui/Tabs';
import { Timeline  } from '../components/common/Timeline';
import { AreaChartCard, RadarChartCard  } from '../components/charts/Recharts';
import { EmptyState  } from '../components/ui/EmptyState';
const statusVariant = {
  active: 'success',
  'on-leave': 'warning',
  inactive: 'muted',
  terminated: 'danger',
};

export function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const employee = useMemo(() => db.employees.find((e) => e.id === id), [id]);
  const department = useMemo(() => db.departments.find((d) => d.id === employee?.departmentId), [employee]);
  const attendance = useMemo(() => db.attendance.filter((a) => a.employeeId === id), [id]);
  const leaves = useMemo(() => db.leaves.filter((l) => l.employeeId === id), [id]);
  const payroll = useMemo(() => db.payroll.filter((p) => p.employeeId === id), [id]);
  const assets = useMemo(() => db.assets.filter((a) => a.assignedToId === id), [id]);
  const projects = useMemo(() => db.projects.filter((p) => employee && p.memberIds.includes(employee.id)), [employee]);
  const tasks = useMemo(() => db.tasks.filter((t) => t.assigneeId === id), [id]);

  if (!employee) {
    return (
      <EmptyState
        title="Employee not found"
        description="The employee you're looking for doesn't exist."
        action={<Button onClick={() => navigate('/employees')}>Back to Employees</Button>}
      />
    );
  }

  const performanceData = [
    { subject: 'Quality', value: employee.performanceScore, fullMark: 100 },
    { subject: 'Speed', value: Math.max(50, employee.performanceScore - 10), fullMark: 100 },
    { subject: 'Teamwork', value: Math.max(60, employee.performanceScore - 5), fullMark: 100 },
    { subject: 'Leadership', value: Math.max(55, employee.performanceScore - 15), fullMark: 100 },
    { subject: 'Innovation', value: Math.max(65, employee.performanceScore - 8), fullMark: 100 },
    { subject: 'Reliability', value: Math.max(70, employee.performanceScore - 3), fullMark: 100 },
  ];

  const attendanceTrend = attendance.slice(0, 14).reverse().map((a) => ({
    date: moment(a.date).format('DD'),
    hours: a.workHours,
  }));

  const timelineItems = [
    { id: '1', title: 'Joined the company', description: `${employee.jobTitle} · ${department?.name}`, time: moment(employee.hireDate).format('MMM YYYY'), color: 'success' },
    { id: '2', title: 'First performance review', description: 'Rating: Exceeds expectations', time: '6 months ago', color: 'primary' },
    { id: '3', title: 'Promoted', description: `Promoted to ${employee.jobTitle}`, time: '1 year ago', color: 'secondary' },
    { id: '4', title: 'Skills updated', description: employee.skills.slice(0, 3).join(', '), time: '3 months ago', color: 'primary' },
  ];

  return (
    <div className="space-y-5">
      <Link to="/employees" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowBackIcon className="h-4 w-4" /> Back to Employees
      </Link>

      {/* Header card */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar name={`${employee.firstName} ${employee.lastName}`} size="xl" />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold text-foreground">{employee.firstName} {employee.lastName}</h1>
              <Badge variant={statusVariant[employee.status]} className="capitalize">{employee.status.replace('-', ' ')}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{employee.jobTitle} · {department?.name}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MailOutlineOutlinedIcon className="h-4 w-4" /> {employee.email}</span>
              <span className="flex items-center gap-1"><PhoneOutlinedIcon className="h-4 w-4" /> {employee.phone}</span>
              <span className="flex items-center gap-1"><LocationOnOutlinedIcon className="h-4 w-4" /> {employee.location}</span>
              <span className="flex items-center gap-1"><BusinessOutlinedIcon className="h-4 w-4" /> {department?.name}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Edit</Button>
            <Button>Message</Button>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="salary">Salary</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle>Personal Info</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Employee ID</span><span className="font-medium">{employee.id}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Employment Type</span><span className="font-medium capitalize">{employee.employmentType.replace('-', ' ')}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Hire Date</span><span className="font-medium">{moment(employee.hireDate).format('MMM D, YYYY')}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tenure</span><span className="font-medium">{moment(employee.hireDate).fromNow(true)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span className="font-medium">{employee.location}</span></div>
            </CardContent></Card>
            <Card><CardHeader><CardTitle>Documents</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
              {['Employment Contract', 'ID Verification', 'Tax Form W-4', 'Emergency Contact'].map((doc) => (
                <div key={doc} className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/40">
                  <span className="text-foreground">{doc}</span>
                  <Badge variant="success">Verified</Badge>
                </div>
              ))}
            </CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <Card><CardHeader><CardTitle>Employee Timeline</CardTitle></CardHeader><CardContent><Timeline items={timelineItems} /></CardContent></Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card><CardHeader><CardTitle>Skills & Expertise</CardTitle></CardHeader><CardContent>
            <div className="flex flex-wrap gap-2">
              {employee.skills.map((s) => (
                <Badge key={s} variant="primary" className="text-sm">{s}</Badge>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              {employee.skills.slice(0, 5).map((s, i) => (
                <div key={s}>
                  <div className="flex justify-between text-sm"><span className="font-medium text-foreground">{s}</span><span className="text-muted-foreground">{75 + i * 4}%</span></div>
                  <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${75 + i * 4}%` }} /></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle>Performance Radar</CardTitle></CardHeader><CardContent><RadarChartCard data={performanceData} /></CardContent></Card>
            <Card><CardHeader><CardTitle>Score Summary</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Overall Score</span><span className="font-display text-2xl font-bold text-primary">{employee.performanceScore}%</span></div>
              <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${employee.performanceScore}%` }} /></div>
              <p className="mt-3 text-xs text-muted-foreground">Last reviewed: {moment().subtract(2, 'months').format('MMM YYYY')}</p>
            </CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <Card><CardHeader><CardTitle>Recent Attendance</CardTitle></CardHeader><CardContent>
            <AreaChartCard data={attendanceTrend} xKey="date" series={[{ key: 'hours', name: 'Work Hours', color: '#2563eb' }]} height={200} />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="py-2">Date</th><th>Check In</th><th>Check Out</th><th>Status</th></tr></thead>
                <tbody>
                  {attendance.slice(0, 7).map((a) => (
                    <tr key={a.id} className="border-b border-border">
                      <td className="py-2">{moment(a.date).format('MMM D')}</td>
                      <td>{a.checkIn || '—'}</td>
                      <td>{a.checkOut || '—'}</td>
                      <td><Badge variant={a.status === 'present' ? 'success' : a.status === 'absent' ? 'danger' : 'warning'} className="capitalize">{a.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="salary">
          <Card><CardHeader><CardTitle>Salary & Payroll History</CardTitle></CardHeader><CardContent>
            <div className="mb-4 flex items-center justify-between rounded-lg bg-muted/40 p-4">
              <div><p className="text-xs text-muted-foreground">Current Base Salary</p><p className="font-display text-2xl font-bold text-foreground">${employee.salary.toLocaleString()}</p></div>
              <Badge variant="success">Annual</Badge>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="py-2">Month</th><th>Base</th><th>Bonus</th><th>Deductions</th><th>Net</th><th>Status</th></tr></thead>
              <tbody>
                {payroll.map((p) => (
                  <tr key={p.id} className="border-b border-border">
                    <td className="py-2">{moment(p.month + '-01').format('MMM YYYY')}</td>
                    <td>${p.baseSalary.toLocaleString()}</td>
                    <td>${p.bonus.toLocaleString()}</td>
                    <td>${p.deductions.toLocaleString()}</td>
                    <td className="font-medium">${p.netSalary.toLocaleString()}</td>
                    <td><Badge variant={p.status === 'paid' ? 'success' : p.status === 'processed' ? 'primary' : 'warning'} className="capitalize">{p.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="assets">
          <Card><CardHeader><CardTitle>Assigned Assets</CardTitle></CardHeader><CardContent>
            {assets.length === 0 ? <EmptyState title="No assets assigned" /> : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{assets.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div><p className="text-sm font-medium text-foreground">{a.name}</p><p className="text-xs text-muted-foreground">{a.serial}</p></div>
                    <Badge variant="primary">${a.value.toLocaleString()}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="leave">
          <Card><CardHeader><CardTitle>Leave History</CardTitle></CardHeader><CardContent>
            {leaves.length === 0 ? <EmptyState title="No leave records" /> : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="py-2">Type</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
                <tbody>
                  {leaves.map((l) => (
                    <tr key={l.id} className="border-b border-border">
                      <td className="py-2 capitalize">{l.type}</td>
                      <td>{moment(l.startDate).format('MMM D')}</td>
                      <td>{moment(l.endDate).format('MMM D')}</td>
                      <td><Badge variant={l.status === 'approved' ? 'success' : l.status === 'rejected' ? 'danger' : l.status === 'pending' ? 'warning' : 'muted'} className="capitalize">{l.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card><CardHeader><CardTitle>Projects</CardTitle></CardHeader><CardContent>
            {projects.length === 0 ? <EmptyState title="No projects assigned" /> : (
              <div className="space-y-3">
                {projects.map((p) => (
                  <div key={p.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{p.name}</p>
                      <Badge variant={p.status === 'active' ? 'success' : p.status === 'completed' ? 'primary' : 'muted'} className="capitalize">{p.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
                    <div className="mt-3 h-1.5 rounded-full bg-muted"><div className="h-1.5 rounded-full bg-primary" style={{ width: `${p.progress}%` }} /></div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
