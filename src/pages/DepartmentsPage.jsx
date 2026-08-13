import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { ImportExcelButton } from '../components/common/ImportExcelButton';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/Input';
import { api } from '../services/api';
import { toast } from 'sonner';

const emptyDepartment = { name: '', description: '', color: '#2563eb', budget: '' };
/** Database-backed department administration page. */
export function DepartmentsPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]); const [form, setForm] = useState(null);
  const load = async () => { try { setDepartments(await api.departments.list()); } catch { toast.error('Unable to load departments.'); } };
  useEffect(() => { load(); }, []);
  const remove = async (department) => { if (!window.confirm(`Delete ${department.name}?`)) return; try { await api.departments.remove(department.id); await load(); toast.success('Department deleted.'); } catch (error) { toast.error(error.response?.data?.message || 'Unable to delete department.'); } };
  return (
    <div className="space-y-5">
      <PageHeader title="Departments" description="Manage your organization departments" actions={<><ImportExcelButton module="departments" onImported={() => window.location.reload()} /><Button onClick={() => setForm(emptyDepartment)}>Add Department</Button></>} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((department) => (
          <Card key={department.id} className="transition-all hover:shadow-md">
            <div className="h-1.5" style={{ backgroundColor: department.color || '#2563eb' }} />
            <CardHeader>
              <CardTitle className="cursor-pointer hover:text-primary" onClick={() => navigate(`/employees?departmentId=${department.id}`)}>
                {department.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{department.description || 'No description'}</p>
              <p className="font-medium">Budget: ${Number(department.budget || 0).toLocaleString()}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" onClick={() => navigate(`/employees?departmentId=${department.id}`)}>
                  View Employees
                </Button>
                <Button size="sm" variant="outline" onClick={() => setForm(department)}>Edit</Button>
                <Button size="sm" variant="outline" onClick={() => remove(department)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {form && <DepartmentModal department={form} onClose={() => setForm(null)} onSaved={load} />}
    </div>
  );
}
function DepartmentModal({ department, onClose, onSaved }) { const editing = Boolean(department.id); const [values, setValues] = useState(department); const submit = async (event) => { event.preventDefault(); try { const payload = { ...values, budget: Number(values.budget || 0) }; if (editing) await api.departments.update(values.id, payload); else await api.departments.create(payload); await onSaved(); toast.success(editing ? 'Department updated.' : 'Department created.'); onClose(); } catch (error) { toast.error(error.response?.data?.message || 'Unable to save department.'); } }; return <Modal open onOpenChange={(open) => !open && onClose()} title={editing ? 'Edit Department' : 'Add Department'}><form onSubmit={submit} className="space-y-4"><FormField label="Name"><input required className="input-base" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} /></FormField><FormField label="Description"><textarea className="input-base" value={values.description || ''} onChange={(e) => setValues({ ...values, description: e.target.value })} /></FormField><FormField label="Budget"><input type="number" min="0" className="input-base" value={values.budget || ''} onChange={(e) => setValues({ ...values, budget: e.target.value })} /></FormField><FormField label="Color"><input type="color" className="input-base" value={values.color || '#2563eb'} onChange={(e) => setValues({ ...values, color: e.target.value })} /></FormField><div className="flex gap-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">Save Department</Button></div></form></Modal>; }
