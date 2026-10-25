import { Chapter, Em } from "../components/Chapter";
import { ColumnChart } from "../components/Charts";
import { CountUp } from "../components/CountUp";
import { StatTile } from "../components/StatTile";
import { formatDuration, formatInteger, formatMonth, formatScore, plural } from "../lib/format";
import { activityDate } from "../lib/stats";
import type { ChapterProps } from "./types";

const MONTHS = Array.from({ length: 12 }, (_, month) => formatMonth(month));

export function Numbers({ chapter, review }: ChapterProps) {
  const { totals } = review;
  const hours = totals.minutes / 60;

  return (
    <Chapter
      {...chapter}
      backdrop={review.favourites[0] ?? review.completed[0]}
      title={
        <>
          {review.year}, by the <Em>numbers</Em>
        </>
      }
      lede={
        <>
          {plural(totals.episodes, "episode")} add up to {formatDuration(totals.minutes)} of anime.
          That's about {formatDuration(totals.minutes / 52)} every week.
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatTile
          featured
          className="col-span-2 row-span-2 min-h-56 sm:min-h-80"
          label="Anime completed"
          value={<CountUp value={totals.completed} />}
          detail={
            totals.dropped > 0
              ? `and ${plural(totals.dropped, "dropped", "dropped")}`
              : "and not a single one dropped"
          }
        />
        <StatTile index={1} label="Episodes" value={<CountUp value={totals.episodes} />} />
        <StatTile
          index={2}
          label="Hours"
          value={<CountUp value={hours} />}
          detail={`${formatInteger(hours / 24)} days non-stop`}
        />
        <StatTile
          index={3}
          label="Mean score"
          value={
            totals.meanScore !== undefined ? (
              <CountUp value={totals.meanScore} format={formatScore} />
            ) : (
              "–"
            )
          }
          detail={
            totals.scored > 0 ? `across ${plural(totals.scored, "scored show")}` : "nothing scored"
          }
        />
        <StatTile
          index={4}
          label="Genres"
          value={<CountUp value={totals.genres} />}
          detail="explored"
        />
      </div>
    </Chapter>
  );
}

export function Rhythm({ chapter, review }: ChapterProps) {
  const { counts, busiest = 0 } = review.months;
  const month = formatMonth(busiest);

  return (
    <Chapter
      {...chapter}
      backdrop={review.completed.find((entry) => activityDate(entry).getMonth() === busiest)}
      title={
        <>
          <Em>{month}</Em> was your marathon month
        </>
      }
      lede={
        <>
          You finished {plural(counts[busiest] ?? 0, "anime", "anime")} in {month} alone. Here's how
          the rest of the year stacked up.
        </>
      }
    >
      <ColumnChart
        caption="Anime completed per month"
        values={counts}
        labels={MONTHS.map((name) => name.slice(0, 3))}
        titles={MONTHS}
        highlight={busiest}
      />
    </Chapter>
  );
}
