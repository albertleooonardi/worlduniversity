import React, { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiSearch, FiAlertTriangle, FiSliders } from "react-icons/fi";
import PageHero from "../components/PageHero";
import CountrySearchBox from "../components/CountrySearchBox";
import CountryGrid from "../components/CountryGrid";
import StateMessage, {
  primaryButtonClass,
  secondaryButtonClass,
} from "../components/StateMessage";
import Footer from "../components/Footer";
import useCountries from "../hooks/useCountries";
import { searchSlides } from "../data/featuredCountries";
import {
  searchCountries,
  sortCountries,
  SORT_OPTIONS,
} from "../utils/countries";

const EXAMPLE_QUERIES = ["Tokyo", "Nippon", "Brazil", "DE"];

const CountrySearch = () => {
  const { countries, loading, error, retry } = useCountries();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "name";

  // Keep the query in the URL so "back" from a country restores the results.
  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const results = useMemo(() => {
    const matches = searchCountries(countries, query);
    // Typed searches keep relevance order unless a sort was picked.
    return query && sort === "name" ? matches : sortCountries(matches, sort);
  }, [countries, query, sort]);

  return (
    <div className="bg-gray-50">
      <PageHero
        slides={searchSlides}
        eyebrow="Country Search"
        title="Find any country in the world"
        subtitle={`Search ${
          countries.length || 250
        } countries and territories by name, capital, native name or ISO code.`}
      >
        <CountrySearchBox
          countries={countries}
          query={query}
          onQueryChange={(value) => updateParam("q", value)}
          disabled={loading && !countries.length}
        />
        <p className="mt-3 font-inter text-sm text-white/70">
          Try{" "}
          {EXAMPLE_QUERIES.map((example, index) => (
            <React.Fragment key={example}>
              <button
                onClick={() => updateParam("q", example)}
                className="underline decoration-white/40 underline-offset-4 hover:text-white hover:decoration-white"
              >
                {example}
              </button>
              {index < EXAMPLE_QUERIES.length - 1 && ", "}
            </React.Fragment>
          ))}
        </p>
      </PageHero>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-8 md:py-14">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-poppins text-2xl font-medium text-[#1A202C]">
              {query ? (
                <>
                  {results.length} {results.length === 1 ? "result" : "results"}{" "}
                  for “{query}”
                </>
              ) : (
                "All countries"
              )}
            </h2>
            <p className="mt-1 font-inter text-sm text-gray-500">
              Need more control?{" "}
              <Link
                to="/filtercountry"
                className="inline-flex items-center gap-1 font-medium text-[#1A202C] underline-offset-4 hover:underline"
              >
                <FiSliders size={14} aria-hidden="true" />
                Use advanced filters
              </Link>
            </p>
          </div>

          <label className="flex items-center gap-2 font-inter text-sm text-gray-600">
            Sort by
            <select
              value={sort}
              onChange={(e) =>
                updateParam("sort", e.target.value === "name" ? "" : e.target.value)
              }
              className="rounded-full border border-gray-300 bg-white px-4 py-2 text-[#1A202C] focus:border-[#1A202C] focus:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {query && option.value === "name"
                    ? "Best match"
                    : option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

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
            icon={FiSearch}
            title={`No countries match “${query}”`}
            description="Check the spelling, or search by capital city or a 2–3 letter country code."
          >
            <button
              onClick={() => updateParam("q", "")}
              className={primaryButtonClass}
            >
              Clear search
            </button>
            <Link to="/filtercountry" className={secondaryButtonClass}>
              Browse with filters
            </Link>
          </StateMessage>
        ) : (
          <CountryGrid countries={results} loading={loading} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CountrySearch;
