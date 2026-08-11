/** Generates report previews from live API data and exports the selected, filtered rows. */
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DataTable } from '../components/tables/DataTable';
import { Spinner } from '../components/ui/Spinner';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import { api } from '../services/api';
import { downloadCSV } from '../lib/utils';
import { toast } from 'sonner';

const reportTypes = [
  { id: 'employee', label: 'Employee Report', load: () => api.employees.all() },
  { id: 'attendance', label: 'Attendance Report', load: () => api.attendance.history() },
  { id: 'leave', label: 'Leave Report', load: () => api.leaves.list() },
  { id: 'payroll', label: 'Payroll Report', load: () => api.payroll.list() },
  { id: 'asset', label: 'Asset Report', load: () => api.assets.list() },
  { id: 'task', label: 'Task Report', load: () => api.tasks.list() },
  { id: 'performance', label: 'Performance Report', load: () => api.performance.list() },
  { id: 'recruitment', label: 'Recruitment Report', load: () => api.recruitment.candidates.list() },
];
const dateFieldByReport = { attendance: 'date', leave: 'startDate', payroll: 'payDate', task: 'dueDate' };
const serialize = (row) => Object.fromEntries(Object.entries(row).filter(([, value]) => value == null || ['string', 'number', 'boolean'].includes(typeof value)));

export function ReportsPage() {
  const [selected, setSelected] = useState('employee');
  const [rows, setRows] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true; setLoading(true);
    reportTypes.find((report) => report.id === selected).load().then((data) => mounted && setRows(data || []))
      .catch((error) => { if (mounted) { setRows([]); toast.error(error?.response?.data?.message || 'Unable to load report data.'); } })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [selected]);
  const filteredRows = useMemo(() => {
    const dateField = dateFieldByReport[selected];
    if (!dateField || (!startDate && !endDate)) return rows;
    return rows.filter((row) => { const value = row[dateField]?.slice?.(0, 10); return value && (!startDate || value >= startDate) && (!endDate || value <= endDate); });
  }, [rows, selected, startDate, endDate]);
  const exportRows = filteredRows.map(serialize);
  const exportExcel = () => {
    if (!exportRows.length) return toast.error('There are no rows to export.');
    const headers = Object.keys(exportRows[0]);
    const xml = `<table><tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr>${exportRows.map((row) => `<tr>${headers.map((header) => `<td>${String(row[header] ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</td>`).join('')}</tr>`).join('')}</table>`;
    const url = URL.createObjectURL(new Blob([xml], { type: 'application/vnd.ms-excel' })); const link = document.createElement('a'); link.href = url; link.download = `${selected}-report.xls`; link.click(); URL.revokeObjectURL(url);
  };
  const exportPdf = () => {
    if (!exportRows.length) return toast.error('There are no rows to export.');
    const headers = Object.keys(exportRows[0]); const popup = window.open('', '_blank');
    if (!popup) return toast.error('Allow pop-ups to export PDF.');
    popup.document.write(`<title>${selected} report</title><h1>${selected} report</h1><table border="1"><thead><tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr></thead><tbody>${exportRows.map((row) => `<tr>${headers.map((header) => `<td>${String(row[header] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table>`); popup.document.close(); popup.print();
  };
  const columns = useMemo(() => Object.keys(exportRows[0] || {}).slice(0, 8).map((key) => ({ accessorKey: key, header: key.replace(/([A-Z])/g, ' $1') })), [exportRows]);
  return <div className="space-y-5"><PageHeader title="Reports" description="Generate reports from live HRMS data" />
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">{reportTypes.map((report) => <Card key={report.id} onClick={() => setSelected(report.id)} className={`cursor-pointer p-4 ${selected === report.id ? 'border-primary shadow-glow' : ''}`}><div className="flex justify-between gap-2"><h3 className="font-semibold">{report.label}</h3>{selected === report.id && <Badge variant="primary">Selected</Badge>}</div></Card>)}</div>
    <Card><CardHeader><CardTitle>Filters & Export</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex flex-wrap gap-3"><label className="text-sm">Start <input className="input-base ml-2" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label><label className="text-sm">End <input className="input-base ml-2" type="date" min={startDate || undefined} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label></div><div className="flex flex-wrap gap-3"><Button variant="outline" onClick={exportPdf}><PictureAsPdfOutlinedIcon className="h-4 w-4" /> Export PDF</Button><Button variant="outline" onClick={exportExcel}><GridOnOutlinedIcon className="h-4 w-4" /> Export Excel</Button><Button variant="outline" onClick={() => { downloadCSV(`${selected}-report.csv`, exportRows); toast.success('CSV exported.'); }}><DownloadIcon className="h-4 w-4" /> Export CSV</Button></div></CardContent></Card>
    {loading ? <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div> : <DataTable columns={columns} data={exportRows} searchKey={(row) => JSON.stringify(row)} searchPlaceholder="Search report…" exportFilename={`${selected}-report.csv`} />}
  </div>;
}
