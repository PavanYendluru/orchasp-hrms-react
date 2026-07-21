/** Contains reusable notification and profile summary card components. */
import { Card  } from '../ui/Card';
import { Avatar  } from '../ui/Avatar';
import { Badge  } from '../ui/Badge';
import { cn  } from '../../lib/utils';

const typeAccent = {
  info: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-danger/10 text-danger',
};

// Render a notification with its current read state.
export function NotificationCard({ notification, onClick, className }) {
  return (
    <Card
      onClick={onClick}
      className={cn('cursor-pointer p-3.5 transition-colors hover:bg-muted/50', !notification.read && 'border-primary/30', className)}
    >
      <div className="flex gap-3">
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold', typeAccent[notification.type])}>
          {notification.title[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium text-foreground">{notification.title}</p>
            {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
          <p className="mt-1 text-[11px] text-muted-foreground/70">{new Date(notification.createdAt).toLocaleString()}</p>
        </div>
      </div>
    </Card>
  );
}

export function ProfileCard({ name, email, role, avatar }) {
  return (
    <Card className="p-5">
      <div className="flex flex-col items-center text-center">
        <Avatar name={name} src={avatar} size="xl" />
        <h3 className="mt-3 font-display text-lg font-semibold text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground">{email}</p>
        <Badge variant="secondary" className="mt-2 capitalize">{role}</Badge>
      </div>
    </Card>
  );
}
