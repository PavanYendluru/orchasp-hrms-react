/** Displays a key metric, optional trend, and visual accent on dashboards. */
import { motion  } from 'framer-motion';
import { Card  } from '../ui/Card';
import { cn  } from '../../lib/utils';

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendLabel,
  accent = 'primary',
  index = 0,
}) {
  const accentClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="p-5 hover:shadow-glow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{value}</p>
          </div>
          <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', accentClasses[accent])}>
            {icon}
          </div>
        </div>
        {trendLabel && (
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            <span className={cn('font-medium', trend === 'down' ? 'text-danger' : 'text-success')}>
              {trend === 'down' ? '↓' : '↑'} {trendLabel}
            </span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
