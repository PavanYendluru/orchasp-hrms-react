import { useMemo  } from 'react';
import { PageHeader  } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent  } from '../components/ui/Card';
import { AreaChartCard, BarChartCard, PieChartCard, RadarChartCard, LineChartCard  } from '../components/charts/Recharts';
import { ApexRadialChart, ApexHeatmapChart, ApexBarChart  } from '../components/charts/ApexCharts';
import { ChartJSLine, ChartJSDoughnut  } from '../components/charts/ChartJS';
import { db  } from '../data/db';

export function AnalyticsPage() {
  const growthData = useMemo(() => {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((m, i) => ({
      month: m, entries: Math.round(Math.random() * 10), exits: Math.round(Math.random() * 5), net: Math.round(3 + i * 0.5),
    }));
  }, []);

  const deptData = useMemo(() => db.departments.map((d) => ({
    name: d.name, value: db.employees.filter((e) => e.departmentId === d.id).length,
  })), []);

  const radarData = [
    { subject: 'Hiring', value: 78, fullMark: 100 }, { subject: 'Retention', value: 85, fullMark: 100 },
    { subject: 'Engagement', value: 72, fullMark: 100 }, { subject: 'Performance', value: 88, fullMark: 100 },
    { subject: 'Training', value: 65, fullMark: 100 }, { subject: 'Diversity', value: 80, fullMark: 100 },
  ];

  const heatmapData = useMemo(() => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
    name, data: ['9am', '11am', '1pm', '3pm', '5pm'].map((h) => ({ x: h, y: Math.round(Math.random() * 100) })),
  })), []);

  const attendanceTrend = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'].map((w) => ({
    week: w, present: Math.round(70 + Math.random() * 15), remote: Math.round(15 + Math.random() * 10),
  }));

  return (
    <div className="space-y-5">
      <PageHeader title="Analytics" description="Interactive analytics dashboard with multiple chart types" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Revenue Growth (Area)</CardTitle></CardHeader><CardContent><AreaChartCard data={growthData} xKey="month" series={[{ key: 'hires', name: 'Hires', color: '#16a34a' }, { key: 'exits', name: 'Exits', color: '#dc2626' }, { key: 'net', name: 'Net', color: '#2563eb' }]} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Attendance Trend (Line)</CardTitle></CardHeader><CardContent><LineChartCard data={attendanceTrend} xKey="week" series={[{ key: 'present', name: 'Present', color: '#16a34a' }, { key: 'remote', name: 'Remote', color: '#7c3aed' }]} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Department Headcount (Bar)</CardTitle></CardHeader><CardContent><BarChartCard data={deptData.map((d) => ({ name: d.name.slice(0, 6), value: d.value }))} xKey="name" series={[{ key: 'value', name: 'Employees', color: '#2563eb' }]} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Department Distribution (Pie)</CardTitle></CardHeader><CardContent><PieChartCard data={deptData} /></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card><CardHeader><CardTitle>HR Health (Radar)</CardTitle></CardHeader><CardContent><RadarChartCard data={radarData} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Department Radial</CardTitle></CardHeader><CardContent><ApexRadialChart labels={['Eng', 'Sales', 'HR']} series={[72, 58, 45]} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Activity Heatmap</CardTitle></CardHeader><CardContent><ApexHeatmapChart data={heatmapData} /></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Monthly Attendance (Chart.js)</CardTitle></CardHeader><CardContent><ChartJSLine labels={attendanceTrend.map((a) => a.week)} datasets={[{ label: 'Present', data: attendanceTrend.map((a) => a.present) }, { label: 'Remote', data: attendanceTrend.map((a) => a.remote) }]} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Status Breakdown (Doughnut)</CardTitle></CardHeader><CardContent><ChartJSDoughnut labels={['Active', 'On Leave', 'Inactive']} data={[db.employees.filter((e) => e.status === 'active').length, db.employees.filter((e) => e.status === 'on-leave').length, db.employees.filter((e) => e.status === 'inactive').length]} /></CardContent></Card>
      </div>

      <Card><CardHeader><CardTitle>Performance by Department (Apex Bar)</CardTitle></CardHeader><CardContent><ApexBarChart categories={db.departments.map((d) => d.name.slice(0, 6))} data={[{ name: 'Avg Score', data: db.departments.map(() => Math.round(70 + Math.random() * 25)) }]} /></CardContent></Card>
    </div>
  );
}
