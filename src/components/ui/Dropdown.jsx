/** Exposes styled dropdown-menu primitives used throughout the interface. */
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '../../lib/utils';

// Provide the shared dropdown-menu container and trigger.
export function Dropdown({ children, trigger }) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>{trigger}</DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[10rem] overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-soft"
        >
          {children}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

// Render a selectable dropdown menu item.
export function DropdownItem({ children, onClick, className, danger }) {
  return (
    <DropdownMenuPrimitive.Item
      onSelect={onClick}
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors focus:bg-muted data-[disabled]:opacity-50',
        danger && 'text-danger focus:bg-danger/10',
        className
      )}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  );
}

// Render a non-interactive menu label.
export function DropdownLabel({ children }) {
  return <DropdownMenuPrimitive.Label className="px-2.5 py-1.5 text-xs font-semibold text-muted-foreground">{children}</DropdownMenuPrimitive.Label>;
}

// Separate related dropdown menu items.
export function DropdownSeparator() {
  return <DropdownMenuPrimitive.Separator className="my-1 h-px bg-border" />;
}
