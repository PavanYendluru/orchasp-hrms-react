/** Provides accessible hover and focus help for interface elements. */
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

// Display accessible contextual help for an element.
export function Tooltip({ content, children }) {
  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={6}
            className="z-50 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-soft"
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-foreground" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
