/** Lets the signed-in user review and update personal profile details. */
import { PageHeader  } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent  } from '../components/ui/Card';
import { Avatar  } from '../components/ui/Avatar';
import { Badge  } from '../components/ui/Badge';
import { Button  } from '../components/ui/Button';
import { useAuth  } from '../context/AuthContext';
import { Tabs, TabsList, TabsTrigger, TabsContent  } from '../components/ui/Tabs';
import { useFormWithYup  } from '../components/forms/Form';
import { FormField  } from '../components/ui/Input';
import * as yup from 'yup';
import { toast  } from 'sonner';

const profileSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Too short'),
  email: yup.string().email('Valid email required').required('Email is required'),
  phone: yup.string().required('Phone is required'),
  location: yup.string().required('Location is required'),
});

export function ProfilePage() {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useFormWithYup(profileSchema, {
    defaultValues: { name: user?.name, email: user?.email, phone: '+1-555-0100', location: 'San Francisco, US' },
  });

  const onSubmit = () => toast.success('Profile updated successfully');

  return (
    <div className="space-y-5">
      <PageHeader title="Profile" description="View and manage your personal profile" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center">
            <Avatar name={user?.name || 'User'} size="xl" />
            <h2 className="mt-3 font-display text-lg font-semibold text-foreground">{user?.name}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Badge variant="secondary" className="mt-2 capitalize">{user?.role}</Badge>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-4">
            <div><p className="font-display text-xl font-bold text-foreground">12</p><p className="text-[11px] text-muted-foreground">Projects</p></div>
            <div><p className="font-display text-xl font-bold text-foreground">48</p><p className="text-[11px] text-muted-foreground">Tasks</p></div>
            <div><p className="font-display text-xl font-bold text-foreground">92%</p><p className="text-[11px] text-muted-foreground">Score</p></div>
          </div>
        </Card>

        <div className="lg:col-span-2">
          <Tabs defaultValue="info">
            <TabsList>
              <TabsTrigger value="info">Personal Info</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="info">
              <Card>
                <CardHeader><CardTitle>Edit Personal Information</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
                    <FormField label="Full Name" error={errors.name?.message} className="col-span-2">
                      <input {...register('name')} className="input-base" />
                    </FormField>
                    <FormField label="Email" error={errors.email?.message} className="col-span-2">
                      <input {...register('email')} className="input-base" />
                    </FormField>
                    <FormField label="Phone" error={errors.phone?.message}>
                      <input {...register('phone')} className="input-base" />
                    </FormField>
                    <FormField label="Location" error={errors.location?.message}>
                      <input {...register('location')} className="input-base" />
                    </FormField>
                    <div className="col-span-2 flex justify-end">
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="security">
              <Card>
                <CardHeader><CardTitle>Security Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div><p className="text-sm font-medium text-foreground">Password</p><p className="text-xs text-muted-foreground">Last changed 3 months ago</p></div>
                    <Button variant="outline" size="sm" onClick={() => toast.info('Password change flow')}>Change</Button>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div><p className="text-sm font-medium text-foreground">Two-Factor Auth</p><p className="text-xs text-muted-foreground">Not enabled</p></div>
                    <Button variant="outline" size="sm" onClick={() => toast.info('2FA setup')}>Enable</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="activity">
              <Card>
                <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {['Logged in from San Francisco', 'Updated profile picture', 'Completed Q2 review', 'Joined Project Atlas', 'Approved 3 leave requests'].map((a, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-border pb-2">
                      <span className="text-foreground">{a}</span>
                      <span className="text-xs text-muted-foreground">{i + 1}d ago</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
