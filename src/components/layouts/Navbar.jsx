/** Renders the top navigation controls, alerts, and user menu. */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import SettingsBrightnessOutlinedIcon from '@mui/icons-material/SettingsBrightnessOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import KeyboardCommandKeyIcon from '@mui/icons-material/KeyboardCommandKey';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from '../ui/Dropdown';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { NotificationCard } from '../common/NotificationCard';
import { api } from '../../services/api';

export function Navbar({ onMenuClick, onCommandOpen }) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadNotifications() {
      try {
        const employeeId = user?.employeeId;
        if (!employeeId) {
          if (isMounted) setNotifications([]);
          return;
        }
        const data = await api.notifications.forEmployee(employeeId);

        if (isMounted) {
          setNotifications(data || []);
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    }

    if (user) {
      loadNotifications();

      const interval = setInterval(loadNotifications, 30000);

      return () => {
        clearInterval(interval);
        isMounted = false;
      };
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  const displayNotifications = notifications.slice(0, 6);
  const unread = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleMarkRead = async (notificationId) => {
    try {
      await api.notifications.markRead(notificationId);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, isRead: true }
            : n
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border glass px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <button
        onClick={onCommandOpen}
        className="group flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <SearchIcon className="h-4 w-4" />
        <span className="flex-1 text-left">
          Search or jump to&hellip;
        </span>

        <kbd className="hidden items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:flex">
          <KeyboardCommandKeyIcon className="h-3 w-3" />
          K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <Dropdown
          trigger={
            <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              {theme === 'light' && (
                <LightModeOutlinedIcon className="h-5 w-5" />
              )}

              {theme === 'dark' && (
                <DarkModeOutlinedIcon className="h-5 w-5" />
              )}

              {theme === 'system' && (
                <SettingsBrightnessOutlinedIcon className="h-5 w-5" />
              )}
            </button>
          }
        >
          <DropdownLabel>Theme</DropdownLabel>

          <DropdownItem onClick={() => setTheme('light')}>
            <LightModeOutlinedIcon className="h-4 w-4" />
            Light
          </DropdownItem>

          <DropdownItem onClick={() => setTheme('dark')}>
            <DarkModeOutlinedIcon className="h-4 w-4" />
            Dark
          </DropdownItem>

          <DropdownItem onClick={() => setTheme('system')}>
            <SettingsBrightnessOutlinedIcon className="h-4 w-4" />
            System
          </DropdownItem>
        </Dropdown>

        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <NotificationsOutlinedIcon className="h-5 w-5" />

            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotifOpen(false)}
              />

              <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-soft animate-fade-in">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">
                    Notifications
                  </p>

                  <Badge variant="muted">
                    {unread} new
                  </Badge>
                </div>

                <div className="max-h-96 space-y-2 overflow-y-auto p-2 scrollbar-thin">
                  {displayNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                    >
                      <NotificationCard
                        notification={n}
                        onClick={() => setNotifOpen(false)}
                      />
                    </div>
                  ))}

                  {displayNotifications.length === 0 && (
                    <p className="p-3 text-center text-sm text-muted-foreground">
                      No notifications
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <Dropdown
          trigger={
            <button className="ml-1 flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-muted">
              <Avatar
                name={user?.name || 'User'}
                size="sm"
              />

              <span className="hidden text-sm font-medium text-foreground sm:block">
                {user?.name?.split(' ')[0]}
              </span>
            </button>
          }
        >
          <DropdownLabel>My Account</DropdownLabel>

          <DropdownItem onClick={() => navigate('/profile')}>
            <span>Profile</span>
          </DropdownItem>

          <DropdownItem onClick={() => navigate('/settings')}>
            <span>Settings</span>
          </DropdownItem>

          <DropdownSeparator />

          <DropdownItem
            onClick={handleLogout}
            danger
          >
            <span>Logout</span>
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
