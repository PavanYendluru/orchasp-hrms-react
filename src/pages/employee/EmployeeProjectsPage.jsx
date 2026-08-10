/** Employee-facing projects. Shows only projects assigned to/project-managed by the employee. */
import { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { api } from '../../services/api';
import { toast } from 'sonner';
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined';

const statusVariant = { PLANNING: 'warning', ACTIVE: 'success', 'ON-HOLD': 'muted', COMPLETED: 'primary', CANCELLED: 'danger' };

export function EmployeeProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProjects(await api.projects.mine());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load your projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">My projects</h1>
        <p className="mt-1 text-sm text-muted-foreground">Projects you are assigned to manage.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : projects.length === 0 ? (
        <Card><CardContent><EmptyState icon={<FolderSharedOutlinedIcon className="h-6 w-6" />} title="No projects assigned" description="Projects you manage will appear here." /></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {projects.map((p) => (
            <Card key={p.id}>
              <CardHeader className="flex-row items-start justify-between gap-2">
                <CardTitle>{p.name}</CardTitle>
                <Badge variant={statusVariant[p.status] || 'muted'} className="capitalize">{(p.status || '').toLowerCase().replace('-', ' ')}</Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {p.description && <p className="text-muted-foreground">{p.description}</p>}
                {p.technology && <p><span className="font-medium">Technology:</span> {p.technology}</p>}
                <p><span className="font-medium">Manager:</span> {p.projectManagerName || 'You'}</p>
                <p className="text-muted-foreground">{p.startDate ? moment(p.startDate).format('MMM D, YYYY') : '—'} – {p.endDate ? moment(p.endDate).format('MMM D, YYYY') : 'TBD'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
