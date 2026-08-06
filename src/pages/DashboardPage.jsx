/** Combines operational HR metrics, activity, and draggable dashboard widgets with live data. */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Timeline } from '../components/common/Timeline';
import { Spinner } from '../components/ui/Spinner';
import { formatCurrency, formatCompactNumber } from '../lib/utils';
import { api } from '../services/api';
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
  const navigate = useNavigate();
  const [widgets, setWidgets] = useState(['stats', 'activities', 'birthdays']);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [currentTime, setCurrentTime] = useState(moment());
  const [hrDashboard, setHrDashboard] = useState(null);
  const [birthdays, setBirthdays] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(moment()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      setLoading(true);
      setError(null);
      try {
        const [hrData, bdays, acts] = await Promise.all([
          api.dashboard.hr(),
          api.dashboard.birthdays(),
          api.dashboard.activities(),
        ]);
        if (isMounted) {
          setHrDashboard(hrData);
          setBirthdays(bdays || []);
          setActivities(acts || []);
        }
      } catch (err) {
        console.error('Failed loading dashboard data:', err);
        setError('Failed to load dashboard data. Please ensure the backend server is running.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDashboardData();
    return () => { isMounted = false; };
  }, []);

  const stats = useMemo(() => ({
    totalEmployees: hrDashboard?.totalEmployees ?? 0,
    active: hrDashboard?.activeEmployees ?? 0,
    present: hrDashboard?.presentEmployees ?? 0,
    absent: hrDashboard?.absentEmployees ?? 0,
    onLeave: hrDashboard?.onLeave ?? 0,
    pendingLeaves: hrDashboard?.pendingLeaves ?? 0,
    approvedLeaves: hrDashboard?.approvedLeaves ?? 0,
    rejectedLeaves: hrDashboard?.rejectedLeaves ?? 0,
    monthlyPayroll: hrDashboard?.monthlyPayroll ?? 0,
    assignedAssets: hrDashboard?.assignedAssets ?? 0,
    departments: hrDashboard?.totalDepartments ?? 0,
    totalAssets: hrDashboard?.totalAssets ?? 0,
    activeProjects: hrDashboard?.activeProjects ?? 0,
  }), [hrDashboard]);

  const timelineItems = useMemo(() =>
    activities.map((a) => ({
      id: String(a.id),
      title: a.description || a.activityType,
      description: `${a.employeeName} - ${a.activityType.replace(/_/g, ' ')}`,
      time: moment(a.createdAt).fromNow(),
      color: 'primary',
    })),
  [activities]);

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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Overview of your organization's key metrics and activities" />
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-danger">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const widgetMap = {
    stats: (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Live Date & Time</CardTitle>
        </CardHeader>
        <CardContent>
  <div className="grid grid-cols-2 gap-4">
    <div className="rounded-lg bg-muted/30 p-4 text-center">
      ...
    </div>

    <div className="rounded-lg bg-muted/30 p-4 text-center">
      ...
    </div>
  </div>
</CardContent>
      </Card>
    ),
    activities: (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {timelineItems.length > 0 ? (
            <Timeline items={timelineItems} />
          ) : (
            <p className="text-sm text-muted-foreground">No recent activities.</p>
          )}
        </CardContent>
      </Card>
    ),
    birthdays: (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CakeOutlinedIcon className="h-4 w-4 text-secondary" /> Upcoming Birthdays
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {birthdays.length > 0 ? birthdays.slice(0, 5).map((emp) => (
            <div key={emp.id} className="flex items-center gap-3">
              <Avatar
                name={`${emp.firstName} ${emp.lastName}`}
                src={emp.profilePicture}
                size="sm"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{emp.firstName} {emp.lastName}</p>
                <p className="text-xs text-muted-foreground">{emp.departmentName}{emp.jobTitle ? ` · ${emp.jobTitle}` : ''}</p>
              </div>
              <Badge variant="secondary">{moment(emp.dateOfBirth).format('MMM D')}</Badge>
              <Badge variant="primary">{emp.daysRemaining > 0 ? `${emp.daysRemaining}d` : 'Today!'}</Badge>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground">No upcoming birthdays.</p>
          )}
        </CardContent>
      </Card>
    ),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your organization's key metrics and activities"
        actions={
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{currentTime.format('dddd, MMMM D, YYYY')}</p>
            <p className="text-xs text-muted-foreground">{currentTime.format('h:mm:ss A')}</p>
          </div>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button type="button" onClick={() => navigate('/employees')} className="text-left">
          <StatCard label="Total Employees" value={formatCompactNumber(stats.totalEmployees)} icon={<PeopleAltOutlinedIcon className="h-5 w-5" />} trend={stats.active > 0 ? 'up' : 'neutral'} trendLabel={`${stats.active} active`} accent="primary" />
        </button>
        <button type="button" onClick={() => navigate('/attendance')} className="text-left">
          <StatCard label="Present Today" value={stats.present} icon={<HowToRegOutlinedIcon className="h-5 w-5" />} trend="up" trendLabel={`${stats.absent} absent`} accent="success" />
        </button>
        <button type="button" onClick={() => navigate('/leave')} className="text-left">
          <StatCard label="On Leave" value={stats.onLeave} icon={<EventAvailableOutlinedIcon className="h-5 w-5" />} trend="down" trendLabel={`${stats.pendingLeaves} pending`} accent="warning" />
        </button>
        <button type="button" onClick={() => navigate('/payroll')} className="text-left">
          <StatCard label="Monthly Payroll" value={formatCurrency(stats.monthlyPayroll)} icon={<PaymentsOutlinedIcon className="h-5 w-5" />} trend="up" trendLabel="Live" accent="success" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Approved Leaves</p>
          <p className="mt-1 font-display text-xl font-bold text-foreground">{stats.approvedLeaves}</p>
          <Badge variant="success" className="mt-2">Approved</Badge>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Rejected Leaves</p>
          <p className="mt-1 font-display text-xl font-bold text-foreground">{stats.rejectedLeaves}</p>
          <Badge variant="danger" className="mt-2">Rejected</Badge>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Total Assets</p>
          <p className="mt-1 font-display text-xl font-bold text-foreground">{stats.totalAssets}</p>
          <Badge variant="secondary" className="mt-2">{stats.assignedAssets} assigned</Badge>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Departments</p>
          <p className="mt-1 font-display text-xl font-bold text-foreground">{stats.departments}</p>
          <Badge variant="secondary" className="mt-2">Active</Badge>
        </Card>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgets} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
    </div>
  );
}
