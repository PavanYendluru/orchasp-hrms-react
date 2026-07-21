/** Displays a concise employee summary for lists and dashboards. */
import { Card  } from '../ui/Card';
import { Avatar  } from '../ui/Avatar';
import { Badge  } from '../ui/Badge';
import { cn  } from '../../lib/utils';

const statusVariant = {
  active: 'success',
  'on-leave': 'warning',
  inactive: 'muted',
  terminated: 'danger',
};

// Render a compact, clickable employee summary.
export function EmployeeCard({ employee, onClick, className }) {
  return (
    <Card
      onClick={onClick}
      className={cn('cursor-pointer p-4 transition-all hover:shadow-glow hover:-translate-y-0.5', className)}
    >
      <div className="flex items-center gap-3">
        <Avatar name={`${employee.firstName} ${employee.lastName}`} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {employee.firstName} {employee.lastName}
          </p>
          <p className="truncate text-xs text-muted-foreground">{employee.jobTitle}</p>
        </div>
        <Badge variant={statusVariant[employee.status]} className="capitalize">
          {employee.status.replace('-', ' ')}
        </Badge>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{employee.location}</span>
        <span className="font-medium text-foreground">${(employee.salary / 1000).toFixed(0)}k</span>
      </div>
    </Card>
  );
}
