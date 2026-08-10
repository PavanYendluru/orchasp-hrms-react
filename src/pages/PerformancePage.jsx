/** Displays employee performance scores (backend-driven). HR can create/edit scores. */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { RadarChartCard } from '../components/charts/Recharts';
import { api } from '../services/api';
import { toast } from 'sonner';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';

const initialForm = {
  employeeId: '',
  communication: 70,
  attendance: 70,
  productivity: 70,
  technicalSkills: 70,
  leadership: 70,
  discipline: 70,
  overallRating: 70,
};

export function PerformancePage() {
  const [scores, setScores] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [scoreData, employeeData] = await Promise.all([api.performance.list(), api.employees.all()]);
      setScores(scoreData || []);
      setEmployees(employeeData || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load performance scores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (score) => {
    setEditing(score);
    setForm({
      employeeId: String(score.employeeId),
      communication: sval(score.communication),
      attendance: sval(score.attendance),
      productivity: sval(score.productivity),
      technicalSkills: sval(score.technicalSkills),
      leadership: sval(score.leadership),
      discipline: sval(score.discipline),
      overallRating: sval(score.overallRating),
    });
    setModalOpen(true);
  };

  const sval = (v) => (v === null || v === undefined ? 0 : Number(v));
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    if (!form.employeeId) return toast.error('Select an employee.');
    setSaving(true);
    try {
      const payload = { ...form, employeeId: Number(form.employeeId) };
      if (editing) {
        await api.performance.update(editing.id, payload);
        toast.success('Performance score updated.');
      } else {
        await api.performance.create(payload);
        toast.success('Performance score recorded.');
      }
      setModalOpen(false);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save performance score.');
    } finally {
      setSaving(false);
    }
  };

  const avg = (s) => Math.round((sval(s.communication) + sval(s.attendance) + sval(s.productivity) + sval(s.technicalSkills) + sval(s.leadership) + sval(s.discipline)) / 6);

  const radarData = useMemo(() => {
    if (!scores.length) return [];
    const latest = scores[0];
    return [
      { subject: 'Communication', value: sval(latest.communication) },
      { subject: 'Attendance', value: sval(latest.attendance) },
      { subject: 'Productivity', value: sval(latest.productivity) },
      { subject: 'Technical', value: sval(latest.technicalSkills) },
      { subject: 'Leadership', value: sval(latest.leadership) },
      { subject: 'Discipline', value: sval(latest.discipline) },
    ];
  }, [scores]);

  const sorted = useMemo(() => [...scores].sort((a, b) => avg(b) - avg(a)), [scores]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Performance"
        description="Employee performance reviews and analytics"
        actions={<Button onClick={openCreate}><AddOutlinedIcon className="h-4 w-4" /> Record Score</Button>}
      />

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : scores.length === 0 ? (
        <Card><CardContent><EmptyState icon={<InsightsOutlinedIcon className="h-6 w-6" />} title="No performance scores" description="Record the first performance review to get started." action={<Button onClick={openCreate}><AddOutlinedIcon className="h-4 w-4" /> Record Score</Button>} /></CardContent></Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card><CardHeader><CardTitle>Latest Review Radar</CardTitle></CardHeader><CardContent><RadarChartCard data={radarData} /></CardContent></Card>
            <Card><CardHeader><CardTitle>Score Summary</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[{ label: 'Communication', value: sval(scores[0].communication) }, { label: 'Attendance', value: sval(scores[0].attendance) }, { label: 'Productivity', value: sval(scores[0].productivity) }, { label: 'Technical Skills', value: sval(scores[0].technicalSkills) }, { label: 'Leadership', value: sval(scores[0].leadership) }, { label: 'Discipline', value: sval(scores[0].discipline) }].map((item) => (
                  <div key={item.label} className="rounded-lg border border-border p-3 text-center">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="mt-1 font-display text-xl font-bold text-foreground">{item.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Performance Reviews</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sorted.map((score) => (
                  <div key={score.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/40">
                    <Avatar name={score.employeeName} src={score.employeePhoto} size="sm" />
                    <div className="min-w-40 flex-1">
                      <p className="text-sm font-medium text-foreground">{score.employeeName}</p>
                      <p className="text-xs text-muted-foreground">Reviewed {score.reviewDate || '—'}</p>
                    </div>
                    <div className="flex gap-1.5">
                      {[{ label: 'Comm', v: score.communication }, { label: 'Att', v: score.attendance }, { label: 'Prod', v: score.productivity }, { label: 'Tech', v: score.technicalSkills }, { label: 'Lead', v: score.leadership }, { label: 'Disc', v: score.discipline }].map((x) => (
                        <span key={x.label} title={x.label} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{x.label} {sval(x.v)}</span>
                      ))}
                    </div>
                    <div className="w-28">
                      <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${sval(score.overallRating)}%` }} /></div>
                    </div>
                    <Badge variant={sval(score.overallRating) >= 85 ? 'success' : sval(score.overallRating) >= 70 ? 'primary' : sval(score.overallRating) >= 50 ? 'warning' : 'danger'}>{sval(score.overallRating)}%</Badge>
                    <Button size="sm" variant="outline" onClick={() => openEdit(score)}><EditOutlinedIcon className="h-3.5 w-3.5" /> Edit</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editing ? 'Edit Performance Score' : 'Record Performance Score'} description="Set scores from 0 to 100 for each competency.">
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Employee">
            <select required className="input-base" name="employeeId" value={form.employeeId} onChange={update} disabled={Boolean(editing)}>
              <option value="">Select employee</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['communication', 'Communication'], ['attendance', 'Attendance'], ['productivity', 'Productivity'], ['technicalSkills', 'Technical Skills'], ['leadership', 'Leadership'], ['discipline', 'Discipline'],
            ].map(([key, label]) => (
              <FormField key={key} label={label}>
                <input type="number" min="0" max="100" className="input-base" name={key} value={form[key]} onChange={update} />
              </FormField>
            ))}
          </div>
          <FormField label="Overall Rating">
            <input type="number" min="0" max="100" className="input-base" name="overallRating" value={form.overallRating} onChange={update} />
          </FormField>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update Score' : 'Record Score'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
