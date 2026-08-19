/** Presents database-driven organization metrics for HR users. */
import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState, ErrorState } from '../components/ui/EmptyState';
import { BarChartCard, PieChartCard } from '../components/charts/Recharts';
import { api } from '../services/api';

const titleCase = (value) => value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
function MetricCard({ title, metrics, type = 'bar' }) {
  const data = (metrics || []).filter((metric) => metric.value > 0).map((metric) => ({ ...metric, name: titleCase(metric.name) }));
  return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent>{data.length === 0 ? <EmptyState title="No data yet" description="This chart will update when records are available." className="py-6" /> : type === 'pie' ? <PieChartCard data={data} /> : <BarChartCard data={data} xKey="name" series={[{ key: 'value', name: 'Count', color: '#2563eb' }]} />}</CardContent></Card>;
}
export function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(false);
  const load = useCallback(async () => { setLoading(true); setError(false); try { setAnalytics(await api.dashboard.analytics()); } catch { setError(true); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  return <div className="space-y-5"><PageHeader title="Analytics" description="Live aggregates calculated from current HRMS records" actions={<Button variant="outline" onClick={load}>Refresh</Button>} />
    {loading ? <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div> : error ? <Card><CardContent><ErrorState title="Analytics unavailable" description="We could not load the latest analytics. Please try again." action={<Button onClick={load}>Retry</Button>} /></CardContent></Card> : <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><MetricCard title="Department Headcount" metrics={analytics?.departmentHeadcount} /><MetricCard title="Employee Status" metrics={analytics?.employeeStatus} type="pie" /><MetricCard title="Attendance Status" metrics={analytics?.attendanceStatus} /><MetricCard title="Leave Requests" metrics={analytics?.leaveStatus} type="pie" /><MetricCard title="Task Workflow" metrics={analytics?.taskStatus} /><Card><CardHeader><CardTitle>Data source</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Every chart is calculated by the backend from current employee, attendance, leave, department, and task records. Refresh this page after changes to see updated results.</p></CardContent></Card></div>}
  </div>;
}
