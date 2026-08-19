/** HR task board backed by persisted task workflow states. */
import { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { api } from '../services/api';
import { toast } from 'sonner';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

const columns = [{ id: 'TODO', label: 'To Do' }, { id: 'IN_PROGRESS', label: 'In Progress' }, { id: 'REVIEW', label: 'Review' }, { id: 'DONE', label: 'Done' }];
const priorities = ['HIGH', 'MEDIUM', 'LOW'];
const priorityVariant = { HIGH: 'danger', MEDIUM: 'warning', LOW: 'muted' };
const initialForm = { title: '', description: '', priority: 'MEDIUM', dueDate: '', assignedToId: '' };

export function TasksPage() {
  const [tasks, setTasks] = useState([]); const [employees, setEmployees] = useState([]); const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false); const [saving, setSaving] = useState(false); const [form, setForm] = useState(initialForm);
  const load = useCallback(async () => { setLoading(true); try { const [taskData, employeeData] = await Promise.all([api.tasks.list(), api.employees.all()]); setTasks(taskData || []); setEmployees(employeeData || []); } catch (error) { toast.error(error?.response?.data?.message || 'Unable to load tasks.'); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const board = useMemo(() => Object.fromEntries(columns.map((column) => [column.id, tasks.filter((task) => task.status === column.id)])), [tasks]);
  const transition = async (task, status) => { try { await api.tasks.transition(task.id, status); toast.success(`Task moved to ${status.replace('_', ' ')}.`); await load(); } catch (error) { toast.error(error?.response?.data?.message || 'Task transition was rejected.'); } };
  const createTask = async (event) => { event.preventDefault(); if (!form.title.trim() || !form.priority || !form.dueDate || !form.assignedToId) return toast.error('Title, priority, due date, and assigned employee are required.'); if (form.dueDate < new Date().toISOString().slice(0, 10)) return toast.error('Due date cannot be in the past.'); setSaving(true); try { await api.tasks.create({ ...form, title: form.title.trim(), description: form.description.trim(), assignedToId: Number(form.assignedToId) }); toast.success('Task assigned successfully.'); setCreating(false); setForm(initialForm); await load(); } catch (error) { toast.error(error?.response?.data?.message || 'Unable to create task.'); } finally { setSaving(false); } };
  if (loading) return <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>;
  return <div className="space-y-5"><PageHeader title="Tasks" description="Assign work, monitor progress, and complete reviews" actions={<Button onClick={() => setCreating(true)}><AddOutlinedIcon className="h-4 w-4" /> Assign Task</Button>} />
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">{columns.map((column) => <Card key={column.id} className="min-h-48 p-3"><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-foreground">{column.label}</h3><Badge variant="muted">{board[column.id].length}</Badge></div><div className="space-y-3">{board[column.id].map((task) => <div key={task.id} className="rounded-lg border border-border p-3"><div className="flex justify-between gap-2"><p className="font-medium text-foreground">{task.title}</p><Badge variant={priorityVariant[task.priority] || 'muted'}>{task.priority}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{task.description || 'No description'}</p><p className="mt-3 text-xs text-muted-foreground">Assigned: {task.assignedToName}<br />Due: {task.dueDate ? moment(task.dueDate).format('DD MMM YYYY') : '—'}</p>{task.status === 'TODO' && task.acceptedAt && <Button className="mt-3 w-full" size="sm" onClick={() => transition(task, 'IN_PROGRESS')}>Move to In Progress</Button>}{task.status === 'IN_PROGRESS' && <Button className="mt-3 w-full" size="sm" onClick={() => transition(task, 'REVIEW')}>Move to Review</Button>}{task.status === 'REVIEW' && <Button className="mt-3 w-full" size="sm" onClick={() => transition(task, 'DONE')}>Complete Task</Button>}</div>)}{board[column.id].length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">No tasks</p>}</div></Card>)}</div>
    <Modal open={creating} onOpenChange={setCreating} title="Assign Task" description="The employee will see this task in their portal."><form onSubmit={createTask} className="space-y-4"><FormField label="Task Title"><input required maxLength="255" className="input-base" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></FormField><FormField label="Description"><textarea className="input-base min-h-24" maxLength="2000" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></FormField><div className="grid grid-cols-2 gap-4"><FormField label="Priority"><select required className="input-base" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>{priorities.map((priority) => <option key={priority} value={priority}>{priority[0] + priority.slice(1).toLowerCase()}</option>)}</select></FormField><FormField label="Due Date"><input required type="date" min={new Date().toISOString().slice(0, 10)} className="input-base" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></FormField></div><FormField label="Assigned Employee"><select required className="input-base" value={form.assignedToId} onChange={(event) => setForm({ ...form, assignedToId: event.target.value })}><option value="">Select employee</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName} {employee.employeeCode ? `(${employee.employeeCode})` : ''}</option>)}</select></FormField><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setCreating(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Assigning…' : 'Assign Task'}</Button></div></form></Modal>
  </div>;
}
