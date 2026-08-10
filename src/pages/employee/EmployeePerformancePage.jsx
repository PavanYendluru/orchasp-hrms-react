/** Employee-facing performance view. Employees can view only their own scores (read-only). */
import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { RadarChartCard } from '../../components/charts/Recharts';
import { api } from '../../services/api';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { toast } from 'sonner';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';

const sval = (v) => (v === null || v === undefined ? 0 : Number(v));

export function EmployeePerformancePage() {
  const { employee } = useEmployeeAuth();
  const empId = employee.employeeId ?? employee.id;
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setScores(await api.performance.forEmployee(empId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load your performance.');
    } finally {
      setLoading(false);
    }
  }, [empId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>;

  const latest = scores[0];
  const radarData = latest ? [
    { subject: 'Communication', value: sval(latest.communication) },
    { subject: 'Attendance', value: sval(latest.attendance) },
    { subject: 'Productivity', value: sval(latest.productivity) },
    { subject: 'Technical', value: sval(latest.technicalSkills) },
    { subject: 'Leadership', value: sval(latest.leadership) },
    { subject: 'Discipline', value: sval(latest.discipline) },
  ] : [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">My performance</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your performance scores, reviewed by HR. Read-only view.</p>
      </div>

      {!latest ? (
        <Card><CardContent><EmptyState icon={<InsightsOutlinedIcon className="h-6 w-6" />} title="No performance review yet" description="HR will publish your performance review here once available." /></CardContent></Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card><CardHeader><CardTitle>Latest Review Radar</CardTitle></CardHeader><CardContent><RadarChartCard data={radarData} /></CardContent></Card>
            <Card>
              <CardHeader><CardTitle>Latest Review</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[['Communication', latest.communication], ['Attendance', latest.attendance], ['Productivity', latest.productivity], ['Technical Skills', latest.technicalSkills], ['Leadership', latest.leadership], ['Discipline', latest.discipline]].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between border-b border-border pb-2 text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{sval(value)}/100</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 text-sm">
                  <span className="font-medium text-foreground">Overall Rating</span>
                  <Badge variant={sval(latest.overallRating) >= 85 ? 'success' : sval(latest.overallRating) >= 70 ? 'primary' : sval(latest.overallRating) >= 50 ? 'warning' : 'danger'}>{sval(latest.overallRating)}%</Badge>
                </div>
                {latest.reviewDate && <p className="pt-2 text-xs text-muted-foreground">Reviewed on {latest.reviewDate}</p>}
              </CardContent>
            </Card>
          </div>

          {scores.length > 1 && (
            <Card><CardHeader><CardTitle>Review History</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scores.map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                      <span className="text-muted-foreground">{s.reviewDate || '—'}</span>
                      <span className="font-medium text-foreground">{sval(s.overallRating)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
