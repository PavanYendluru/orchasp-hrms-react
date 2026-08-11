import { useEffect, useState } from 'react';
import moment from 'moment';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardContent } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { api } from '../services/api';

/** Displays database-backed application activity, optionally constrained to an inclusive date range. */
export function RecentActivityPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    api.dashboard.activities({ startDate: startDate || undefined, endDate: endDate || undefined, limit: 100 })
      .then((data) => mounted && setActivities(data || []))
      .catch((err) => mounted && setError(err?.response?.data?.message || 'Unable to load recent activity.'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [startDate, endDate]);

  return <div className="space-y-5">
    <PageHeader title="Recent Activity" description="Auditable events from across the HRMS" />
    <Card><CardContent className="flex flex-wrap gap-3 p-4">
      <label className="text-sm">Start Date <input className="input-base ml-2" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
      <label className="text-sm">End Date <input className="input-base ml-2" type="date" min={startDate || undefined} value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label>
    </CardContent></Card>
    <Card><CardContent className="p-0">
      {loading ? <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
        : error ? <p className="p-6 text-sm text-danger">{error}</p>
          : activities.length === 0 ? <p className="p-6 text-sm text-muted-foreground">No activity exists for this date range.</p>
            : <div className="divide-y divide-border">{activities.map((activity) => <div key={activity.id} className="p-4">
              <p className="font-medium text-foreground">{activity.description || activity.activityType}</p>
              <p className="mt-1 text-sm text-muted-foreground">{activity.employeeName} · {String(activity.activityType).replaceAll('_', ' ')} · {moment(activity.createdAt).format('DD MMM YYYY, h:mm A')}</p>
            </div>)}</div>}
    </CardContent></Card>
  </div>;
}
