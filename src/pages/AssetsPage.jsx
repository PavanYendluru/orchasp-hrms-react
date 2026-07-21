/** Lists company assets and summarizes their assignment status. */
import { useMemo  } from 'react';
import { PageHeader  } from '../components/common/PageHeader';
import { DataTable  } from '../components/tables/DataTable';
import { Card, CardHeader, CardTitle, CardContent  } from '../components/ui/Card';
import { Badge  } from '../components/ui/Badge';
import { StatCard  } from '../components/common/StatCard';
import { ApexBarChart  } from '../components/charts/ApexCharts';
import { db  } from '../data/db';
import { formatCurrency  } from '../lib/utils';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DangerousOutlinedIcon from '@mui/icons-material/DangerousOutlined';

const statusVariant = {
  assigned: 'primary', available: 'success', damaged: 'danger', returned: 'muted',
};

export function AssetsPage() {
  const assets = useMemo(() => db.assets.map((a) => ({ ...a, assignee: db.employees.find((e) => e.id === a.assignedToId) })), []);

  const stats = {
    total: db.assets.length,
    assigned: db.assets.filter((a) => a.status === 'assigned').length,
    available: db.assets.filter((a) => a.status === 'available').length,
    damaged: db.assets.filter((a) => a.status === 'damaged').length,
  };

  const byCategory = useMemo(() => {
    const cats = [...new Set(db.assets.map((a) => a.category))];
    return {
      categories: cats,
      data: [{ name: 'Assets', data: cats.map((c) => db.assets.filter((a) => a.category === c).length) }],
    };
  }, []);

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
      <PageHeader title="Assets" description="Track and manage company assets and inventory" />

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
    </div>
  );
}
