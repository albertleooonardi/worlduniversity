import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSliders, FiX, FiAlertTriangle, FiFilter } from "react-icons/fi";
import PageHero from "../components/PageHero";
import CountryGrid from "../components/CountryGrid";
import CountryFilterPanel, {
  POPULATION_BUCKETS,
  STATUS_OPTIONS,
} from "../components/CountryFilterPanel";
import StateMessage, { primaryButtonClass } from "../components/StateMessage";
import Footer from "../components/Footer";
import useCountries from "../hooks/useCountries";
import { filterSlides } from "../data/featuredCountries";
import {
  searchCountries,
  sortCountries,
  SORT_OPTIONS,
} from "../utils/countries";

const countBy = (values) =>
  values.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

// Filters live in the URL so a filtered view can be shared or bookmarked,
// and the browser back button returns to it from a country page.
const readFilters = (params) => ({
  q: params.get("q") || "",
  regions: params.get("region")?.split(",").filter(Boolean) || [],
  subregion: params.get("subregion") || "",
  language: params.get("language") || "",
  currency: params.get("currency") || "",
  pop: params.get("pop") || "",
  status: params.get("status") || "",
  un: params.get("un") === "1",
  landlocked: params.get("landlocked") === "1",
  sort: params.get("sort") || "name",
});

const writeFilters = (filters) => {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.regions.length) params.set("region", filters.regions.join(","));
  if (filters.subregion) params.set("subregion", filters.subregion);
  if (filters.language) params.set("language", filters.language);
  if (filters.currency) params.set("currency", filters.currency);
  if (filters.pop) params.set("pop", filters.pop);
  if (filters.status) params.set("status", filters.status);
  if (filters.un) params.set("un", "1");
  if (filters.landlocked) params.set("landlocked", "1");
  if (filters.sort !== "name") params.set("sort", filters.sort);
  return params;
};

const applyFilters = (countries, f) => {
  const bucket = POPULATION_BUCKETS.find((b) => b.value === f.pop);
  return searchCountries(countries, f.q).filter(
    (c) =>
      (!f.regions.length || f.regions.includes(c.region)) &&
      (!f.subregion || c.subregion === f.subregion) &&
      (!f.language || c.languages.includes(f.language)) &&
      (!f.currency || c.currencies.some((cur) => cur.code === f.currency)) &&
      (!bucket ||
        (c.population != null &&
          c.population >= bucket.min &&
          c.population < bucket.max)) &&
      (!f.status || c.independent === (f.status === "independent")) &&
      (!f.un || c.unMember) &&
      (!f.landlocked || c.landlocked)
  );
};

