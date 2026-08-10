/** Employee-facing task board. Employees can accept tasks and move them to review. */
import { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { api } from '../../services/api';
import { toast } from 'sonner';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';

const priorityVariant = { HIGH: 'danger', MEDIUM: 'warning', LOW: 'muted' };
const statusVariant = { TODO: 'muted', IN_PROGRESS: 'primary', REVIEW: 'warning', DONE: 'success' };
const statusLabels = { TODO: 'To Do', IN_PROGRESS: 'In Progress', REVIEW: 'Review', DONE: 'Done' };

export function EmployeeTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTasks(await api.tasks.mine());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load your tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const move = async (task, target) => {
    try {
      await api.tasks.transition(task.id, target);
      toast.success(`Task moved to ${statusLabels[target]}.`);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update task.');
    }
  };

  const grouped = useMemo(() => {
    const map = { TODO: [], IN_PROGRESS: [], REVIEW: [], DONE: [] };
    tasks.forEach((t) => { if (map[t.status]) map[t.status].push(t); });
    return map;
  }, [tasks]);

  const renderTask = (task) => (
    <div key={task.id} className="rounded-lg border border-border bg-card p-3 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{task.title}</p>
        <Badge variant={priorityVariant[task.priority] || 'muted'} className="capitalize">{(task.priority || '').toLowerCase()}</Badge>
      </div>
      {task.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{task.description}</p>}
      <div className="mt-2 text-xs text-muted-foreground">Due {task.dueDate ? moment(task.dueDate).format('MMM D, YYYY') : '—'}</div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {task.status === 'TODO' && <Button size="sm" variant="success" onClick={() => move(task, 'IN_PROGRESS')}>Accept Task</Button>}
        {task.status === 'IN_PROGRESS' && <Button size="sm" variant="warning" onClick={() => move(task, 'REVIEW')}>Move to Review</Button>}
        {task.status === 'REVIEW' && <Badge variant="warning">Awaiting HR review</Badge>}
        {task.status === 'DONE' && <Badge variant="success">Completed</Badge>}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">My tasks</h1>
        <p className="mt-1 text-sm text-muted-foreground">Accept assigned tasks and track your workflow.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : tasks.length === 0 ? (
        <Card><CardContent><EmptyState icon={<TaskAltOutlinedIcon className="h-6 w-6" />} title="No tasks assigned" description="When HR assigns you a task, it will appear here." /></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Object.keys(grouped).map((status) => (
            <Card key={status}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-sm">{statusLabels[status]}</CardTitle>
                <Badge variant={statusVariant[status]}>{grouped[status].length}</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {grouped[status].map(renderTask)}
                {grouped[status].length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">No tasks</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
