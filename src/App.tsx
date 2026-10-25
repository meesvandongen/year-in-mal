import { Component, type ReactNode, Suspense, use } from "react";
import { buttonClass } from "./components/Button";
import { Sparkle } from "./components/Icons";
import { Landing } from "./Landing";
import { loadSession } from "./lib/session";
import { Story } from "./Story";

const session = loadSession();

function Screen({ children }: { children: ReactNode }) {
  return (
    <main className="relative isolate grid min-h-dvh place-items-center overflow-hidden px-5 text-center">
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -z-10 size-[60vmax] -translate-1/2 rounded-full bg-accent-deep opacity-50 blur-3xl"
      />
      <div className="flex max-w-md flex-col items-center">{children}</div>
    </main>
  );
}

function Loading() {
  return (
    <Screen>
      <Sparkle
        width="3.5rem"
        height="3.5rem"
        className="text-accent motion-safe:animate-spin motion-safe:[animation-duration:2.5s]"
      />
      <p className="mt-8 font-display text-2xl font-bold" role="status">
        Rewinding your year…
      </p>
      <p className="mt-2 text-white/60">Fetching your list from MyAnimeList.</p>
    </Screen>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { error?: unknown }> {
  state: { error?: unknown } = {};

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  render() {
    if (this.state.error === undefined) return this.props.children;
    return (
      <Screen>
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          MyAnimeList isn't answering
        </h1>
        <p className="mt-4 text-white/70">
          We couldn't load your list. MAL might be having a moment; try again in a bit.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className={buttonClass("primary")}
            onClick={() => location.reload()}
          >
            Try again
          </button>
          <a href="/?demo" className={buttonClass("ghost")}>
            Try the demo
          </a>
        </div>
      </Screen>
    );
  }
}

function Root() {
  const current = use(session);
  if (current.kind === "anonymous") {
    return <Landing authError={current.authError} />;
  }
  return <Story user={current.user} list={current.list} demo={current.kind === "demo"} />;
}

export function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Root />
      </Suspense>
    </ErrorBoundary>
  );
}
