import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  Input,
  Link,
  NextUIProvider,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { AnimeListItem } from "./data";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/pagination";
import { ArrowDown } from "./arrow-down";
import { useState } from "react";

function filterCompletedByUser(anime: AnimeListItem) {
  return anime.list_status.status === "completed";
}

function filterDroppedByUser(anime: AnimeListItem) {
  return anime.list_status.status === "dropped";
}

function filterUpdatedInYear(year: number) {
  return (anime: AnimeListItem) => {
    const date = new Date(anime.list_status.updated_at!);
    // is current year
    return date.getFullYear() === year;
  };
}

function filterWithUserScore(anime: AnimeListItem) {
  return anime.list_status.score !== 0;
}

function filterWithMalScore(anime: AnimeListItem) {
  return anime.node.mean !== undefined;
}

function filterNoMusic(anime: AnimeListItem) {
  return anime.node.media_type !== "music";
}

function sortByOverrated(a: AnimeListItem, b: AnimeListItem) {
  const differenceA = (a.node.mean ?? 0) - a.list_status.score;
  const differenceB = (b.node.mean ?? 0) - b.list_status.score;

  return differenceB - differenceA;
}

function sortByUnderrated(a: AnimeListItem, b: AnimeListItem) {
  const differenceA = a.list_status.score - (a.node.mean ?? 0);
  const differenceB = b.list_status.score - (b.node.mean ?? 0);

  return differenceB - differenceA;
}

function filterOverrated(anime: AnimeListItem) {
  return (anime.node.mean ?? 0) - anime.list_status.score > 0;
}

function filterUnderrated(anime: AnimeListItem) {
  return anime.list_status.score - (anime.node.mean ?? 0) > 0;
}

function sortByMalScoreHighFirst(a: AnimeListItem, b: AnimeListItem) {
  return b.node.mean! - a.node.mean!;
}

function sortByMalScoreLowFirst(a: AnimeListItem, b: AnimeListItem) {
  return a.node.mean! - b.node.mean!;
}

function sortByUserScoreHighFirst(a: AnimeListItem, b: AnimeListItem) {
  return b.list_status.score - a.list_status.score;
}

function sortByUserScoreLowFirst(a: AnimeListItem, b: AnimeListItem) {
  return a.list_status.score - b.list_status.score;
}

function sortByUserUpdatedDateLastFirst(a: AnimeListItem, b: AnimeListItem) {
  return (
    new Date(b.list_status.updated_at!).getTime() -
    new Date(a.list_status.updated_at!).getTime()
  );
}

function sortByUserUpdatedDateFirstFirst(a: AnimeListItem, b: AnimeListItem) {
  return (
    new Date(a.list_status.updated_at!).getTime() -
    new Date(b.list_status.updated_at!).getTime()
  );
}

function filterWithDuration(anime: AnimeListItem) {
  return anime.node.num_episodes !== undefined;
}

function filterWithNumEpisodes(anime: AnimeListItem) {
  return anime.node.num_episodes !== undefined;
}

function sortByLongestAnime(a: AnimeListItem, b: AnimeListItem) {
  return (
    b.node.num_episodes! * b.node.average_episode_duration! -
    a.node.num_episodes! * a.node.average_episode_duration!
  );
}

function sortByShortestAnime(a: AnimeListItem, b: AnimeListItem) {
  return (
    a.node.num_episodes! * a.node.average_episode_duration! -
    b.node.num_episodes! * b.node.average_episode_duration!
  );
}

function sortByMostListUsers(a: AnimeListItem, b: AnimeListItem) {
  return b.node.num_list_users! - a.node.num_list_users!;
}

function sortByLeastListUsers(a: AnimeListItem, b: AnimeListItem) {
  return a.node.num_list_users! - b.node.num_list_users!;
}

function sortByReleaseDateFirstFirst(a: AnimeListItem, b: AnimeListItem) {
  return (
    new Date(a.node.start_date!).getTime() -
    new Date(b.node.start_date!).getTime()
  );
}

function sortByReleaseDateLastFirst(a: AnimeListItem, b: AnimeListItem) {
  return (
    new Date(b.node.start_date!).getTime() -
    new Date(a.node.start_date!).getTime()
  );
}

