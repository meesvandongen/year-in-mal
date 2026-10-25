import { describe, expect, it } from "vite-plus/test";
import { createDemoList } from "../demo/demo";
import { activityDate, availableYears, defaultYear, minutesWatched, reviewYear } from "./stats";
import type { Anime, ListEntry, ListStatus } from "./types";

let nextId = 1;

function entry(node: Partial<Anime> = {}, status: Partial<ListStatus> = {}): ListEntry {
  const id = nextId++;
  return {
    node: {
      id,
      title: `Anime ${id}`,
      media_type: "tv",
      genres: [],
      studios: [],
      ...node,
    },
    list_status: {
      status: "completed",
      score: 0,
      num_episodes_watched: 12,
      is_rewatching: false,
      updated_at: "2025-06-01T12:00:00+00:00",
      ...status,
    },
  };
}

describe("activityDate", () => {
  it("prefers the finish date of completed anime", () => {
    const date = activityDate(
      entry({}, { finish_date: "2024-12-30", updated_at: "2025-02-01T00:00:00Z" }),
    );
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2024, 11, 30]);
  });

  it("handles partial finish dates", () => {
    expect(activityDate(entry({}, { finish_date: "2023-04" })).getMonth()).toBe(3);
  });

  it("uses the update time for dropped anime", () => {
    const date = activityDate(entry({}, { status: "dropped", finish_date: "2020-01-01" }));
    expect(date.getFullYear()).toBe(2025);
  });
});

describe("years", () => {
  const list = [
    entry({}, { finish_date: "2023-05-01" }),
    entry({}, { finish_date: "2025-05-01" }),
    entry({}, { status: "plan_to_watch", updated_at: "2026-01-01T12:00:00Z" }),
    entry({ media_type: "music" }, { finish_date: "2022-05-01" }),
  ];

  it("lists years with finished or dropped anime", () => {
    expect(availableYears(list)).toEqual([2025, 2023]);
  });

  it("defaults to last year until December", () => {
    expect(defaultYear(list, new Date(2026, 9, 25))).toBe(2025);
    expect(defaultYear(list, new Date(2025, 11, 2))).toBe(2025);
  });

  it("falls back to the latest year with data", () => {
    expect(defaultYear(list, new Date(2025, 3, 1))).toBe(2023);
    expect(defaultYear([], new Date(2025, 3, 1))).toBe(2024);
  });
});

describe("minutesWatched", () => {
  it("multiplies episodes by their duration", () => {
    expect(
      minutesWatched(entry({ average_episode_duration: 24 * 60 }, { num_episodes_watched: 10 })),
    ).toBe(240);
  });

  it("falls back to the episode count for completed anime", () => {
    expect(
      minutesWatched(
        entry({ num_episodes: 3, average_episode_duration: 60 * 60 }, { num_episodes_watched: 0 }),
      ),
    ).toBe(180);
  });
});

describe("reviewYear", () => {
  const action = { id: 1, name: "Action" };
  const drama = { id: 2, name: "Drama" };
  const list = [
    entry(
      { mean: 9, rank: 3, genres: [action], num_list_users: 3_000_000 },
      { score: 10, finish_date: "2025-01-10" },
    ),
    entry(
      { mean: 8.5, rank: 40, genres: [action, drama], num_list_users: 900_000 },
      { score: 5, finish_date: "2025-03-02" },
    ),
    entry(
      { mean: 6.5, rank: 4000, genres: [drama], num_list_users: 20_000 },
      { score: 9, finish_date: "2025-03-20" },
    ),
    entry({ mean: 7, genres: [drama] }, { finish_date: "2025-08-01" }),
    entry(
      { mean: 8.8, genres: [action] },
      { status: "dropped", score: 4, num_episodes_watched: 2 },
    ),
    entry({ mean: 9.9 }, { score: 1, finish_date: "2024-12-31" }),
  ];
  const review = reviewYear(list, 2025);

  it("only counts anime from the year", () => {
    expect(review.totals.completed).toBe(4);
    expect(review.totals.dropped).toBe(1);
    expect(review.totals.episodes).toBe(4 * 12 + 2);
  });

  it("ranks favourites by score", () => {
    expect(review.favourites.map((e) => e.list_status.score)).toEqual([10, 9, 5]);
    expect(review.leastFavourites[0]?.list_status.score).toBe(5);
  });

  it("averages scores of scored completed anime", () => {
    expect(review.totals.meanScore).toBe(8);
    expect(review.totals.crowdMean).toBeCloseTo(8);
  });

  it("finds hot takes against the MAL average", () => {
    expect(review.underrated.map((p) => p.delta)).toEqual([2.5, 1]);
    expect(review.overrated.map((p) => p.delta)).toEqual([-3.5]);
  });

  it("finds hidden gems and unpopular opinions", () => {
    expect(review.hiddenGem?.list_status.score).toBe(9);
    expect(review.unpopularOpinion?.list_status.score).toBe(5);
  });

  it("buckets completions per month", () => {
    expect(review.months.counts).toEqual([1, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0]);
    expect(review.months.busiest).toBe(2);
  });

  it("groups genres", () => {
    expect(review.genres.byCount.map((g) => [g.name, g.entries.length])).toEqual([
      ["Drama", 3],
      ["Action", 2],
    ]);
    expect(review.genres.favourite?.name).toBe("Action");
    expect(review.genres.leastFavourite?.name).toBe("Drama");
  });

  it("tracks first and last anime", () => {
    expect(review.bookends.first?.list_status.finish_date).toBe("2025-01-10");
    expect(review.bookends.last?.list_status.finish_date).toBe("2025-08-01");
  });

  it("describes drops", () => {
    expect(review.drops.genre?.name).toBe("Action");
    expect(review.drops.gotAway?.node.mean).toBe(8.8);
    expect(review.drops.goodRiddance).toBeUndefined();
  });

  it("handles an empty year", () => {
    const empty = reviewYear(list, 1999);
    expect(empty.totals.completed).toBe(0);
    expect(empty.totals.meanScore).toBeUndefined();
    expect(empty.months.busiest).toBeUndefined();
    expect(empty.favourites).toEqual([]);
  });
});

describe("demo list", () => {
  it("fills every chapter of last year's review", () => {
    const now = new Date(2026, 9, 25);
    const list = createDemoList(now);
    const review = reviewYear(list, defaultYear(list, now));
    expect(review.year).toBe(2025);
    expect(review.favourites).toHaveLength(5);
    expect(review.underrated.length).toBeGreaterThan(0);
    expect(review.overrated.length).toBeGreaterThan(0);
    expect(review.hiddenGem).toBeDefined();
    expect(review.unpopularOpinion).toBeDefined();
    expect(review.drops.gotAway).toBeDefined();
  });
});
