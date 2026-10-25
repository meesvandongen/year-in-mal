import type { ReactNode } from "react";
import type { YearInReview } from "../lib/stats";
import type { User } from "../lib/types";

/** What every chapter gets: its place in the story and the data. */
export interface ChapterInfo {
  id: string;
  number: number;
  label: string;
  hue: number;
}

export interface StoryContext {
  review: YearInReview;
  user: User;
  demo: boolean;
  years: number[];
  onYearChange: (year: number) => void;
}

export interface ChapterProps extends StoryContext {
  chapter: ChapterInfo;
}

export interface ChapterDefinition {
  id: string;
  label: string;
  hue: number;
  /** Leave the chapter out when there isn't enough data for it. */
  when?: (review: YearInReview) => boolean;
  render: (props: ChapterProps) => ReactNode;
}
