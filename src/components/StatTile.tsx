import type { ReactNode } from "react";

interface StatTileProps {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  featured?: boolean;
  className?: string;
  index?: number;
}

export function StatTile({
  label,
  value,
  detail,
  featured = false,
  className = "",
  index = 0,
}: StatTileProps) {
  return (
    <div
      className={`reveal flex flex-col justify-between gap-4 rounded-3xl p-5 ring-1 ring-inset sm:p-6 ${featured ? "bg-linear-to-br from-accent-strong/90 to-accent-deep ring-white/20" : "bg-white/5 ring-white/10 backdrop-blur-sm"} ${className}`}
      style={{ "--i": index }}
    >
      <p
        className={`text-xs font-semibold tracking-[0.18em] uppercase ${featured ? "text-white/80" : "text-white/50"}`}
      >
        {label}
      </p>
      <div>
        <p
          className={`font-display leading-none font-extrabold tracking-tight ${featured ? "text-7xl sm:text-8xl" : "text-4xl sm:text-5xl lg:text-4xl xl:text-5xl"}`}
        >
          {value}
        </p>
        {detail && (
          <p className={`mt-2 text-sm ${featured ? "text-white/80" : "text-white/50"}`}>{detail}</p>
        )}
      </div>
    </div>
  );
}
