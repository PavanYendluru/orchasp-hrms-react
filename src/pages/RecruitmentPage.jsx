/** Manages job openings and the candidate recruitment pipeline (backend-driven). */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { ImportExcelButton } from '../components/common/ImportExcelButton';
import { DataTable } from '../components/tables/DataTable';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/Input';
import { StatCard } from '../components/common/StatCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { api } from '../services/api';
import { toast } from 'sonner';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';

const stages = ['SOURCED', 'SCREENING', 'INTERVIEW', 'TECHNICAL', 'HR_ROUND', 'OFFER', 'HIRED', 'REJECTED'];

const stageVariant = {
  SOURCED: 'muted',
  SCREENING: 'warning',
  INTERVIEW: 'primary',
  TECHNICAL: 'primary',
  HR_ROUND: 'primary',
  OFFER: 'warning',
  HIRED: 'success',
  REJECTED: 'danger',
};

const stageLabels = {
  SOURCED: 'Sourced',
  SCREENING: 'Screening',
  INTERVIEW: 'Interview',
  TECHNICAL: 'Technical',
  HR_ROUND: 'HR Round',
  OFFER: 'Offer',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
};

const emptyJobForm = { position: '', department: '', vacancies: 1, location: '', employmentType: 'FULL_TIME', experience: '', description: '' };
const emptyCandForm = { name: '', role: '', stage: 'SOURCED', rating: 70, phone: '', email: '', resumeUrl: '', source: '', jobOpeningId: '' };

