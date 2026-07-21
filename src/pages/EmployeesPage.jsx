import { useMemo, useState  } from 'react';
import { useNavigate  } from 'react-router-dom';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { PageHeader  } from '../components/common/PageHeader';
import { DataTable  } from '../components/tables/DataTable';
import { Avatar  } from '../components/ui/Avatar';
import { Badge  } from '../components/ui/Badge';
import { Button  } from '../components/ui/Button';
import { Modal  } from '../components/ui/Modal';
import { FormField  } from '../components/ui/Input';
import { useFormWithYup  } from '../components/forms/Form';
import { db  } from '../data/db';
import { cn  } from '../lib/utils';
import * as yup from 'yup';
import { toast  } from 'sonner';
const statusVariant = {
  active: 'success',
  'on-leave': 'warning',
  inactive: 'muted',
  terminated: 'danger',
};

export function EmployeesPage() {
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState(false);
  const [deptFilter, setDeptFilter] = useState('all');

  const filtered = useMemo(
    () => deptFilter === 'all' ? db.employees : db.employees.filter((e) => e.departmentId === deptFilter),
    [deptFilter]
  );

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Employee',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${row.original.firstName} ${row.original.lastName}`} size="sm" />
          <div>
            <p className="font-medium text-foreground">{row.original.firstName} {row.original.lastName}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: 'jobTitle', header: 'Title' },
    {
      id: 'department',
      header: 'Department',
      cell: ({ row }) => db.departments.find((d) => d.id === row.original.departmentId)?.name || '—',
    },
    { accessorKey: 'location', header: 'Location' },
    {
      accessorKey: 'salary',
      header: 'Salary',
      cell: ({ row }) => <span className="font-medium">${(row.original.salary / 1000).toFixed(0)}k</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status]} className="capitalize">
          {row.original.status.replace('-', ' ')}
        </Badge>
      ),
    },
  ], []);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Employees"
        description="Manage your organization's workforce"
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <AddOutlinedIcon className="h-4 w-4" /> Add Employee
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setDeptFilter('all')}
          className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', deptFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground')}
        >
          All Departments
        </button>
        {db.departments.map((d) => (
          <button
            key={d.id}
            onClick={() => setDeptFilter(d.id)}
            className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', deptFilter === d.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground')}
          >
            {d.name}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchKey={(e) => `${e.firstName} ${e.lastName} ${e.email} ${e.jobTitle}`}
        searchPlaceholder="Search employees…"
        enableSelection
        exportFilename="employees.csv"
        onRowClick={(e) => navigate(`/employees/${e.id}`)}
      />

      <AddEmployeeModal open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

const schema = yup.object({
  firstName: yup.string().required('First name is required').min(2, 'Too short'),
  lastName: yup.string().required('Last name is required').min(2, 'Too short'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  phone: yup.string().required('Phone is required'),
  jobTitle: yup.string().required('Job title is required'),
  departmentId: yup.string().required('Department is required'),
  location: yup.string().required('Location is required'),
  salary: yup.number().typeError('Must be a number').positive('Must be positive').required('Salary is required'),
});

function AddEmployeeModal({ open, onOpenChange }) {
  const { register, handleSubmit, formState: { errors }, reset } = useFormWithYup(schema);

  const onSubmit = (data) => {
    toast.success('Employee added successfully');
    reset();
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Employee"
      description="Fill in the details below to add a new employee record."
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)}>Save Employee</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
        <FormField label="First Name" error={errors.firstName?.message}>
          <input {...register('firstName')} className="input-base" placeholder="John" />
        </FormField>
        <FormField label="Last Name" error={errors.lastName?.message}>
          <input {...register('lastName')} className="input-base" placeholder="Doe" />
        </FormField>
        <FormField label="Email" error={errors.email?.message} className="col-span-2">
          <input {...register('email')} className="input-base" placeholder="john@company.com" />
        </FormField>
        <FormField label="Phone" error={errors.phone?.message}>
          <input {...register('phone')} className="input-base" placeholder="+1-555-0100" />
        </FormField>
        <FormField label="Job Title" error={errors.jobTitle?.message}>
          <input {...register('jobTitle')} className="input-base" placeholder="Engineer" />
        </FormField>
        <FormField label="Department" error={errors.departmentId?.message}>
          <select {...register('departmentId')} className="input-base">
            <option value="">Select…</option>
            {db.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </FormField>
        <FormField label="Location" error={errors.location?.message}>
          <input {...register('location')} className="input-base" placeholder="San Francisco, US" />
        </FormField>
        <FormField label="Salary (USD)" error={errors.salary?.message} className="col-span-2">
          <input type="number" {...register('salary')} className="input-base" placeholder="75000" />
        </FormField>
      </form>
    </Modal>
  );
}
