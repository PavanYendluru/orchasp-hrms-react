import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { ImportExcelButton } from '../components/common/ImportExcelButton';
import { DataTable } from '../components/tables/DataTable';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/Input';
import { api } from '../services/api';
import { toast } from 'sonner';

const emptyEmployee = { firstName: '', lastName: '', email: '', phone: '', jobTitle: '', departmentId: '', location: '', salary: '', hireDate: '', dateOfBirth: '', employmentType: 'full-time', status: 'ACTIVE', address: '', emergencyContact: '', profilePicture: '', initialPassword: '' };

/** Database-backed employee directory with department filtering. */
export function EmployeesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedDeptId = searchParams.get('departmentId') || '';

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(null);

  const load = useCallback(async () => {
    try {
      const [employeeData, departmentData] = await Promise.all([
        api.employees.all(),
        api.departments.list(),
      ]);
      setEmployees(employeeData);
      setDepartments(departmentData);
    } catch {
      toast.error('Unable to load employee data.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDepartmentFilterChange = (deptId) => {
    if (deptId) {
      setSearchParams({ departmentId: deptId });
    } else {
      setSearchParams({});
    }
  };

  const filteredEmployees = useMemo(() => {
    if (!selectedDeptId) return employees;
    return employees.filter((e) => String(e.departmentId) === String(selectedDeptId));
  }, [employees, selectedDeptId]);

  const selectedDepartmentName = useMemo(() => {
    if (!selectedDeptId) return null;
    const found = departments.find((d) => String(d.id) === String(selectedDeptId));
    return found ? found.name : `Department #${selectedDeptId}`;
  }, [departments, selectedDeptId]);

  const remove = useCallback(async (employee) => {
    if (!window.confirm(`Delete ${employee.firstName} ${employee.lastName}?`)) return;
    try {
      await api.employees.remove(employee.id);
      await load();
      toast.success('Employee deleted.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete employee.');
    }
  }, [load]);

  const columns = useMemo(
    () => [
      { accessorKey: 'employeeId', header: 'Employee ID', cell: ({ row }) => <span>{row.original.employeeId || `EMP-${row.original.id}`}</span> },
      {
        accessorKey: 'firstName',
        header: 'Employee',
        cell: ({ row }) => (
          <span>
            {row.original.firstName} {row.original.lastName}
          </span>
        ),
      },
      { accessorKey: 'jobTitle', header: 'Designation' },
      { accessorKey: 'departmentName', header: 'Department', cell: ({ row }) => <span>{row.original.departmentName || 'N/A'}</span> },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'phone', header: 'Phone' },
      { accessorKey: 'dateOfBirth', header: 'Date of Birth', cell: ({ row }) => <span>{row.original.dateOfBirth || 'N/A'}</span> },
      { accessorKey: 'location', header: 'Location' },
      { accessorKey: 'hireDate', header: 'Joining Date' },
      { accessorKey: 'salary', header: 'Salary', cell: ({ row }) => `$${Number(row.original.salary || 0).toLocaleString()}` },
      { accessorKey: 'status', header: 'Status' },
      {
        id: 'actions',
        header: 'Actions',
cell: ({ row }) => (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button size="sm" variant="outline" onClick={() => setForm({ ...row.original, initialPassword: '' })}>Edit</Button>
            <Button size="sm" variant="outline" onClick={() => remove(row.original)}>Delete</Button>
          </div>
        ),
      },
    ],
    [remove]
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Employees"
        description={selectedDepartmentName ? `Showing employees in ${selectedDepartmentName}` : "Manage your organization's workforce"}
        actions={<><ImportExcelButton module="employees" onImported={() => window.location.reload()} /><Button onClick={() => setForm(emptyEmployee)}>Add Employee</Button></>}
      />

      <div className="flex flex-wrap items-center gap-3 bg-card p-3 rounded-lg border border-border">
        <label className="text-sm font-medium text-foreground">Filter by Department:</label>
        <select
          className="input-base max-w-xs h-9 py-1 text-sm"
          value={selectedDeptId}
          onChange={(e) => handleDepartmentFilterChange(e.target.value)}
        >
          <option value="">All Departments ({employees.length})</option>
          {departments.map((d) => {
            const count = employees.filter((e) => String(e.departmentId) === String(d.id)).length;
            return (
              <option key={d.id} value={d.id}>
                {d.name} ({count})
              </option>
            );
          })}
        </select>
        {selectedDeptId && (
          <Button size="sm" variant="outline" onClick={() => handleDepartmentFilterChange('')}>
            Clear Filter
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filteredEmployees}
        searchKey={(item) => `${item.employeeId} ${item.firstName} ${item.lastName} ${item.email} ${item.phone} ${item.jobTitle} ${item.location} ${item.departmentName}`}
        searchPlaceholder="Search employees…"
        onRowClick={(employee) => navigate(`/employees/${employee.id}`)}
      />

      {form && <EmployeeModal employee={form} departments={departments} onClose={() => setForm(null)} onSaved={load} />}
    </div>
  );
}
function EmployeeModal({ employee, departments, onClose, onSaved }) {
  const editing = Boolean(employee.id); const [values, setValues] = useState(employee);
  const set = (key, value) => setValues({ ...values, [key]: value });
  const submit = async (event) => { event.preventDefault(); if (!editing && values.initialPassword.length < 8) return toast.error('Temporary password must contain at least 8 characters.'); if (new Date(values.dateOfBirth) > new Date()) return toast.error('Date of birth cannot be in the future.'); try { const payload = { ...values, departmentId: Number(values.departmentId), salary: Number(values.salary), initialPassword: values.initialPassword || null }; if (editing) await api.employees.update(values.id, payload); else await api.employees.create(payload); await onSaved(); toast.success(editing ? 'Employee updated.' : 'Employee and login account created.'); onClose(); } catch (error) { toast.error(error.response?.data?.message || 'Unable to save employee.'); } };
  const fields = [['First Name', 'firstName'], ['Last Name', 'lastName'], ['Email', 'email', 'email'], ['Phone', 'phone', 'tel'], ['Job Title', 'jobTitle'], ['Location', 'location'], ['Salary', 'salary', 'number'], ['Date of Birth', 'dateOfBirth', 'date'], ['Joining Date', 'hireDate', 'date'], ['Profile Picture URL', 'profilePicture'], ['Address', 'address'], ['Emergency Contact', 'emergencyContact']];
  return <Modal open onOpenChange={(open) => !open && onClose()} title={editing ? 'Edit Employee' : 'Add Employee'} className="max-w-3xl"><form onSubmit={submit} className="grid gap-x-4 gap-y-3 sm:grid-cols-2">{fields.map(([label, key, type = 'text']) => <FormField key={key} label={label}><input required={['firstName', 'lastName', 'email', 'phone', 'jobTitle', 'location', 'salary', 'hireDate', 'dateOfBirth'].includes(key)} type={type} max={key === 'dateOfBirth' ? new Date().toISOString().slice(0, 10) : undefined} className="input-base" value={values[key] || ''} onChange={(e) => set(key, e.target.value)} /></FormField>)}<FormField label="Department"><select required className="input-base" value={values.departmentId || ''} onChange={(e) => set('departmentId', e.target.value)}><option value="">Select department</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></FormField><FormField label="Status"><select className="input-base" value={values.status} onChange={(e) => set('status', e.target.value)}>{['ACTIVE', 'ON_LEAVE', 'INACTIVE', 'TERMINATED'].map((status) => <option key={status}>{status}</option>)}</select></FormField><FormField label="Employment Type"><select className="input-base" value={values.employmentType} onChange={(e) => set('employmentType', e.target.value)}>{['full-time', 'part-time', 'contract', 'intern'].map((type) => <option key={type}>{type}</option>)}</select></FormField>{!editing && <FormField label="Temporary Employee Password"><input required type="password" minLength="8" className="input-base" value={values.initialPassword} onChange={(e) => set('initialPassword', e.target.value)} /></FormField>}<div className="flex flex-wrap gap-2 pt-1 sm:col-span-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">Save Employee</Button></div></form></Modal>;
}
