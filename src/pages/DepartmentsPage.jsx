/** Summarizes departments, headcount, and department-level information. */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { PageHeader  } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent  } from '../components/ui/Card';
import { Avatar  } from '../components/ui/Avatar';
import { Badge  } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/Input';
import { BarChartCard  } from '../components/charts/Recharts';
import { formatCurrency  } from '../lib/utils';
import { hrmsStore, useHrmsData } from '../services/hrmsStore';

export function DepartmentsPage() {
  const data = useHrmsData();
  const navigate = useNavigate();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const departments = useMemo(
    () => data.departments.map((d) => ({
      ...d,
      employeeCount: data.employees.filter((e) => e.departmentId === d.id).length,
      head: data.employees.find((e) => e.id === d.headId),
    })),
    [data.departments, data.employees]
  );

  const selectedDepartment = departments.find((department) => department.id === selectedDepartmentId);
  const departmentEmployees = selectedDepartment ? data.employees.filter((employee) => employee.departmentId === selectedDepartment.id) : [];

  const chartData = departments.map((d) => ({ name: d.name.slice(0, 8), employees: d.employeeCount, budget: Math.round(d.budget / 1000) }));

  return (
    <div className="space-y-5">
      <PageHeader title="Departments" description="Select a department to view its people and details" actions={<Button onClick={() => setIsAddOpen(true)}><AddOutlinedIcon className="h-4 w-4" /> Add Department</Button>} />
      <Card>
        <CardHeader><CardTitle>Headcount by Department</CardTitle></CardHeader>
        <CardContent>
          <BarChartCard data={chartData} xKey="name" series={[{ key: 'employees', name: 'Employees', color: '#2563eb' }, { key: 'budget', name: 'Budget ($k)', color: '#7c3aed' }]} />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((d) => (
          <button key={d.id} type="button" onClick={() => setSelectedDepartmentId(d.id)} className="text-left">
          <Card className={`h-full overflow-hidden transition-shadow hover:shadow-soft ${selectedDepartmentId === d.id ? 'ring-2 ring-primary' : ''}`}>
            <div className="h-1.5" style={{ backgroundColor: d.color }} />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-base font-semibold text-foreground">{d.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{d.employeeCount} employees</p>
                </div>
                <Badge variant="primary">{formatCurrency(d.budget)}</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{d.description}</p>
              {d.head && (
                <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                  <Avatar name={`${d.head.firstName} ${d.head.lastName}`} size="sm" />
                  <div><p className="text-xs font-medium text-foreground">{d.head.firstName} {d.head.lastName}</p><p className="text-[11px] text-muted-foreground">Department Head</p></div>
                </div>
              )}
            </CardContent>
          </Card>
          </button>
        ))}
      </div>
      {selectedDepartment && <Modal open onOpenChange={(open) => !open && setSelectedDepartmentId(null)} title={`${selectedDepartment.name} employees`} description={selectedDepartment.description} className="max-w-3xl"><div className="mb-4 flex justify-end"><Badge variant="primary">{departmentEmployees.length} people</Badge></div>{departmentEmployees.length ? <div className="grid max-h-[60vh] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">{departmentEmployees.map((employee) => <button type="button" key={employee.id} onClick={() => navigate(`/employees/${employee.id}`)} className="flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted"><Avatar name={`${employee.firstName} ${employee.lastName}`} src={employee.profilePicture} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-foreground">{employee.firstName} {employee.lastName}</p><p className="truncate text-xs text-muted-foreground">{employee.jobTitle}</p><p className="truncate text-xs text-muted-foreground">{employee.email}</p></div><Badge variant={employee.status === 'active' ? 'success' : 'warning'} className="capitalize">{employee.status.replace('-', ' ')}</Badge></button>)}</div> : <p className="text-sm text-muted-foreground">No employees are assigned to this department yet.</p>}</Modal>}
      <DepartmentModal open={isAddOpen} employees={data.employees} onClose={() => setIsAddOpen(false)} onSave={(values) => { const department = hrmsStore.departments.create(values); setSelectedDepartmentId(department.id); setIsAddOpen(false); }} />
    </div>
  );
}

function DepartmentModal({ open, employees, onClose, onSave }) {
  const [values, setValues] = useState({ name: '', description: '', budget: '', color: '#2563eb', headId: '' });
  const submit = (event) => { event.preventDefault(); if (!values.name.trim()) return; onSave({ ...values, name: values.name.trim(), budget: Number(values.budget) || 0, headId: values.headId || null }); setValues({ name: '', description: '', budget: '', color: '#2563eb', headId: '' }); };
  return <Modal open={open} onOpenChange={(isOpen) => !isOpen && onClose()} title="Add Department" description="Create a department, then assign employees from the employee directory." footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={submit}>Create Department</Button></>}><form onSubmit={submit} className="grid gap-4"><FormField label="Department name"><input autoFocus required value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} className="input-base" placeholder="e.g. Customer Success" /></FormField><FormField label="Description"><textarea value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} className="input-base min-h-20" placeholder="What does this team own?" /></FormField><div className="grid grid-cols-2 gap-4"><FormField label="Annual budget"><input type="number" min="0" value={values.budget} onChange={(event) => setValues({ ...values, budget: event.target.value })} className="input-base" placeholder="0" /></FormField><FormField label="Accent color"><input type="color" value={values.color} onChange={(event) => setValues({ ...values, color: event.target.value })} className="input-base h-10 p-1" /></FormField></div><FormField label="Department head"><select value={values.headId} onChange={(event) => setValues({ ...values, headId: event.target.value })} className="input-base"><option value="">Assign later</option>{employees.filter((employee) => employee.status === 'active').map((employee) => <option key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}</option>)}</select></FormField></form></Modal>;
}
