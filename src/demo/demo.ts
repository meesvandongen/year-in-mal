import type { Anime, ListEntry, User, WatchStatus } from "../lib/types";
import catalog from "./catalog.json";

export const demoUser: User = { id: 0, name: "Demo" };

/** Small seeded PRNG so the demo list is the same on every visit. */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (n: number) => String(n).padStart(2, "0");
const isoDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/**
 * A believable list for a fan who finished a lot of anime in the year before
 * `now`, a few the year before that and some so far this year.
 */
export function createDemoList(now = new Date()): ListEntry[] {
  const random = mulberry32(2025);
  const year = now.getFullYear();

  const randomDate = (inYear: number) => {
    const start = new Date(inYear, 0, 1).getTime();
    const end = Math.min(new Date(inYear + 1, 0, 1).getTime(), now.getTime());
    return new Date(start + random() * (end - start));
  };

  const shuffled = (catalog as Anime[])
    .map((anime) => ({ anime, sort: random() }))
    .toSorted((a, b) => a.sort - b.sort)
    .map(({ anime }) => anime);

  const plan: Array<[WatchStatus, number | undefined, number]> = [
    ["completed", year - 1, 46],
    ["completed", year - 2, 14],
    ["completed", year, 9],
    ["dropped", year - 1, 6],
    ["dropped", year - 2, 2],
    ["watching", year, 3],
    ["plan_to_watch", undefined, Infinity],
  ];

  const entries: ListEntry[] = [];
  let index = 0;
  for (const [status, inYear, count] of plan) {
    for (let i = 0; i < count && index < shuffled.length; i++) {
      const anime = shuffled[index++]!;
      const date = randomDate(inYear ?? year);
      const episodes = anime.num_episodes || 12;
      const watched =
        status === "completed"
          ? episodes
          : status === "plan_to_watch"
            ? 0
            : Math.max(1, Math.floor(episodes * random() * 0.6));

      // Scores hover around MAL's mean with a personal spin, and roughly one
      // in ten finished shows is left unscored.
      const opinion = (random() - 0.6) * 3.5 + (random() < 0.15 ? -2.5 : 0);
      const score =
        status === "plan_to_watch" || random() < 0.1
          ? 0
          : Math.min(
              10,
              Math.max(1, Math.round((anime.mean ?? 7) + opinion - (status === "dropped" ? 2 : 0))),
            );

      entries.push({
        node: anime,
        list_status: {
          status,
          score,
          num_episodes_watched: watched,
          is_rewatching: false,
          updated_at: date.toISOString(),
          finish_date: status === "completed" ? isoDate(date) : undefined,
        },
      });
    }
  }
  return entries;
}
