import { logout } from "../lib/session";
import type { User } from "../lib/types";
import { ChevronDown, ExternalLink, LogOut, Sparkle } from "./Icons";

const menuItem =
  "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition hover:bg-white/10";

export function Logo() {
  return (
    <span className="flex shrink-0 items-center gap-2 font-display text-lg font-extrabold tracking-tight whitespace-nowrap">
      <Sparkle className="text-accent transition-colors duration-700" />
      Year in MAL
    </span>
  );
}

function Avatar({ user }: { user: User }) {
  return user.picture ? (
    <img src={user.picture} alt="" className="size-full object-cover" />
  ) : (
    <span className="grid size-full place-items-center bg-accent font-display font-bold text-ink transition-colors duration-700">
      {user.name[0]?.toUpperCase()}
    </span>
  );
}

interface TopBarProps {
  user: User;
  demo: boolean;
  year: number;
  years: number[];
  onYearChange: (year: number) => void;
}

export function TopBar({ user, demo, year, years, onYearChange }: TopBarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-linear-to-b from-ink/90 via-ink/60 to-transparent">
      {/* Fills as you scroll, where scroll-driven animations are supported. */}
      <div
        aria-hidden="true"
        className="scroll-progress absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-accent transition-colors duration-700"
      />
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-4 sm:px-8 lg:px-12">
        <a href="#intro" aria-label="Back to the start">
          <Logo />
        </a>
        {demo && (
          <span className="hidden rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-white/80 uppercase min-[400px]:inline">
            Demo
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <label className="relative">
            <span className="sr-only">Year</span>
            <select
              value={year}
              onChange={(event) => onYearChange(Number(event.target.value))}
              className="h-10 cursor-pointer appearance-none rounded-full bg-white/10 pr-9 pl-4 font-display font-bold ring-1 ring-white/15 backdrop-blur-md transition ring-inset hover:bg-white/15"
            >
              {years.map((option) => (
                <option key={option} value={option} className="bg-ink-raised">
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-white/60" />
          </label>

          <button
            type="button"
            popoverTarget="user-menu"
            aria-label="Account"
            className="size-10 cursor-pointer overflow-hidden rounded-full ring-1 ring-white/20 transition hover:ring-white/50"
          >
            <Avatar user={user} />
          </button>
          <div
            id="user-menu"
            popover="auto"
            className="fixed inset-auto top-16 right-5 m-0 w-64 scale-95 rounded-2xl border-0 bg-ink-raised/95 p-2 text-white opacity-0 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl transition-[opacity,scale,display,overlay] transition-discrete duration-200 sm:right-8 lg:right-12 open:scale-100 open:opacity-100 starting:open:scale-95 starting:open:opacity-0"
          >
            {demo ? (
              <>
                <p className="px-3 py-2 text-sm text-white/60">You're looking at a made-up list.</p>
                <a href="/api/login" className={menuItem}>
                  <Sparkle className="text-accent" />
                  Log in with MyAnimeList
                </a>
                <a href="/" className={menuItem}>
                  <LogOut />
                  Exit demo
                </a>
              </>
            ) : (
              <>
                <div className="px-3 py-2">
                  <p className="text-xs text-white/50">Signed in as</p>
                  <p className="truncate font-semibold">{user.name}</p>
                </div>
                <a
                  href={`https://myanimelist.net/profile/${encodeURIComponent(user.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className={menuItem}
                >
                  <ExternalLink />
                  Your MAL profile
                </a>
                <button type="button" className={menuItem} onClick={logout}>
                  <LogOut />
                  Log out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
