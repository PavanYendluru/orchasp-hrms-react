import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn  } from '../../lib/utils';

export function Tabs({
  value,
  onValueChange,
  defaultValue,
  children,
  className,
}) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={onValueChange} defaultValue={defaultValue} className={cn('w-full', className)}>
      {children}
    </TabsPrimitive.Root>
  );
}

export function TabsList({ children, className }) {
  return (
    <TabsPrimitive.List className={cn('inline-flex items-center gap-1 rounded-lg bg-muted p-1', className)}>
      {children}
    </TabsPrimitive.List>
  );
}

export function TabsTrigger({ value, children, className }) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-soft',
        className
      )}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({ value, children, className }) {
  return (
    <TabsPrimitive.Content value={value} className={cn('mt-4 focus-visible:outline-none', className)}>
      {children}
    </TabsPrimitive.Content>
  );
}
