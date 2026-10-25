import type { Env } from "../lib/env";
import { randomToken, redirect } from "../lib/http";
import { setSignedCookie } from "../lib/kukkii";
import { AUTH_URL } from "../lib/mal";
import { cookieOptions } from "../lib/session";

// Long enough to log in, short enough not to linger.
const OAUTH_COOKIE_MAX_AGE = 60 * 10;

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const { origin } = new URL(request.url);
  // MAL only supports the "plain" PKCE method, so the challenge is the
  // verifier itself. 96 bytes of base64url is the maximum length of 128.
  const codeVerifier = randomToken(96);
  const state = randomToken(32);

  const url = new URL(AUTH_URL);
  url.search = new URLSearchParams({
    response_type: "code",
    client_id: env.CLIENT_ID,
    code_challenge_method: "plain",
    code_challenge: codeVerifier,
    state,
    redirect_uri: `${origin}/api/callback`,
  }).toString();

  const response = redirect(url.toString());
  const options = { ...cookieOptions, maxAge: OAUTH_COOKIE_MAX_AGE };
  await setSignedCookie(
    response.headers,
    "code_verifier",
    codeVerifier,
    env.COOKIE_SECRET,
    options,
  );
  await setSignedCookie(response.headers, "oauth_state", state, env.COOKIE_SECRET, options);
  return response;
};
