import type { ReactNode } from "react";
import { formatMeta, malUrl } from "../lib/format";
import type { ListEntry } from "../lib/types";
import { PosterImage } from "./Poster";

interface EntryRowProps {
  entry: ListEntry;
  /** Shown on the right, e.g. a score comparison. */
  aside?: ReactNode;
  index?: number;
  /** Shown on the left, for rankings. */
  rank?: number;
}

export function EntryRow({ entry, aside, index = 0, rank }: EntryRowProps) {
  return (
    <li className="reveal" style={{ "--i": index }}>
      <a
        href={malUrl(entry.node)}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-3 rounded-2xl p-2 transition hover:bg-white/5 sm:gap-4"
      >
        {rank !== undefined && (
          <span className="w-7 shrink-0 text-center font-display text-sm font-bold text-white/40 tabular-nums">
            {rank}
          </span>
        )}
        <PosterImage
          entry={entry}
          size="medium"
          className="aspect-[2/3] w-12 shrink-0 rounded-lg shadow-lg ring-1 ring-white/10 sm:w-14"
        />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 leading-snug font-semibold group-hover:text-accent">
            {entry.node.title}
          </p>
          <p className="mt-0.5 text-xs text-white/50">{formatMeta(entry.node)}</p>
        </div>
        {aside && <div className="shrink-0 text-right">{aside}</div>}
      </a>
    </li>
  );
}
