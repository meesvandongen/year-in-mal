import { Env } from "../env";
import { getSignedCookie, deleteCookie, setSignedCookie } from "../kukkii";

export const onRequest: PagesFunction<Env> = async (c) => {
  const { searchParams, origin } = new URL(c.request.url);

  const code = searchParams.get("code");
  if (!code) {
    return new Response("No code provided", { status: 400 });
  }
  const code_verifier = await getSignedCookie(
    c.request,
    c.env.COOKIE_SECRET,
    "code_verifier"
  );
  if (!code_verifier) {
    return new Response("No code_verifier provided", { status: 400 });
  }

  const response = new Response(undefined, {
    status: 302,
  });
  deleteCookie(response.headers, "code_verifier");

  const { access_token, expires_in, refresh_token } = await fetchToken(
    c.env,
    origin,
    code,
    code_verifier
  );

  await setSignedCookie(
    response.headers,
    "access_token",
    access_token,
    c.env.COOKIE_SECRET,
    {
      expires: new Date(Date.now() + expires_in * 1000),
      httpOnly: true,
      secure: true,
    }
  );
  await setSignedCookie(
    response.headers,
    "refresh_token",
    refresh_token,
    c.env.COOKIE_SECRET,
    {
      expires: new Date(Date.now() + expires_in * 1000),
      httpOnly: true,
      secure: true,
    }
  );

  response.headers.set("Location", `${origin}/`);

  return response;
};

async function fetchToken(
  env: Env,
  origin: string,
  code: string,
  code_verifier: string
) {
  const body = new URLSearchParams({
    client_id: env.CLIENT_ID,
    client_secret: env.CLIENT_SECRET,
    code,
    code_verifier,
    grant_type: "authorization_code",
    redirect_uri: `${origin}/api/callback`,
  });

  const res = await fetch(env.TOKEN_URL, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch token");
  }

  const json = await res.json<{
    access_token: string;
    expires_in: number;
    refresh_token: string;
  }>();

  if (!json.access_token || !json.expires_in || !json.refresh_token) {
    throw new Error("Invalid token response");
  }

  return json;
}
