import type { Anime, ListEntry } from "./types";

const integer = new Intl.NumberFormat("en");
const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const decimal = new Intl.NumberFormat("en", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const oneDecimal = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
const monthName = new Intl.DateTimeFormat("en", { month: "long" });
const shortDate = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
});
const ordinalRules = new Intl.PluralRules("en", { type: "ordinal" });
const ordinalSuffix: Partial<Record<Intl.LDMLPluralRule, string>> = {
  one: "st",
  two: "nd",
  few: "rd",
  other: "th",
};
const list = new Intl.ListFormat("en", { type: "conjunction" });

export const formatInteger = (value: number) => integer.format(Math.round(value));
export const formatCompact = (value: number) => compact.format(value);
export const formatScore = (value: number) => decimal.format(value);
export const formatMonth = (month: number) => monthName.format(new Date(2000, month, 1));
export const formatShortDate = (date: Date) => shortDate.format(date);
export const formatList = (items: string[]) => list.format(items);

export function formatOrdinal(value: number) {
  return `${value}${ordinalSuffix[ordinalRules.select(value)] ?? "th"}`;
}

export function formatSigned(value: number) {
  const formatted = decimal.format(Math.abs(value));
  return value >= 0 ? `+${formatted}` : `−${formatted}`;
}

export function plural(count: number, singular: string, pluralForm?: string) {
  return `${formatInteger(count)} ${count === 1 ? singular : (pluralForm ?? `${singular}s`)}`;
}

/** `1 day 4 hours`, `5 hours 20 minutes`, `45 minutes`. */
export function formatDuration(minutes: number) {
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = Math.round(minutes % 60);
  if (days > 0) {
    return hours > 0 ? `${plural(days, "day")} ${plural(hours, "hour")}` : plural(days, "day");
  }
  if (hours > 0) {
    return mins > 0 ? `${plural(hours, "hour")} ${plural(mins, "min")}` : plural(hours, "hour");
  }
  return plural(mins, "min");
}

/**
 * A gap between two dates: `3 days`, `5 weeks`, `4 months`, `2.5 years`,
 * `12 years`, or `3d`, `5w`, `4mo`, `2.5y` when short.
 */
export function formatLag(days: number, short = false) {
  const [value, unit, abbreviation] =
    days < 14
      ? [Math.round(days), "day", "d"]
      : days < 61
        ? [Math.round(days / 7), "week", "w"]
        : days < 365
          ? [Math.round(days / 30.44), "month", "mo"]
          : [days / 365.25, "year", "y"];
  // Tenths of a year stop mattering after a decade.
  const formatted = oneDecimal.format(value >= 10 ? Math.round(value) : value);
  if (short) return `${formatted}${abbreviation}`;
  return `${formatted} ${formatted === "1" ? unit : `${unit}s`}`;
}

const MEDIA_TYPES: Record<string, string> = {
  tv: "TV",
  movie: "Movie",
  ova: "OVA",
  ona: "ONA",
  special: "Special",
  tv_special: "TV Special",
  music: "Music",
  cm: "CM",
  pv: "PV",
  unknown: "Unknown",
};

export const formatMediaType = (type: string) => MEDIA_TYPES[type] ?? type.toUpperCase();

export function pluralMediaType(type: string, count: number) {
  const label = formatMediaType(type);
  if (count === 1) return label;
  return label === "TV" ? "TV series" : `${label}s`;
}

export const startYear = (anime: Anime) => anime.start_date?.slice(0, 4);

/** `TV · 2019 · 25 eps` */
export function formatMeta(anime: Anime) {
  const episodes =
    anime.num_episodes && anime.media_type !== "movie"
      ? plural(anime.num_episodes, "ep")
      : undefined;
  return [formatMediaType(anime.media_type), startYear(anime), episodes]
    .filter(Boolean)
    .join(" · ");
}

export const malUrl = (anime: Anime) => `https://myanimelist.net/anime/${anime.id}`;

/** The English title, when MAL has one that differs from the main title. */
export function englishTitle(anime: Anime) {
  const en = anime.alternative_titles?.en;
  return en && en.toLowerCase() !== anime.title.toLowerCase() ? en : undefined;
}

export const posterUrl = (entry: ListEntry, size: "medium" | "large") =>
  size === "large"
    ? (entry.node.main_picture?.large ?? entry.node.main_picture?.medium)
    : entry.node.main_picture?.medium;
