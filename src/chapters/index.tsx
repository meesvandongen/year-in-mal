import { Dropped, Formats, Genres, Studios } from "./Breakdown";
import { CatchUp } from "./CatchUp";
import { Bookends, Crowd, Era, Gems, Length, Popularity } from "./Contrasts";
import { Intro } from "./Intro";
import { Outro } from "./Outro";
import { Numbers, Rhythm } from "./Overview";
import { Favourites, HotTakes, LeastFavourites, Scores } from "./Taste";
import type { ChapterDefinition } from "./types";

const differ = (a?: { node: { id: number } }, b?: { node: { id: number } }) =>
  !!a && !!b && a.node.id !== b.node.id;

/** The story, in order. Chapters without enough data are skipped. */
export const CHAPTERS: ChapterDefinition[] = [
  { id: "intro", label: "Intro", hue: 290, render: (p) => <Intro {...p} /> },
  {
    id: "numbers",
    label: "By the numbers",
    hue: 255,
    render: (p) => <Numbers {...p} />,
  },
  {
    id: "rhythm",
    label: "Rhythm",
    hue: 170,
    when: (r) => r.totals.completed >= 4,
    render: (p) => <Rhythm {...p} />,
  },
  {
    id: "favourites",
    label: "Favourites",
    hue: 75,
    when: (r) => r.favourites.length > 0,
    render: (p) => <Favourites {...p} />,
  },
  {
    id: "scores",
    label: "Your scores",
    hue: 345,
    when: (r) => r.totals.scored >= 3,
    render: (p) => <Scores {...p} />,
  },
  {
    id: "hot-takes",
    label: "Hot takes",
    hue: 25,
    when: (r) => r.underrated.length + r.overrated.length > 0,
    render: (p) => <HotTakes {...p} />,
  },
  {
    id: "least-favourites",
    label: "Misses",
    hue: 230,
    when: (r) =>
      r.leastFavourites.length >= 3 &&
      r.leastFavourites[0]!.list_status.score < r.favourites[0]!.list_status.score,
    render: (p) => <LeastFavourites {...p} />,
  },
  {
    id: "gems",
    label: "Hidden gems",
    hue: 185,
    when: (r) => !!(r.hiddenGem ?? r.unpopularOpinion),
    render: (p) => <Gems {...p} />,
  },
  {
    id: "popularity",
    label: "Popularity",
    hue: 210,
    when: (r) => differ(r.popularity.most, r.popularity.least),
    render: (p) => <Popularity {...p} />,
  },
  {
    id: "crowd",
    label: "The crowd",
    hue: 140,
    when: (r) => differ(r.crowd.loved, r.crowd.disliked),
    render: (p) => <Crowd {...p} />,
  },
  {
    id: "bookends",
    label: "Bookends",
    hue: 320,
    when: (r) => differ(r.bookends.first, r.bookends.last),
    render: (p) => <Bookends {...p} />,
  },
  {
    id: "era",
    label: "Time travel",
    hue: 60,
    when: (r) =>
      differ(r.era.oldest, r.era.newest) &&
      r.era.oldest!.node.start_date?.slice(0, 4) !== r.era.newest!.node.start_date?.slice(0, 4),
    render: (p) => <Era {...p} />,
  },
  {
    id: "catch-up",
    label: "Catching up",
    hue: 155,
    when: (r) => r.lag.ranking.length >= 3,
    render: (p) => <CatchUp {...p} />,
  },
  {
    id: "length",
    label: "Marathons",
    hue: 110,
    when: (r) => differ(r.length.longest, r.length.shortest),
    render: (p) => <Length {...p} />,
  },
  {
    id: "genres",
    label: "Genres",
    hue: 275,
    when: (r) => r.genres.byCount.length > 0,
    render: (p) => <Genres {...p} />,
  },
  {
    id: "studios",
    label: "Studios",
    hue: 195,
    when: (r) => r.studios.length > 0,
    render: (p) => <Studios {...p} />,
  },
  {
    id: "formats",
    label: "Formats",
    hue: 40,
    when: (r) => r.formats.length > 1,
    render: (p) => <Formats {...p} />,
  },
  {
    id: "dropped",
    label: "Dropped",
    hue: 15,
    when: (r) => r.totals.dropped > 0,
    render: (p) => <Dropped {...p} />,
  },
  { id: "outro", label: "Wrap-up", hue: 290, render: (p) => <Outro {...p} /> },
];
