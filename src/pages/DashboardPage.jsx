/** Combines operational HR metrics, activity, and draggable dashboard widgets. */
import { useMemo, useState  } from 'react';
import { DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
 } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy  } from '@dnd-kit/sortable';
import { CSS  } from '@dnd-kit/utilities';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { PageHeader  } from '../components/common/PageHeader';
import { StatCard  } from '../components/common/StatCard';
import { Card, CardHeader, CardTitle, CardContent  } from '../components/ui/Card';
import { Badge  } from '../components/ui/Badge';
import { Avatar  } from '../components/ui/Avatar';
import { Timeline  } from '../components/common/Timeline';
import { AreaChartCard, BarChartCard, PieChartCard, RadarChartCard  } from '../components/charts/Recharts';
import { ApexRadialChart, ApexHeatmapChart  } from '../components/charts/ApexCharts';
import { ChartJSLine  } from '../components/charts/ChartJS';
import { db  } from '../data/db';
import { formatCurrency, formatCompactNumber  } from '../lib/utils';
import moment from 'moment';

function SortableWidget({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

export function DashboardPage() {
  const [widgets, setWidgets] = useState(['growth', 'attendance', 'payroll', 'distribution']);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const stats = useMemo(() => ({
    totalEmployees: db.employees.length,
    active: db.employees.filter((e) => e.status === 'active').length,
    onLeave: db.employees.filter((e) => e.status === 'on-leave').length,
    pendingLeaves: db.leaves.filter((l) => l.status === 'pending').length,
    monthlyPayroll: db.payroll.filter((p) => p.month === '2025-06').reduce((s, p) => s + p.netSalary, 0),
    assignedAssets: db.assets.filter((a) => a.status === 'assigned').length,
  activeProjects: db.projects.filter((p) => p.status === 'active').length,
  departments: db.departments.length,
  birthdays: db.employees.filter((e) => {
    const m = moment(e.hireDate);
    return m.month() === moment().month();
  }),
    topPerformers: [...db.employees].sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 5),
  }), []);

  const growthData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((m, i) => ({
      month: m,
      employees: Math.round(40 + i * 2.5 + Math.random() * 4),
      attrition: Math.round(2 + Math.random() * 4),
    }));
  }, []);

  const attendanceData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    return days.map((d) => ({
      day: d,
      present: Math.round(40 + Math.random() * 15),
      late: Math.round(Math.random() * 8),
      remote: Math.round(5 + Math.random() * 10),
    }));
  }, []);

  const deptDistribution = useMemo(
    () => db.departments.map((d) => ({
      name: d.name,
      value: db.employees.filter((e) => e.departmentId === d.id).length,
    })),
    []
  );

  const radarData = useMemo(
    () => [
      { subject: 'Hiring', value: 78, fullMark: 100 },
      { subject: 'Retention', value: 85, fullMark: 100 },
      { subject: 'Engagement', value: 72, fullMark: 100 },
      { subject: 'Performance', value: 88, fullMark: 100 },
      { subject: 'Training', value: 65, fullMark: 100 },
      { subject: 'Diversity', value: 80, fullMark: 100 },
    ],
    []
  );

  const heatmapData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day) => ({
      name: day,
      data: ['9am', '11am', '1pm', '3pm', '5pm'].map((hour) => ({ x: hour, y: Math.round(Math.random() * 100) })),
    }));
  }, []);

  const payrollTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return {
      labels: months,
      datasets: [{ label: 'Net Payroll', data: months.map(() => Math.round(400000 + Math.random() * 80000)) }],
    };
  }, []);

  const timelineItems = useMemo(
    () => [
      { id: '1', title: 'New employee onboarded', description: 'Sophia Patel joined Engineering', time: '2h ago', color: 'success' },
      { id: '2', title: 'Leave request submitted', description: 'Liam Johnson applied for annual leave', time: '4h ago', color: 'primary' },
      { id: '3', title: 'Payroll processed', description: 'June payroll for 60 employees', time: '6h ago', color: 'success' },
      { id: '4', title: 'Asset returned', description: 'Laptop SN-48213 returned by Ava Martinez', time: '1d ago', color: 'warning' },
      { id: '5', title: 'Performance review scheduled', description: 'Q2 reviews start next week', time: '2d ago', color: 'secondary' },
    ],
    []
  );

  const handleDragEnd = (e) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const widgetMap = {
    growth: (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Employee Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <AreaChartCard data={growthData} xKey="month" series={[{ key: 'employees', name: 'Employees', color: '#2563eb' }, { key: 'attrition', name: 'Attrition', color: '#dc2626' }]} />
        </CardContent>
      </Card>
    ),
    attendance: (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChartCard data={attendanceData} xKey="day" series={[{ key: 'present', name: 'Present', color: '#16a34a' }, { key: 'late', name: 'Late', color: '#ea580c' }, { key: 'remote', name: 'Remote', color: '#2563eb' }]} />
        </CardContent>
      </Card>
    ),
    payroll: (
      <Card>
        <CardHeader>
          <CardTitle>Payroll Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartJSLine labels={payrollTrend.labels} datasets={payrollTrend.datasets} />
        </CardContent>
      </Card>
    ),
    distribution: (
      <Card>
        <CardHeader>
          <CardTitle>Department Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChartCard data={deptDistribution} />
        </CardContent>
      </Card>
    ),
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your organization's key metrics and activities" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard index={0} label="Total Employees" value={formatCompactNumber(stats.totalEmployees)} icon={<PeopleAltOutlinedIcon className="h-5 w-5" />} trend="up" trendLabel="8.2%" accent="primary" />
        <StatCard index={1} label="On Leave Today" value={stats.onLeave} icon={<EventAvailableOutlinedIcon className="h-5 w-5" />} trend="down" trendLabel="3.1%" accent="warning" />
        <StatCard index={2} label="Monthly Payroll" value={formatCurrency(stats.monthlyPayroll)} icon={<PaymentsOutlinedIcon className="h-5 w-5" />} trend="up" trendLabel="2.4%" accent="success" />
        <StatCard index={3} label="Assigned Assets" value={stats.assignedAssets} icon={<Inventory2OutlinedIcon className="h-5 w-5" />} trend="up" trendLabel="1.8%" accent="secondary" />
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Active Employees</p>
          <p className="mt-1 font-display text-xl font-bold text-foreground">{stats.active}</p>
          <Badge variant="success" className="mt-2">{Math.round((stats.active / stats.totalEmployees) * 100)}%</Badge>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Pending Leaves</p>
          <p className="mt-1 font-display text-xl font-bold text-foreground">{stats.pendingLeaves}</p>
          <Badge variant="warning" className="mt-2">Action needed</Badge>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Active Projects</p>
          <p className="mt-1 font-display text-xl font-bold text-foreground">{stats.activeProjects}</p>
          <Badge variant="primary" className="mt-2">In progress</Badge>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Departments</p>
          <p className="mt-1 font-display text-xl font-bold text-foreground">{stats.departments}</p>
          <Badge variant="secondary" className="mt-2">All active</Badge>
        </Card>
      </div>

      {/* Drag and drop widgets */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgets} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {widgets.map((w) => (
              <SortableWidget key={w} id={w}>
                <div className="group relative">
                  <div className="absolute -top-3 left-3 z-10 cursor-grab rounded-md border border-border bg-card px-1.5 py-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <DragIndicatorIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  {widgetMap[w]}
                </div>
              </SortableWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Analytics row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>HR Health Radar</CardTitle></CardHeader>
          <CardContent><RadarChartCard data={radarData} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Department Radial</CardTitle></CardHeader>
          <CardContent>
            <ApexRadialChart labels={['Engineering', 'Sales', 'Design']} series={[72, 58, 45]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Activity Heatmap</CardTitle></CardHeader>
          <CardContent><ApexHeatmapChart data={heatmapData} /></CardContent>
        </Card>
      </div>

      {/* Bottom row: timeline + birthdays + announcements */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
          <CardContent><Timeline items={timelineItems} /></CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CakeOutlinedIcon className="h-4 w-4 text-secondary" /> Upcoming Birthdays</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.birthdays.slice(0, 5).map((emp) => (
              <div key={emp.id} className="flex items-center gap-3">
                <Avatar name={`${emp.firstName} ${emp.lastName}`} size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{emp.firstName} {emp.lastName}</p>
                  <p className="text-xs text-muted-foreground">{emp.jobTitle}</p>
                </div>
                <Badge variant="secondary">{moment(emp.hireDate).format('MMM D')}</Badge>
              </div>
            ))}
            {stats.birthdays.length === 0 && <p className="text-sm text-muted-foreground">No birthdays this month.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUpOutlinedIcon className="h-4 w-4 text-success" /> Top Performers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.topPerformers.map((emp, i) => (
              <div key={emp.id} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                <Avatar name={`${emp.firstName} ${emp.lastName}`} size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{emp.firstName} {emp.lastName}</p>
                  <p className="text-xs text-muted-foreground">{emp.performanceScore}% performance</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Announcements */}
      <Card>
        <CardHeader><CardTitle>Latest Announcements</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {db.announcements.map((a) => (
            <div key={a.id} className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/40">
              <p className="text-sm font-semibold text-foreground">{a.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{a.body}</p>
              <p className="mt-2 text-[11px] text-muted-foreground/70">{a.author} · {moment(a.createdAt).fromNow()}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
