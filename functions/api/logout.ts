import type { Env } from "../lib/env";
import { clearTokens } from "../lib/session";

export const onRequestPost: PagesFunction<Env> = async () => {
  const response = new Response(null, { status: 204 });
  clearTokens(response.headers);
  return response;
};
