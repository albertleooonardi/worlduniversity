import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiX, FiCornerDownLeft } from "react-icons/fi";
import { searchCountries } from "../utils/countries";

const MAX_SUGGESTIONS = 6;

const CountrySearchBox = ({ countries, query, onQueryChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const suggestions = useMemo(
    () =>
      query.trim()
        ? searchCountries(countries, query).slice(0, MAX_SUGGESTIONS)
        : [],
    [countries, query]
  );
  const showList = open && query.trim().length > 0;

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  // "/" focuses the search from anywhere on the page.
  useEffect(() => {
    const handleShortcut = (e) => {
      const tag = document.activeElement?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const goTo = (country) => {
    setOpen(false);
    navigate(`/country/${country.slug}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown" && suggestions.length) {
      e.preventDefault();
      setOpen(true);
      setHighlightedIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp" && suggestions.length) {
      e.preventDefault();
      setHighlightedIndex(
        (i) => (i - 1 + suggestions.length) % suggestions.length
      );
    } else if (e.key === "Enter" && showList && suggestions[highlightedIndex]) {
      e.preventDefault();
      goTo(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      if (showList) setOpen(false);
      else onQueryChange("");
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-white/60">
        <FiSearch
          className="ml-5 shrink-0 text-gray-400"
          size={22}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label="Search countries"
          aria-expanded={showList}
          aria-controls="country-suggestions"
          aria-autocomplete="list"
          aria-activedescendant={
            showList && suggestions[highlightedIndex]
              ? `suggestion-${suggestions[highlightedIndex].cca3}`
              : undefined
          }
          autoComplete="off"
          disabled={disabled}
          value={query}
          placeholder={
            disabled ? "Loading countries…" : "Search by country, capital or code"
          }
          onChange={(e) => {
            onQueryChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent px-4 py-4 font-inter text-base text-[#1A202C] placeholder-gray-400 outline-none md:py-5 md:text-lg [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              onQueryChange("");
              inputRef.current?.focus();
            }}
            className="mr-3 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Clear search"
          >
            <FiX size={20} />
          </button>
        ) : (
          <kbd className="mr-5 hidden rounded-md border border-gray-200 px-2 py-0.5 font-inter text-xs text-gray-400 sm:block">
            /
          </kbd>
        )}
      </div>

      {showList && (
        <ul
          id="country-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl bg-white py-2 text-[#1A202C] shadow-2xl ring-1 ring-black/5"
        >
          {suggestions.length === 0 ? (
            <li className="px-5 py-4 font-inter text-sm text-gray-500">
              No countries match “{query}”.
            </li>
          ) : (
            suggestions.map((country, index) => (
              <li
                key={country.cca3}
                id={`suggestion-${country.cca3}`}
                role="option"
                aria-selected={index === highlightedIndex}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => goTo(country)}
                className={`flex cursor-pointer items-center gap-4 px-5 py-2.5 ${
                  index === highlightedIndex ? "bg-gray-100" : ""
                }`}
              >
                <img
                  src={country.flags.svg}
                  alt=""
                  className="h-7 w-10 shrink-0 rounded object-cover ring-1 ring-black/10"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-poppins text-sm font-medium">
                    {country.name.common}
                  </p>
                  <p className="truncate font-inter text-xs text-gray-500">
                    {[country.capital[0], country.region]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                {index === highlightedIndex && (
                  <FiCornerDownLeft
                    className="shrink-0 text-gray-400"
                    aria-hidden="true"
                  />
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default CountrySearchBox;
