/** Shared Orchasp logo. The source asset lives in public/assets for every app entry point. */
export function BrandMark({ className = '' }) {
  return <img src="/assets/orchasp-logo.png" alt="Orchasp" className={`h-10 w-10 shrink-0 rounded-lg bg-white object-contain p-0.5 ${className}`} />;
}
