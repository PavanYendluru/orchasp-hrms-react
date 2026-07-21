/** Provides shared text, textarea, and label form controls. */
import { forwardRef } from 'react';
import { cn  } from '../../lib/utils';

// Render the shared single-line form field.
export const Input = forwardRef(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

// Render the shared multi-line form field.
export const Textarea = forwardRef(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[80px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

// Render the shared accessible form label.
export const Label = forwardRef(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
      {...props}
    />
  )
);
Label.displayName = 'Label';

export function FormField({
  label,
  error,
  children,
  className,
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <Label>{label}</Label>}
      {children}
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}
