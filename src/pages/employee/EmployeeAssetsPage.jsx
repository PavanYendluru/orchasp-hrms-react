import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../services/api';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { formatCurrency } from '../../lib/utils';

export function EmployeeAssetsPage() {
  const { employee } = useEmployeeAuth();
  const [assets, setAssets] = useState([]);
  useEffect(() => { api.assets.mine().then(setAssets); }, []);
  return <div className="space-y-5"><div><h1 className="font-display text-2xl font-bold text-foreground">My assets</h1><p className="mt-1 text-sm text-muted-foreground">Company equipment currently assigned to you by HR.</p></div><Card><CardHeader><CardTitle>Assigned equipment</CardTitle></CardHeader><CardContent>{assets.length ? <div className="grid gap-4 md:grid-cols-2">{assets.map((asset) => <div key={asset.id} className="rounded-xl border border-border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-foreground">{asset.name}</p><p className="mt-1 text-sm text-muted-foreground">{asset.category} · {asset.serial}</p></div><Badge variant="primary" className="capitalize">{asset.status}</Badge></div><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-muted-foreground">Assigned on</dt><dd className="mt-1 font-medium">{asset.assignedDate}</dd></div><div><dt className="text-muted-foreground">Asset value</dt><dd className="mt-1 font-medium">{formatCurrency(asset.value)}</dd></div></dl></div>)}</div> : <p className="py-8 text-center text-sm text-muted-foreground">No equipment has been assigned to you yet.</p>}</CardContent></Card></div>;
}
