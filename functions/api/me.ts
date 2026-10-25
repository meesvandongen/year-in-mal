import { json } from "../lib/http";
import { API_URL, malGet } from "../lib/mal";
import { withSession } from "../lib/session";

interface MalUser {
  id: number;
  name: string;
  picture?: string;
  joined_at?: string;
}

export const onRequestGet = withSession(async (token) => {
  const user = await malGet<MalUser>(token, `${API_URL}/users/@me`);
  return json(
    {
      id: user.id,
      name: user.name,
      picture: user.picture,
      joined_at: user.joined_at,
    },
    { headers: { "cache-control": "private, no-store" } },
  );
});
