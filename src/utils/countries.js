const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const formatNumber = (value) =>
  value == null ? "—" : Math.round(value).toLocaleString("en");

export const formatCompact = (value) =>
  value == null ? "—" : compact.format(value);

export const formatUsd = (value) =>
  value == null ? "—" : `$${compact.format(value)}`;

export const formatPercent = (value) =>
  value == null ? "—" : `${value.toFixed(1)}%`;

export const normalize = (text = "") =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

// Lower score = better match. Returns null when the country doesn't match.
const scoreMatch = (country, q) => {
  const name = normalize(country.name.common);
  if (country.cca2.toLowerCase() === q || country.cca3.toLowerCase() === q)
    return 0;
  if (name.startsWith(q)) return 1;
  if (name.split(/[\s-]+/).some((word) => word.startsWith(q))) return 2;
  if (name.includes(q)) return 3;
  if (normalize(country.name.official).includes(q)) return 4;
  if (country.altSpellings.some((alt) => normalize(alt).includes(q))) return 5;
  if (normalize(country.name.native).includes(q)) return 5;
  if (country.capital.some((cap) => normalize(cap).startsWith(q))) return 6;
  return null;
};

// Matches by name, official/native name, alternate spelling, capital or ISO code.
export const searchCountries = (countries, query) => {
  const q = normalize(query);
  if (!q) return countries;
  return countries
    .map((country) => ({ country, score: scoreMatch(country, q) }))
    .filter((r) => r.score !== null)
    .sort(
      (a, b) =>
        a.score - b.score ||
        a.country.name.common.localeCompare(b.country.name.common)
    )
    .map((r) => r.country);
};

export const SORT_OPTIONS = [
  { value: "name", label: "Name (A–Z)" },
  { value: "population", label: "Population (high–low)" },
  { value: "area", label: "Area (large–small)" },
];

export const sortCountries = (countries, sort) => {
  const sorted = [...countries];
  if (sort === "population") {
    sorted.sort((a, b) => (b.population ?? -1) - (a.population ?? -1));
  } else if (sort === "area") {
    sorted.sort((a, b) => (b.area ?? -1) - (a.area ?? -1));
  } else {
    sorted.sort((a, b) => a.name.common.localeCompare(b.name.common));
  }
  return sorted;
};
