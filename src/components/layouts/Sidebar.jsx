/** Renders responsive primary navigation and session controls. */
import { NavLink  } from 'react-router-dom';
import { motion, AnimatePresence  } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { navGroups, navItems, logoutItem, appName  } from '../../constants/navigation';
import { cn  } from '../../lib/utils';
import { useAuth  } from '../../context/AuthContext';
import { Avatar  } from '../ui/Avatar';

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}) {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-300 lg:static lg:z-auto',
          collapsed ? 'w-[68px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-glow">
              <span className="font-display text-lg font-bold">O</span>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold text-foreground">Orchasp</p>
                <p className="truncate text-[11px] text-muted-foreground">HRMS Suite</p>
              </div>
            )}
          </div>
          <button
            onClick={onToggle}
            className="hidden rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:block"
          >
            <ChevronLeftIcon className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
          <button
            onClick={onMobileClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted lg:hidden"
          >
            <MenuIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 scrollbar-thin">
          {navGroups.map((group) => {
            const items = navItems.filter((i) => i.group === group.id);
            if (!items.length) return null;
            return (
              <div key={group.id}>
                {!collapsed && (
                  <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {group.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onMobileClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                          collapsed && 'justify-center'
                        )
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="border-t border-border p-3">
          <div className={cn('flex items-center gap-2.5 rounded-lg p-2', collapsed && 'justify-center')}>
            <Avatar name={user?.name || 'User'} size="sm" />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">{user?.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{user?.role}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={logout}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                title={logoutItem.label}
              >
                <logoutItem.icon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