function reduceToStudiosRecord(
  acc: Record<string, AnimeListItem[]>,
  anime: AnimeListItem
) {
  anime.node.studios.forEach((studio) => {
    if (!acc[studio.name]) {
      acc[studio.name] = [];
    }
    acc[studio.name].push(anime);
  });
  return acc;
}

function reduceToGenresRecord(
  acc: Record<string, AnimeListItem[]>,
  anime: AnimeListItem
) {
  anime.node.genres.forEach((genre) => {
    if (!acc[genre.name]) {
      acc[genre.name] = [];
    }
    acc[genre.name].push(anime);
  });
  return acc;
}

function reduceToMediaTypeRecord(
  acc: Record<string, AnimeListItem[]>,
  anime: AnimeListItem
) {
  if (!acc[anime.node.media_type]) {
    acc[anime.node.media_type] = [];
  }
  acc[anime.node.media_type].push(anime);
  return acc;
}

function sortAnimeEntriesByUserScoreLowFirst(
  [, animeA]: [string, AnimeListItem[]],
  [, animeB]: [string, AnimeListItem[]]
) {
  const averageScoreA =
    animeA.reduce((acc, anime) => acc + anime.list_status.score, 0) /
    animeA.length;
  const averageScoreB =
    animeB.reduce((acc, anime) => acc + anime.list_status.score, 0) /
    animeB.length;

  return averageScoreA - averageScoreB;
}

function sortAnimeEntriesByUserScoreHighFirst(
  [, animeA]: [string, AnimeListItem[]],
  [, animeB]: [string, AnimeListItem[]]
) {
  const averageScoreA =
    animeA.reduce((acc, anime) => acc + anime.list_status.score, 0) /
    animeA.length;
  const averageScoreB =
    animeB.reduce((acc, anime) => acc + anime.list_status.score, 0) /
    animeB.length;

  return averageScoreB - averageScoreA;
}

function sortAnimeEntriesMostFirst(
  [, animeA]: [string, AnimeListItem[]],
  [, animeB]: [string, AnimeListItem[]]
) {
  return animeB.length - animeA.length;
}

function filterAnimeEntriesWithMoreThanXAnime(x: number) {
  return ([, anime]: [string, AnimeListItem[]]) => anime.length > x;
}

function filterRankHigherThan(rank: number) {
  return (anime: AnimeListItem) => (anime.node.rank ?? 0) < rank;
}

function filterRankLowerThan(rank: number) {
  return (anime: AnimeListItem) => (anime.node.rank ?? 0) > rank;
}

