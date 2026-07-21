import { useState  } from 'react';
import { PageHeader  } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent  } from '../components/ui/Card';
import { Button  } from '../components/ui/Button';
import { Badge  } from '../components/ui/Badge';
import { toast  } from 'sonner';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import { db  } from '../data/db';
import { downloadCSV, formatCurrency  } from '../lib/utils';

const reportTypes = [
  { id: 'employee', label: 'Employee Report', description: 'Complete employee roster with details' },
  { id: 'payroll', label: 'Payroll Report', description: 'Monthly payroll breakdown' },
  { id: 'attendance', label: 'Attendance Report', description: 'Daily and monthly attendance' },
  { id: 'leave', label: 'Leave Report', description: 'Leave applications and approvals' },
  { id: 'asset', label: 'Asset Report', description: 'Asset inventory and assignments' },
  { id: 'performance', label: 'Performance Report', description: 'Employee performance scores' },
];

export function ReportsPage() {
  const [selected, setSelected] = useState('employee');

  const handleExport = (format) => {
    const data = {
      employee: db.employees,
      payroll: db.payroll,
      attendance: db.attendance,
      leave: db.leaves,
      asset: db.assets,
      performance: db.employees.map((e) => ({ id: e.id, name: `${e.firstName} ${e.lastName}`, score: e.performanceScore })),
    };
    const rows = data[selected];
    if (format === 'csv') {
      downloadCSV(`${selected}-report.csv`, rows);
      toast.success('CSV exported');
    } else {
      toast.success(`${format.toUpperCase()} export started`);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Reports" description="Generate and export organizational reports" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((r) => (
          <Card
            key={r.id}
            onClick={() => setSelected(r.id)}
            className={`cursor-pointer p-5 transition-all ${selected === r.id ? 'border-primary shadow-glow' : 'hover:shadow-soft'}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">{r.label}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
              </div>
              {selected === r.id && <Badge variant="primary">Selected</Badge>}
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Export Options</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => handleExport('pdf')}><PictureAsPdfOutlinedIcon className="h-4 w-4" /> Export PDF</Button>
            <Button variant="outline" onClick={() => handleExport('excel')}><GridOnOutlinedIcon className="h-4 w-4" /> Export Excel</Button>
            <Button variant="outline" onClick={() => handleExport('csv')}><DownloadIcon className="h-4 w-4" /> Export CSV</Button>
          </div>
          <div className="mt-6 rounded-lg bg-muted/40 p-4">
            <p className="text-sm text-muted-foreground">Report: <span className="font-medium text-foreground capitalize">{selected}</span></p>
            <p className="mt-1 text-xs text-muted-foreground">Total records: {selected === 'employee' ? db.employees.length : selected === 'payroll' ? db.payroll.length : selected === 'attendance' ? db.attendance.length : selected === 'leave' ? db.leaves.length : selected === 'asset' ? db.assets.length : db.employees.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
