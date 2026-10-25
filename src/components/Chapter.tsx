import type { ReactNode } from "react";
import { posterUrl } from "../lib/format";
import type { ListEntry } from "../lib/types";

interface BackdropProps {
  entry?: ListEntry;
}

/** A blurred wash of the chapter's key art behind an accent glow. */
export function Backdrop({ entry }: BackdropProps) {
  const src = entry && posterUrl(entry, "medium");
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
      {src && (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full scale-125 object-cover opacity-30 blur-3xl saturate-150"
        />
      )}
      <div className="absolute -top-1/4 -left-1/4 size-[80vmax] rounded-full bg-accent-deep opacity-60 blur-3xl" />
      <div className="absolute inset-0 bg-linear-to-b from-ink/30 via-ink/70 to-ink" />
    </div>
  );
}

export interface ChapterProps {
  id: string;
  number: number;
  label: string;
  hue: number;
  title: ReactNode;
  lede?: ReactNode;
  backdrop?: ListEntry;
  children?: ReactNode;
}

export function Chapter({ id, number, label, hue, title, lede, backdrop, children }: ChapterProps) {
  return (
    <section
      id={id}
      data-chapter={label}
      data-hue={hue}
      aria-labelledby={`${id}-title`}
      className="chapter relative isolate flex min-h-dvh items-center overflow-hidden"
      style={{ "--hue": hue }}
    >
      <Backdrop entry={backdrop} />
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-5 pt-24 pb-28 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:px-12 lg:py-28">
        <header className="reveal">
          <p className="eyebrow">
            {String(number).padStart(2, "0")} — {label}
          </p>
          <h2
            id={`${id}-title`}
            className="mt-4 font-display text-[clamp(2.5rem,6.5vw,5.25rem)] leading-[0.95] font-extrabold tracking-[-0.035em]"
          >
            {title}
          </h2>
          {lede && (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70 sm:text-xl">{lede}</p>
          )}
        </header>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

/** Highlights a phrase inside a chapter title. */
export function Em({ children }: { children: ReactNode }) {
  return <em className="text-accent not-italic">{children}</em>;
}
