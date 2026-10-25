import { Chapter, Em } from "../components/Chapter";
import { ColumnChart } from "../components/Charts";
import { EntryRow } from "../components/EntryRow";
import { Star } from "../components/Icons";
import { Poster } from "../components/Poster";
import { SeeAll } from "../components/Sheet";
import { formatScore, formatSigned } from "../lib/format";
import type { Pick } from "../lib/stats";
import type { ChapterProps } from "./types";

export function Favourites({ chapter, review }: ChapterProps) {
  const [first, ...rest] = review.favourites;
  if (!first) return null;

  return (
    <Chapter
      {...chapter}
      backdrop={first}
      title={
        <>
          Your top {review.favourites.length} of <Em>{review.year}</Em>
        </>
      }
      lede={
        <>
          <strong className="text-white">{first.node.title}</strong> took the crown with a{" "}
          {first.list_status.score} out of 10.
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] sm:gap-5">
        <Poster
          entry={first}
          rank={1}
          size="lg"
          className="reveal mx-auto w-full max-w-sm sm:max-w-none"
        />
        {/* A swipeable rail on phones, a 2×2 grid next to #1 on larger screens. */}
        <ol className="scrollbar-none -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:content-start sm:overflow-visible sm:px-0 sm:pb-0">
          {rest.map((entry, i) => (
            <li
              key={entry.node.id}
              className="reveal w-[42%] shrink-0 snap-start sm:w-auto"
              style={{ "--i": i + 1 }}
            >
              <Poster entry={entry} rank={i + 2} size="sm" />
            </li>
          ))}
        </ol>
      </div>
      {review.rated.length > review.favourites.length && (
        <SeeAll
          label={`See all ${review.rated.length} you scored`}
          title={`Everything you scored in ${review.year}`}
          description="Ties go to the one MAL rates higher."
          ranked
          items={review.rated.map((entry) => ({
            entry,
            aside: (
              <span className="inline-flex items-center gap-1 font-display font-bold tabular-nums">
                <Star className="text-accent" width="0.9em" height="0.9em" />
                {entry.list_status.score}
              </span>
            ),
          }))}
        />
      )}
    </Chapter>
  );
}

export function Scores({ chapter, review }: ChapterProps) {
  const { histogram, criticDelta = 0 } = review.scores;
  const { meanScore, crowdMean } = review.totals;
  const mode = histogram.indexOf(Math.max(...histogram));

  const verdict =
    criticDelta > 0.35 ? (
      <>
        The <Em>generous</Em> critic
      </>
    ) : criticDelta < -0.35 ? (
      <>
        The <Em>tough</Em> critic
      </>
    ) : (
      <>
        In <Em>tune</Em> with the crowd
      </>
    );

  return (
    <Chapter
      {...chapter}
      title={verdict}
      lede={
        meanScore !== undefined && crowdMean !== undefined ? (
          <>
            Your average score was {formatScore(meanScore)}. MyAnimeList rates the same anime{" "}
            {formatScore(crowdMean)} on average, and you handed out more {mode + 1}s than anything
            else.
          </>
        ) : undefined
      }
    >
      <ColumnChart
        caption="How often you gave each score"
        values={histogram}
        labels={histogram.map((_, i) => String(i + 1))}
        titles={histogram.map((_, i) => `Score ${i + 1}`)}
        highlight={mode}
      />
    </Chapter>
  );
}

function TakeList({
  title,
  picks,
  direction,
}: {
  title: string;
  picks: Pick[];
  direction: "up" | "down";
}) {
  if (picks.length === 0) return null;
  return (
    <div className="rounded-3xl bg-white/5 p-3 ring-1 ring-white/10 backdrop-blur-sm ring-inset sm:p-4">
      <h3 className="px-2 pt-1 pb-3 text-xs font-semibold tracking-[0.18em] text-white/60 uppercase">
        {title}
      </h3>
      <ol className="space-y-1">
        {picks.map(({ entry, delta }, i) => (
          <EntryRow
            key={entry.node.id}
            entry={entry}
            index={i}
            aside={
              <>
                <p
                  className={`font-display text-xl font-extrabold tabular-nums ${direction === "up" ? "text-emerald-300" : "text-rose-300"}`}
                >
                  {formatSigned(delta)}
                </p>
                <p className="text-xs text-white/50 tabular-nums">
                  {entry.list_status.score} vs {formatScore(entry.node.mean ?? 0)}
                </p>
              </>
            }
          />
        ))}
      </ol>
    </div>
  );
}

export function HotTakes({ chapter, review }: ChapterProps) {
  const biggest = [...review.underrated, ...review.overrated].toSorted(
    (a, b) => Math.abs(b.delta) - Math.abs(a.delta),
  )[0];

  return (
    <Chapter
      {...chapter}
      backdrop={biggest?.entry}
      title={
        <>
          Your <Em>hot takes</Em>
        </>
      }
      lede={
        biggest && (
          <>
            The biggest split: you gave{" "}
            <strong className="text-white">{biggest.entry.node.title}</strong> a{" "}
            {biggest.entry.list_status.score}, while MAL averages{" "}
            {formatScore(biggest.entry.node.mean ?? 0)}.
          </>
        )
      }
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <TakeList title="You rated higher" picks={review.underrated.slice(0, 4)} direction="up" />
        <TakeList title="You rated lower" picks={review.overrated.slice(0, 4)} direction="down" />
      </div>
    </Chapter>
  );
}

export function LeastFavourites({ chapter, review }: ChapterProps) {
  const [worst] = review.leastFavourites;
  if (!worst) return null;
  const picks = review.leastFavourites.slice(0, 3);

  return (
    <Chapter
      {...chapter}
      backdrop={worst}
      title={
        <>
          The ones that <Em>didn't land</Em>
        </>
      }
      lede={
        <>
          Not everything can be a 10. <strong className="text-white">{worst.node.title}</strong> got
          your lowest score of the year: {worst.list_status.score}.
        </>
      }
    >
      <ol className="grid grid-cols-3 gap-3 sm:gap-5">
        {picks.map((entry, i) => (
          <li
            key={entry.node.id}
            className="reveal grayscale-[60%] transition hover:grayscale-0"
            style={{ "--i": i }}
          >
            <Poster entry={entry} size="sm" />
          </li>
        ))}
      </ol>
    </Chapter>
  );
}
