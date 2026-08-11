/** Manages company assets exclusively through the Spring Boot inventory APIs. */
import { useCallback, useEffect, useMemo, useState } from 'react';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/tables/DataTable';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/common/StatCard';
import { ApexBarChart } from '../components/charts/ApexCharts';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { formatCurrency } from '../lib/utils';
import { api } from '../services/api';
import { toast } from 'sonner';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DangerousOutlinedIcon from '@mui/icons-material/DangerousOutlined';

const statusVariant = { ASSIGNED: 'primary', AVAILABLE: 'success', DAMAGED: 'danger', RETURNED: 'muted' };
const blankAsset = { name: '', category: '', serial: '', value: '', status: 'AVAILABLE' };

export function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assetForm, setAssetForm] = useState(null);
  const [assignment, setAssignment] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [assetData, employeeData] = await Promise.all([api.assets.list(), api.employees.all()]);
      setAssets(assetData || []);
      setEmployees((employeeData || []).filter((employee) => employee.status === 'ACTIVE'));
    } catch (error) { toast.error(error?.response?.data?.message || 'Unable to load assets.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const assetsWithAssignee = useMemo(() => assets.map((asset) => ({ ...asset, assignee: employees.find((employee) => employee.id === asset.employeeId) })), [assets, employees]);
  const stats = useMemo(() => ({
    total: assets.length,
    assigned: assets.filter((asset) => asset.status === 'ASSIGNED').length,
    available: assets.filter((asset) => asset.status === 'AVAILABLE').length,
    damaged: assets.filter((asset) => asset.status === 'DAMAGED').length,
  }), [assets]);
  const byCategory = useMemo(() => {
    const categories = [...new Set(assets.map((asset) => asset.category).filter(Boolean))];
    return { categories, data: [{ name: 'Assets', data: categories.map((category) => assets.filter((asset) => asset.category === category).length) }] };
  }, [assets]);
  const remove = async (asset) => {
    if (!window.confirm(`Delete ${asset.name}? This cannot be undone.`)) return;
    try { await api.assets.remove(asset.id); toast.success('Asset deleted.'); load(); }
    catch (error) { toast.error(error?.response?.data?.message || 'Asset could not be deleted.'); }
  };
  const returnAsset = async (asset) => {
    try { await api.assets.returnAsset(asset.id); toast.success('Asset returned.'); load(); }
    catch (error) { toast.error(error?.response?.data?.message || 'Asset could not be returned.'); }
  };
  const columns = useMemo(() => [
    { accessorKey: 'name', header: 'Asset', cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: 'category', header: 'Category' }, { accessorKey: 'serial', header: 'Serial Number' },
    { id: 'assignee', header: 'Assigned To', cell: ({ row }) => row.original.assignee ? `${row.original.assignee.firstName} ${row.original.assignee.lastName}` : '—' },
    { accessorKey: 'assignedDate', header: 'Assigned Date', cell: ({ row }) => row.original.assignedDate || '—' },
    { accessorKey: 'value', header: 'Value', cell: ({ row }) => formatCurrency(Number(row.original.value || 0)) },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant={statusVariant[row.original.status] || 'muted'}>{row.original.status}</Badge> },
    { id: 'actions', header: 'Actions', enableSorting: false, cell: ({ row }) => <div className="flex gap-1">
      {row.original.status === 'ASSIGNED' && <Button aria-label="Return asset" variant="ghost" size="icon" onClick={() => returnAsset(row.original)}><AssignmentReturnOutlinedIcon className="h-4 w-4" /></Button>}
      <Button aria-label="Delete asset" variant="ghost" size="icon" className="text-danger" onClick={() => remove(row.original)}><DeleteOutlinedIcon className="h-4 w-4" /></Button>
    </div> },
  ], [employees]);
  return <div className="space-y-5"><PageHeader title="Assets" description="Track and manage company assets and inventory" actions={<div className="flex gap-2"><Button variant="outline" onClick={() => setAssignment(true)}>Assign Asset</Button><Button onClick={() => setAssetForm(blankAsset)}><AddOutlinedIcon className="h-4 w-4" /> Add Asset</Button></div>} />
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><StatCard label="Total Assets" value={stats.total} icon={<Inventory2OutlinedIcon className="h-5 w-5" />} accent="primary" /><StatCard label="Assigned" value={stats.assigned} icon={<CheckCircleOutlinedIcon className="h-5 w-5" />} accent="success" /><StatCard label="Available" value={stats.available} icon={<Inventory2OutlinedIcon className="h-5 w-5" />} accent="secondary" /><StatCard label="Damaged" value={stats.damaged} icon={<DangerousOutlinedIcon className="h-5 w-5" />} accent="danger" /></div>
    <Card><CardHeader><CardTitle>Assets by Category</CardTitle></CardHeader><CardContent><ApexBarChart categories={byCategory.categories} data={byCategory.data} /></CardContent></Card>
    {loading ? <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div> : <DataTable columns={columns} data={assetsWithAssignee} searchKey={(asset) => `${asset.name} ${asset.serial} ${asset.category} ${asset.status}`} searchPlaceholder="Search assets…" exportFilename="assets.csv" />}
    <AssetModal asset={assetForm} onClose={() => setAssetForm(null)} onSaved={load} />
    <AssignmentModal open={assignment} assets={assets} employees={employees} onClose={() => setAssignment(false)} onSaved={load} />
  </div>;
}

