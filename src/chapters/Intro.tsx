import { buttonClass } from "../components/Button";
import { ArrowDown } from "../components/Icons";
import { PosterWall } from "../components/PosterWall";
import { formatDuration, plural, posterUrl } from "../lib/format";
import type { ChapterProps } from "./types";

export function Intro({ chapter, review, user, demo, years, onYearChange }: ChapterProps) {
  const { totals } = review;
  const images = [...review.completed, ...review.dropped].flatMap(
    (entry) => posterUrl(entry, "medium") ?? [],
  );
  const empty = totals.completed + totals.dropped === 0;

  return (
    <section
      id={chapter.id}
      data-chapter={chapter.label}
      data-hue={chapter.hue}
      aria-labelledby="intro-title"
      className="chapter relative isolate flex min-h-dvh items-center justify-center overflow-hidden"
      style={{ "--hue": chapter.hue }}
    >
      <PosterWall images={images} className="-z-20 opacity-40" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in oklab, var(--color-ink) 60%, transparent), var(--color-ink) 75%)",
        }}
      />

      <div className="mx-auto flex max-w-5xl flex-col items-center px-5 pt-24 pb-20 text-center">
        <p className="enter inline-flex items-center gap-2.5 rounded-full bg-white/8 py-1.5 pr-4 pl-1.5 text-sm font-medium ring-1 ring-white/15 backdrop-blur-md ring-inset">
          {user.picture ? (
            <img src={user.picture} alt="" className="size-7 rounded-full object-cover" />
          ) : (
            <span className="grid size-7 place-items-center rounded-full bg-accent font-display font-bold text-ink">
              {user.name[0]?.toUpperCase()}
            </span>
          )}
          {demo ? "A demo year in anime" : `${user.name}'s year in anime`}
        </p>

        <h1
          id="intro-title"
          className="enter mt-8 font-display text-[clamp(5.5rem,27vw,13rem)] leading-[0.82] font-extrabold tracking-[-0.05em]"
          style={{ "--i": 1 }}
        >
          <span className="block bg-linear-to-br from-white via-accent to-accent-strong bg-clip-text text-transparent">
            {review.year}
          </span>
          <span className="mt-2 block text-[0.42em] tracking-[-0.03em]">in anime</span>
        </h1>

        {empty ? (
          <>
            <p className="enter mt-8 max-w-xl text-lg text-white/70 sm:text-xl">
              Nothing finished or dropped in {review.year} yet. Pick another year to look back on.
            </p>
            <div className="enter mt-8 flex flex-wrap justify-center gap-2">
              {years.map((year) => (
                <button
                  key={year}
                  type="button"
                  className={buttonClass("ghost")}
                  onClick={() => onYearChange(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p
              className="enter mt-8 max-w-xl text-lg leading-relaxed text-white/75 sm:text-xl"
              style={{ "--i": 2 }}
            >
              You finished{" "}
              <strong className="text-white">{plural(totals.completed, "anime", "anime")}</strong>{" "}
              and spent <strong className="text-white">{formatDuration(totals.minutes)}</strong> in
              other worlds. Here's how it went.
            </p>
            <a
              href="#numbers"
              className={buttonClass("primary", "enter mt-10 h-14 px-7 text-base")}
              style={{ "--i": 3 }}
            >
              Start the recap
              <ArrowDown className="motion-safe:animate-float" />
            </a>
          </>
        )}
      </div>
    </section>
  );
}
