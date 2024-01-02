import { Env } from "../env";
import { getSignedCookie } from "../kukkii";

export const onRequest: PagesFunction<Env> = async (c) => {
  const access_token = await getSignedCookie(
    c.request,
    c.env.COOKIE_SECRET,
    "access_token"
  );
  if (!access_token) {
    return new Response("No access_token provided", { status: 400 });
  }

  const url = new URL(`${c.env.API_URL}/users/@me/animelist`);
  const parameters = new URLSearchParams({
    limit: "1000",
    sort: "list_updated_at",
    fields: [
      // list status
      "list_status",
      // node
      "end_date",
      "genres",
      "nsfw",
      "num_list_users",
      "num_scoring_users",
      "rank",
      "start_date",
      "status",
      "studios",
      "media_type",
      "mean",
      "average_episode_duration",
      "num_episodes",
    ].join(","),
  });

  url.search = parameters.toString();

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  const json = await res.json<any>();
  return new Response(JSON.stringify(json.data), {
    headers: {
      "content-type": "application/json",
    },
  });
};
