/** Displays lightweight placeholder shapes while content is loading. */
import { forwardRef, HTMLAttributes  } from 'react';
import { cn  } from '../../lib/utils';

export const Skeleton = forwardRef(
  ({ className, width, height, rounded = 'md', style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('animate-pulse bg-muted', rounded === 'md' ? 'rounded-md' : rounded === 'lg' ? 'rounded-lg' : rounded === 'full' ? 'rounded-full' : 'rounded', className)}
      style={{ width, height, ...style }}
      {...props}
    />
  )
);
Skeleton.displayName = 'Skeleton';
