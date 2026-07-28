/** Manages company inventory through add, edit, assignment, return, and damage workflows. */
import { useMemo, useRef, useState } from 'react';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/tables/DataTable';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/common/StatCard';
import { ApexBarChart } from '../components/charts/ApexCharts';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FormField } from '../components/ui/Input';
import { formatCurrency, parseCSV } from '../lib/utils';
import { hrmsStore, useHrmsData } from '../services/hrmsStore';
import { toast } from 'sonner';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DangerousOutlinedIcon from '@mui/icons-material/DangerousOutlined';

const statusVariant = { assigned: 'primary', available: 'success', damaged: 'danger', returned: 'muted' };
const blankAsset = { name: '', category: '', serial: '', value: '', status: 'available' };

/** Shows inventory summaries and the asset table. */
export function AssetsPage() {
  const data = useHrmsData();
  const fileInput = useRef(null);
  const [assetForm, setAssetForm] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const assets = useMemo(() => data.assets.map((asset) => ({ ...asset, assignee: data.employees.find((employee) => employee.id === asset.assignedToId) })), [data]);
  const stats = { total: assets.length, assigned: assets.filter((asset) => asset.status === 'assigned').length, available: assets.filter((asset) => asset.status === 'available').length, damaged: assets.filter((asset) => asset.status === 'damaged').length };
  const byCategory = useMemo(() => { const categories = [...new Set(assets.map((asset) => asset.category))]; return { categories, data: [{ name: 'Assets', data: categories.map((category) => assets.filter((asset) => asset.category === category).length) }] }; }, [assets]);

  /** Table actions mutate the store and stop the row click from bubbling. */
  const columns = useMemo(() => [
    { accessorKey: 'name', header: 'Asset', cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: 'category', header: 'Category' }, { accessorKey: 'serial', header: 'Serial Number' },
    { accessorKey: 'assignee', header: 'Assigned To', cell: ({ row }) => row.original.assignee ? `${row.original.assignee.firstName} ${row.original.assignee.lastName}` : '—' },
    { accessorKey: 'assignedDate', header: 'Assigned Date', cell: ({ row }) => row.original.assignedDate || '—' }, { accessorKey: 'value', header: 'Value', cell: ({ row }) => formatCurrency(Number(row.original.value)) },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant={statusVariant[row.original.status]} className="capitalize">{row.original.status}</Badge> },
    { id: 'actions', header: 'Actions', enableSorting: false, cell: ({ row }) => <div className="flex gap-1"><Button aria-label="Edit asset" variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); setAssetForm(row.original); }}><EditOutlinedIcon className="h-4 w-4" /></Button>{row.original.status === 'assigned' && <Button aria-label="Return asset" variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); hrmsStore.assets.returnAsset(row.original.id); toast.success('Asset returned.'); }}><AssignmentReturnOutlinedIcon className="h-4 w-4" /></Button>}<Button aria-label="Mark damaged" variant="ghost" size="icon" className="text-warning" onClick={(event) => { event.stopPropagation(); hrmsStore.assets.update(row.original.id, { status: 'damaged' }); toast.success('Asset marked as damaged.'); }}><BuildOutlinedIcon className="h-4 w-4" /></Button><Button aria-label="Delete asset" variant="ghost" size="icon" className="text-danger" onClick={(event) => { event.stopPropagation(); removeAsset(row.original); }}><DeleteOutlinedIcon className="h-4 w-4" /></Button></div> },
  ], []);

  const removeAsset = (asset) => { if (window.confirm(`Delete ${asset.name}? This cannot be undone.`)) { hrmsStore.assets.remove(asset.id); toast.success('Asset deleted.'); } };
  const importAssets = async (event) => { const file = event.target.files?.[0]; event.target.value = ''; if (!file) return; try { const rows = parseCSV(await file.text()); const required = ['name', 'category', 'serial', 'value']; if (rows.some((row) => required.some((field) => !row[field]))) throw new Error(`CSV must include: ${required.join(', ')}.`); rows.forEach((row) => hrmsStore.assets.create({ ...row, value: Number(row.value) })); toast.success(`${rows.length} assets imported.`); } catch (error) { toast.error(error.message || 'Unable to import assets.'); } };

  return <div className="space-y-5"><PageHeader title="Assets" description="Track and manage company assets and inventory" actions={<div className="flex gap-2"><input ref={fileInput} type="file" accept=".csv,text/csv" className="hidden" onChange={importAssets} /><Button variant="outline" onClick={() => fileInput.current?.click()}><UploadFileOutlinedIcon className="h-4 w-4" /> Import CSV</Button><Button variant="outline" onClick={() => setAssignment({ assetId: '', employeeId: '' })}>Assign Asset</Button><Button onClick={() => setAssetForm({ ...blankAsset })}><AddOutlinedIcon className="h-4 w-4" /> Add Asset</Button></div>} />
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><StatCard index={0} label="Total Assets" value={stats.total} icon={<Inventory2OutlinedIcon className="h-5 w-5" />} accent="primary" /><StatCard index={1} label="Assigned" value={stats.assigned} icon={<CheckCircleOutlinedIcon className="h-5 w-5" />} accent="success" /><StatCard index={2} label="Available" value={stats.available} icon={<Inventory2OutlinedIcon className="h-5 w-5" />} accent="secondary" /><StatCard index={3} label="Damaged" value={stats.damaged} icon={<DangerousOutlinedIcon className="h-5 w-5" />} accent="danger" /></div>
    <Card><CardHeader><CardTitle>Assets by Category</CardTitle></CardHeader><CardContent><ApexBarChart categories={byCategory.categories} data={byCategory.data} /></CardContent></Card>
    <DataTable columns={columns} data={assets} searchKey={(asset) => `${asset.name} ${asset.serial} ${asset.category} ${asset.status}`} searchPlaceholder="Search assets…" enableSelection exportFilename="assets.csv" />
    <AssetModal asset={assetForm} onClose={() => setAssetForm(null)} /><AssignmentModal assignment={assignment} assets={assets} employees={data.employees} onClose={() => setAssignment(null)} />
  </div>;
}

