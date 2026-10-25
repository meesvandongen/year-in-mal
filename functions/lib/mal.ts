import type { Env } from "./env";

export const AUTH_URL = "https://myanimelist.net/v1/oauth2/authorize";
export const TOKEN_URL = "https://myanimelist.net/v1/oauth2/token";
export const API_URL = "https://api.myanimelist.net/v2";

export interface Tokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export class MalError extends Error {
  constructor(readonly status: number) {
    super(`MyAnimeList responded with ${status}`);
  }
}

async function requestTokens(env: Env, params: Record<string, string>) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.CLIENT_ID,
      client_secret: env.CLIENT_SECRET,
      ...params,
    }),
  });
  if (!res.ok) throw new MalError(res.status);

  const tokens = await res.json<Partial<Tokens>>();
  if (!tokens.access_token || !tokens.refresh_token || !tokens.expires_in) {
    throw new Error("Invalid token response");
  }
  return tokens as Tokens;
}

export function exchangeCode(env: Env, code: string, codeVerifier: string, redirectUri: string) {
  return requestTokens(env, {
    grant_type: "authorization_code",
    code,
    code_verifier: codeVerifier,
    redirect_uri: redirectUri,
  });
}

export function refreshTokens(env: Env, refreshToken: string) {
  return requestTokens(env, {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
}

export async function malGet<T>(token: string, url: string | URL) {
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new MalError(res.status);
  return res.json<T>();
}
