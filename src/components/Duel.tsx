import type { ReactNode } from "react";
import type { ListEntry } from "../lib/types";
import { Poster } from "./Poster";

export interface Contender {
  label: string;
  entry: ListEntry;
  /** A short highlight below the poster, e.g. `3.2M members`. */
  stat: ReactNode;
}

/** Two anime side by side, or one when only one exists. */
export function Duel({
  left,
  right,
  separator = "vs",
}: {
  left?: Contender;
  right?: Contender;
  separator?: string;
}) {
  const contenders = [left, right].filter((c): c is Contender => !!c);

  return (
    <div
      className={`relative mx-auto grid max-w-2xl items-start gap-4 sm:gap-8 ${contenders.length === 2 ? "grid-cols-2" : "max-w-xs grid-cols-1"}`}
    >
      {contenders.map((contender, i) => (
        <figure
          key={contender.label}
          className={`reveal ${contenders.length === 2 ? (i === 0 ? "sm:-rotate-2" : "sm:mt-12 sm:rotate-2") : ""}`}
          style={{ "--i": i * 2 }}
        >
          <figcaption className="mb-3 text-xs font-semibold tracking-[0.2em] text-white/60 uppercase sm:text-sm">
            {contender.label}
          </figcaption>
          <Poster entry={contender.entry} />
          <p className="mt-3 font-display text-lg leading-tight font-bold text-accent sm:text-2xl">
            {contender.stat}
          </p>
        </figure>
      ))}
      {contenders.length === 2 && (
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 grid size-11 -translate-1/2 place-items-center rounded-full bg-ink font-display text-sm font-extrabold text-accent shadow-xl ring-1 ring-white/15 sm:size-14 sm:text-base"
        >
          {separator}
        </span>
      )}
    </div>
  );
}
