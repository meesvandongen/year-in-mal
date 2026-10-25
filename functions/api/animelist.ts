import { json } from "../lib/http";
import { API_URL, malGet } from "../lib/mal";
import { withSession } from "../lib/session";

const FIELDS = [
  "list_status",
  "alternative_titles",
  "start_date",
  "end_date",
  "genres",
  "studios",
  "media_type",
  "status",
  "mean",
  "rank",
  "num_list_users",
  "num_episodes",
  "average_episode_duration",
  "nsfw",
];

// The API returns at most 1000 entries per page; 20 pages covers any list.
const MAX_PAGES = 20;

interface Page {
  data: unknown[];
  paging?: { next?: string };
}

export const onRequestGet = withSession(async (token) => {
  const url = new URL(`${API_URL}/users/@me/animelist`);
  url.search = new URLSearchParams({
    limit: "1000",
    sort: "list_updated_at",
    nsfw: "true",
    fields: FIELDS.join(","),
  }).toString();

  const entries: unknown[] = [];
  let next: string | undefined = url.toString();
  for (let page = 0; next && page < MAX_PAGES; page++) {
    const result: Page = await malGet<Page>(token, next);
    entries.push(...result.data);
    // Only ever follow links back to the MAL API with the visitor's token.
    next = result.paging?.next?.startsWith(`${API_URL}/`) ? result.paging.next : undefined;
  }

  return json(entries, {
    headers: { "cache-control": "private, no-store" },
  });
});
