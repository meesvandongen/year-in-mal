import { Fragment, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { CHAPTERS } from "./chapters";
import type { ChapterInfo, StoryContext } from "./chapters/types";
import { ChapterNav } from "./components/ChapterNav";
import { TopBar } from "./components/TopBar";
import { availableYears, defaultYear, reviewYear } from "./lib/stats";
import type { ListEntry, User } from "./lib/types";

const prefersReducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function scrollToChapter(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

interface StoryProps {
  user: User;
  list: ListEntry[];
  demo: boolean;
}

/** The year in review: a vertical story of full-screen chapters. */
export function Story({ user, list, demo }: StoryProps) {
  const [year, setYear] = useState(() => defaultYear(list));
  const [active, setActive] = useState("intro");

  const review = reviewYear(list, year);
  const years = [...new Set([year, ...availableYears(list)])].toSorted((a, b) => b - a);
  const empty = review.totals.completed + review.totals.dropped === 0;
  const chapters = (empty ? CHAPTERS.slice(0, 1) : CHAPTERS)
    .filter((chapter) => !chapter.when || chapter.when(review))
    .map((chapter, number) => ({ ...chapter, number }));
  const infos: ChapterInfo[] = chapters.map(({ id, number, label, hue }) => ({
    id,
    number,
    label,
    hue,
  }));

  function changeYear(next: number) {
    const update = () => {
      flushSync(() => {
        setYear(next);
        setActive("intro");
      });
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    if (document.startViewTransition && !prefersReducedMotion()) {
      document.startViewTransition(update);
    } else {
      update();
    }
  }

  // Track the chapter in view, and let the fixed UI take on its colour.
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-chapter]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const section = entry.target as HTMLElement;
          setActive(section.id);
          document.documentElement.style.setProperty("--hue", section.dataset.hue ?? "290");
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [year]);

  // J and K step through chapters, like in a feed reader.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if ((event.target as HTMLElement).closest("input, select, textarea")) {
        return;
      }
      const ids = [...document.querySelectorAll("[data-chapter]")].map((section) => section.id);
      const index = ids.indexOf(active);
      const key = event.key.toLowerCase();
      const target = key === "j" ? ids[index + 1] : key === "k" ? ids[index - 1] : undefined;
      if (target) scrollToChapter(target);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  const context: StoryContext = {
    review,
    user,
    demo,
    years,
    onYearChange: changeYear,
  };

  return (
    <>
      <TopBar user={user} demo={demo} year={year} years={years} onYearChange={changeYear} />
      <ChapterNav chapters={infos} active={active} onNavigate={scrollToChapter} />
      <main key={year}>
        {chapters.map(({ render, ...chapter }, i) => (
          <Fragment key={chapter.id}>{render({ ...context, chapter: infos[i]! })}</Fragment>
        ))}
      </main>
    </>
  );
}
