/** Manages persistent application, notification, and account preferences. */
import { PageHeader  } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent  } from '../components/ui/Card';
import { Switch  } from '../components/ui/Switch';
import { Button  } from '../components/ui/Button';
import { useTheme  } from '../context/ThemeContext';
import { useLocalStorage  } from '../hooks/useLocalStorage';
import { toast  } from 'sonner';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [emailNotif, setEmailNotif] = useLocalStorage('orchasp-email-notif', true);
  const [pushNotif, setPushNotif] = useLocalStorage('orchasp-push-notif', true);
  const [twoFA, setTwoFA] = useLocalStorage('orchasp-2fa', false);
  const [language, setLanguage] = useLocalStorage('orchasp-lang', 'en');

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" description="Manage your account and application preferences" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PaletteOutlinedIcon className="h-4 w-4" /> Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-foreground">Theme</p><p className="text-xs text-muted-foreground">Choose light, dark, or system theme</p></div>
            <div className="flex gap-2">
              {(['light', 'dark', 'system']).map((t) => (
                <Button key={t} variant={theme === t ? 'default' : 'outline'} size="sm" onClick={() => setTheme(t)} className="capitalize">{t}</Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><NotificationsOutlinedIcon className="h-4 w-4" /> Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-foreground">Email Notifications</p><p className="text-xs text-muted-foreground">Receive updates via email</p></div>
            <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div><p className="text-sm font-medium text-foreground">Push Notifications</p><p className="text-xs text-muted-foreground">Get in-app push alerts</p></div>
            <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><SecurityOutlinedIcon className="h-4 w-4" /> Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-foreground">Two-Factor Authentication</p><p className="text-xs text-muted-foreground">Add an extra layer of security</p></div>
            <Switch checked={twoFA} onCheckedChange={setTwoFA} />
          </div>
          <div className="border-t border-border pt-4">
            <Button variant="outline" onClick={() => toast.info('Password change flow')}>Change Password</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LanguageOutlinedIcon className="h-4 w-4" /> Language & Region</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-foreground">Language</p><p className="text-xs text-muted-foreground">Select your preferred language</p></div>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input-base w-auto">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => toast.success('Settings saved successfully')}>Save Changes</Button>
      </div>
    </div>
  );
}