export function Wrapped({ data }: { data: Array<AnimeListItem> }) {
  const currentYear = new Date().getFullYear();
  const [yearToEvaluate, setYearToEvaluate] = useState(
    new Date().getMonth() === 11 ? currentYear : currentYear - 1
  );
  const navigate = useNavigate();

  const initialFiltered = data
    .filter(filterUpdatedInYear(yearToEvaluate))
    .filter(filterNoMusic);

  const studiosCompletedAnime = initialFiltered
    .filter(filterCompletedByUser)
    .reduce(reduceToStudiosRecord, {});
  const studioCompletedAnimeEntries = Object.entries(studiosCompletedAnime);
  const studioEntriesMostCompletedAnime = studioCompletedAnimeEntries.toSorted(
    sortAnimeEntriesMostFirst
  );

  const studiosDroppedAnime = initialFiltered
    .filter(filterDroppedByUser)
    .reduce(reduceToStudiosRecord, {});
  const studioDroppedAnimeEntries = Object.entries(studiosDroppedAnime);
  const studioEntriesMostDroppedAnime = studioDroppedAnimeEntries.toSorted(
    sortAnimeEntriesMostFirst
  );

  const genresCompletedAnime = initialFiltered
    .filter(filterCompletedByUser)
    .reduce(reduceToGenresRecord, {});
  const genreCompletedAnimeEntries = Object.entries(genresCompletedAnime);
  const genreEntriesMostCompletedAnime = genreCompletedAnimeEntries.toSorted(
    sortAnimeEntriesMostFirst
  );

  const genresDroppedAnime = initialFiltered
    .filter(filterDroppedByUser)
    .reduce(reduceToGenresRecord, {});
  const genreDroppedAnimeEntries = Object.entries(genresDroppedAnime);
  const genreEntriesMostDroppedAnime = genreDroppedAnimeEntries.toSorted(
    sortAnimeEntriesMostFirst
  );

  const genresScoredAnime = initialFiltered
    .filter(filterWithUserScore)
    .reduce(reduceToGenresRecord, {});
  const genreScoredAnimeEntries = Object.entries(genresScoredAnime);
  const genreEntriesHighestUserScore = genreScoredAnimeEntries
    .filter(filterAnimeEntriesWithMoreThanXAnime(1))
    .toSorted(sortAnimeEntriesByUserScoreHighFirst);
  const genreEntriesLowestUserScore = genreScoredAnimeEntries
    .filter(filterAnimeEntriesWithMoreThanXAnime(1))
    .toSorted(sortAnimeEntriesByUserScoreLowFirst);

  const mediaTypeCompletedAnime = initialFiltered
    .filter(filterCompletedByUser)
    .toSorted(sortByUserScoreHighFirst)
    .reduce(reduceToMediaTypeRecord, {});
  const mediaTypeCompletedAnimeEntries = Object.entries(
    mediaTypeCompletedAnime
  );
  const mediaTypeEntriesMostCompletedAnime =
    mediaTypeCompletedAnimeEntries.toSorted(sortAnimeEntriesMostFirst);

  const secondsWatched = initialFiltered
    .filter(filterCompletedByUser)
    .reduce(
      (acc, anime) =>
        acc + anime.node.num_episodes! * anime.node.average_episode_duration!,
      0
    );

  return (
    <NextUIProvider navigate={navigate} className="h-full">
      <Swiper
        spaceBetween={50}
        slidesPerView={1}
        className="w-full h-full"
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        key={yearToEvaluate}
      >
        <SwiperSlide className="bg-gradient-to-t from-blue-900 to-blue-800 flex flex-col gap-8">
          <h1 className="text-4xl text-blue-100 font-bold flex items-center gap-4">
            Your MAL wrapped for{" "}
            <Input
              value={yearToEvaluate.toString()}
              onChange={(e) => setYearToEvaluate(parseInt(e.target.value))}
              type="number"
              className="inline-block w-20"
            />
          </h1>
        </SwiperSlide>

        {/* user score */}
        <SwiperSlide className="bg-gradient-to-t from-amber-900 to-amber-800 flex flex-col gap-8">
          <h1 className="text-4xl text-amber-100 font-bold">
            Anime you liked most
          </h1>
          <MalWrappedSlide
            list={initialFiltered
              .filter(filterCompletedByUser)
              .filter(filterWithUserScore)
              .toSorted(sortByUserScoreHighFirst)}
            length={5}
          />
        </SwiperSlide>
        <SwiperSlide className="bg-gradient-to-t from-violet-900 to-violet-800 flex flex-col gap-8">
          <h1 className="text-4xl text-violet-100 font-bold">
            Anime you liked least
          </h1>
          <MalWrappedSlide
            list={initialFiltered
              .filter(filterCompletedByUser)
              .filter(filterWithUserScore)
              .toSorted(sortByUserScoreLowFirst)}
            length={5}
          />
        </SwiperSlide>

        {/* Popularity */}
        <SwiperSlide className="bg-gradient-to-t flex flex-col gap-8 from-fuchsia-900 to-fuchsia-800">
          <h1 className="text-4xl font-bold text-fuchsia-100">
            The most popular Anime you watched
          </h1>

          <MalWrappedSlide
            list={initialFiltered
              .filter(filterCompletedByUser)
              .filter(filterWithMalScore)
              .toSorted(sortByMostListUsers)}
          />
        </SwiperSlide>
        <SwiperSlide className="bg-gradient-to-t flex flex-col gap-8 from-purple-900 to-purple-800">
          <h1 className="text-4xl font-bold text-purple-100">
            The least popular Anime you watched
          </h1>

          <MalWrappedSlide
            list={initialFiltered
              .filter(filterCompletedByUser)
              .filter(filterWithMalScore)
              .toSorted(sortByLeastListUsers)}
          />
        </SwiperSlide>

        {/* OVERRATED UNDERRATED */}
        <SwiperSlide className="bg-gradient-to-t flex flex-col gap-8 from-red-900 to-red-800">
          <h1 className="text-4xl font-bold text-red-100">
            Anime you think are overrated
          </h1>
          <MalWrappedSlide
            list={initialFiltered
              .filter(filterCompletedByUser)
              .filter(filterWithUserScore)
              .filter(filterWithMalScore)
              .filter(filterOverrated)
              .toSorted(sortByOverrated)}
          />
        </SwiperSlide>
        <SwiperSlide className="bg-gradient-to-t flex flex-col gap-8 from-emerald-900 to-emerald-800">
          <h1 className="text-4xl font-bold text-emerald-100">
            Anime you think are underrated
          </h1>
          <MalWrappedSlide
            list={initialFiltered
              .filter(filterCompletedByUser)
              .filter(filterWithUserScore)
              .filter(filterWithMalScore)
              .filter(filterUnderrated)
              .toSorted(sortByUnderrated)}
          />
        </SwiperSlide>

        {/* completed */}
        <SwiperSlide className="bg-gradient-to-t flex flex-col gap-8 from-lime-900 to-lime-800">
          <h1 className="text-4xl font-bold text-lime-100">
            Anime you watched that others loved
          </h1>

          <MalWrappedSlide
            list={initialFiltered
              .filter(filterCompletedByUser)
              .filter(filterWithMalScore)
              .toSorted(sortByMalScoreHighFirst)}
          />
        </SwiperSlide>
        <SwiperSlide className="bg-gradient-to-t flex flex-col gap-8 from-zinc-900 to-zinc-800">
          <h1 className="text-4xl font-bold text-zinc-100">
            Anime you watched that others didn't like
          </h1>
          <MalWrappedSlide
            list={initialFiltered
              .filter(filterCompletedByUser)
              .filter(filterWithMalScore)
              .toSorted(sortByMalScoreLowFirst)}
          />
        </SwiperSlide>

        {/* dropped */}
        <SwiperSlide className="bg-gradient-to-t flex flex-col gap-8 from-stone-900 to-stone-800">
          <h1 className="text-4xl font-bold text-stone-100">
            Anime you dropped that others thought were good
          </h1>
          <MalWrappedSlide
            list={initialFiltered
              .filter(filterDroppedByUser)
              .filter(filterWithMalScore)
              .toSorted(sortByMalScoreHighFirst)}
          />
        </SwiperSlide>
        <SwiperSlide className="bg-gradient-to-t flex flex-col gap-8 from-rose-900 to-rose-800">
          <h1 className="text-4xl font-bold text-rose-100">
            Anime you dropped that others didn't like
          </h1>

          <MalWrappedSlide
            list={initialFiltered
              .filter(filterDroppedByUser)
              .filter(filterWithMalScore)
              .toSorted(sortByMalScoreLowFirst)}
          />
        </SwiperSlide>

        <SwiperSlide className="bg-gradient-to-t flex flex-col gap-8 from-rose-900 to-rose-800">
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            className="w-full h-full"
            direction="vertical"
            modules={[Pagination]}
            pagination={{
              clickable: true,
            }}
          >
            <SwiperSlide className="flex flex-col gap-8">
              <h1 className="text-4xl text-rose-100 font-bold">
                The Beginning and the End
              </h1>
              <h3 className="text-rose-300">
                <ArrowDown />
              </h3>
              {/* Arrow down */}
            </SwiperSlide>
            <SwiperSlide className="flex-col gap-8">
              <h2 className="text-4xl text-rose-100 font-bold">
                The first anime you watched
              </h2>
              <MalWrappedSlide
                list={initialFiltered
                  .filter(filterCompletedByUser)
                  .filter(filterWithMalScore)
                  .toSorted(sortByUserUpdatedDateFirstFirst)}
              />
            </SwiperSlide>
            <SwiperSlide className="flex flex-col gap-8">
              <h2 className="text-4xl text-rose-100 font-bold">
                The last anime you watched
              </h2>
              <MalWrappedSlide
                list={initialFiltered
                  .filter(filterCompletedByUser)
                  .filter(filterWithMalScore)
                  .toSorted(sortByUserUpdatedDateLastFirst)}
              />
            </SwiperSlide>
          </Swiper>
        </SwiperSlide>

        {/* oldest, newest, longest, shortest */}
        <SwiperSlide className="bg-gradient-to-t flex flex-col gap-8 from-violet-900 to-violet-800">
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            className="w-full h-full"
            direction="vertical"
            modules={[Pagination]}
            pagination={{
              clickable: true,
            }}
          >
            <SwiperSlide className="flex flex-col gap-8">
              <h1 className="text-4xl text-violet-100 font-bold">
                The Oldest and the Newest
              </h1>
              <h3 className="text-violet-300">
                <ArrowDown />
              </h3>
              {/* Arrow down */}
            </SwiperSlide>
            <SwiperSlide className="flex-col gap-8">
              <h1 className="text-4xl font-bold text-violet-100">
                The oldest Anime you watched
              </h1>

              <MalWrappedSlide
                list={initialFiltered
                  .filter(filterCompletedByUser)
                  .filter(filterWithMalScore)
                  .toSorted(sortByReleaseDateFirstFirst)}
              />
            </SwiperSlide>
            <SwiperSlide className="flex flex-col gap-8">
              <h1 className="text-4xl font-bold text-sky-100">
                The newest Anime you watched
              </h1>

              <MalWrappedSlide
                list={initialFiltered
                  .filter(filterCompletedByUser)
                  .filter(filterWithMalScore)
                  .toSorted(sortByReleaseDateLastFirst)}
              />
            </SwiperSlide>
          </Swiper>
        </SwiperSlide>
        <SwiperSlide className="bg-gradient-to-t flex flex-col gap-8 from-orange-900 to-orange-800">
          <h1 className="text-4xl font-bold text-orange-100">
            The longest anime you watched
          </h1>

          <MalWrappedSlide
            list={initialFiltered
              .filter(filterCompletedByUser)
              .filter(filterWithMalScore)
              .filter(filterWithDuration)
              .filter(filterWithNumEpisodes)
              .toSorted(sortByLongestAnime)}
          />
        </SwiperSlide>
        <SwiperSlide className="bg-gradient-to-t flex flex-col gap-8 from-indigo-900 to-indigo-800">
          <h1 className="text-4xl font-bold text-indigo-100">
            The shortest anime you watched
          </h1>

          <MalWrappedSlide
            list={initialFiltered
              .filter(filterCompletedByUser)
              .filter(filterWithDuration)
              .filter(filterWithNumEpisodes)
              .toSorted(sortByShortestAnime)}
          />
        </SwiperSlide>

        {/* Genres */}
        <SwiperSlide className="flex flex-col gap-8 bg-gradient-to-t from-sky-900 to-sky-800">
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            className="w-full h-full"
            direction="vertical"
            modules={[Pagination]}
            pagination={{
              clickable: true,
            }}
          >
            <SwiperSlide className=" flex flex-col gap-8">
              <h1 className="text-4xl text-sky-100 font-bold">
                The genres you liked most
              </h1>
              <h3 className="text-sky-300">
                <ArrowDown />
              </h3>
              {/* Arrow down */}
            </SwiperSlide>
            {genreEntriesHighestUserScore
              .slice(0, 10)
              .map(([genre, list], i) => (
                <SwiperSlide className="flex flex-col gap-8">
                  <h2 className="text-3xl font-bold text-sky-100">
                    #{i + 1} {genre} ({list.length})
                  </h2>
                  <div>
                    <p className="text-sky-100">
                      Your average score:{" "}
                      {(
                        list.reduce(
                          (acc, anime) => acc + anime.list_status.score,
                          0
                        ) / list.length
                      ).toFixed(2)}
                    </p>
                    <p className="text-sky-100">
                      MAL average score:{" "}
                      {(
                        list.reduce((acc, anime) => acc + anime.node.mean!, 0) /
                        list.length
                      ).toFixed(2)}
                    </p>
                  </div>
                  <MalWrappedSlide list={list} length={10} />
                </SwiperSlide>
              ))}
          </Swiper>
        </SwiperSlide>
        <SwiperSlide className="flex flex-col gap-8 bg-gradient-to-t from-red-900 to-red-800">
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            className="w-full h-full"
            direction="vertical"
            modules={[Pagination]}
            pagination={{
              clickable: true,
            }}
          >
            <SwiperSlide className=" flex flex-col gap-8">
              <h1 className="text-4xl text-red-100 font-bold">
                The genres you liked least
              </h1>
              <h3 className="text-red-300">
                <ArrowDown />
              </h3>
              {/* Arrow down */}
            </SwiperSlide>
            {genreEntriesLowestUserScore
              .slice(0, 10)
              .map(([genre, list], i) => (
                <SwiperSlide className="flex flex-col gap-8">
                  <h2 className="text-3xl font-bold text-red-100">
                    #{i + 1} {genre} ({list.length})
                  </h2>
                  <div>
                    <p className="text-red-100">
                      Your average score:{" "}
                      {(
                        list.reduce(
                          (acc, anime) => acc + anime.list_status.score,
                          0
                        ) / list.length
                      ).toFixed(2)}
                    </p>
                    <p className="text-red-100">
                      MAL average score:{" "}
                      {(
                        list.reduce((acc, anime) => acc + anime.node.mean!, 0) /
                        list.length
                      ).toFixed(2)}
                    </p>
                  </div>
                  <MalWrappedSlide list={list} length={10} />
                </SwiperSlide>
              ))}
          </Swiper>
        </SwiperSlide>
        <SwiperSlide className="flex flex-col gap-8 bg-gradient-to-t from-cyan-900 to-cyan-800">
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            className="w-full h-full"
            direction="vertical"
            modules={[Pagination]}
            pagination={{
              clickable: true,
            }}
          >
            <SwiperSlide className=" flex flex-col gap-8">
              <h1 className="text-4xl text-cyan-100 font-bold">
                Genre with the most anime you watched
              </h1>
              <h3 className="text-cyan-300">
                <ArrowDown />
              </h3>
              {/* Arrow down */}
            </SwiperSlide>
            {genreEntriesMostCompletedAnime
              .slice(0, 15)
              .map(([genre, list], i) => (
                <SwiperSlide className="flex flex-col gap-8">
                  <h2 className="text-3xl font-bold text-cyan-100">
                    #{i + 1} {genre} ({list.length})
                  </h2>
                  <MalWrappedSlide list={list} length={10} />
                </SwiperSlide>
              ))}
          </Swiper>
        </SwiperSlide>
        <SwiperSlide className="flex flex-col gap-8 bg-gradient-to-t from-pink-900 to-pink-800">
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            className="w-full h-full"
            direction="vertical"
            modules={[Pagination]}
            pagination={{
              clickable: true,
            }}
          >
            <SwiperSlide className=" flex flex-col gap-8">
              <h1 className="text-4xl text-pink-100 font-bold">
                Genre with the most anime you dropped
              </h1>
              <h3 className="text-pink-300">
                <ArrowDown />
              </h3>
              {/* Arrow down */}
            </SwiperSlide>
            {genreEntriesMostDroppedAnime
              .slice(0, 15)
              .map(([genre, list], i) => (
                <SwiperSlide className="flex flex-col gap-8">
                  <h2 className="text-3xl font-bold text-blue-100">
                    #{i + 1} {genre} ({list.length})
                  </h2>
                  <MalWrappedSlide list={list} length={10} />
                </SwiperSlide>
              ))}
          </Swiper>
        </SwiperSlide>

        {/* Media types */}
        <SwiperSlide className="flex flex-col gap-8 bg-gradient-to-t from-teal-900 to-teal-800">
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            className="w-full h-full"
            direction="vertical"
            modules={[Pagination]}
            pagination={{
              clickable: true,
            }}
          >
            <SwiperSlide className=" flex flex-col gap-8">
              <h1 className="text-4xl text-teal-100 font-bold">
                Your Anime Per Media Type
              </h1>
              <h3 className="text-teal-300">
                <ArrowDown />
              </h3>
              {/* Arrow down */}
            </SwiperSlide>
            {mediaTypeEntriesMostCompletedAnime
              .slice(0, 10)
              .map(([genre, list], i) => (
                <SwiperSlide className="flex flex-col gap-8">
                  <h2 className="text-3xl font-bold text-blue-100">
                    #{i + 1} {genre} ({list.length})
                  </h2>
                  <MalWrappedSlide list={list} length={10} />
                </SwiperSlide>
              ))}
          </Swiper>
        </SwiperSlide>

        {/* Studios */}
        <SwiperSlide className="flex flex-col gap-8 bg-gradient-to-t from-green-900 to-green-800">
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            className="w-full h-full"
            direction="vertical"
            modules={[Pagination]}
            pagination={{
              clickable: true,
            }}
          >
            <SwiperSlide className=" flex flex-col gap-8">
              <h1 className="text-4xl text-green-100 font-bold">
                Studios with the most anime you watched
              </h1>
              <h3 className="text-green-300">
                <ArrowDown />
              </h3>
              {/* Arrow down */}
            </SwiperSlide>
            {studioEntriesMostCompletedAnime
              .slice(0, 3)
              .map(([studio, list], i) => (
                <SwiperSlide className="flex flex-col gap-8">
                  <h2 className="text-3xl font-bold text-green-100">
                    #{i + 1} {studio} ({list.length})
                  </h2>
                  <MalWrappedSlide list={list} length={10} />
                </SwiperSlide>
              ))}
          </Swiper>
        </SwiperSlide>
        <SwiperSlide className="flex flex-col gap-8 bg-gradient-to-t from-red-900 to-red-800">
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            className="w-full h-full"
            direction="vertical"
            modules={[Pagination]}
            pagination={{
              clickable: true,
            }}
          >
            <SwiperSlide className=" flex flex-col gap-8">
              <h1 className="text-4xl text-red-100 font-bold">
                Studios with the most anime you dropped
              </h1>
              <h3 className="text-red-300">
                <ArrowDown />
              </h3>
              {/* Arrow down */}
            </SwiperSlide>
            {studioEntriesMostDroppedAnime
              .slice(0, 3)
              .map(([studio, list], i) => (
                <SwiperSlide className="flex flex-col gap-8">
                  <h2 className="text-3xl font-bold text-blue-100">
                    #{i + 1} {studio} ({list.length})
                  </h2>
                  <MalWrappedSlide list={list} length={10} />
                </SwiperSlide>
              ))}
          </Swiper>
        </SwiperSlide>

        {/* Hidden gem / unpopular opinion */}
        <SwiperSlide className="flex flex-col gap-8 bg-gradient-to-t from-yellow-900 to-yellow-800">
          <h1 className="text-4xl font-bold text-yellow-100">Hidden gem</h1>
          <MalWrappedSlide
            list={initialFiltered
              .filter(filterCompletedByUser)
              .filter(filterWithMalScore)
              .filter(filterRankLowerThan(500))
              .toSorted(sortByUserScoreHighFirst)}
          />
        </SwiperSlide>
        <SwiperSlide className="flex flex-col gap-8 bg-gradient-to-t from-stone-900 to-stone-800">
          <h1 className="text-4xl font-bold text-stone-100">
            Unpopular opinion
          </h1>
          <MalWrappedSlide
            list={initialFiltered
              .filter(filterCompletedByUser)
              .filter(filterWithMalScore)
              .filter(filterRankHigherThan(500))
              .toSorted(sortByUserScoreLowFirst)}
          />
        </SwiperSlide>

        {/* Numbers */}
        <SwiperSlide className="flex flex-col gap-8 bg-gradient-to-t from-amber-900 to-amber-800">
          <h1 className="text-4xl text-amber-100 font-bold">Some Numbers</h1>
          <div className="grid grid-cols-4 gap-4 gap-y-8 flex-wrap text-amber-100">
            <div>
              <div>Days watched</div>
              <div className="text-2xl">
                {Math.floor(secondsWatched / 60 / 60 / 24)} days
              </div>
            </div>
            <div>
              <div>Hours watched</div>
              <div className="text-2xl">
                {Math.floor(secondsWatched / 60 / 60)} hours
              </div>
            </div>
            <div>
              <div>episodes watched</div>
              <div className="text-2xl">
                {initialFiltered
                  .filter(filterCompletedByUser)
                  .reduce((acc, anime) => acc + anime.node.num_episodes!, 0)}
              </div>
            </div>
            <div>
              <div>mean score completed</div>
              <div className="text-2xl">
                {(
                  initialFiltered
                    .filter(filterWithUserScore)
                    .filter(filterCompletedByUser)
                    .reduce((acc, anime) => acc + anime.list_status.score, 0) /
                  initialFiltered
                    .filter(filterWithUserScore)
                    .filter(filterCompletedByUser).length
                ).toFixed(2)}
              </div>
            </div>
            <div>
              <div>mean score dropped</div>
              <div className="text-2xl">
                {(
                  initialFiltered
                    .filter(filterWithUserScore)
                    .filter(filterDroppedByUser)
                    .reduce((acc, anime) => acc + anime.list_status.score, 0) /
                  initialFiltered
                    .filter(filterWithUserScore)
                    .filter(filterDroppedByUser).length
                ).toFixed(2)}
              </div>
            </div>
            <div>
              <div>anime completed</div>
              <div className="text-2xl">
                {initialFiltered.filter(filterCompletedByUser).length}
              </div>
            </div>
            <div>
              <div>anime dropped</div>
              <div className="text-2xl">
                {initialFiltered.filter(filterDroppedByUser).length}
              </div>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide className="bg-gradient-to-t from-blue-900 to-blue-800">
          <h1 className="text-4xl font-bold text-blue-100">It's a wrap!</h1>
        </SwiperSlide>
      </Swiper>
    </NextUIProvider>
  );
}

