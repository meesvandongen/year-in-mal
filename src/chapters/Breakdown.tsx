import { useState } from "react";
import { Chapter, Em } from "../components/Chapter";
import { BarList, SegmentBar } from "../components/Charts";
import { Duel } from "../components/Duel";
import { buttonClass } from "../components/Button";
import { ChevronDown, Star } from "../components/Icons";
import { PosterImage } from "../components/Poster";
import { EntrySheet, SeeAll } from "../components/Sheet";
import { formatList, formatScore, formatShortDate, plural, pluralMediaType } from "../lib/format";
import { activityDate, type Group } from "../lib/stats";
import type { ListEntry } from "../lib/types";
import type { ChapterProps } from "./types";

const byScore = (entries: ListEntry[]) =>
  entries.toSorted((a, b) => b.list_status.score - a.list_status.score);

/** The anime in a genre or studio, best scored first. */
function GroupSheet({
  group,
  open,
  onClose,
  year,
}: {
  group?: Group;
  open: boolean;
  onClose: () => void;
  year: number;
}) {
  return (
    <EntrySheet
      open={open}
      onClose={onClose}
      title={group?.name}
      description={
        group &&
        `${plural(group.entries.length, "anime", "anime")} you finished in ${year}, your favourites first.`
      }
      items={byScore(group?.entries ?? []).map((entry) => ({
        entry,
        aside: entry.list_status.score > 0 && (
          <span className="inline-flex items-center gap-1 font-display font-bold tabular-nums">
            <Star className="text-accent" width="0.9em" height="0.9em" />
            {entry.list_status.score}
          </span>
        ),
      }))}
    />
  );
}

const GENRES = 8;
const STUDIOS = 5;

