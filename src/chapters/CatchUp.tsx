import { Chapter, Em } from "../components/Chapter";
import { ColumnChart, SegmentBar } from "../components/Charts";
import { SeeAll } from "../components/Sheet";
import { formatLag, plural } from "../lib/format";
import { airingLag, type LagYear } from "../lib/stats";
import type { ChapterProps } from "./types";

/** Up to this many years fit the chart on a phone. */
const MAX_YEARS = 8;

/** The years around the reviewed one, leaning towards the most recent. */
function yearsAround(history: LagYear[], year: number) {
  const index = history.findIndex((item) => item.year === year);
  const start = Math.min(Math.max(0, history.length - MAX_YEARS), Math.max(0, index));
  return history.slice(start, start + MAX_YEARS);
}

/** `In 2024 it was 2 years; so far in 2026, 3 months.` */
function comparison(history: LagYear[], year: number) {
  const before = history.findLast((item) => item.year < year);
  const after = history.find((item) => item.year > year);
  const parts = [
    before && `in ${before.year} it was ${formatLag(before.median)}`,
    after &&
      `${after.year === new Date().getFullYear() ? "so far in" : "in"} ${after.year}${before ? "," : " it's"} ${formatLag(after.median)}`,
  ].filter(Boolean);
  if (parts.length === 0) return "";
  const sentence = parts.join("; ");
  return ` ${sentence[0]!.toUpperCase()}${sentence.slice(1)}.`;
}

export function CatchUp({ chapter, review }: ChapterProps) {
  const { median, ranking, buckets, history } = review.lag;
  if (median === undefined) return null;
  const shown = yearsAround(history, review.year);
  const fresh = buckets[0]!.value;

  return (
    <Chapter
      {...chapter}
      backdrop={ranking[0]}
      title={
        median <= 14 ? (
          <>
            Watching it <Em>as it aired</Em>
          </>
        ) : (
          <>
            <Em>{formatLag(median)}</Em> behind the broadcast
          </>
        )
      }
      lede={
        <>
          From an anime's final episode airing to you finishing it, the typical wait in{" "}
          {review.year} was {formatLag(median)}
          {fresh > 0 && `, and you caught ${plural(fresh, "show")} within a season`}.
          {comparison(history, review.year)}
        </>
      }
    >
      <div className="space-y-4">
        {shown.length > 1 && (
          <ColumnChart
            compact
            caption="Typical time from airing to finishing, per year"
            values={shown.map((item) => item.median)}
            labels={shown.map((item) =>
              shown.length > 5 ? `’${String(item.year).slice(2)}` : String(item.year),
            )}
            titles={shown.map((item) => String(item.year))}
            highlight={shown.findIndex((item) => item.year === review.year)}
            format={(days) => formatLag(days, true)}
          />
        )}
        <SegmentBar segments={buckets.filter((bucket) => bucket.value > 0)} />
      </div>
      <SeeAll
        label="From freshest to oldest"
        title="Freshest to oldest"
        description={`Time between each anime's last episode airing and you finishing it in ${review.year}.`}
        ranked
        items={ranking.map((entry) => ({
          entry,
          aside: (
            <span className="font-display font-bold text-accent tabular-nums">
              {formatLag(airingLag(entry)!)}
            </span>
          ),
        }))}
      />
    </Chapter>
  );
}
