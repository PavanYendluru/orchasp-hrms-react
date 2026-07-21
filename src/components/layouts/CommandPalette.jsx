import { useEffect, useState  } from 'react';
import { Command  } from 'cmdk';
import { useNavigate  } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import { navItems  } from '../../constants/navigation';
import { cn  } from '../../lib/utils';

export function CommandPalette({ open, onOpenChange }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 backdrop-blur-sm pt-[15vh] px-4" onClick={() => onOpenChange(false)}>
      <Command
        loop
        className={cn(
          'w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-soft animate-fade-in',
          '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground',
          '[&_[cmdk-group]]:px-2 [&_[cmdk-group]]:pb-2',
          '[&_[cmdk-item]]:flex [&_[cmdk-item]]:cursor-pointer [&_[cmdk-item]]:items-center [&_[cmdk-item]]:gap-3 [&_[cmdk-item]]:rounded-lg [&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-2 [&_[cmdk-item]]:text-sm [&_[cmdk-item]]:text-foreground [&_[cmdk-item]]:transition-colors',
          '[&_[cmdk-item][data-selected]]:bg-primary/10 [&_[cmdk-item][data-selected]]:text-primary',
          '[&_[cmdk-input-wrapper]]:flex [&_[cmdk-input-wrapper]]:items-center [&_[cmdk-input-wrapper]]:gap-2 [&_[cmdk-input-wrapper]]:border-b [&_[cmdk-input-wrapper]]:border-border [&_[cmdk-input-wrapper]]:px-4 [&_[cmdk-input-wrapper]]:py-3',
          '[&_[cmdk-input]]:border-none [&_[cmdk-input]]:bg-transparent [&_[cmdk-input]]:text-foreground [&_[cmdk-input]]:outline-none [&_[cmdk-input]]:placeholder:text-muted-foreground'
        )}
      >
        <Command.Input placeholder="Type a command or search…" autoFocus />
        <Command.List className="max-h-80 overflow-y-auto scrollbar-thin">
          <Command.Empty className="px-4 py-8 text-center text-sm text-muted-foreground">
            No results found.
          </Command.Empty>
          <Command.Group heading="Navigation">
            {navItems.map((item) => (
              <Command.Item
                key={item.path}
                onSelect={() => { navigate(item.path); onOpenChange(false); }}
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                {item.label}
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="Quick Actions">
            <Command.Item onSelect={() => { navigate('/employees'); onOpenChange(false); }}>
              <SearchIcon className="h-4 w-4 text-muted-foreground" /> View All Employees
            </Command.Item>
            <Command.Item onSelect={() => { navigate('/leave'); onOpenChange(false); }}>
              <SearchIcon className="h-4 w-4 text-muted-foreground" /> Apply Leave
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}

