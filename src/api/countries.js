import axios from "axios";

// REST Countries v3.1 was shut down, and its v5 requires a private API key.
// Country data now comes from three free sources that need no key:
// - world-countries (mledoze/countries): the dataset REST Countries was built on
// - World Bank Open Data: population and economic indicators
// - flagcdn: flag images keyed by ISO alpha-2 code
const DATASET_URL =
  "https://cdn.jsdelivr.net/npm/world-countries@5.1.0/countries.json";
const WORLD_BANK_URL = "https://api.worldbank.org/v2";
const CACHE_KEY = "wu:countries:v1";

// The World Bank uses a few codes that differ from ISO 3166.
const WORLD_BANK_CODES = { UNK: "XKX" };
const toWorldBankCode = (cca3) => WORLD_BANK_CODES[cca3] || cca3;

export const toSlug = (name) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const toCountry = (raw, populationByCode) => {
  const cca2 = raw.cca2.toLowerCase();
  const population = populationByCode[toWorldBankCode(raw.cca3)];
  const nativeName = Object.values(raw.name.native || {})[0];
  const idd = raw.idd || {};

  return {
    cca2: raw.cca2,
    cca3: raw.cca3,
    ccn3: raw.ccn3,
    slug: toSlug(raw.name.common),
    name: {
      common: raw.name.common,
      official: raw.name.official,
      native: nativeName?.common,
    },
    altSpellings: raw.altSpellings || [],
    capital: raw.capital || [],
    region: raw.region,
    subregion: raw.subregion,
    languages: Object.values(raw.languages || {}),
    currencies: Object.entries(raw.currencies || {}).map(([code, c]) => ({
      code,
      name: c.name,
      symbol: c.symbol,
    })),
    latlng: raw.latlng,
    area: raw.area,
    borders: raw.borders || [],
    independent: raw.independent,
    unMember: raw.unMember,
    landlocked: raw.landlocked,
    demonym: raw.demonyms?.eng?.m,
    callingCode: idd.root
      ? `${idd.root}${idd.suffixes?.length === 1 ? idd.suffixes[0] : ""}`
      : null,
    tld: raw.tld || [],
    flagEmoji: raw.flag,
    flags: {
      svg: `https://flagcdn.com/${cca2}.svg`,
      png: `https://flagcdn.com/w320/${cca2}.png`,
    },
    population: population?.value ?? null,
    populationYear: population?.year ?? null,
  };
};

const fetchPopulations = async () => {
  try {
    const response = await axios.get(
      `${WORLD_BANK_URL}/country/all/indicator/SP.POP.TOTL`,
      { params: { format: "json", mrnev: 1, per_page: 400 } }
    );
    const rows = response.data?.[1] || [];
    return rows.reduce((acc, row) => {
      if (row.countryiso3code && row.value != null) {
        acc[row.countryiso3code] = { value: row.value, year: Number(row.date) };
      }
      return acc;
    }, {});
  } catch (error) {
    // Population is a nice-to-have; the rest of the data still works without it.
    console.error("Error fetching populations:", error);
    return {};
  }
};

const readCache = () => {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const writeCache = (countries) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(countries));
  } catch {
    // Storage can be full or blocked; the in-memory cache still applies.
  }
};

let countriesPromise = null;

export const getCountries = () => {
  if (countriesPromise) return countriesPromise;

  const cached = readCache();
  if (cached) {
    countriesPromise = Promise.resolve(cached);
    return countriesPromise;
  }

  countriesPromise = Promise.all([axios.get(DATASET_URL), fetchPopulations()])
    .then(([datasetResponse, populationByCode]) => {
      const countries = datasetResponse.data
        .map((raw) => toCountry(raw, populationByCode))
        .sort((a, b) => a.name.common.localeCompare(b.name.common));
      writeCache(countries);
      return countries;
    })
    .catch((error) => {
      countriesPromise = null;
      throw error;
    });

  return countriesPromise;
};

// Accepts the slug used in links, plus older name-based links and ISO codes.
export const findCountry = (countries, param) => {
  const key = decodeURIComponent(param || "").toLowerCase();
  const slug = toSlug(key);
  return countries.find(
    (c) =>
      c.slug === slug ||
      c.name.common.toLowerCase() === key ||
      c.cca3.toLowerCase() === key ||
      c.cca2.toLowerCase() === key
  );
};

export const INDICATORS = {
  gdp: "NY.GDP.MKTP.CD",
  gdpPerCapita: "NY.GDP.PCAP.CD",
  lifeExpectancy: "SP.DYN.LE00.IN",
  urbanPopulation: "SP.URB.TOTL.IN.ZS",
  internetUsers: "IT.NET.USER.ZS",
};

// Latest non-empty value for each indicator, e.g. { gdp: { value, year } }.
export const fetchIndicators = async (cca3) => {
  const ids = Object.values(INDICATORS).join(";");
  const response = await axios.get(
    `${WORLD_BANK_URL}/country/${toWorldBankCode(cca3)}/indicator/${ids}`,
    { params: { source: 2, format: "json", mrnev: 1, per_page: 50 } }
  );
  const rows = Array.isArray(response.data?.[1]) ? response.data[1] : [];
  return Object.entries(INDICATORS).reduce((acc, [key, id]) => {
    const row = rows.find((r) => r.indicator.id === id);
    acc[key] = row ? { value: row.value, year: Number(row.date) } : null;
    return acc;
  }, {});
};

export const fetchPopulationHistory = async (cca3) => {
  const response = await axios.get(
    `${WORLD_BANK_URL}/country/${toWorldBankCode(cca3)}/indicator/SP.POP.TOTL`,
    { params: { format: "json", date: "1975:2030", per_page: 100 } }
  );
  const rows = Array.isArray(response.data?.[1]) ? response.data[1] : [];
  return rows
    .filter((r) => r.value != null)
    .map((r) => ({ year: Number(r.date), value: r.value }))
    .sort((a, b) => a.year - b.year);
};
