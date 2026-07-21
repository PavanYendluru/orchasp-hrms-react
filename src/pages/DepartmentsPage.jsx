import { useMemo  } from 'react';
import { PageHeader  } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent  } from '../components/ui/Card';
import { Avatar  } from '../components/ui/Avatar';
import { Badge  } from '../components/ui/Badge';
import { BarChartCard  } from '../components/charts/Recharts';
import { db  } from '../data/db';
import { formatCurrency  } from '../lib/utils';

export function DepartmentsPage() {
  const departments = useMemo(
    () => db.departments.map((d) => ({
      ...d,
      employeeCount: db.employees.filter((e) => e.departmentId === d.id).length,
      head: db.employees.find((e) => e.id === d.headId),
    })),
    []
  );

  const chartData = departments.map((d) => ({ name: d.name.slice(0, 8), employees: d.employeeCount, budget: Math.round(d.budget / 1000) }));

  return (
    <div className="space-y-5">
      <PageHeader title="Departments" description="Organizational structure and department overview" />
      <Card>
        <CardHeader><CardTitle>Headcount by Department</CardTitle></CardHeader>
        <CardContent>
          <BarChartCard data={chartData} xKey="name" series={[{ key: 'employees', name: 'Employees', color: '#2563eb' }, { key: 'budget', name: 'Budget ($k)', color: '#7c3aed' }]} />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((d) => (
          <Card key={d.id} className="overflow-hidden">
            <div className="h-1.5" style={{ backgroundColor: d.color }} />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-base font-semibold text-foreground">{d.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{d.employeeCount} employees</p>
                </div>
                <Badge variant="primary">{formatCurrency(d.budget)}</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{d.description}</p>
              {d.head && (
                <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                  <Avatar name={`${d.head.firstName} ${d.head.lastName}`} size="sm" />
                  <div><p className="text-xs font-medium text-foreground">{d.head.firstName} {d.head.lastName}</p><p className="text-[11px] text-muted-foreground">Department Head</p></div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
