import { useMemo  } from 'react';
import moment from 'moment';
import { PageHeader  } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent  } from '../components/ui/Card';
import { Badge  } from '../components/ui/Badge';
import { Avatar  } from '../components/ui/Avatar';
import { db  } from '../data/db';

const statusVariant = {
  planning: 'warning', active: 'success', 'on-hold': 'muted', completed: 'primary', cancelled: 'danger',
};

export function ProjectsPage() {
  const projects = useMemo(() => db.projects.map((p) => ({
    ...p,
    lead: db.employees.find((e) => e.id === p.leadId),
    members: p.memberIds.map((id) => db.employees.find((e) => e.id === id)).filter(Boolean),
  })), []);

  return (
    <div className="space-y-5">
      <PageHeader title="Projects" description="Manage organizational projects and initiatives" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-display text-base font-semibold text-foreground">{p.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
              </div>
              <Badge variant={statusVariant[p.status]} className="capitalize">{p.status.replace('-', ' ')}</Badge>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Progress</span><span className="font-medium text-foreground">{p.progress}%</span></div>
              <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${p.progress}%` }} /></div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <div className="flex -space-x-2">
                {p.members.slice(0, 4).map((m) => <Avatar key={m.id} name={`${m.firstName} ${m.lastName}`} size="xs" className="ring-2 ring-card" />)}
                {p.members.length > 4 && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-card">+{p.members.length - 4}</span>}
              </div>
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground">Due</p>
                <p className="text-xs font-medium text-foreground">{p.endDate ? moment(p.endDate).format('MMM D') : 'TBD'}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
