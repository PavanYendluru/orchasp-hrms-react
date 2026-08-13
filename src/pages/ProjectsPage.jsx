/** Displays the Orchasp project portfolio (backend-driven). HR can create, edit, and delete projects. */
import { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { PageHeader } from '../components/common/PageHeader';
import { ImportExcelButton } from '../components/common/ImportExcelButton';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { api } from '../services/api';
import { toast } from 'sonner';
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

const statusVariant = {
  PLANNING: 'warning',
  ACTIVE: 'success',
  'ON-HOLD': 'muted',
  COMPLETED: 'primary',
  CANCELLED: 'danger',
};

const initialForm = {
  name: '',
  description: '',
  technology: '',
  status: 'PLANNING',
  startDate: '',
  endDate: '',
  projectManagerId: '',
};

export function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [projectData, employeeData] = await Promise.all([api.projects.list(), api.employees.all()]);
      setProjects(projectData || []);
      setEmployees(employeeData || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (project) => {
    setEditing(project);
    setForm({
      name: project.name || '',
      description: project.description || '',
      technology: project.technology || '',
      status: project.status || 'PLANNING',
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      projectManagerId: project.projectManagerId ? String(project.projectManagerId) : '',
    });
    setModalOpen(true);
  };

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.description.trim()) return toast.error('Project name and description are required.');
    if (form.endDate && form.startDate && form.endDate < form.startDate) return toast.error('End date must be on or after the start date.');
    setSaving(true);
    try {
      const payload = { ...form, projectManagerId: form.projectManagerId ? Number(form.projectManagerId) : null };
      if (editing) {
        await api.projects.update(editing.id, payload);
        toast.success('Project updated.');
      } else {
        await api.projects.create(payload);
        toast.success('Project created.');
      }
      setModalOpen(false);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save project.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (project) => {
    if (!window.confirm(`Delete project "${project.name}"?`)) return;
    try {
      await api.projects.remove(project.id);
      toast.success('Project deleted.');
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete project.');
    }
  };

  const stats = useMemo(() => ({
    total: projects.length,
    active: projects.filter((p) => p.status === 'ACTIVE').length,
    planning: projects.filter((p) => p.status === 'PLANNING').length,
    completed: projects.filter((p) => p.status === 'COMPLETED').length,
  }), [projects]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Projects"
        description="Manage the Orchasp company portfolio and initiatives"
        actions={<><ImportExcelButton module="projects" onImported={() => window.location.reload()} /><Button onClick={openCreate}><AddOutlinedIcon className="h-4 w-4" /> New Project</Button></>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Projects</p>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="mt-1 font-display text-2xl font-bold text-success">{stats.active}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Planning</p>
          <p className="mt-1 font-display text-2xl font-bold text-warning">{stats.planning}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="mt-1 font-display text-2xl font-bold text-primary">{stats.completed}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : projects.length === 0 ? (
        <Card><CardContent><EmptyState icon={<FolderSharedOutlinedIcon className="h-6 w-6" />} title="No projects yet" description="Create your first project to start building the Orchasp portfolio." action={<Button onClick={openCreate}><AddOutlinedIcon className="h-4 w-4" /> New Project</Button>} /></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-display text-base font-semibold text-foreground">{p.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                </div>
                <Badge variant={statusVariant[p.status] || 'muted'} className="capitalize">{(p.status || '').toLowerCase().replace('-', ' ')}</Badge>
              </div>
              {p.technology && <p className="mt-3 text-xs text-muted-foreground"><span className="font-medium text-foreground">Tech:</span> {p.technology}</p>}
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
                <div className="flex items-center gap-2">
                  {p.projectManagerName ? (
                    <>
                      <Avatar name={p.projectManagerName} size="xs" />
                      <span className="text-muted-foreground">{p.projectManagerName}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">No manager assigned</span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-muted-foreground">Timeline</p>
                  <p className="font-medium text-foreground">{p.startDate ? moment(p.startDate).format('MMM D') : '—'} – {p.endDate ? moment(p.endDate).format('MMM D, YYYY') : 'TBD'}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2 border-t border-border pt-3">
                <Button size="sm" variant="outline" onClick={() => openEdit(p)}><EditOutlinedIcon className="h-3.5 w-3.5" /> Edit</Button>
                <Button size="sm" variant="danger" onClick={() => remove(p)}><DeleteOutlineOutlinedIcon className="h-3.5 w-3.5" /> Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editing ? 'Edit Project' : 'New Project'} description={editing ? 'Update the project details.' : 'Create a new Orchasp company project.'}>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Project Name"><input required className="input-base" name="name" value={form.name} onChange={update} placeholder="e.g. IndusCare" /></FormField>
          <FormField label="Description"><textarea required className="input-base min-h-24" name="description" value={form.description} onChange={update} placeholder="Describe the project scope" /></FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Technology"><input className="input-base" name="technology" value={form.technology} onChange={update} placeholder="e.g. React, Spring Boot" /></FormField>
            <FormField label="Status">
              <select className="input-base" name="status" value={form.status} onChange={update}>
                <option value="PLANNING">Planning</option>
                <option value="ACTIVE">Active</option>
                <option value="ON-HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Start Date"><input type="date" className="input-base" name="startDate" value={form.startDate} onChange={update} /></FormField>
            <FormField label="End Date"><input type="date" className="input-base" name="endDate" value={form.endDate} onChange={update} /></FormField>
          </div>
          <FormField label="Project Manager">
            <select className="input-base" name="projectManagerId" value={form.projectManagerId} onChange={update}>
              <option value="">Unassigned</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
            </select>
          </FormField>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update Project' : 'Create Project'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

