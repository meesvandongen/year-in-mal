import { type CSSProperties, useState } from "react";
import { englishTitle, formatMeta, malUrl, posterUrl } from "../lib/format";
import type { ListEntry } from "../lib/types";
import { Star } from "./Icons";

interface PosterImageProps {
  entry: ListEntry;
  size?: "medium" | "large";
  className?: string;
  style?: CSSProperties;
}

/** The anime's key art, or a gradient with its initials if there is none. */
export function PosterImage({ entry, size = "large", className = "", style }: PosterImageProps) {
  const [failed, setFailed] = useState(false);
  const src = posterUrl(entry, size);

  if (!src || failed) {
    const initials = entry.node.title
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join("");
    return (
      <div
        aria-hidden="true"
        style={style}
        className={`grid place-items-center bg-linear-to-br from-accent-strong to-accent-deep font-display text-4xl font-bold text-white/80 ${className}`}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      style={style}
      className={`object-cover ${className}`}
    />
  );
}

interface PosterProps {
  entry: ListEntry;
  /** Shows a `#n` badge. */
  rank?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const titleSizes = {
  sm: "text-sm",
  md: "text-base sm:text-lg",
  lg: "text-2xl sm:text-3xl",
};

/** A poster card that links to the anime on MyAnimeList. */
export function Poster({ entry, rank, size = "md", className = "" }: PosterProps) {
  const { node, list_status } = entry;
  const english = englishTitle(node);

  return (
    <a
      href={malUrl(node)}
      target="_blank"
      rel="noreferrer"
      className={`group relative block aspect-[2/3] overflow-hidden rounded-2xl bg-white/5 shadow-2xl shadow-black/40 ring-1 ring-white/10 transition duration-300 ring-inset hover:-translate-y-1 hover:ring-accent/60 ${size === "lg" ? "rounded-3xl" : ""} ${className}`}
    >
      <PosterImage
        entry={entry}
        size={size === "sm" ? "medium" : "large"}
        className="absolute inset-0 size-full transition duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/95 via-black/60 to-transparent p-3 pt-16 sm:p-4 sm:pt-20">
        <p className="text-[0.7rem] font-medium tracking-wide text-white/60 uppercase">
          {formatMeta(node)}
        </p>
        <h3
          className={`mt-1 line-clamp-2 font-display leading-tight font-bold ${titleSizes[size]}`}
        >
          {node.title}
        </h3>
        {english && size !== "sm" && (
          <p className="mt-0.5 line-clamp-1 text-xs text-white/50">{english}</p>
        )}
      </div>

      {rank !== undefined && (
        <span
          className={`absolute top-2.5 left-2.5 rounded-full bg-accent font-display font-extrabold text-ink tabular-nums ${size === "lg" ? "px-3.5 py-1 text-lg" : "px-2.5 py-0.5 text-sm"}`}
        >
          #{rank}
        </span>
      )}
      {list_status.score > 0 && (
        <span
          className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-0.5 text-sm font-semibold tabular-nums backdrop-blur-md"
          title="Your score"
        >
          <Star className="text-accent" width="0.9em" height="0.9em" />
          {list_status.score}
        </span>
      )}
    </a>
  );
}
