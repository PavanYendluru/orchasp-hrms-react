/** Displays inline and full-page loading indicators. */
import { cn  } from '../../lib/utils';

export function Spinner({ className }) {
  return (
    <div
      className={cn('inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent', className)}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
      <Spinner className="h-8 w-8 text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
