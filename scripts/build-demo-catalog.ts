/**
 * Builds `src/demo/catalog.json`, the anime catalogue behind demo mode.
 *
 * MAL's API needs a client id, so the metadata comes from AniList's public
 * GraphQL API (which cross-references MAL ids) and is mapped onto the shape
 * of a MAL `node`. Scores and member counts are AniList's, so they only
 * approximate MAL's numbers — good enough for a demo.
 *
 * Run with `pnpm run demo-catalog`.
 */
import { writeFile } from "node:fs/promises";

// A deliberately mixed bag: blockbusters, classics, films, sequels and a few
// niche picks so every chapter of the review has something to show.
const MAL_IDS = [
  1, 5, 19, 20, 21, 30, 32, 33, 43, 47, 136, 164, 199, 245, 269, 356, 431, 437, 457, 523, 820, 849,
  853, 918, 1210, 1535, 1575, 1689, 1735, 1943, 2001, 2167, 2236, 2251, 2904, 3588, 4181, 4224,
  5081, 5114, 6547, 9253, 9969, 9989, 10087, 11061, 11757, 13601, 16498, 18679, 20583, 22319, 23273,
  24833, 28851, 28977, 30276, 30831, 31240, 31646, 31964, 32182, 32281, 33352, 34599, 35180, 35849,
  37450, 37510, 37521, 37779, 37999, 38000, 39535, 40028, 40456, 40591, 40748, 41025, 41467, 43608,
  44511, 47917, 49387, 50265, 51009, 52701, 52991, 54492,
];

const QUERY = `
query ($ids: [Int], $page: Int) {
  Page(page: $page, perPage: 50) {
    pageInfo { hasNextPage }
    media(idMal_in: $ids, type: ANIME) {
      idMal
      title { romaji english }
      format
      status
      episodes
      duration
      startDate { year month day }
      endDate { year month day }
      genres
      studios(isMain: true) { nodes { id name } }
      averageScore
      popularity
      coverImage { large extraLarge }
      rankings { rank type allTime context }
      isAdult
    }
  }
}`;

interface AniListMedia {
  idMal: number;
  title: { romaji: string; english: string | null };
  format: string | null;
  status: string;
  episodes: number | null;
  duration: number | null;
  startDate: AniListDate;
  endDate: AniListDate;
  genres: string[];
  studios: { nodes: Array<{ id: number; name: string }> };
  averageScore: number | null;
  popularity: number;
  coverImage: { large: string; extraLarge: string };
  rankings: Array<{
    rank: number;
    type: string;
    allTime: boolean;
    context: string;
  }>;
  isAdult: boolean;
}

interface AniListDate {
  year: number | null;
  month: number | null;
  day: number | null;
}

const MEDIA_TYPES: Record<string, string> = {
  TV: "tv",
  TV_SHORT: "tv",
  MOVIE: "movie",
  OVA: "ova",
  ONA: "ona",
  SPECIAL: "special",
  MUSIC: "music",
};

const STATUSES: Record<string, string> = {
  FINISHED: "finished_airing",
  RELEASING: "currently_airing",
  NOT_YET_RELEASED: "not_yet_aired",
};

function formatDate({ year, month, day }: AniListDate) {
  if (!year) return undefined;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (!month) return `${year}`;
  if (!day) return `${year}-${pad(month)}`;
  return `${year}-${pad(month)}-${pad(day)}`;
}

function genreId(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % 10_000;
}

async function fetchPage(page: number) {
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { ids: MAL_IDS, page } }),
  });
  if (!res.ok) throw new Error(`AniList responded ${res.status}`);
  const json = (await res.json()) as {
    data: { Page: { pageInfo: { hasNextPage: boolean }; media: AniListMedia[] } };
  };
  return json.data.Page;
}

const media: AniListMedia[] = [];
for (let page = 1; ; page++) {
  const result = await fetchPage(page);
  media.push(...result.media);
  if (!result.pageInfo.hasNextPage) break;
}

const catalog = media
  .filter((m) => m.idMal && !m.isAdult)
  .map((m) => {
    // Only the overall ranking; AniList also ranks per format and season.
    const rated = m.rankings.find(
      (r) => r.type === "RATED" && r.context === "highest rated all time",
    );
    const mean = m.averageScore ? m.averageScore / 10 : undefined;
    return {
      id: m.idMal,
      title: m.title.romaji,
      alternative_titles: m.title.english ? { en: m.title.english } : undefined,
      main_picture: { medium: m.coverImage.large, large: m.coverImage.extraLarge },
      start_date: formatDate(m.startDate),
      end_date: formatDate(m.endDate),
      genres: m.genres.map((name) => ({ id: genreId(name), name })),
      studios: m.studios.nodes.map(({ id, name }) => ({ id, name })),
      media_type: MEDIA_TYPES[m.format ?? ""] ?? "unknown",
      status: STATUSES[m.status] ?? "finished_airing",
      mean,
      // AniList stops ranking around #500; estimate the tail from the score.
      rank: rated?.rank ?? Math.round(500 + (9 - (mean ?? 6)) * 1500),
      // AniList's audience is roughly a third of MAL's.
      num_list_users: m.popularity * 3,
      num_episodes: m.episodes ?? 0,
      average_episode_duration: (m.duration ?? 0) * 60,
      nsfw: "white",
    };
  })
  .toSorted((a, b) => a.id - b.id);

const out = new URL("../src/demo/catalog.json", import.meta.url);
await writeFile(out, JSON.stringify(catalog) + "\n");
console.log(`Wrote ${catalog.length} of ${MAL_IDS.length} anime to ${out.pathname}`);
