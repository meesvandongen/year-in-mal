import { useState } from "react";
import { buttonClass } from "../components/Button";
import { Backdrop } from "../components/Chapter";
import { ArrowUp, Check, Share, Sparkle } from "../components/Icons";
import { PosterImage } from "../components/Poster";
import { formatInteger, formatScore } from "../lib/format";
import type { YearInReview } from "../lib/stats";
import type { ChapterProps } from "./types";

function summaryText(review: YearInReview, owner: string) {
  const { totals } = review;
  return [
    `${owner} ${review.year} in anime`,
    `${totals.completed} completed · ${formatInteger(totals.episodes)} episodes · ${formatInteger(totals.minutes / 60)} hours`,
    ...(review.favourites.length > 0
      ? [
          "",
          "Top picks:",
          ...review.favourites.map(
            (entry, i) => `${i + 1}. ${entry.node.title} (${entry.list_status.score}/10)`,
          ),
        ]
      : []),
  ].join("\n");
}

export function Outro({ chapter, review, user, demo, years, onYearChange }: ChapterProps) {
  const [copied, setCopied] = useState(false);
  const { totals } = review;
  const owner = demo ? "My" : `${user.name}'s`;
  const [hero] = review.favourites;
  const stats = [
    ["Completed", formatInteger(totals.completed)],
    ["Hours", formatInteger(totals.minutes / 60)],
    ["Mean score", totals.meanScore !== undefined ? formatScore(totals.meanScore) : "–"],
    ["Top genre", review.genres.byCount[0]?.name ?? "–"],
  ] as const;

  async function share() {
    const text = summaryText(review, owner);
    const url = location.origin;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Year in MAL", text, url });
        return;
      } catch (error) {
        // The visitor closed the share sheet.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await navigator.clipboard.writeText(`${text}\n\n${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <section
      id={chapter.id}
      data-chapter={chapter.label}
      data-hue={chapter.hue}
      aria-labelledby="outro-title"
      className="chapter relative isolate flex min-h-dvh items-center overflow-hidden"
      style={{ "--hue": chapter.hue }}
    >
      <Backdrop entry={hero} />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pt-24 pb-28 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-12">
        <div className="reveal text-center lg:text-left">
          <p className="eyebrow">The end</p>
          <h2
            id="outro-title"
            className="mt-4 font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.9] font-extrabold tracking-[-0.04em]"
          >
            That's a wrap on <span className="text-accent">{review.year}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/70 lg:mx-0">
            Share your recap, or take a trip back to another year on your list.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <button type="button" className={buttonClass("primary")} onClick={share}>
              {copied ? <Check /> : <Share />}
              {copied ? "Copied to clipboard" : "Share recap"}
            </button>
            <a href="#intro" className={buttonClass("ghost")}>
              <ArrowUp />
              Back to the start
            </a>
          </div>
          {years.length > 1 && (
            <div className="mt-10">
              <p className="text-xs font-semibold tracking-[0.18em] text-white/50 uppercase">
                Other years
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 lg:justify-start">
                {years
                  .filter((year) => year !== review.year)
                  .map((year) => (
                    <button
                      key={year}
                      type="button"
                      className={buttonClass("ghost", "min-h-9 px-4")}
                      onClick={() => onYearChange(year)}
                    >
                      {year}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* The summary card, laid out like a poster you'd screenshot. */}
        <article
          className="reveal relative mx-auto w-full max-w-sm overflow-hidden rounded-[2rem] bg-ink-raised shadow-2xl shadow-black/60 ring-1 ring-white/15"
          style={{ "--i": 2 }}
          aria-label="Summary"
        >
          <div className="relative h-44 overflow-hidden">
            {hero && <PosterImage entry={hero} className="absolute inset-0 size-full" />}
            <div className="absolute inset-0 bg-linear-to-b from-accent-deep/40 to-ink-raised" />
            <div className="absolute inset-x-6 bottom-4 flex items-end justify-between">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] text-accent uppercase">
                  <Sparkle /> Year in MAL
                </p>
                <p className="mt-1 font-display text-3xl leading-none font-extrabold">
                  {owner} {review.year}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            {review.favourites.length > 0 && (
              <ol className="space-y-2.5 py-4">
                {review.favourites.map((entry, i) => (
                  <li key={entry.node.id} className="flex items-baseline gap-3">
                    <span className="w-4 font-display font-extrabold text-accent tabular-nums">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-semibold">
                      {entry.node.title}
                    </span>
                    <span className="text-sm text-white/50 tabular-nums">
                      {entry.list_status.score}
                    </span>
                  </li>
                ))}
              </ol>
            )}
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10">
              {stats.map(([label, value]) => (
                <div key={label} className="bg-ink-raised p-3.5">
                  <dt className="text-[0.65rem] font-semibold tracking-[0.18em] text-white/50 uppercase">
                    {label}
                  </dt>
                  <dd className="mt-1 truncate font-display text-xl font-extrabold">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </article>
      </div>
    </section>
  );
}
