/**
 * Manages the employee directory, including full employee lifecycle actions
 * and a CSV import workflow backed by the local prototype data store.
 */
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/tables/DataTable';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/Input';
import { useFormWithYup } from '../components/forms/Form';
import { db } from '../data/db';
import { cn, parseCSV } from '../lib/utils';
import { hrmsStore, useHrmsData } from '../services/hrmsStore';
import * as yup from 'yup';
import { toast } from 'sonner';

const statusVariant = { active: 'success', 'on-leave': 'warning', inactive: 'muted', terminated: 'danger' };
const employeeSchema = yup.object({
  firstName: yup.string().required('First name is required'), lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'), phone: yup.string().required('Phone is required'),
  jobTitle: yup.string().required('Job title is required'), departmentId: yup.string().required('Department is required'),
  location: yup.string().required('Location is required'), salary: yup.number().typeError('Salary must be a number').positive().required(),
  hireDate: yup.string().required('Joining date is required'), employmentType: yup.string().required('Employment type is required'),
  status: yup.string().required('Status is required'),
});

const emptyEmployee = { firstName: '', lastName: '', email: '', phone: '', jobTitle: '', departmentId: '', location: '', salary: '', hireDate: '', employmentType: 'full-time', status: 'active', address: '', emergencyContact: '', profilePicture: '' };

/** Main directory view with filtering, sorting, CSV export, and row actions. */
export function EmployeesPage() {
  const data = useHrmsData();
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const [modalEmployee, setModalEmployee] = useState(null);
  const [filters, setFilters] = useState({ departmentId: 'all', status: 'all', jobTitle: 'all', location: 'all' });

  const employees = useMemo(() => data.employees.filter((employee) => (
    (filters.departmentId === 'all' || employee.departmentId === filters.departmentId)
    && (filters.status === 'all' || employee.status === filters.status)
    && (filters.jobTitle === 'all' || employee.jobTitle === filters.jobTitle)
    && (filters.location === 'all' || employee.location === filters.location)
  )), [data.employees, filters]);

  /** Defines directory columns independently so table behavior remains reusable. */
  const columns = useMemo(() => [
    { accessorKey: 'employeeId', header: 'Employee ID', cell: ({ row }) => `EMP-${row.original.id.replace(/\D/g, '').padStart(3, '0')}` },
    { accessorKey: 'name', header: 'Employee', cell: ({ row }) => <div className="flex items-center gap-3"><Avatar name={`${row.original.firstName} ${row.original.lastName}`} src={row.original.profilePicture} size="sm" /><div><p className="font-medium text-foreground">{row.original.firstName} {row.original.lastName}</p><p className="text-xs text-muted-foreground">{row.original.email}</p></div></div> },
    { accessorKey: 'jobTitle', header: 'Title' },
    { id: 'department', header: 'Department', cell: ({ row }) => data.departments.find((department) => department.id === row.original.departmentId)?.name || '—' },
    { accessorKey: 'location', header: 'Location' },
    { accessorKey: 'hireDate', header: 'Joining Date' },
    { accessorKey: 'salary', header: 'Salary', cell: ({ row }) => <span className="font-medium">${Number(row.original.salary).toLocaleString()}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant={statusVariant[row.original.status]} className="capitalize">{row.original.status.replace('-', ' ')}</Badge> },
    { id: 'actions', header: 'Actions', enableSorting: false, cell: ({ row }) => <div className="flex gap-1"><Button aria-label="Edit employee" variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); setModalEmployee(row.original); }}><EditOutlinedIcon className="h-4 w-4" /></Button><Button aria-label="Delete employee" variant="ghost" size="icon" className="text-danger" onClick={(event) => { event.stopPropagation(); removeEmployee(row.original); }}><DeleteOutlinedIcon className="h-4 w-4" /></Button></div> },
  ], [data.departments]);

  /** Requests confirmation before permanently removing an employee record. */
  const removeEmployee = (employee) => {
    if (!window.confirm(`Delete ${employee.firstName} ${employee.lastName}? This cannot be undone.`)) return;
    hrmsStore.employees.remove(employee.id);
    toast.success('Employee deleted.');
  };

  /** Validates the selected file and imports only records with minimum fields. */
  const importEmployees = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const rows = parseCSV(await file.text());
      const required = ['firstName', 'lastName', 'email', 'phone', 'jobTitle', 'departmentId', 'location', 'salary', 'hireDate'];
      const invalid = rows.find((row) => required.some((field) => !row[field]));
      if (invalid) throw new Error(`CSV must include: ${required.join(', ')}.`);
      const count = hrmsStore.employees.import(rows.map((row) => ({ ...row, salary: Number(row.salary) })));
      toast.success(`${count} employees imported.`);
    } catch (error) { toast.error(error.message || 'Unable to import the CSV file.'); }
  };

  return <div className="space-y-5">
    <PageHeader title="Employees" description="Manage your organization's workforce" actions={<div className="flex gap-2"><input ref={fileInput} type="file" accept=".csv,text/csv" className="hidden" onChange={importEmployees} /><Button variant="outline" onClick={() => fileInput.current?.click()}><UploadFileOutlinedIcon className="h-4 w-4" /> Import CSV</Button><Button onClick={() => setModalEmployee({ ...emptyEmployee })}><AddOutlinedIcon className="h-4 w-4" /> Add Employee</Button></div>} />

    {/* These filters deliberately complement, rather than replace, text search. */}
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <Filter label="Department" value={filters.departmentId} onChange={(value) => setFilters({ ...filters, departmentId: value })} options={data.departments.map((item) => [item.id, item.name])} />
      <Filter label="Status" value={filters.status} onChange={(value) => setFilters({ ...filters, status: value })} options={Object.keys(statusVariant).map((item) => [item, item])} />
      <Filter label="Job title" value={filters.jobTitle} onChange={(value) => setFilters({ ...filters, jobTitle: value })} options={[...new Set(data.employees.map((item) => item.jobTitle))].map((item) => [item, item])} />
      <Filter label="Location" value={filters.location} onChange={(value) => setFilters({ ...filters, location: value })} options={[...new Set(data.employees.map((item) => item.location))].map((item) => [item, item])} />
    </div>

    <DataTable columns={columns} data={employees} searchKey={(employee) => `${employee.id} ${employee.firstName} ${employee.lastName} ${employee.email} ${employee.jobTitle} ${employee.location}`} searchPlaceholder="Search by ID, name, email, title, or location…" enableSelection exportFilename="employees.csv" onRowClick={(employee) => navigate(`/employees/${employee.id}`)} />
    <EmployeeModal employee={modalEmployee} departments={data.departments} onClose={() => setModalEmployee(null)} />
  </div>;
}

