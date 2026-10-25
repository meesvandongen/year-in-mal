import type { Env } from "../lib/env";
import { redirect } from "../lib/http";
import { deleteCookie, getSignedCookie } from "../lib/kukkii";
import { exchangeCode, type Tokens } from "../lib/mal";
import { cookieOptions, writeTokens } from "../lib/session";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const { searchParams, origin } = new URL(request.url);

  const finish = async (result: { tokens: Tokens } | { error: string }) => {
    const response = redirect(
      "error" in result ? `${origin}/?auth_error=${result.error}` : `${origin}/`,
    );
    deleteCookie(response.headers, "code_verifier", cookieOptions);
    deleteCookie(response.headers, "oauth_state", cookieOptions);
    if ("tokens" in result) {
      await writeTokens(response.headers, result.tokens, env);
    }
    return response;
  };

  if (searchParams.has("error")) return finish({ error: "denied" });

  const code = searchParams.get("code");
  const [codeVerifier, state] = await Promise.all([
    getSignedCookie(request, env.COOKIE_SECRET, "code_verifier"),
    getSignedCookie(request, env.COOKIE_SECRET, "oauth_state"),
  ]);
  if (!code || !codeVerifier || !state) return finish({ error: "expired" });
  if (searchParams.get("state") !== state) return finish({ error: "state" });

  try {
    const tokens = await exchangeCode(env, code, codeVerifier, `${origin}/api/callback`);
    return await finish({ tokens });
  } catch {
    return finish({ error: "token" });
  }
};
