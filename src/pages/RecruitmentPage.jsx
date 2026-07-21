import { useMemo  } from 'react';
import { PageHeader  } from '../components/common/PageHeader';
import { DataTable  } from '../components/tables/DataTable';
import { Card, CardHeader, CardTitle, CardContent  } from '../components/ui/Card';
import { Badge  } from '../components/ui/Badge';
import { StatCard  } from '../components/common/StatCard';
import { db  } from '../data/db';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';

const stages = ['Sourced', 'Phone Screen', 'Technical', 'Onsite', 'Offer', 'Hired'];

export function RecruitmentPage() {
  const candidates = useMemo(() => db.employees.slice(0, 25).map((e, i) => ({
    id: `cand_${i}`,
    name: `${e.firstName} ${e.lastName}`,
    email: e.email,
    position: e.jobTitle || 'Position TBD',
    stage: stages[i % stages.length],
    appliedAt: e.hireDate,
    rating: e.performanceScore,
  })), []);

  const stats = {
    open: 12,
    candidates: candidates.length,
    hired: candidates.filter((c) => c.stage === 'Hired').length,
  };

  const columns = useMemo(() => [
    { accessorKey: 'name', header: 'Candidate', cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: 'position', header: 'Position' },
    { accessorKey: 'stage', header: 'Stage', cell: ({ row }) => <Badge variant={row.original.stage === 'Hired' ? 'success' : row.original.stage === 'Offer' ? 'primary' : 'warning'}>{row.original.stage}</Badge> },
    { accessorKey: 'rating', header: 'Rating', cell: ({ row }) => <span className="font-medium">{row.original.rating}/100</span> },
  ], []);

  return (
    <div className="space-y-5">
      <PageHeader title="Recruitment" description="Manage job openings and candidate pipeline" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Open Positions" value={stats.open} icon={<AssignmentOutlinedIcon className="h-5 w-5" />} accent="primary" />
        <StatCard index={1} label="Active Candidates" value={stats.candidates} icon={<PersonAddAltOutlinedIcon className="h-5 w-5" />} accent="secondary" />
        <StatCard index={2} label="Hired This Quarter" value={stats.hired} icon={<GroupsOutlinedIcon className="h-5 w-5" />} accent="success" />
      </div>

      {/* Pipeline */}
      <Card>
        <CardHeader><CardTitle>Recruitment Pipeline</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {stages.map((stage) => {
              const count = candidates.filter((c) => c.stage === stage).length;
              return (
                <div key={stage} className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">{stage}</p>
                  <p className="mt-1 font-display text-xl font-bold text-foreground">{count}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <DataTable columns={columns} data={candidates} searchKey={(c) => `${c.name} ${c.position}`} searchPlaceholder="Search candidates…" exportFilename="candidates.csv" />
    </div>
  );
}
