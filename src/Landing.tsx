import { Suspense, use } from "react";
import { buttonClass } from "./components/Button";
import { ArrowRight } from "./components/Icons";
import { PosterWall } from "./components/PosterWall";
import { Logo } from "./components/TopBar";
import type { Anime } from "./lib/types";

let wallImages: Promise<string[]> | undefined;

/** Key art from the demo catalogue, loaded after the page itself. */
function loadWallImages() {
  wallImages ??= import("./demo/catalog.json").then(({ default: catalog }) =>
    (catalog as Anime[]).flatMap((anime) => anime.main_picture?.medium ?? []),
  );
  return wallImages;
}

function Wall() {
  return (
    <PosterWall
      images={use(loadWallImages())}
      columns={6}
      className="-z-20 opacity-35 lg:left-1/3 lg:opacity-70"
    />
  );
}

const AUTH_ERRORS: Record<string, string> = {
  denied: "You declined access on MyAnimeList, so there's nothing to show yet.",
  expired: "The login took too long. Please try again.",
};

const FEATURES = [
  "Your top 5",
  "Hot takes vs. the MAL crowd",
  "Genres & studios",
  "Hidden gems",
  "Marathons",
  "A shareable recap",
];

export function Landing({ authError }: { authError?: string }) {
  return (
    <div className="relative isolate min-h-dvh overflow-hidden">
      <Suspense>
        <Wall />
      </Suspense>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-ink/70 lg:bg-transparent lg:bg-linear-to-r lg:from-ink lg:from-35% lg:via-ink/85 lg:to-ink/10"
      />
      <div
        aria-hidden="true"
        className="absolute -top-1/3 -left-1/4 -z-10 size-[70vmax] rounded-full bg-accent-deep opacity-50 blur-3xl"
      />

      <header className="mx-auto flex max-w-7xl items-center px-5 py-5 sm:px-8 lg:px-12">
        <Logo />
      </header>

      <main className="mx-auto flex min-h-[calc(100dvh-9rem)] max-w-7xl flex-col justify-center px-5 py-12 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <p className="enter eyebrow">Unofficial · Made for MyAnimeList</p>
          <h1
            style={{ "--i": 1 }}
            className="enter mt-5 font-display text-[clamp(3.25rem,9vw,7.25rem)] leading-[0.88] font-extrabold tracking-[-0.045em]"
          >
            Your year in anime,{" "}
            <span className="bg-linear-to-r from-accent to-accent-strong bg-clip-text text-transparent">
              wrapped.
            </span>
          </h1>
          <p
            style={{ "--i": 2 }}
            className="enter mt-7 max-w-lg text-lg leading-relaxed text-white/75 sm:text-xl"
          >
            Log in with MyAnimeList to relive the shows you finished, your hottest takes, the
            studios that owned your year and the ones you let go.
          </p>

          {authError && (
            <p
              role="alert"
              className="mt-6 max-w-lg rounded-2xl bg-rose-500/15 px-4 py-3 text-sm text-rose-100 ring-1 ring-rose-400/30 ring-inset"
            >
              {AUTH_ERRORS[authError] ?? "Logging in didn't work. Please try again."}
            </p>
          )}

          <div style={{ "--i": 3 }} className="enter mt-9 flex flex-wrap gap-3">
            <a href="/api/login" className={buttonClass("primary", "h-14 px-7 text-base")}>
              Continue with MyAnimeList
              <ArrowRight />
            </a>
            <a href="/?demo" className={buttonClass("ghost", "h-14 px-7 text-base")}>
              Try the demo
            </a>
          </div>
          <p className="mt-5 text-sm text-white/50">
            Read-only access to your list. Nothing is stored on our servers.
          </p>

          <ul className="mt-12 flex max-w-xl flex-wrap gap-2">
            {FEATURES.map((feature) => (
              <li
                key={feature}
                className="rounded-full bg-white/6 px-3.5 py-1.5 text-sm text-white/70 ring-1 ring-white/10 backdrop-blur-md ring-inset"
              >
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </main>

      <footer className="mx-auto max-w-7xl px-5 pb-6 text-xs text-white/40 sm:px-8 lg:px-12">
        Not affiliated with MyAnimeList. Anime data and artwork belong to their respective owners.
      </footer>
    </div>
  );
}