function AssetModal({ asset, onClose, onSaved }) {
  const [values, setValues] = useState(asset || blankAsset);
  if (!asset) return null;
  const save = async (event) => {
    event.preventDefault();
    if (!values.name || !values.category || !values.serial || values.value === '') return toast.error('Complete all asset fields.');
    try { await api.assets.create({ ...values, value: Number(values.value) }); toast.success('Asset added.'); onSaved(); onClose(); }
    catch (error) { toast.error(error?.response?.data?.message || 'Asset could not be saved.'); }
  };
  return <Modal open onOpenChange={(open) => !open && onClose()} title="Add Asset" footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>Save Asset</Button></>}><form className="grid gap-4 sm:grid-cols-2" onSubmit={save}>{[['Asset Name', 'name'], ['Asset Type / Category', 'category'], ['Serial Number', 'serial'], ['Value', 'value']].map(([label, name]) => <FormField key={name} label={label}><input className="input-base" type={name === 'value' ? 'number' : 'text'} value={values[name]} onChange={(event) => setValues({ ...values, [name]: event.target.value })} /></FormField>)}</form></Modal>;
}

function AssignmentModal({ open, assets, employees, onClose, onSaved }) {
  const [values, setValues] = useState({ assetId: '', employeeId: '' });
  if (!open) return null;
  const submit = async (event) => {
    event.preventDefault();
    if (!values.assetId || !values.employeeId) return toast.error('Select an asset and employee.');
    try { await api.assets.assign({ assetId: Number(values.assetId), employeeId: Number(values.employeeId) }); toast.success('Asset assigned.'); onSaved(); onClose(); }
    catch (error) { toast.error(error?.response?.data?.message || 'Asset could not be assigned.'); }
  };
  return <Modal open onOpenChange={(isOpen) => !isOpen && onClose()} title="Assign asset to employee"><form onSubmit={submit} className="space-y-4"><FormField label="Available asset"><select className="input-base" value={values.assetId} onChange={(event) => setValues({ ...values, assetId: event.target.value })}><option value="">Select asset</option>{assets.filter((asset) => asset.status === 'AVAILABLE').map((asset) => <option key={asset.id} value={asset.id}>{asset.name} · {asset.serial}</option>)}</select></FormField><FormField label="Employee"><select className="input-base" value={values.employeeId} onChange={(event) => setValues({ ...values, employeeId: event.target.value })}><option value="">Select employee</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}</option>)}</select></FormField><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">Assign</Button></div></form></Modal>;
}
