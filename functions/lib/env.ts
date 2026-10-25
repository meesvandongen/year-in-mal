/** Secrets configured on the Cloudflare Pages project (or in `.dev.vars`). */
export interface Env {
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  /** Any long random string; used to sign the session cookies. */
  COOKIE_SECRET: string;
}
