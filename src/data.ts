export interface AnimeListItem {
  node: {
    id: number;
    title: string;
    main_picture: {
      medium: string;
      large: string;
    };
    end_date?: string;
    genres: Array<{
      id: number;
      name: string;
    }>;
    nsfw: "white" | "grey" | "black";
    num_list_users: number;
    num_scoring_users: number;
    rank?: number;
    start_date?: string;
    status: string;
    studios: Array<{
      id: number;
      name: string;
    }>;
    media_type:
      | "movie"
      | "tv"
      | "ova"
      | "special"
      | "ona"
      | "music"
      | "unknown"
      | string;
    mean?: number;
    average_episode_duration?: number;
    num_episodes?: number;
  };
  list_status: {
    status: string;
    score: number;
    num_episodes_watched: number;
    is_rewatching: boolean;
    updated_at: string;
    start_date?: string;
    finish_date?: string;
  };
}
