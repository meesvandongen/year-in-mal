import type { ListEntry, User } from "./types";

export type Session =
  | { kind: "anonymous"; authError?: string }
  | { kind: "user" | "demo"; user: User; list: ListEntry[] };

export class RequestError extends Error {
  constructor(readonly status: number) {
    super(`Request failed with status ${status}`);
  }
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new RequestError(res.status);
  return res.json() as Promise<T>;
}

export const isDemo = () => new URLSearchParams(location.search).has("demo");

export async function loadSession(): Promise<Session> {
  if (isDemo()) {
    const { createDemoList, demoUser } = await import("../demo/demo");
    return { kind: "demo", user: demoUser, list: createDemoList() };
  }

  const params = new URLSearchParams(location.search);
  const authError = params.get("auth_error") ?? undefined;
  if (authError) {
    params.delete("auth_error");
    const query = params.size > 0 ? `?${params}` : "";
    history.replaceState(null, "", `${location.pathname}${query}`);
  }

  // Ask for both at once; the list request fails the same way when logged out.
  const user = getJson<User>("/api/me");
  const list = getJson<ListEntry[]>("/api/animelist");
  list.catch(() => {});

  try {
    return { kind: "user", user: await user, list: await list };
  } catch (error) {
    if (error instanceof RequestError && error.status === 401) {
      return { kind: "anonymous", authError };
    }
    throw error;
  }
}

export async function logout() {
  await fetch("/api/logout", { method: "POST" });
  location.assign("/");
}