export function RecruitmentPage() {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [summary, setSummary] = useState({ totalCandidates: 0, interviewScheduled: 0, offers: 0, hired: 0, rejected: 0, openPositions: 0 });
  const [loading, setLoading] = useState(true);
  const [jobModal, setJobModal] = useState(false);
  const [candModal, setCandModal] = useState(false);
  const [jobForm, setJobForm] = useState(emptyJobForm);
  const [candForm, setCandForm] = useState(emptyCandForm);
  const [editingJob, setEditingJob] = useState(null);
  const [editingCand, setEditingCand] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [jobData, candData, sum] = await Promise.all([api.recruitment.jobs.list(), api.recruitment.candidates.list(), api.recruitment.summary()]);
      setJobs(jobData || []);
      setCandidates(candData || []);
      setSummary(sum || {});
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load recruitment data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ---- Job Opening actions ----
  const openJob = (job) => {
    setEditingJob(job || null);
    setJobForm(job ? {
      position: job.position || '', department: job.department || '', vacancies: job.vacancies || 1, location: job.location || '', employmentType: job.employmentType || 'FULL_TIME', experience: job.experience || '', description: job.description || '',
    } : emptyJobForm);
    setJobModal(true);
  };

  const submitJob = async (event) => {
    event.preventDefault();
    if (!jobForm.position.trim()) return toast.error('Position is required.');
    setSaving(true);
    try {
      const payload = { ...jobForm, vacancies: Number(jobForm.vacancies) || 1 };
      if (editingJob) { await api.recruitment.jobs.update(editingJob.id, payload); toast.success('Job opening updated.'); }
      else { await api.recruitment.jobs.create(payload); toast.success('Job opening created.'); }
      setJobModal(false);
      await load();
    } catch (error) { toast.error(error.response?.data?.message || 'Unable to save job opening.'); }
    finally { setSaving(false); }
  };

  const deleteJob = async (job) => {
    if (!window.confirm(`Delete opening for "${job.position}"?`)) return;
    try { await api.recruitment.jobs.remove(job.id); toast.success('Job opening deleted.'); await load(); }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to delete job opening.'); }
  };

  // ---- Candidate actions ----
  const openCand = (cand) => {
    setEditingCand(cand || null);
    setCandForm(cand ? {
      name: cand.name || '', role: cand.role || '', stage: cand.stage || 'SOURCED', rating: cand.rating ?? 70, phone: cand.phone || '', email: cand.email || '', resumeUrl: cand.resumeUrl || '', source: cand.source || '', jobOpeningId: cand.jobOpeningId ? String(cand.jobOpeningId) : '',
    } : emptyCandForm);
    setCandModal(true);
  };

  const submitCand = async (event) => {
    event.preventDefault();
    if (!candForm.name.trim()) return toast.error('Candidate name is required.');
    setSaving(true);
    try {
      const payload = { ...candForm, rating: Number(candForm.rating) || 0, jobOpeningId: candForm.jobOpeningId ? Number(candForm.jobOpeningId) : null };
      if (editingCand) { await api.recruitment.candidates.update(editingCand.id, payload); toast.success('Candidate updated.'); }
      else { await api.recruitment.candidates.create(payload); toast.success('Candidate added.'); }
      setCandModal(false);
      await load();
    } catch (error) { toast.error(error.response?.data?.message || 'Unable to save candidate.'); }
    finally { setSaving(false); }
  };

  const moveStage = async (cand, stage) => {
    try { await api.recruitment.candidates.setStage(cand.id, stage); toast.success(`Candidate moved to ${stageLabels[stage] || stage}.`); await load(); }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to update candidate stage.'); }
  };

  const deleteCand = async (cand) => {
    if (!window.confirm(`Delete candidate "${cand.name}"?`)) return;
    try { await api.recruitment.candidates.remove(cand.id); toast.success('Candidate removed.'); await load(); }
    catch (error) { toast.error(error.response?.data?.message || 'Unable to delete candidate.'); }
  };

  const columns = useMemo(() => [
    { accessorKey: 'name', header: 'Candidate', cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: 'role', header: 'Role' },
    { accessorKey: 'jobOpeningPosition', header: 'Position', cell: ({ row }) => row.original.jobOpeningPosition || '—' },
    { accessorKey: 'stage', header: 'Stage', cell: ({ row }) => <Badge variant={stageVariant[row.original.stage] || 'muted'} className="capitalize">{(stageLabels[row.original.stage] || row.original.stage || '').toLowerCase()}</Badge> },
    { accessorKey: 'rating', header: 'Rating', cell: ({ row }) => <span className="font-medium">{row.original.rating ?? '—'}/100</span> },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          <Button size="sm" variant="outline" onClick={() => openCand(row.original)}>Edit</Button>
          <select className="input-base h-8 w-auto text-xs" value="" onChange={(e) => e.target.value && moveStage(row.original, e.target.value)} defaultValue="">
            <option value="" disabled>Set Stage</option>
            {stages.map((s) => <option key={s} value={s}>{stageLabels[s]}</option>)}
          </select>
          <Button size="sm" variant="danger" onClick={() => deleteCand(row.original)}>Delete</Button>
        </div>
      ),
    },
  ], []);

  const pipelineCounts = useMemo(() => {
    const counts = {};
    stages.forEach((s) => { counts[s] = 0; });
    candidates.forEach((c) => { if (counts[c.stage] !== undefined) counts[c.stage] += 1; });
    return counts;
  }, [candidates]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Recruitment"
        description="Manage job openings and the candidate pipeline"
        actions={<><ImportExcelButton module="candidates" label="Import Candidates" onImported={() => window.location.reload()} /><ImportExcelButton module="job-openings" label="Import Openings" onImported={() => window.location.reload()} /><Button variant="outline" onClick={() => openCand(null)}><PersonAddOutlinedIcon className="h-4 w-4" /> Add Candidate</Button><Button onClick={() => openJob(null)}><WorkOutlineOutlinedIcon className="h-4 w-4" /> New Opening</Button></>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard index={0} label="Total Candidates" value={summary.totalCandidates ?? 0} icon={<GroupsOutlinedIcon className="h-5 w-5" />} accent="primary" />
        <StatCard index={1} label="Interview Scheduled" value={summary.interviewScheduled ?? 0} icon={<ChecklistOutlinedIcon className="h-5 w-5" />} accent="warning" />
        <StatCard index={2} label="Offers" value={summary.offers ?? 0} icon={<ChecklistOutlinedIcon className="h-5 w-5" />} accent="primary" />
        <StatCard index={3} label="Hired" value={summary.hired ?? 0} icon={<HowToRegOutlinedIcon className="h-5 w-5" />} accent="success" />
        <StatCard index={4} label="Rejected" value={summary.rejected ?? 0} icon={<GroupsOutlinedIcon className="h-5 w-5" />} accent="danger" />
        <StatCard index={5} label="Open Positions" value={summary.openPositions ?? 0} icon={<WorkOutlineOutlinedIcon className="h-5 w-5" />} accent="secondary" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : (
        <>
          {/* Open positions */}
          <Card>
            <CardHeader><CardTitle>Open Positions</CardTitle></CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <EmptyState icon={<WorkOutlineOutlinedIcon className="h-6 w-6" />} title="No job openings" description="Create an opening to start receiving candidates." action={<Button onClick={() => openJob(null)}><WorkOutlineOutlinedIcon className="h-4 w-4" /> New Opening</Button>} />
              ) : (
                <div className="space-y-2">
                  {jobs.map((job) => (
                    <div key={job.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
                      <div>
                        <div className="flex items-center gap-2"><p className="text-sm font-semibold text-foreground">{job.position}</p><Badge variant={job.active ? 'success' : 'muted'}>{job.active ? 'Open' : 'Closed'}</Badge></div>
                        <p className="text-xs text-muted-foreground">{job.department} · {job.location} · {job.employmentType} · {job.experience}</p>
                        {job.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{job.description}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{job.vacancies} vacancy/ies</span>
                        <Button size="sm" variant="outline" onClick={() => openJob(job)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => deleteJob(job)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pipeline */}
          <Card>
            <CardHeader><CardTitle>Recruitment Pipeline</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {stages.map((stage) => (
                  <div key={stage} className="rounded-lg border border-border p-3 text-center">
                    <p className="text-xs text-muted-foreground">{stageLabels[stage]}</p>
                    <p className="mt-1 font-display text-xl font-bold text-foreground">{pipelineCounts[stage]}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Candidates table */}
          <Card>
            <CardHeader><CardTitle>Candidates</CardTitle></CardHeader>
            <CardContent>
              {candidates.length === 0 ? (
                <EmptyState icon={<PersonAddOutlinedIcon className="h-6 w-6" />} title="No candidates" description="Add a candidate to begin." action={<Button onClick={() => openCand(null)}><PersonAddOutlinedIcon className="h-4 w-4" /> Add Candidate</Button>} />
              ) : (
                <DataTable columns={columns} data={candidates} searchKey={(c) => `${c.name} ${c.role} ${c.jobOpeningPosition || ''}`} searchPlaceholder="Search candidates…" exportFilename="candidates.csv" />
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Job opening modal */}
      <Modal open={jobModal} onOpenChange={setJobModal} title={editingJob ? 'Edit Job Opening' : 'New Job Opening'}>
        <form onSubmit={submitJob} className="space-y-4">
          <FormField label="Position"><input required className="input-base" value={jobForm.position} onChange={(e) => setJobForm({ ...jobForm, position: e.target.value })} placeholder="e.g. Senior React Developer" /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Department"><input className="input-base" value={jobForm.department} onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })} /></FormField>
            <FormField label="Vacancies"><input type="number" min="1" className="input-base" value={jobForm.vacancies} onChange={(e) => setJobForm({ ...jobForm, vacancies: e.target.value })} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Location"><input className="input-base" value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} /></FormField>
            <FormField label="Employment Type">
              <select className="input-base" value={jobForm.employmentType} onChange={(e) => setJobForm({ ...jobForm, employmentType: e.target.value })}>
                <option value="FULL_TIME">Full Time</option><option value="PART_TIME">Part Time</option><option value="CONTRACT">Contract</option><option value="INTERNSHIP">Internship</option>
              </select>
            </FormField>
          </div>
          <FormField label="Experience"><input className="input-base" value={jobForm.experience} onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })} placeholder="e.g. 3+ years" /></FormField>
          <FormField label="Description"><textarea className="input-base min-h-20" value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} /></FormField>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setJobModal(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : editingJob ? 'Update Opening' : 'Create Opening'}</Button>
          </div>
        </form>
      </Modal>

      {/* Candidate modal */}
      <Modal open={candModal} onOpenChange={setCandModal} title={editingCand ? 'Edit Candidate' : 'Add Candidate'}>
        <form onSubmit={submitCand} className="space-y-4">
          <FormField label="Candidate Name"><input required className="input-base" value={candForm.name} onChange={(e) => setCandForm({ ...candForm, name: e.target.value })} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Role"><input className="input-base" value={candForm.role} onChange={(e) => setCandForm({ ...candForm, role: e.target.value })} /></FormField>
            <FormField label="Stage">
              <select className="input-base" value={candForm.stage} onChange={(e) => setCandForm({ ...candForm, stage: e.target.value })}>
                {stages.map((s) => <option key={s} value={s}>{stageLabels[s]}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Rating (0-100)"><input type="number" min="0" max="100" className="input-base" value={candForm.rating} onChange={(e) => setCandForm({ ...candForm, rating: e.target.value })} /></FormField>
            <FormField label="Source"><input className="input-base" value={candForm.source} onChange={(e) => setCandForm({ ...candForm, source: e.target.value })} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone"><input className="input-base" value={candForm.phone} onChange={(e) => setCandForm({ ...candForm, phone: e.target.value })} /></FormField>
            <FormField label="Email"><input type="email" className="input-base" value={candForm.email} onChange={(e) => setCandForm({ ...candForm, email: e.target.value })} /></FormField>
          </div>
          <FormField label="Resume URL"><input className="input-base" value={candForm.resumeUrl} onChange={(e) => setCandForm({ ...candForm, resumeUrl: e.target.value })} /></FormField>
          <FormField label="Job Opening">
            <select className="input-base" value={candForm.jobOpeningId} onChange={(e) => setCandForm({ ...candForm, jobOpeningId: e.target.value })}>
              <option value="">None</option>
              {jobs.map((job) => <option key={job.id} value={job.id}>{job.position}</option>)}
            </select>
          </FormField>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setCandModal(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : editingCand ? 'Update Candidate' : 'Add Candidate'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