const CountryFilter = () => {
  const { countries, loading, error, retry } = useCountries();
  const [searchParams, setSearchParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);

  const updateFilters = (changes) =>
    setSearchParams(writeFilters({ ...filters, ...changes }), {
      replace: true,
    });
  const clearAll = () =>
    setSearchParams(writeFilters({ ...readFilters(new URLSearchParams()), sort: filters.sort }), {
      replace: true,
    });

  const options = useMemo(() => {
    const regionCounts = countBy(countries.map((c) => c.region));
    const languageCounts = countBy(countries.flatMap((c) => c.languages));
    const currencies = {};
    countries.forEach((c) =>
      c.currencies.forEach((cur) => {
        currencies[cur.code] = currencies[cur.code] || {
          label: `${cur.name} (${cur.code})`,
          count: 0,
        };
        currencies[cur.code].count += 1;
      })
    );
    const inRegions = countries.filter(
      (c) => !filters.regions.length || filters.regions.includes(c.region)
    );

    return {
      regions: Object.keys(regionCounts)
        .sort()
        .map((value) => ({ value, count: regionCounts[value] })),
      subregions: [
        ...new Set(inRegions.map((c) => c.subregion).filter(Boolean)),
      ].sort(),
      languages: Object.keys(languageCounts)
        .sort()
        .map((value) => ({ value, count: languageCounts[value] })),
      currencies: Object.entries(currencies)
        .map(([value, data]) => ({ value, ...data }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    };
  }, [countries, filters.regions]);

  const results = useMemo(
    () => sortCountries(applyFilters(countries, filters), filters.sort),
    [countries, filters]
  );

  const activeChips = [
    filters.q && { label: `“${filters.q}”`, clear: { q: "" } },
    ...filters.regions.map((region) => ({
      label: region,
      clear: {
        regions: filters.regions.filter((r) => r !== region),
        subregion: "",
      },
    })),
    filters.subregion && { label: filters.subregion, clear: { subregion: "" } },
    filters.pop && {
      label: POPULATION_BUCKETS.find((b) => b.value === filters.pop)?.label,
      clear: { pop: "" },
    },
    filters.language && { label: filters.language, clear: { language: "" } },
    filters.currency && {
      label: filters.currency,
      clear: { currency: "" },
    },
    filters.status && {
      label: STATUS_OPTIONS.find((s) => s.value === filters.status)?.label,
      clear: { status: "" },
    },
    filters.un && { label: "UN member", clear: { un: false } },
    filters.landlocked && { label: "Landlocked", clear: { landlocked: false } },
  ].filter(Boolean);

  const panel = (
    <CountryFilterPanel
      filters={filters}
      options={options}
      onChange={updateFilters}
    />
  );

  return (
    <div className="bg-gray-50">
      <PageHero
        slides={filterSlides}
        eyebrow="Country Filter"
        title="Narrow the world down"
        subtitle="Combine region, population, language, currency and status to find exactly the countries you're looking for."
      />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-8 md:py-14">
        <div className="flex gap-8">
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-poppins text-base font-medium">
                  <FiSliders aria-hidden="true" /> Filters
                </h2>
                {activeChips.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="font-inter text-sm text-gray-500 underline-offset-4 hover:text-[#1A202C] hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              {panel}
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-poppins text-2xl font-medium text-[#1A202C]">
                  {loading ? "Loading countries…" : `${results.length} countries`}
                </h2>
                {!loading && (
                  <p className="mt-1 font-inter text-sm text-gray-500">
                    of {countries.length} countries and territories
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 font-poppins text-sm lg:hidden"
                >
                  <FiSliders aria-hidden="true" />
                  Filters
                  {activeChips.length > 0 && (
                    <span className="rounded-full bg-[#1A202C] px-2 text-xs text-white">
                      {activeChips.length}
                    </span>
                  )}
                </button>
                <label className="flex items-center gap-2 font-inter text-sm text-gray-600">
                  <span className="hidden sm:inline">Sort by</span>
                  <select
                    value={filters.sort}
                    onChange={(e) => updateFilters({ sort: e.target.value })}
                    aria-label="Sort by"
                    className="rounded-full border border-gray-300 bg-white px-4 py-2 text-[#1A202C] focus:border-[#1A202C] focus:outline-none"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                {activeChips.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => updateFilters(chip.clear)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#1A202C] py-1 pl-3 pr-2 font-inter text-sm text-white transition hover:bg-gray-700"
                    aria-label={`Remove filter ${chip.label}`}
                  >
                    {chip.label}
                    <FiX aria-hidden="true" />
                  </button>
                ))}
                <button
                  onClick={clearAll}
                  className="px-2 font-inter text-sm text-gray-500 underline-offset-4 hover:text-[#1A202C] hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {error ? (
              <StateMessage
                icon={FiAlertTriangle}
                title="Couldn't load countries"
                description="Check your connection and try again."
              >
                <button onClick={retry} className={primaryButtonClass}>
                  Try again
                </button>
              </StateMessage>
            ) : !loading && results.length === 0 ? (
              <StateMessage
                icon={FiFilter}
                title="No countries match these filters"
                description="Try removing a filter or two. Population data isn't available for a few small territories."
              >
                <button onClick={clearAll} className={primaryButtonClass}>
                  Clear all filters
                </button>
              </StateMessage>
            ) : (
              <CountryGrid countries={results} loading={loading} />
            )}
          </div>
        </div>
      </main>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="font-poppins text-lg font-medium">Filters</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-full p-2 hover:bg-gray-100"
                aria-label="Close filters"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{panel}</div>
            <div className="flex gap-3 border-t border-gray-200 px-5 py-4">
              <button
                onClick={clearAll}
                className="flex-1 rounded-full border border-gray-300 py-2.5 font-poppins text-sm"
              >
                Clear all
              </button>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex-[2] rounded-full bg-[#1A202C] py-2.5 font-poppins text-sm text-white"
              >
                Show {results.length} countries
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default CountryFilter;
