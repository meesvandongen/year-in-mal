import { generateRandomString, generateCodeVerifier } from "../crypto";
import { Env } from "../env";
import { setSignedCookie } from "../kukkii";

export const onRequest: PagesFunction<Env> = async (c) => {
  const requestUrl = new URL(c.request.url);
  const response = new Response(undefined, {
    status: 302,
  });

  const code_challenge = generateRandomString();
  const code_verifier = generateCodeVerifier(code_challenge);
  await setSignedCookie(
    response.headers,
    "code_verifier",
    code_verifier,
    c.env.COOKIE_SECRET
  );

  const parameters = new URLSearchParams({
    response_type: "code",
    client_id: c.env.CLIENT_ID,
    code_challenge_method: "plain",
    code_challenge,
    redirect_uri: `${requestUrl.origin}/api/callback`,
  });
  const url = new URL(c.env.AUTH_URL);

  url.search = parameters.toString();
  response.headers.set("Location", url.toString());

  return response;
};
