import * as AccordionPrimitive from '@radix-ui/react-accordion';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { cn  } from '../../lib/utils';

export function Accordion({ children, className, type = 'single', defaultValue }) {
  return (
    <AccordionPrimitive.Root type={type} defaultValue={defaultValue} className={cn('space-y-2', className)}>
      {children}
    </AccordionPrimitive.Root>
  );
}

export function AccordionItem({ value, title, children }) {
  return (
    <AccordionPrimitive.Item value={value} className="overflow-hidden rounded-lg border border-border bg-card">
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-muted [&[data-state=open]>svg]:rotate-180">
          {title}
          <KeyboardArrowDownIcon className="h-4 w-4 text-muted-foreground transition-transform" />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden px-4 text-sm text-muted-foreground data-[state=closed]:animate-fade-in">
        <div className="pb-4 pt-1">{children}</div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}
