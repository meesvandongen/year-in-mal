import type { ListEntry } from "./types";

/**
 * When an entry counts as "watched": the finish date for completed anime and
 * otherwise the last time the list entry changed.
 */
export function activityDate(entry: ListEntry): Date {
  const { status, finish_date, updated_at } = entry.list_status;
  if (status === "completed" && finish_date) {
    const [year, month = 1, day = 1] = finish_date.split("-").map(Number);
    if (year) return new Date(year, month - 1, day);
  }
  return new Date(updated_at);
}

const isCompleted = (entry: ListEntry) => entry.list_status.status === "completed";
const isDropped = (entry: ListEntry) => entry.list_status.status === "dropped";
const isScored = (entry: ListEntry) => entry.list_status.score > 0;
const isCounted = (entry: ListEntry) =>
  (isCompleted(entry) || isDropped(entry)) && entry.node.media_type !== "music";

/** Years with at least one completed or dropped anime, newest first. */
export function availableYears(list: ListEntry[]): number[] {
  const years = new Set(list.filter(isCounted).map((entry) => activityDate(entry).getFullYear()));
  return [...years].toSorted((a, b) => b - a);
}

/**
 * Until December the previous year is the one worth wrapping up. Falls back to
 * the latest year that has data.
 */
export function defaultYear(list: ListEntry[], now = new Date()): number {
  const preferred = now.getMonth() === 11 ? now.getFullYear() : now.getFullYear() - 1;
  const years = availableYears(list);
  if (years.length === 0 || years.includes(preferred)) return preferred;
  return years.find((year) => year < preferred) ?? years[0]!;
}

export function episodesWatched(entry: ListEntry): number {
  const { num_episodes_watched } = entry.list_status;
  if (isCompleted(entry)) {
    return num_episodes_watched || entry.node.num_episodes || 0;
  }
  return num_episodes_watched;
}

/** Minutes spent on the episodes watched of an entry. */
export function minutesWatched(entry: ListEntry): number {
  return (episodesWatched(entry) * (entry.node.average_episode_duration ?? 0)) / 60;
}

/** Length of the whole show in minutes, if known. */
export function runtime(entry: ListEntry): number | undefined {
  const { num_episodes, average_episode_duration } = entry.node;
  if (!num_episodes || !average_episode_duration) return undefined;
  return (num_episodes * average_episode_duration) / 60;
}

/** How much higher the user scored an anime than MAL's average. */
export function scoreDelta(entry: ListEntry): number | undefined {
  if (!isScored(entry) || entry.node.mean === undefined) return undefined;
  return entry.list_status.score - entry.node.mean;
}

function average(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  const sorted = values.toSorted((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1]! + sorted[middle]!) / 2;
}

/** Parses MAL's `YYYY-MM-DD`, `YYYY-MM` or `YYYY` dates. */
function parseDate(date?: string): number | undefined {
  if (!date) return undefined;
  const [year, month = 1, day = 1] = date.split("-").map(Number);
  return year ? new Date(year, month - 1, day).getTime() : undefined;
}

const startTime = (entry: ListEntry) => parseDate(entry.node.start_date);

const DAY = 24 * 60 * 60 * 1000;

/**
 * Days between an anime's last episode airing (or its premiere, for a movie
 * without an end date) and the user finishing it. Watching along as it airs
 * counts as 0.
 */
export function airingLag(entry: ListEntry): number | undefined {
  const aired = parseDate(entry.node.end_date) ?? startTime(entry);
  if (aired === undefined) return undefined;
  return Math.max(0, Math.round((activityDate(entry).getTime() - aired) / DAY));
}

/** Upper bounds, in days, of the airing lag buckets. */
export const LAG_BUCKETS = [
  { label: "Within a season", max: 91 },
  { label: "Within a year", max: 365 },
  { label: "1–5 years", max: 5 * 365 },
  { label: "5+ years", max: Infinity },
] as const;

