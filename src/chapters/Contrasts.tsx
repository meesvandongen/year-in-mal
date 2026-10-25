import { Chapter, Em } from "../components/Chapter";
import { Duel } from "../components/Duel";
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
    </Chapter>
  );
}
