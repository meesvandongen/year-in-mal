export function json(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { ...init, headers });
}

export function error(status: number, code: string) {
  return json({ error: code }, { status });
}

export function redirect(location: string) {
  return new Response(null, { status: 302, headers: { location } });
}

export function randomToken(bytes: number) {
  const buffer = crypto.getRandomValues(new Uint8Array(bytes));
  // base64url, which only uses characters PKCE and cookies both allow.
  return btoa(String.fromCharCode(...buffer))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}
