import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import CheckIcon from '@mui/icons-material/Check';
import { cn  } from '../../lib/utils';

// Provide the shared accessible checkbox control.
export function Checkbox({ checked, onCheckedChange, className }) {
  return (
    <CheckboxPrimitive.Root
      checked={checked}
      onCheckedChange={(v) => onCheckedChange(!!v)}
      className={cn(
        'peer h-4 w-4 shrink-0 rounded border border-border shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        className
      )}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <CheckIcon className="h-3 w-3" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
