/** Provides the shared controlled search input with its leading icon. */
import SearchIcon from '@mui/icons-material/Search';
import { cn  } from '../../lib/utils';

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search…',
  className,
}) {
  return (
    <div className={cn('relative', className)}>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}
