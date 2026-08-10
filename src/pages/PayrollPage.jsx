/** Displays payroll records and their monthly payment breakdowns (backend-driven). */
import { useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/tables/DataTable';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/common/StatCard';
import { ApexAreaChart } from '../components/charts/ApexCharts';
import { Spinner } from '../components/ui/Spinner';
import { api } from '../services/api';
import { formatCurrency } from '../lib/utils';
import { toast } from 'sonner';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';

const statusVariant = {
  PENDING: 'warning',
  PROCESSED: 'primary',
  PAID: 'success',
};

export function PayrollPage() {
  const [month, setMonth] = useState(moment().format('YYYY-MM'));
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    api.payroll
      .list(month)
      .then((data) => {
        if (isMounted) setRecords(data || []);
      })
      .catch((err) => {
        console.error('Failed loading payroll:', err);
        if (isMounted) {
          setError(err?.response?.data?.message || 'Unable to load payroll records.');
          setRecords([]);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [month]);

  const totals = useMemo(() => ({
    gross: records.reduce((s, p) => s + Number(p.basicSalary || 0) + Number(p.hra || 0) + Number(p.allowances || 0) + Number(p.bonuses || 0), 0),
    deductions: records.reduce((s, p) => s + Number(p.deductions || 0) + Number(p.pf || 0) + Number(p.tax || 0), 0),
    net: records.reduce((s, p) => s + Number(p.netSalary || 0), 0),
    count: records.length,
  }), [records]);

  const trendData = useMemo(() => {
    const months = [-5, -4, -3, -2, -1, 0].map((i) => moment().subtract(i, 'months').format('YYYY-MM'));
    return {
      categories: months.map((m) => moment(m + '-01').format('MMM')),
      data: [{ name: 'Net Payroll', data: months.map(() => 0) }],
    };
  }, []);

  const columns = useMemo(() => [
    { accessorKey: 'employeeName', header: 'Employee', cell: ({ row }) => <span className="font-medium">{row.original.employeeName}</span> },
    { accessorKey: 'basicSalary', header: 'Base', cell: ({ row }) => formatCurrency(Number(row.original.basicSalary || 0)) },
    { accessorKey: 'bonuses', header: 'Bonus', cell: ({ row }) => formatCurrency(Number(row.original.bonuses || 0)) },
    { accessorKey: 'deductions', header: 'Deductions', cell: ({ row }) => <span className="text-danger">-{formatCurrency(Number(row.original.deductions || 0) + Number(row.original.pf || 0) + Number(row.original.tax || 0))}</span> },
    { accessorKey: 'netSalary', header: 'Net', cell: ({ row }) => <span className="font-semibold">{formatCurrency(Number(row.original.netSalary || 0))}</span> },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge variant={statusVariant[row.original.status] || 'primary'} className="capitalize">{row.original.status || '—'}</Badge>,
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
          {[-5, -4, -3, -2, -1, 0].map((i) => {
            const m = moment().subtract(i, 'months').format('YYYY-MM');
            return <option key={m} value={m}>{moment(m + '-01').format('MMMM YYYY')}</option>;
          })}
        </select>
        <Button size="sm" onClick={async () => { try { await api.payroll.generate(month); toast.success('Payroll generated for ' + month); setMonth(month); } catch (err) { toast.error(err?.response?.data?.message || 'Generation failed.'); } }}>
          <AutoAwesomeOutlinedIcon className="h-4 w-4" /> Generate Payroll
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : error ? (
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">{error}</CardContent></Card>
      ) : (
        <DataTable columns={columns} data={records} searchKey={(p) => p.employeeName || ''} searchPlaceholder="Search payroll…" exportFilename={`payroll-${month}.csv`} />
      )}
    </div>
  );
}