interface MalWrappedSlideProps {
  list: AnimeListItem[];
  length?: number;
}

function MalWrappedSlide({ list, length = 3 }: MalWrappedSlideProps) {
  return (
    <Swiper
      resistanceRatio={0}
      wrapperClass="max-w-[900px] h-[500px]"
      effect={"cards"}
      grabCursor={true}
      modules={[EffectCards]}
    >
      {list.slice(0, length).map((anime, i) => (
        <SwiperSlide key={anime.node.id}>
          <Card className="w-full h-full" isFooterBlurred>
            <CardHeader className="absolute z-10 top-1 flex-col !items-start">
              <h4 className="text-white font-medium text-large">
                #{i + 1} {anime.node.title}
              </h4>
            </CardHeader>
            <img
              alt="Card background"
              className="z-0 w-full h-full object-cover"
              src={anime.node.main_picture.large}
            />
            <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
              <div className="grid grid-rows-2 grid-flow-col flex-grow gap-2 items-center text-start">
                <p className="text-tiny text-white/60">
                  Your score: {anime.list_status.score}
                </p>
                <p className="text-tiny text-white/60">
                  MAL score: {anime.node.mean}
                </p>
                <p className="text-tiny text-white/60">
                  Episodes: {anime.node.num_episodes}
                </p>
                <p className="text-tiny text-white/60">
                  Duration:{" "}
                  {((anime.node.average_episode_duration ?? 0) / 60).toFixed()}{" "}
                  min
                </p>
                <p className="text-tiny text-white/60">
                  Media: {anime.node.media_type}
                </p>
                <p></p>
                {anime.node.start_date && (
                  <p className="text-tiny text-white/60">
                    Start date: {anime.node.start_date}
                  </p>
                )}
                {anime.node.end_date && (
                  <p className="text-tiny text-white/60">
                    End date: {anime.node.end_date}
                  </p>
                )}
                {anime.list_status.updated_at && (
                  <p className="text-tiny text-white/60">
                    Watch date:{" "}
                    {Intl.DateTimeFormat().format(
                      new Date(anime.list_status.updated_at)
                    )}
                  </p>
                )}
              </div>
              <Button
                as={Link}
                radius="full"
                size="sm"
                href={`https://myanimelist.net/anime/${anime.node.id}`}
                showAnchorIcon
                isExternal={true}
              >
                MAL
              </Button>
            </CardFooter>
          </Card>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