/** Renders one consistently styled select filter with an inclusive default. */
function Filter({ label, value, onChange, options }) {
  return <label className="text-xs font-medium text-muted-foreground">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="input-base mt-1"><option value="all">All {label}s</option>{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue} className="capitalize">{optionLabel}</option>)}</select></label>;
}

/** Handles both creation and updates so the employee form has a single source of truth. */
function EmployeeModal({ employee, departments, onClose }) {
  const editing = Boolean(employee?.id);
  const { register, handleSubmit, formState: { errors } } = useFormWithYup(employeeSchema, { defaultValues: employee || emptyEmployee });
  if (!employee) return null;
  const save = (values) => {
    const normalized = { ...values, salary: Number(values.salary) };
    if (editing) hrmsStore.employees.update(employee.id, normalized);
    else hrmsStore.employees.create(normalized);
    toast.success(editing ? 'Employee updated.' : 'Employee added.');
    onClose();
  };
  return <Modal open onOpenChange={(open) => !open && onClose()} title={editing ? 'Edit Employee' : 'Add New Employee'} description="Fields marked by validation are required. Employment data is managed by HR." footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handleSubmit(save)}>Save Employee</Button></>}><form onSubmit={handleSubmit(save)} className="grid max-h-[65vh] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
    <TextField label="First Name" name="firstName" register={register} error={errors.firstName?.message} /><TextField label="Last Name" name="lastName" register={register} error={errors.lastName?.message} />
    <TextField label="Email" name="email" type="email" register={register} error={errors.email?.message} /><TextField label="Phone" name="phone" register={register} error={errors.phone?.message} />
    <TextField label="Job Title" name="jobTitle" register={register} error={errors.jobTitle?.message} /><FormField label="Department" error={errors.departmentId?.message}><select {...register('departmentId')} className="input-base"><option value="">Select department</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></FormField>
    <TextField label="Location" name="location" register={register} error={errors.location?.message} /><TextField label="Salary (USD)" name="salary" type="number" register={register} error={errors.salary?.message} />
    <TextField label="Joining Date" name="hireDate" type="date" register={register} error={errors.hireDate?.message} /><FormField label="Employment Type" error={errors.employmentType?.message}><select {...register('employmentType')} className="input-base"><option value="full-time">Full-time</option><option value="part-time">Part-time</option><option value="contract">Contract</option><option value="intern">Intern</option></select></FormField>
    <FormField label="Status" error={errors.status?.message}><select {...register('status')} className="input-base">{Object.keys(statusVariant).map((status) => <option key={status} value={status} className="capitalize">{status}</option>)}</select></FormField><TextField label="Profile Picture URL" name="profilePicture" register={register} />
    <TextField label="Address" name="address" register={register} className="sm:col-span-2" /><TextField label="Emergency Contact" name="emergencyContact" register={register} className="sm:col-span-2" />
  </form></Modal>;
}

/** Keeps repeated text inputs accessible and consistently validated. */
function TextField({ label, name, type = 'text', register, error, className }) {
  return <FormField label={label} error={error} className={className}><input type={type} {...register(name)} className="input-base" /></FormField>;
}