/** A year needs this many anime with airing dates for its lag to mean much. */
const MIN_LAG_SAMPLE = 3;

export interface LagYear {
  year: number;
  /** Median airing lag in days. */
  median: number;
  count: number;
}

/** The typical airing lag of every year with enough completed anime, oldest first. */
function lagHistory(list: ListEntry[]): LagYear[] {
  const byYear = Map.groupBy(
    list.filter((entry) => isCounted(entry) && isCompleted(entry)),
    (entry) => activityDate(entry).getFullYear(),
  );
  return [...byYear]
    .flatMap(([year, entries]) => {
      const lags = entries.flatMap((entry) => airingLag(entry) ?? []);
      return lags.length >= MIN_LAG_SAMPLE
        ? [{ year, median: median(lags)!, count: lags.length }]
        : [];
    })
    .toSorted((a, b) => a.year - b.year);
}

type Key = (entry: ListEntry) => number | undefined;

/** Sorts by the key, highest first, dropping entries without one. */
function rank(
  entries: ListEntry[],
  key: Key,
  direction: "asc" | "desc" = "desc",
  tiebreak?: Key,
): ListEntry[] {
  const sign = direction === "desc" ? -1 : 1;
  return entries
    .filter((entry) => key(entry) !== undefined)
    .toSorted(
      (a, b) => sign * (key(a)! - key(b)!) || sign * ((tiebreak?.(a) ?? 0) - (tiebreak?.(b) ?? 0)),
    );
}

export interface Group {
  name: string;
  entries: ListEntry[];
  /** Mean of the user's scores, if at least one entry is scored. */
  meanScore?: number;
  scoredCount: number;
}

function group(entries: ListEntry[], names: (entry: ListEntry) => string[]): Group[] {
  const groups = Map.groupBy(
    entries.flatMap((entry) => names(entry).map((name) => ({ name, entry }))),
    ({ name }) => name,
  );
  return [...groups]
    .map(([name, items]) => {
      const scores = items.map(({ entry }) => entry.list_status.score).filter((score) => score > 0);
      return {
        name,
        entries: items.map(({ entry }) => entry),
        meanScore: average(scores),
        scoredCount: scores.length,
      };
    })
    .toSorted((a, b) => b.entries.length - a.entries.length || a.name.localeCompare(b.name));
}

const genres = (entry: ListEntry) => (entry.node.genres ?? []).map((genre) => genre.name);
const studios = (entry: ListEntry) => (entry.node.studios ?? []).map((studio) => studio.name);

export interface Pick {
  entry: ListEntry;
  delta: number;
}

const HIDDEN_GEM_RANK = 500;

export type YearInReview = ReturnType<typeof reviewYear>;

