/** Provides the branded split-screen layout for authentication pages. */
import { motion  } from 'framer-motion';
import { appName, appTagline  } from '../../constants/app';

export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-soft lg:grid-cols-2">
        {/* Left brand panel */}
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-primary to-secondary p-10 text-white lg:flex">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <span className="font-display text-xl font-bold">N</span>
            </div>
            <div><p className="font-display text-lg font-bold">{appName}</p><p className="text-xs text-white/80">{appTagline}</p></div>
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold leading-tight">Manage your workforce with confidence.</h2>
            <p className="mt-3 text-sm text-white/80">A premium HRMS platform for modern enterprises — employees, payroll, attendance, performance, and more, all in one place.</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/70">
            <span>SOC 2 Compliant</span><span>·</span><span>99.9% Uptime</span><span>·</span><span>Enterprise Ready</span>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex flex-col justify-center p-8 sm:p-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
