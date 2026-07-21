/** Renders chronological activity events with configurable visual status. */
import { cn  } from '../../lib/utils';

const dotColors = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

export function Timeline({ items, className }) {
  return (
    <div className={cn('relative space-y-5', className)}>
      {items.map((item) => (
        <div key={item.id} className="relative flex gap-3">
          <div className="flex flex-col items-center">
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-full text-white', dotColors[item.color || 'primary'])}>
              {item.icon || <span className="h-2 w-2 rounded-full bg-white" />}
            </div>
            {items[items.length - 1].id !== item.id && (
              <div className="mt-1 h-full w-px flex-1 bg-border" />
            )}
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
            </div>
            {item.description && <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
