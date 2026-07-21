import { cn, initials  } from '../../lib/utils';

const sizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
};

const colors = [
  'bg-primary/15 text-primary',
  'bg-secondary/15 text-secondary',
  'bg-success/15 text-success',
  'bg-warning/15 text-warning',
  'bg-danger/15 text-danger',
];

export function Avatar({
  name,
  src,
  size = 'md',
  className,
}) {
  const colorIndex = name.charCodeAt(0) % colors.length;
  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-2 ring-background',
        sizes[size],
        colors[colorIndex],
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        initials(name)
      )}
    </div>
  );
}