/** Collects the core inventory fields for both new and existing assets. */
function AssetModal({ asset, onClose }) {
  const [values, setValues] = useState(asset || blankAsset);
  if (!asset) return null;
  const save = (event) => { event.preventDefault(); if (!values.name || !values.category || !values.serial || !values.value) return toast.error('Complete all asset fields.'); if (asset.id) hrmsStore.assets.update(asset.id, { ...values, value: Number(values.value) }); else hrmsStore.assets.create({ ...values, value: Number(values.value) }); toast.success(asset.id ? 'Asset updated.' : 'Asset added.'); onClose(); };
  return <Modal open onOpenChange={(open) => !open && onClose()} title={asset.id ? 'Edit Asset' : 'Add Asset'} footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>Save Asset</Button></>}><form className="grid gap-4 sm:grid-cols-2" onSubmit={save}>{[['Asset Name', 'name'], ['Asset Type / Category', 'category'], ['Serial Number', 'serial'], ['Value', 'value']].map(([label, name]) => <FormField key={name} label={label}><input className="input-base" type={name === 'value' ? 'number' : 'text'} value={values[name]} onChange={(event) => setValues({ ...values, [name]: event.target.value })} /></FormField>)}<FormField label="Status"><select className="input-base" value={values.status} onChange={(event) => setValues({ ...values, status: event.target.value })}>{Object.keys(statusVariant).map((status) => <option key={status} value={status}>{status}</option>)}</select></FormField></form></Modal>;
}

/** Assigns only available inventory to active employees. */
function AssignmentModal({ assignment, assets, employees, onClose }) {
  const [values, setValues] = useState(assignment || { assetId: '', employeeId: '' });
  if (!assignment) return null;
  const submit = (event) => { event.preventDefault(); if (!values.assetId || !values.employeeId) return toast.error('Select an asset and employee.'); hrmsStore.assets.assign(values.assetId, values.employeeId); toast.success('Asset assigned to employee.'); onClose(); };
  return <Modal open onOpenChange={(open) => !open && onClose()} title="Assign asset to employee"><form onSubmit={submit} className="space-y-4"><FormField label="Available asset"><select className="input-base" value={values.assetId} onChange={(event) => setValues({ ...values, assetId: event.target.value })}><option value="">Select asset</option>{assets.filter((asset) => asset.status === 'available').map((asset) => <option key={asset.id} value={asset.id}>{asset.name} · {asset.serial}</option>)}</select></FormField><FormField label="Employee"><select className="input-base" value={values.employeeId} onChange={(event) => setValues({ ...values, employeeId: event.target.value })}><option value="">Select employee</option>{employees.filter((employee) => employee.status === 'active').map((employee) => <option key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}</option>)}</select></FormField><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">Assign asset</Button></div></form></Modal>;
}
