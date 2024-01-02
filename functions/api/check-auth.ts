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

  return new Response(undefined, {
    status: 204,
  });
};
