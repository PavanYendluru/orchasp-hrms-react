import { useEffect, useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { api } from '../services/api';
import { toast } from 'sonner';

const emptyProfile = { name: '', email: '', phone: '', department: '', designation: '', role: '' };

/** Loads and persists only the authenticated HR/Admin profile. */
export function ProfilePage() {
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    api.profile.hr().then((data) => setProfile(data || emptyProfile))
      .catch((error) => toast.error(error?.response?.data?.message || 'Unable to load profile.'))
      .finally(() => setLoading(false));
  }, []);
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try { const updated = await api.profile.updateHr(profile); setProfile(updated); toast.success('Profile saved.'); }
    catch (error) { toast.error(error?.response?.data?.message || 'Profile could not be saved.'); }
    finally { setSaving(false); }
  };
  if (loading) return <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>;
  return <div className="space-y-5"><PageHeader title="HR Profile" description="Manage your authenticated profile" />
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3"><Card className="p-6 text-center"><div className="flex flex-col items-center"><Avatar name={profile.name || 'HR'} size="xl" /><h2 className="mt-3 font-display text-lg font-semibold text-foreground">{profile.name}</h2><p className="text-sm text-muted-foreground">{profile.email}</p><Badge variant="secondary" className="mt-2">{profile.role}</Badge></div></Card>
      <div className="lg:col-span-2"><Card><CardHeader><CardTitle>Edit Personal Information</CardTitle></CardHeader><CardContent><form onSubmit={save} className="grid grid-cols-1 gap-4 sm:grid-cols-2">{[['Full Name', 'name', 'text'], ['Email', 'email', 'email'], ['Phone', 'phone', 'tel'], ['Department', 'department', 'text'], ['Designation', 'designation', 'text']].map(([label, field, type]) => <FormField key={field} label={label} className={field === 'name' || field === 'email' ? 'sm:col-span-2' : ''}><input required className="input-base" type={type} value={profile[field]} onChange={(event) => setProfile({ ...profile, [field]: event.target.value })} /></FormField>)}<div className="sm:col-span-2 flex justify-end"><Button disabled={saving} type="submit">{saving ? 'Saving…' : 'Save Changes'}</Button></div></form></CardContent></Card></div>
    </div>
  </div>;
}
