import { useEffect, useState  } from 'react';
import { Outlet, useLocation  } from 'react-router-dom';
import { Sidebar  } from './Sidebar';
import { Navbar  } from './Navbar';
import { CommandPalette  } from './CommandPalette';
import { Breadcrumbs  } from '../common/Breadcrumbs';
import { navItems  } from '../../constants/navigation';
import { useLocalStorage  } from '../../hooks/useLocalStorage';

export function AppShell() {
  const [collapsed, setCollapsed] = useLocalStorage('orchasp-sidebar-collapsed', false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const crumbs = (() => {
    const match = navItems.find((n) => location.pathname.startsWith(n.path));
    if (!match) return [{ label: 'Dashboard' }];
    if (match.path !== '/dashboard') return [{ label: 'Dashboard', path: '/dashboard' }, { label: match.label }];
    return [{ label: 'Dashboard' }];
  })();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setMobileOpen(true)} onCommandOpen={() => setCmdOpen(true)} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto max-w-7xl px-4 py-5 lg:px-6">
            <div className="mb-5">
              <Breadcrumbs items={crumbs} />
            </div>
            <Outlet />
          </div>
        </main>
      </div>
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </div>
  );
}
