/** Summarizes employee reviews, scores, and performance trends. */
import { useMemo  } from 'react';
import { PageHeader  } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent  } from '../components/ui/Card';
import { Avatar  } from '../components/ui/Avatar';
import { Badge  } from '../components/ui/Badge';
import { RadarChartCard  } from '../components/charts/Recharts';
import { ChartJSBar  } from '../components/charts/ChartJS';
import { db  } from '../data/db';

export function PerformancePage() {
  const employees = useMemo(() => [...db.employees].sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 20), []);

  const radarData = [
    { subject: 'Quality', value: 85, fullMark: 100 },
    { subject: 'Speed', value: 72, fullMark: 100 },
    { subject: 'Teamwork', value: 88, fullMark: 100 },
    { subject: 'Leadership', value: 65, fullMark: 100 },
    { subject: 'Innovation', value: 78, fullMark: 100 },
    { subject: 'Reliability', value: 92, fullMark: 100 },
  ];

  const barData = {
    labels: employees.slice(0, 8).map((e) => e.firstName),
    datasets: [{ label: 'Performance Score', data: employees.slice(0, 8).map((e) => e.performanceScore) }],
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Performance" description="Employee performance reviews and analytics" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Team Performance Radar</CardTitle></CardHeader><CardContent><RadarChartCard data={radarData} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Top Performers</CardTitle></CardHeader><CardContent><ChartJSBar labels={barData.labels} datasets={barData.datasets} /></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Performance Leaderboard</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {employees.map((emp, i) => (
              <div key={emp.id} className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/40">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i < 3 ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'}`}>{i + 1}</span>
                <Avatar name={`${emp.firstName} ${emp.lastName}`} size="sm" />
                <div className="flex-1"><p className="text-sm font-medium text-foreground">{emp.firstName} {emp.lastName}</p><p className="text-xs text-muted-foreground">{emp.jobTitle}</p></div>
                <div className="w-32"><div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${emp.performanceScore}%` }} /></div></div>
                <Badge variant={emp.performanceScore >= 85 ? 'success' : emp.performanceScore >= 70 ? 'primary' : 'warning'}>{emp.performanceScore}%</Badge>
             </div>
           ))}
          </div>
       </CardContent>
      </Card>
    </div>
  );
}