function ShowMore({
  expanded,
  onToggle,
  label,
}: {
  expanded: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <div className="mt-6 flex justify-center">
      <button
        type="button"
        aria-expanded={expanded}
        className={buttonClass("ghost")}
        onClick={onToggle}
      >
        {expanded ? "Show fewer" : label}
        <ChevronDown className={`transition ${expanded ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
}

/** Which group's anime are on show, kept while the sheet animates closed. */
function useGroupSheet() {
  const [group, setGroup] = useState<Group>();
  const [open, setOpen] = useState(false);
  return {
    group,
    open,
    show: (next: Group) => {
      setGroup(next);
      setOpen(true);
    },
    close: () => setOpen(false),
  };
}

export function Genres({ chapter, review }: ChapterProps) {
  const { byCount, favourite, leastFavourite } = review.genres;
  const sheet = useGroupSheet();
  const [expanded, setExpanded] = useState(false);
  const [top] = byCount;
  if (!top) return null;
  const shown = expanded ? byCount : byCount.slice(0, GENRES);

  return (
    <Chapter
      {...chapter}
      backdrop={top.entries[0]}
      title={
        <>
          <Em>{top.name}</Em> ran your year
        </>
      }
      lede={
        <>
          {top.entries.length} of your {plural(review.totals.completed, "anime", "anime")} were{" "}
          {top.name}.
          {favourite && leastFavourite && (
            <>
              {" "}
              You scored {favourite.name} the highest ({formatScore(favourite.meanScore ?? 0)} on
              average) and {leastFavourite.name} the lowest (
              {formatScore(leastFavourite.meanScore ?? 0)}).
            </>
          )}
        </>
      }
    >
      <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur-sm ring-inset sm:p-7">
        <BarList
          onSelect={(i) => sheet.show(shown[i]!)}
          items={shown.map((genre) => ({
            label: genre.name,
            value: genre.entries.length,
            detail: (
              <>
                {genre.entries.length}
                {genre.meanScore !== undefined && (
                  <span className="ml-2 text-white/40">★ {formatScore(genre.meanScore)}</span>
                )}
              </>
            ),
          }))}
        />
        <p className="mt-4 text-center text-xs text-white/40">Tap a genre to see its anime</p>
      </div>
      {byCount.length > GENRES && (
        <ShowMore
          expanded={expanded}
          onToggle={() => setExpanded(!expanded)}
          label={`Show all ${byCount.length} genres`}
        />
      )}
      <GroupSheet group={sheet.group} open={sheet.open} onClose={sheet.close} year={review.year} />
    </Chapter>
  );
}

export function Studios({ chapter, review }: ChapterProps) {
  const sheet = useGroupSheet();
  const [expanded, setExpanded] = useState(false);
  const [top] = review.studios;
  if (!top) return null;

  return (
    <Chapter
      {...chapter}
      backdrop={top.entries[0]}
      title={
        <>
          <Em>{top.name}</Em> owned your year
        </>
      }
      lede={
        <>
          You finished {plural(top.entries.length, "anime", "anime")} from {top.name}
          {review.studios.length > 1 &&
            `, more than from any of the other ${review.studios.length - 1} studios on your list`}
          .
        </>
      }
    >
      <ol className="space-y-3">
        {review.studios.slice(0, expanded ? undefined : STUDIOS).map((studio, i) => (
          <li key={studio.name} className="reveal" style={{ "--i": Math.min(i, STUDIOS) }}>
            <button
              type="button"
              onClick={() => sheet.show(studio)}
              className={`flex w-full cursor-pointer items-center gap-4 rounded-3xl p-3 pr-5 text-left ring-1 transition ring-inset sm:gap-6 ${i === 0 ? "bg-accent/15 ring-accent/40 hover:bg-accent/25" : "bg-white/5 ring-white/10 hover:bg-white/10"}`}
            >
              <span className="w-8 text-center font-display text-2xl font-extrabold text-white/40 tabular-nums">
                {i + 1}
              </span>
              {/* A small fan of the studio's posters. */}
              <div className="flex shrink-0 -space-x-6">
                {studio.entries.slice(0, 3).map((entry, j) => (
                  <PosterImage
                    key={entry.node.id}
                    entry={entry}
                    size="medium"
                    className="aspect-[2/3] w-11 rounded-lg shadow-lg ring-2 ring-ink sm:w-12"
                    style={{ rotate: `${(j - 1) * 6}deg` }}
                  />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-bold sm:text-xl">{studio.name}</p>
                <p className="truncate text-sm text-white/50">
                  {studio.entries
                    .slice(0, 2)
                    .map((entry) => entry.node.title)
                    .join(" · ")}
                </p>
              </div>
              <span className="font-display text-2xl font-extrabold tabular-nums">
                {studio.entries.length}
              </span>
            </button>
          </li>
        ))}
      </ol>
      {review.studios.length > STUDIOS && (
        <ShowMore
          expanded={expanded}
          onToggle={() => setExpanded(!expanded)}
          label={`Show all ${review.studios.length} studios`}
        />
      )}
      <GroupSheet group={sheet.group} open={sheet.open} onClose={sheet.close} year={review.year} />
    </Chapter>
  );
}

export function Formats({ chapter, review }: ChapterProps) {
  const formats = review.formats;
  const [top] = formats;
  if (!top) return null;
  const share = top.entries.length / review.totals.completed;

  return (
    <Chapter
      {...chapter}
      backdrop={formats[1]?.entries[0]}
      title={
        share > 0.6 ? (
          <>
            Mostly <Em>{pluralMediaType(top.name, 2)}</Em>, with a side of everything else
          </>
        ) : (
          <>
            A bit of <Em>everything</Em>
          </>
        )
      }
      lede={
        <>
          You finished{" "}
          {formatList(
            formats.map(
              (format) =>
                `${format.entries.length} ${pluralMediaType(format.name, format.entries.length)}`,
            ),
          )}
          .
        </>
      }
    >
      <SegmentBar
        segments={formats.map((format) => ({
          label: pluralMediaType(format.name, 2),
          value: format.entries.length,
        }))}
      />
    </Chapter>
  );
}

export function Dropped({ chapter, review }: ChapterProps) {
  const { genre, gotAway, goodRiddance } = review.drops;
  const count = review.totals.dropped;

  return (
    <Chapter
      {...chapter}
      backdrop={gotAway}
      title={
        <>
          <Em>{count}</Em> you let go
        </>
      }
      lede={
        <>
          {genre && count > 1 && `${genre.name} was the genre you gave up on most often. `}
          {gotAway && (
            <>
              And yes, <strong className="text-white">{gotAway.node.title}</strong> is rated{" "}
              {formatScore(gotAway.node.mean ?? 0)} on MAL. Maybe next year?
            </>
          )}
        </>
      }
    >
      {gotAway && (
        <Duel
          left={{
            label: "The one that got away",
            entry: gotAway,
            stat: `MAL ${formatScore(gotAway.node.mean ?? 0)}`,
          }}
          right={
            goodRiddance && {
              label: "Good riddance",
              entry: goodRiddance,
              stat: `MAL ${formatScore(goodRiddance.node.mean ?? 0)}`,
            }
          }
        />
      )}
      <SeeAll
        label={`See all ${count} dropped`}
        title={`Dropped in ${review.year}`}
        description="How far you got before calling it."
        items={review.dropped
          .toSorted((a, b) => activityDate(b).getTime() - activityDate(a).getTime())
          .map((entry) => ({
            entry,
            aside: (
              <>
                <p className="font-display font-bold text-accent tabular-nums">
                  {entry.list_status.num_episodes_watched}/{entry.node.num_episodes || "?"} eps
                </p>
                <p className="text-xs text-white/50">{formatShortDate(activityDate(entry))}</p>
              </>
            ),
          }))}
      />
    </Chapter>
  );
}
