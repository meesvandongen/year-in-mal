import type { ReactNode } from "react";

interface ColumnChartProps {
  values: number[];
  labels: string[];
  /** Full labels for screen readers and tooltips. */
  titles?: string[];
  highlight?: number;
  caption: string;
  /** Formats the value above each bar. Zeros are hidden unless this is set. */
  format?: (value: number) => string;
  /** A shorter chart, for when it shares a chapter. */
  compact?: boolean;
}

/** Vertical bars, e.g. anime finished per month. */
export function ColumnChart({
  values,
  labels,
  titles = labels,
  highlight,
  caption,
  format,
  compact = false,
}: ColumnChartProps) {
  const max = Math.max(1, ...values);
  return (
    <figure className="reveal rounded-3xl bg-white/5 p-4 ring-1 ring-white/10 ring-inset backdrop-blur-sm sm:p-6">
      <div
        role="img"
        aria-label={`${caption}: ${values.map((v, i) => `${titles[i]} ${format?.(v) ?? v}`).join(", ")}`}
        className={`flex items-end gap-1 sm:gap-2 ${compact ? "h-36 sm:h-44" : "h-56 sm:h-72"}`}
      >
        {values.map((value, i) => (
          <div
            key={labels[i]}
            title={`${titles[i]}: ${format?.(value) ?? value}`}
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
          >
            <span
              className={`text-xs font-semibold whitespace-nowrap tabular-nums ${i === highlight ? "text-accent" : "text-white/50"} ${value === 0 && !format ? "invisible" : ""}`}
            >
              {format?.(value) ?? value}
            </span>
            <div
              className={`grow-bar w-full rounded-t-md sm:rounded-t-lg ${i === highlight ? "bg-linear-to-t from-accent-strong to-accent" : "bg-white/15"}`}
              style={{ height: `${(value / max) * 100}%`, "--i": i }}
            />
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="mt-2 flex gap-1 sm:gap-2">
        {labels.map((label, i) => (
          <span
            key={label}
            className={`min-w-0 flex-1 text-center text-[0.7rem] font-medium sm:text-xs ${i === highlight ? "text-accent" : "text-white/40"}`}
          >
            {label}
          </span>
        ))}
      </div>
      <figcaption className={compact ? "mt-3 text-center text-xs text-white/50" : "sr-only"}>
        {caption}
      </figcaption>
    </figure>
  );
}

export interface BarItem {
  label: string;
  value: number;
  detail?: ReactNode;
}

/**
 * Horizontal bars with a label and value, e.g. anime per genre. With
 * `onSelect`, each bar is a button.
 */
export function BarList({
  items,
  onSelect,
}: {
  items: BarItem[];
  onSelect?: (index: number) => void;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <ol className={onSelect ? "-mx-2 space-y-1" : "space-y-3"}>
      {items.map((item, i) => {
        const bar = (
          <>
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="truncate font-semibold">
                <span className="mr-2 text-white/40 tabular-nums">{i + 1}</span>
                {item.label}
              </span>
              <span className="shrink-0 text-white/60 tabular-nums">{item.detail}</span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/8">
              <div
                className={`h-full rounded-full ${i === 0 ? "bg-linear-to-r from-accent-strong to-accent" : "bg-white/35"}`}
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </>
        );
        return (
          <li key={item.label} className="reveal" style={{ "--i": Math.min(i, 8) }}>
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(i)}
                className="block w-full cursor-pointer rounded-xl p-2 text-left transition hover:bg-white/8"
              >
                {bar}
              </button>
            ) : (
              bar
            )}
          </li>
        );
      })}
    </ol>
  );
}

export interface Segment {
  label: string;
  value: number;
}

/** A single bar split into proportional segments with a legend. */
export function SegmentBar({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  // Fan out from the accent hue so neighbouring segments stay distinct.
  const color = (i: number) =>
    `oklch(${0.82 - i * 0.09} ${0.16 - i * 0.015} calc(var(--hue) + ${i * 38}))`;

  return (
    <div className="reveal rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 ring-inset backdrop-blur-sm sm:p-6">
      <div className="flex h-16 gap-1 overflow-hidden rounded-2xl sm:h-20">
        {segments.map((segment, i) => (
          <div
            key={segment.label}
            title={`${segment.label}: ${segment.value}`}
            className="min-w-1.5 first:rounded-l-2xl last:rounded-r-2xl"
            style={{ flex: segment.value, background: color(i) }}
          />
        ))}
      </div>
      <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
        {segments.map((segment, i) => (
          <li key={segment.label} className="flex items-center gap-2.5">
            <span className="size-3 shrink-0 rounded-full" style={{ background: color(i) }} />
            <span className="min-w-0 truncate text-sm font-semibold">{segment.label}</span>
            <span className="ml-auto text-sm text-white/50 tabular-nums">
              {Math.round((segment.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
