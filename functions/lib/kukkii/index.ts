import { type CookieOptions, parseSigned, serialize, serializeSigned } from "./utils";

/**
 * Returns the value of a signed cookie, or `undefined` when it is missing or
 * its signature doesn't match.
 */
export async function getSignedCookie(
  request: Request,
  secret: string | BufferSource,
  key: string,
) {
  const cookie = request.headers.get("Cookie");
  if (!cookie) {
    return undefined;
  }
  const obj = await parseSigned(cookie, secret, key);
  return obj[key] || undefined;
}

export function setCookie(
  headers: Headers,
  name: string,
  value: string,
  opt?: CookieOptions,
): void {
  const cookie = serialize(name, value, { path: "/", ...opt });
  headers.append("set-cookie", cookie);
}

export async function setSignedCookie(
  headers: Headers,
  name: string,
  value: string,
  secret: string | BufferSource,
  opt?: CookieOptions,
): Promise<void> {
  const cookie = await serializeSigned(name, value, secret, {
    path: "/",
    ...opt,
  });
  headers.append("set-cookie", cookie);
}

export function deleteCookie(headers: Headers, name: string, opt?: CookieOptions): void {
  setCookie(headers, name, "", { ...opt, maxAge: 0 });
}
