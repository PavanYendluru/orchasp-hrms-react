import { useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { api } from '../../services/api';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'sonner';

const statusVariant = {
  PENDING: 'warning',
  PROCESSED: 'primary',
  PAID: 'success',
};

export function EmployeePayslipsPage() {
  const { employee } = useEmployeeAuth();
  const empId = employee.employeeId ?? employee.id;
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    api.payroll
      .forEmployee(empId)
      .then((data) => {
        if (!isMounted) return;
        const records = (data || []).sort((a, b) => b.month.localeCompare(a.month));
        setPayslips(records);
        if (records.length) setSelectedId((prev) => prev || records[0].id);
      })
      .catch((err) => {
        console.error('Failed loading payslips:', err);
        if (isMounted) {
          setError(err?.response?.data?.message || 'Unable to load payslips.');
          setPayslips([]);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [empId]);

  const payslip = useMemo(() => payslips.find((item) => String(item.id) === String(selectedId)) || payslips[0], [payslips, selectedId]);

  const printPayslip = () => window.print();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!payslip) {
    return <div><h1 className="font-display text-2xl font-bold text-foreground">My payslips</h1><Card className="mt-5"><CardContent className="py-12 text-center text-muted-foreground">{error || 'No payslips are available yet.'}</CardContent></Card></div>;
  }

  const gross = Number(payslip.basicSalary || 0) + Number(payslip.hra || 0) + Number(payslip.allowances || 0) + Number(payslip.bonuses || 0);
  const totalDeductions = Number(payslip.deductions || 0) + Number(payslip.pf || 0) + Number(payslip.tax || 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My payslips</h1>
          <p className="mt-1 text-sm text-muted-foreground">View and print your monthly salary statement.</p>
        </div>
        <div className="flex gap-2">
          <select value={payslip.id} onChange={(event) => setSelectedId(event.target.value)} className="input-base w-auto">
            {payslips.map((item) => <option key={item.id} value={item.id}>{moment(`${item.month}-01`).format('MMMM YYYY')}</option>)}
          </select>
          <Button onClick={printPayslip}>Print / Save PDF</Button>
        </div>
      </div>

      <Card className="print:border-0 print:shadow-none">
        <CardHeader className="border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-primary">ORCHASP HRMS</p>
              <CardTitle className="mt-1">Salary payslip</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{moment(`${payslip.month}-01`).format('MMMM YYYY')}</p>
            </div>
            <Badge variant={statusVariant[payslip.status] || 'primary'} className="capitalize">{payslip.status || '—'}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div><p className="text-xs text-muted-foreground">Employee</p><p className="mt-1 font-medium">{payslip.employeeName || employee.name}</p></div>
            <div><p className="text-xs text-muted-foreground">Employee ID</p><p className="mt-1 font-medium">{payslip.employeeCode || employee.employeeId}</p></div>
            <div><p className="text-xs text-muted-foreground">Department</p><p className="mt-1 font-medium">{payslip.departmentName || '—'}</p></div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <section className="rounded-xl bg-muted/50 p-4">
              <h2 className="font-medium text-foreground">Earnings</h2>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span>Base salary</span><span>{formatCurrency(Number(payslip.basicSalary || 0))}</span></div>
                <div className="flex justify-between"><span>HRA</span><span>{formatCurrency(Number(payslip.hra || 0))}</span></div>
                <div className="flex justify-between"><span>Allowances</span><span>{formatCurrency(Number(payslip.allowances || 0))}</span></div>
                <div className="flex justify-between"><span>Bonuses</span><span>{formatCurrency(Number(payslip.bonuses || 0))}</span></div>
                <div className="flex justify-between border-t border-border pt-2 font-semibold"><span>Gross earnings</span><span>{formatCurrency(gross)}</span></div>
              </div>
            </section>
            <section className="rounded-xl bg-muted/50 p-4">
              <h2 className="font-medium text-foreground">Deductions</h2>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span>Other deductions</span><span>-{formatCurrency(Number(payslip.deductions || 0))}</span></div>
                <div className="flex justify-between"><span>Provident fund</span><span>-{formatCurrency(Number(payslip.pf || 0))}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>-{formatCurrency(Number(payslip.tax || 0))}</span></div>
                <div className="flex justify-between border-t border-border pt-2 font-semibold"><span>Net salary</span><span>{formatCurrency(Number(payslip.netSalary || 0))}</span></div>
              </div>
            </section>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-primary p-5 text-primary-foreground">
            <span className="font-medium">Net salary payable</span>
            <span className="font-display text-2xl font-bold">{formatCurrency(Number(payslip.netSalary || 0))}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
