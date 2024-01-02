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

  const url = new URL(`${c.env.API_URL}/users/@me`);

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  const json = await res.json();
  return new Response(JSON.stringify(json), {
    headers: {
      "content-type": "application/json",
    },
  });
};
