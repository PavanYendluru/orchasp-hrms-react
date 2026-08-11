/** HR task board backed by persisted task workflow states. */
import { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { api } from '../services/api';
import { toast } from 'sonner';

const columns = [{ id: 'TODO', label: 'To Do' }, { id: 'IN_PROGRESS', label: 'In Progress' }, { id: 'REVIEW', label: 'Review' }, { id: 'DONE', label: 'Done' }];
const priorityVariant = { HIGH: 'danger', MEDIUM: 'warning', LOW: 'muted' };

export function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try { setTasks(await api.tasks.list()); } catch (error) { toast.error(error?.response?.data?.message || 'Unable to load tasks.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const board = useMemo(() => Object.fromEntries(columns.map((column) => [column.id, tasks.filter((task) => task.status === column.id)])), [tasks]);
  const transition = async (task, status) => {
    try { await api.tasks.transition(task.id, status); toast.success(`Task moved to ${status.replace('_', ' ')}.`); load(); }
    catch (error) { toast.error(error?.response?.data?.message || 'Task transition was rejected.'); }
  };
  if (loading) return <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>;
  return <div className="space-y-5"><PageHeader title="Tasks" description="Persisted task workflow and review queue" />
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">{columns.map((column) => <Card key={column.id} className="min-h-48 p-3"><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-foreground">{column.label}</h3><Badge variant="muted">{board[column.id].length}</Badge></div><div className="space-y-3">{board[column.id].map((task) => <div key={task.id} className="rounded-lg border border-border p-3"><div className="flex justify-between gap-2"><p className="font-medium text-foreground">{task.title}</p><Badge variant={priorityVariant[task.priority] || 'muted'}>{task.priority}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{task.description || 'No description'}</p><p className="mt-3 text-xs text-muted-foreground">Assigned: {task.assignedToName}<br />Due: {task.dueDate ? moment(task.dueDate).format('DD MMM YYYY') : '—'}</p>{task.status === 'TODO' && task.acceptedAt && <Button className="mt-3 w-full" size="sm" onClick={() => transition(task, 'IN_PROGRESS')}>Move to In Progress</Button>}{task.status === 'IN_PROGRESS' && <Button className="mt-3 w-full" size="sm" onClick={() => transition(task, 'REVIEW')}>Move to Review</Button>}{task.status === 'REVIEW' && <Button className="mt-3 w-full" size="sm" onClick={() => transition(task, 'DONE')}>Done</Button>}</div>)}{board[column.id].length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">No tasks</p>}</div></Card>)}</div>
  </div>;
}
