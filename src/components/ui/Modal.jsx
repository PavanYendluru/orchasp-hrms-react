/** Provides an accessible modal dialog with a consistent page overlay. */
import * as DialogPrimitive from '@radix-ui/react-dialog';
import CloseIcon from '@mui/icons-material/Close';
import { cn  } from '../../lib/utils';

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-soft data-[state=open]:animate-fade-in',
            className
          )}
        >
          {title && (
            <DialogPrimitive.Title className="font-display text-lg font-semibold text-foreground">
              {title}
            </DialogPrimitive.Title>
          )}
          {description && (
            <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">
              {description}
            </DialogPrimitive.Description>
          )}
          <div className="mt-4">{children}</div>
          {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <CloseIcon className="h-4 w-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function Drawer({
  open,
  onOpenChange,
  title,
  children,
  footer,
  side = 'right',
  width = 'md',
}) {
  const widthClass = width === 'sm' ? 'max-w-sm' : width === 'lg' ? 'max-w-2xl' : 'max-w-md';
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content
          className={cn(
            'fixed top-0 z-50 flex h-full w-full flex-col border-border bg-card shadow-soft data-[state=open]:animate-slide-in-right',
            side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
            widthClass
          )}
        >
          {title && (
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <DialogPrimitive.Title className="font-display text-base font-semibold">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Close className="rounded-md p-1 text-muted-foreground hover:bg-muted">
                <CloseIcon className="h-4 w-4" />
              </DialogPrimitive.Close>
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">{children}</div>
          {footer && <div className="flex justify-end gap-2 border-t border-border px-5 py-4">{footer}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
