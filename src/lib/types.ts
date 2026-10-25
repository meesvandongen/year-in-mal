/** The subset of the MyAnimeList v2 API this app reads. */

export interface Named {
  id: number;
  name: string;
}

export type MediaType =
  | "tv"
  | "movie"
  | "ova"
  | "ona"
  | "special"
  | "music"
  | "tv_special"
  | "cm"
  | "pv"
  | "unknown";

export interface Anime {
  id: number;
  title: string;
  alternative_titles?: { en?: string; ja?: string; synonyms?: string[] };
  main_picture?: { medium: string; large?: string };
  start_date?: string;
  end_date?: string;
  // MAL leaves these out instead of sending an empty array.
  genres?: Named[];
  studios?: Named[];
  media_type: MediaType | (string & {});
  status?: string;
  mean?: number;
  rank?: number;
  num_list_users?: number;
  num_episodes?: number;
  /** In seconds. */
  average_episode_duration?: number;
  nsfw?: "white" | "gray" | "black";
}

export type WatchStatus = "watching" | "completed" | "on_hold" | "dropped" | "plan_to_watch";

export interface ListStatus {
  status: WatchStatus;
  /** 0 when unscored, otherwise 1–10. */
  score: number;
  num_episodes_watched: number;
  is_rewatching: boolean;
  updated_at: string;
  start_date?: string;
  /** `YYYY-MM-DD`, though MAL allows partial dates such as `YYYY-MM`. */
  finish_date?: string;
}

export interface ListEntry {
  node: Anime;
  list_status: ListStatus;
}

export interface User {
  id: number;
  name: string;
  picture?: string;
  joined_at?: string;
}
