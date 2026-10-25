import type { Env } from "./env";
import { error } from "./http";
import { deleteCookie, getSignedCookie, setSignedCookie } from "./kukkii";
import type { CookieOptions } from "./kukkii/utils";
import { MalError, refreshTokens, type Tokens } from "./mal";

const ACCESS_TOKEN = "access_token";
const REFRESH_TOKEN = "refresh_token";
// MAL doesn't say how long refresh tokens live; if one has expired the refresh
// fails and the visitor simply logs in again.
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 90;

export const cookieOptions: CookieOptions = {
  path: "/",
  httpOnly: true,
  secure: true,
  sameSite: "Lax",
};

export async function writeTokens(headers: Headers, tokens: Tokens, env: Env) {
  await setSignedCookie(headers, ACCESS_TOKEN, tokens.access_token, env.COOKIE_SECRET, {
    ...cookieOptions,
    maxAge: tokens.expires_in,
  });
  await setSignedCookie(headers, REFRESH_TOKEN, tokens.refresh_token, env.COOKIE_SECRET, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export function clearTokens(headers: Headers) {
  deleteCookie(headers, ACCESS_TOKEN, cookieOptions);
  deleteCookie(headers, REFRESH_TOKEN, cookieOptions);
}

/**
 * Reads the access token from the session cookies, using the refresh token to
 * get a new one once it has expired. Cookies to send back are put in `headers`.
 */
async function getAccessToken(request: Request, env: Env, headers: Headers) {
  const accessToken = await getSignedCookie(request, env.COOKIE_SECRET, ACCESS_TOKEN);
  if (accessToken) return accessToken;

  const refreshToken = await getSignedCookie(request, env.COOKIE_SECRET, REFRESH_TOKEN);
  if (!refreshToken) return undefined;

  try {
    const tokens = await refreshTokens(env, refreshToken);
    await writeTokens(headers, tokens, env);
    return tokens.access_token;
  } catch {
    clearTokens(headers);
    return undefined;
  }
}

/** Wraps a handler that talks to the MAL API on behalf of the visitor. */
export function withSession(
  handler: (token: string, context: EventContext<Env, string, unknown>) => Promise<Response>,
): PagesFunction<Env> {
  return async (context) => {
    const cookies = new Headers();
    const token = await getAccessToken(context.request, context.env, cookies);

    let response: Response;
    if (!token) {
      response = error(401, "unauthenticated");
    } else {
      try {
        response = await handler(token, context);
      } catch (e) {
        if (!(e instanceof MalError)) throw e;
        if (e.status === 401) {
          clearTokens(cookies);
          response = error(401, "unauthenticated");
        } else {
          response = error(502, "mal_unavailable");
        }
      }
    }

    for (const cookie of cookies.getSetCookie()) {
      response.headers.append("set-cookie", cookie);
    }
    return response;
  };
}