export function reviewYear(list: ListEntry[], year: number) {
  const inYear = list.filter(
    (entry) => isCounted(entry) && activityDate(entry).getFullYear() === year,
  );
  const completed = rank(inYear.filter(isCompleted), (entry) => activityDate(entry).getTime());
  const dropped = inYear.filter(isDropped);
  const scored = completed.filter(isScored);

  const score: Key = (entry) => entry.list_status.score || undefined;
  const mean: Key = (entry) => entry.node.mean;
  const members: Key = (entry) => entry.node.num_list_users;

  const meanScore = average(scored.map((entry) => entry.list_status.score));
  const crowdMean = average(scored.flatMap((entry) => entry.node.mean ?? []));

  const months = Array.from({ length: 12 }, () => 0);
  for (const entry of completed) months[activityDate(entry).getMonth()]!++;
  const busiestMonth = months.indexOf(Math.max(...months));

  const histogram = Array.from({ length: 10 }, () => 0);
  for (const entry of inYear.filter(isScored)) {
    histogram[entry.list_status.score - 1]!++;
  }

  const deltas = scored.flatMap((entry): Pick[] => {
    const delta = scoreDelta(entry);
    return delta === undefined ? [] : [{ entry, delta }];
  });

  const genreGroups = group(completed, genres);
  const ratedGenres = genreGroups
    .filter((g) => g.scoredCount >= 2)
    .toSorted((a, b) => b.meanScore! - a.meanScore!);

  const droppedByMean = rank(dropped, mean);
  const rated = rank(scored, score, "desc", mean);
  const byMembers = rank(completed, members);
  const byMean = rank(completed, mean);
  const byStart = rank(completed, startTime, "asc");
  const byRuntime = rank(completed, runtime);
  const byLag = rank(completed, airingLag, "asc");
  const lags = byLag.map((entry) => airingLag(entry)!);

  return {
    year,
    completed,
    dropped,
    totals: {
      completed: completed.length,
      dropped: dropped.length,
      episodes: inYear.reduce((sum, e) => sum + episodesWatched(e), 0),
      minutes: inYear.reduce((sum, e) => sum + minutesWatched(e), 0),
      meanScore,
      crowdMean,
      scored: scored.length,
      genres: genreGroups.length,
    },
    months: {
      counts: months,
      busiest: completed.length > 0 ? busiestMonth : undefined,
    },
    scores: {
      histogram,
      /** Positive when the user scores higher than the MAL average. */
      criticDelta:
        meanScore !== undefined && crowdMean !== undefined ? meanScore - crowdMean : undefined,
    },
    rated,
    favourites: rated.slice(0, 5),
    leastFavourites: rank(scored, score, "asc", mean).slice(0, 5),
    underrated: deltas
      .filter((pick) => pick.delta > 0)
      .toSorted((a, b) => b.delta - a.delta)
      .slice(0, 5),
    overrated: deltas
      .filter((pick) => pick.delta < 0)
      .toSorted((a, b) => a.delta - b.delta)
      .slice(0, 5),
    popularity: {
      ranking: byMembers,
      most: byMembers[0],
      least: rank(completed, members, "asc")[0],
    },
    crowd: {
      ranking: byMean,
      loved: byMean[0],
      disliked: rank(completed, mean, "asc")[0],
    },
    hiddenGem: rank(
      scored.filter((entry) => (entry.node.rank ?? Infinity) > HIDDEN_GEM_RANK),
      score,
      "desc",
      (entry) => -(entry.node.num_list_users ?? 0),
    )[0],
    unpopularOpinion: rank(
      scored.filter(
        (entry) => (entry.node.rank ?? Infinity) <= HIDDEN_GEM_RANK && (scoreDelta(entry) ?? 0) < 0,
      ),
      (entry) => scoreDelta(entry),
      "asc",
    )[0],
    era: {
      ranking: byStart,
      oldest: byStart[0],
      newest: rank(completed, startTime)[0],
    },
    length: {
      ranking: byRuntime,
      longest: byRuntime[0],
      shortest: rank(completed, runtime, "asc")[0],
    },
    lag: {
      /** Freshest first. */
      ranking: byLag,
      /** Median days between an anime airing and the user finishing it. */
      median: median(lags),
      buckets: LAG_BUCKETS.map(({ label, max }, i) => ({
        label,
        value: lags.filter((lag) => lag <= max && lag > (LAG_BUCKETS[i - 1]?.max ?? -1)).length,
      })),
      history: lagHistory(list),
    },
    bookends: {
      first: completed.at(-1),
      last: completed[0],
    },
    genres: {
      byCount: genreGroups,
      favourite: ratedGenres[0],
      leastFavourite: ratedGenres.length > 1 ? ratedGenres.at(-1) : undefined,
    },
    studios: group(completed, studios),
    formats: group(completed, (entry) => [entry.node.media_type]),
    drops: {
      genre: group(dropped, genres)[0],
      studio: group(dropped, studios)[0],
      gotAway: droppedByMean[0],
      goodRiddance: droppedByMean.length > 1 ? droppedByMean.at(-1) : undefined,
    },
  };
}
