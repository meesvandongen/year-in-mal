import { Chapter, Em } from "../components/Chapter";
import { Duel } from "../components/Duel";
import { SeeAll } from "../components/Sheet";
import {
  formatCompact,
  formatDuration,
  formatInteger,
  formatScore,
  formatShortDate,
  startYear,
} from "../lib/format";
import { activityDate, runtime } from "../lib/stats";
import type { ListEntry } from "../lib/types";
import type { ChapterProps } from "./types";

const title = (entry: ListEntry) => <strong className="text-white">{entry.node.title}</strong>;

const highlight = (text: string) => (
  <span className="font-display font-bold text-accent tabular-nums">{text}</span>
);

export function Gems({ chapter, review }: ChapterProps) {
  const gem = review.hiddenGem;
  const opinion = review.unpopularOpinion;

  return (
    <Chapter
      {...chapter}
      backdrop={gem ?? opinion}
      title={
        gem && opinion ? (
          <>
            A <Em>hidden gem</Em> and an unpopular opinion
          </>
        ) : gem ? (
          <>
            You found a <Em>hidden gem</Em>
          </>
        ) : (
          <>
            Your <Em>unpopular opinion</Em>
          </>
        )
      }
      lede={
        <>
          {gem && (
            <>
              {title(gem)} sits outside MAL's top 500, but you gave it a {gem.list_status.score}
              .{" "}
            </>
          )}
          {opinion && (
            <>
              Meanwhile the crowd ranks {title(opinion)} #{formatInteger(opinion.node.rank ?? 0)},
              and you weren't having it.
            </>
          )}
        </>
      }
    >
      <Duel
        separator="&"
        left={
          gem && {
            label: "Hidden gem",
            entry: gem,
            stat: `You ${gem.list_status.score} · MAL #${formatInteger(gem.node.rank ?? 0)}`,
          }
        }
        right={
          opinion && {
            label: "Unpopular opinion",
            entry: opinion,
            stat: `You ${opinion.list_status.score} · MAL #${formatInteger(opinion.node.rank ?? 0)}`,
          }
        }
      />
    </Chapter>
  );
}

export function Popularity({ chapter, review }: ChapterProps) {
  const { most, least } = review.popularity;
  if (!most || !least) return null;
  const members = (entry: ListEntry) => entry.node.num_list_users ?? 0;

  return (
    <Chapter
      {...chapter}
      backdrop={least}
      title={
        <>
          From the mainstream to the <Em>deep cuts</Em>
        </>
      }
      lede={
        <>
          {title(most)} is on {formatCompact(members(most))} lists. {title(least)}? Just{" "}
          {formatCompact(members(least))}.
        </>
      }
    >
      <Duel
        left={{
          label: "Most popular",
          entry: most,
          stat: `${formatCompact(members(most))} members`,
        }}
        right={{
          label: "Least popular",
          entry: least,
          stat: `${formatCompact(members(least))} members`,
        }}
      />
      <SeeAll
        label="See all by popularity"
        title="By popularity"
        description="How many MAL users have each anime on their list."
        ranked
        items={review.popularity.ranking.map((entry) => ({
          entry,
          aside: highlight(formatCompact(members(entry))),
        }))}
      />
    </Chapter>
  );
}

export function Crowd({ chapter, review }: ChapterProps) {
  const { loved, disliked } = review.crowd;
  if (!loved || !disliked) return null;

  return (
    <Chapter
      {...chapter}
      backdrop={loved}
      title={
        <>
          The crowd's <Em>best</Em> and worst
        </>
      }
      lede={
        <>
          Of everything you finished, MAL users rate {title(loved)} highest and {title(disliked)}{" "}
          lowest.
        </>
      }
    >
      <Duel
        left={{
          label: "Crowd favourite",
          entry: loved,
          stat: `MAL ${formatScore(loved.node.mean ?? 0)}`,
        }}
        right={{
          label: "Crowd skeptic",
          entry: disliked,
          stat: `MAL ${formatScore(disliked.node.mean ?? 0)}`,
        }}
      />
      <SeeAll
        label="See all by MAL score"
        title="By MAL score"
        description="The average score MAL users give each anime."
        ranked
        items={review.crowd.ranking.map((entry) => ({
          entry,
          aside: highlight(formatScore(entry.node.mean ?? 0)),
        }))}
      />
    </Chapter>
  );
}

export function Bookends({ chapter, review }: ChapterProps) {
  const { first, last } = review.bookends;
  if (!first || !last) return null;

  return (
    <Chapter
      {...chapter}
      backdrop={first}
      title={
        <>
          How your year <Em>began</Em> and ended
        </>
      }
      lede={
        <>
          It all kicked off with {title(first)} on {formatShortDate(activityDate(first))}, and{" "}
          {title(last)} closed the book on {formatShortDate(activityDate(last))}.
        </>
      }
    >
      <Duel
        separator="→"
        left={{
          label: "First finished",
          entry: first,
          stat: formatShortDate(activityDate(first)),
        }}
        right={{
          label: "Last finished",
          entry: last,
          stat: formatShortDate(activityDate(last)),
        }}
      />
      <SeeAll
        label="See the whole year"
        title={`${review.year}, in order`}
        description="Everything you finished, from first to last."
        ranked
        items={review.completed.toReversed().map((entry) => ({
          entry,
          aside: highlight(formatShortDate(activityDate(entry))),
        }))}
      />
    </Chapter>
  );
}

export function Era({ chapter, review }: ChapterProps) {
  const { oldest, newest } = review.era;
  if (!oldest || !newest) return null;
  const from = Number(startYear(oldest.node));
  const to = Number(startYear(newest.node));

  return (
    <Chapter
      {...chapter}
      backdrop={oldest}
      title={
        <>
          <Em>{to - from}</Em> years of anime history
        </>
      }
      lede={
        <>
          From {title(oldest)} ({from}) all the way to {title(newest)} ({to}).
        </>
      }
    >
      <Duel
        separator="→"
        left={{ label: "Oldest", entry: oldest, stat: `Aired ${from}` }}
        right={{ label: "Newest", entry: newest, stat: `Aired ${to}` }}
      />
      <SeeAll
        label="See all by air date"
        title="Oldest to newest"
        description="When each anime started airing."
        items={review.era.ranking.map((entry) => ({
          entry,
          aside: highlight(startYear(entry.node) ?? ""),
        }))}
      />
    </Chapter>
  );
}

export function Length({ chapter, review }: ChapterProps) {
  const { longest, shortest } = review.length;
  if (!longest || !shortest) return null;

  return (
    <Chapter
      {...chapter}
      backdrop={longest}
      title={
        <>
          The <Em>marathon</Em> and the sprint
        </>
      }
      lede={
        <>
          {title(longest)} took {formatDuration(runtime(longest) ?? 0)} to get through.{" "}
          {title(shortest)} was over in {formatDuration(runtime(shortest) ?? 0)}.
        </>
      }
    >
      <Duel
        left={{
          label: "Longest",
          entry: longest,
          stat: formatDuration(runtime(longest) ?? 0),
        }}
        right={{
          label: "Shortest",
          entry: shortest,
          stat: formatDuration(runtime(shortest) ?? 0),
        }}
      />
      <SeeAll
        label="See all by length"
        title="Longest to shortest"
        description="Total runtime of every episode."
        ranked
        items={review.length.ranking.map((entry) => ({
          entry,
          aside: highlight(formatDuration(runtime(entry) ?? 0)),
        }))}
      />
    </Chapter>
  );
}
