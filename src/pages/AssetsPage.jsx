/** Lists company assets and summarizes their assignment status. */
import { useMemo, useState  } from 'react';
import { PageHeader  } from '../components/common/PageHeader';
import { DataTable  } from '../components/tables/DataTable';
import { Card, CardHeader, CardTitle, CardContent  } from '../components/ui/Card';
import { Badge  } from '../components/ui/Badge';
import { StatCard  } from '../components/common/StatCard';
import { ApexBarChart  } from '../components/charts/ApexCharts';
import { db  } from '../data/db';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/Input';
import { toast } from 'sonner';
import { formatCurrency  } from '../lib/utils';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DangerousOutlinedIcon from '@mui/icons-material/DangerousOutlined';

const statusVariant = {
  assigned: 'primary', available: 'success', damaged: 'danger', returned: 'muted',
};

export function AssetsPage() {
  const [assetRows, setAssetRows] = useState(() => [...db.assets]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignment, setAssignment] = useState({ assetId: '', employeeId: '' });
  const assets = useMemo(() => assetRows.map((a) => ({ ...a, assignee: db.employees.find((e) => e.id === a.assignedToId) })), [assetRows]);

  const stats = {
    total: assetRows.length,
    assigned: assetRows.filter((a) => a.status === 'assigned').length,
    available: assetRows.filter((a) => a.status === 'available').length,
    damaged: assetRows.filter((a) => a.status === 'damaged').length,
  };

  const byCategory = useMemo(() => {
    const cats = [...new Set(assetRows.map((a) => a.category))];
    return {
      categories: cats,
      data: [{ name: 'Assets', data: cats.map((c) => assetRows.filter((a) => a.category === c).length) }],
    };
  }, [assetRows]);

  const submitAssignment = async (event) => {
    event.preventDefault();
    if (!assignment.assetId || !assignment.employeeId) return toast.error('Select an asset and employee.');
    const updated = await api.assets.assign(assignment);
    setAssetRows((current) => current.map((asset) => asset.id === updated.id ? { ...updated } : asset));
    setAssignment({ assetId: '', employeeId: '' });
    setAssignOpen(false);
    toast.success('Asset assigned to employee.');
  };

  const columns = useMemo(() => [
    { accessorKey: 'name', header: 'Asset', cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'serial', header: 'Serial' },
    {
      accessorKey: 'assignee',
      header: 'Assigned To',
      cell: ({ row }) => row.original.assignee ? `${row.original.assignee.firstName} ${row.original.assignee.lastName}` : '—',
    },
    { accessorKey: 'value', header: 'Value', cell: ({ row }) => formatCurrency(row.original.value) },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge variant={statusVariant[row.original.status]} className="capitalize">{row.original.status}</Badge>,
    },
  ], []);

  return (
    <div className="space-y-5">
      <PageHeader title="Assets" description="Track and manage company assets and inventory" actions={<Button onClick={() => setAssignOpen(true)}>Assign Asset</Button>} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} label="Total Assets" value={stats.total} icon={<Inventory2OutlinedIcon className="h-5 w-5" />} accent="primary" />
        <StatCard index={1} label="Assigned" value={stats.assigned} icon={<CheckCircleOutlinedIcon className="h-5 w-5" />} accent="success" />
        <StatCard index={2} label="Available" value={stats.available} icon={<Inventory2OutlinedIcon className="h-5 w-5" />} accent="secondary" />
        <StatCard index={3} label="Damaged" value={stats.damaged} icon={<DangerousOutlinedIcon className="h-5 w-5" />} accent="danger" />
      </div>

      <Card>
        <CardHeader><CardTitle>Assets by Category</CardTitle></CardHeader>
        <CardContent><ApexBarChart categories={byCategory.categories} data={byCategory.data} /></CardContent>
      </Card>

      <DataTable columns={columns} data={assets} searchKey={(a) => `${a.name} ${a.serial} ${a.category}`} searchPlaceholder="Search assets…" enableSelection exportFilename="assets.csv" />
      <Modal open={assignOpen} onOpenChange={setAssignOpen} title="Assign asset to employee">
        <form onSubmit={submitAssignment} className="space-y-4">
          <FormField label="Available asset"><select className="input-base" value={assignment.assetId} onChange={(event) => setAssignment({ ...assignment, assetId: event.target.value })}><option value="">Select asset</option>{assetRows.filter((asset) => asset.status === 'available' || !asset.assignedToId).map((asset) => <option key={asset.id} value={asset.id}>{asset.name} · {asset.serial}</option>)}</select></FormField>
          <FormField label="Employee"><select className="input-base" value={assignment.employeeId} onChange={(event) => setAssignment({ ...assignment, employeeId: event.target.value })}><option value="">Select employee</option>{db.employees.filter((employee) => employee.status === 'active').map((employee) => <option key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName} · EMP-{employee.id.replace(/\D/g, '').padStart(3, '0')}</option>)}</select></FormField>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button><Button type="submit">Assign asset</Button></div>
        </form>
      </Modal>
    </div>
  );
}
