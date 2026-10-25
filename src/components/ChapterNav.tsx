import type { ChapterInfo } from "../chapters/types";
import { ArrowDown } from "./Icons";

interface ChapterNavProps {
  chapters: ChapterInfo[];
  active: string;
  onNavigate: (id: string) => void;
}

/** Dots down the right edge on wide screens, one per chapter. */
export function ChapterNav({ chapters, active, onNavigate }: ChapterNavProps) {
  const index = chapters.findIndex((chapter) => chapter.id === active);
  const next = chapters[index + 1];

  return (
    <>
      <nav
        aria-label="Chapters"
        className="fixed top-1/2 right-5 z-40 hidden -translate-y-1/2 xl:block"
      >
        <ol className="flex flex-col items-end">
          {chapters.map((chapter) => {
            const current = chapter.id === active;
            return (
              <li key={chapter.id}>
                <a
                  href={`#${chapter.id}`}
                  aria-current={current ? "step" : undefined}
                  className="group flex items-center gap-3 py-1.5"
                >
                  <span
                    className={`text-xs font-semibold transition group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100 ${current ? "text-accent" : "text-white/70"} translate-x-1 opacity-0`}
                  >
                    {chapter.label}
                  </span>
                  <span
                    className={`h-1.5 rounded-full transition-all duration-500 ${current ? "w-6 bg-accent" : "w-1.5 bg-white/30 group-hover:bg-white/70"}`}
                  />
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      {next && (
        <button
          type="button"
          onClick={() => onNavigate(next.id)}
          aria-label={`Next: ${next.label}`}
          title="Next chapter (J)"
          className="fixed right-5 bottom-5 z-40 hidden size-12 cursor-pointer place-items-center rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur-xl transition ring-inset hover:bg-white/20 active:scale-95 sm:right-8 sm:bottom-8 sm:grid lg:right-12"
        >
          <ArrowDown />
        </button>
      )}
    </>
  );
}
