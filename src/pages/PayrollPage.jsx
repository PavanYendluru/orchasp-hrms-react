import { useMemo, useState  } from 'react';
import moment from 'moment';
import { PageHeader  } from '../components/common/PageHeader';
import { DataTable  } from '../components/tables/DataTable';
import { Card, CardHeader, CardTitle, CardContent  } from '../components/ui/Card';
import { Badge  } from '../components/ui/Badge';
import { StatCard  } from '../components/common/StatCard';
import { ApexAreaChart  } from '../components/charts/ApexCharts';
import { db  } from '../data/db';
import { formatCurrency  } from '../lib/utils';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';

export function PayrollPage() {
  const [month, setMonth] = useState('2025-06');

  const payroll = useMemo(() => db.payroll.filter((p) => p.month === month).map((p) => {
    const emp = db.employees.find((e) => e.id === p.employeeId);
    return { ...p, employee: emp };
  }), [month]);

  const totals = useMemo(() => ({
    gross: payroll.reduce((s, p) => s + p.baseSalary + p.bonus, 0),
    deductions: payroll.reduce((s, p) => s + p.deductions, 0),
    net: payroll.reduce((s, p) => s + p.netSalary, 0),
    count: payroll.length,
  }), [payroll]);

  const trendData = useMemo(() => {
    const months = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'];
    return {
      categories: months.map((m) => moment(m + '-01').format('MMM')),
      data: [{ name: 'Net Payroll', data: months.map((m) => db.payroll.filter((p) => p.month === m).reduce((s, p) => s + p.netSalary, 0)) }],
    };
  }, []);

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Employee',
      cell: ({ row }) => <span className="font-medium">{row.original.employee?.firstName} {row.original.employee?.lastName}</span>,
    },
    { accessorKey: 'baseSalary', header: 'Base', cell: ({ row }) => formatCurrency(row.original.baseSalary) },
    { accessorKey: 'bonus', header: 'Bonus', cell: ({ row }) => formatCurrency(row.original.bonus) },
    { accessorKey: 'deductions', header: 'Deductions', cell: ({ row }) => <span className="text-danger">-{formatCurrency(row.original.deductions)}</span> },
    { accessorKey: 'netSalary', header: 'Net', cell: ({ row }) => <span className="font-semibold">{formatCurrency(row.original.netSalary)}</span> },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge variant={row.original.status === 'paid' ? 'success' : row.original.status === 'processed' ? 'primary' : 'warning'} className="capitalize">{row.original.status}</Badge>,
    },
  ], []);

  return (
    <div className="space-y-5">
      <PageHeader title="Payroll" description="Manage monthly payroll, bonuses, and deductions" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} label="Gross Payroll" value={formatCurrency(totals.gross)} icon={<PaymentsOutlinedIcon className="h-5 w-5" />} accent="primary" />
        <StatCard index={1} label="Net Payroll" value={formatCurrency(totals.net)} icon={<SavingsOutlinedIcon className="h-5 w-5" />} accent="success" />
        <StatCard index={2} label="Total Deductions" value={formatCurrency(totals.deductions)} icon={<TrendingDownOutlinedIcon className="h-5 w-5" />} accent="danger" />
        <StatCard index={3} label="Employees Paid" value={totals.count} icon={<ReceiptOutlinedIcon className="h-5 w-5" />} accent="secondary" />
      </div>

      <Card>
        <CardHeader><CardTitle>Payroll Trend</CardTitle></CardHeader>
        <CardContent><ApexAreaChart categories={trendData.categories} data={trendData.data} /></CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground">Month:</label>
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="input-base w-auto">
          {['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'].map((m) => (
            <option key={m} value={m}>{moment(m + '-01').format('MMMM YYYY')}</option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={payroll} searchKey={(p) => `${p.employee?.firstName} ${p.employee?.lastName}`} searchPlaceholder="Search payroll…" exportFilename={`payroll-${month}.csv`} />
    </div>
  );
}
