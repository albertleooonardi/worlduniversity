import React from "react";
import { FiSearch } from "react-icons/fi";

export const POPULATION_BUCKETS = [
  { value: "xs", label: "Under 1M", min: 0, max: 1e6 },
  { value: "s", label: "1M – 10M", min: 1e6, max: 1e7 },
  { value: "m", label: "10M – 100M", min: 1e7, max: 1e8 },
  { value: "l", label: "Over 100M", min: 1e8, max: Infinity },
];

export const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "independent", label: "Independent" },
  { value: "territory", label: "Territory" },
];

const Section = ({ title, children }) => (
  <fieldset className="border-b border-gray-200 py-5 first:pt-0 last:border-0">
    <legend className="mb-3 font-poppins text-sm font-medium text-[#1A202C]">
      {title}
    </legend>
    {children}
  </fieldset>
);

const pillClass = (active) =>
  `rounded-full border px-3 py-1.5 font-inter text-sm transition ${
    active
      ? "border-[#1A202C] bg-[#1A202C] text-white"
      : "border-gray-300 bg-white text-gray-700 hover:border-[#1A202C]"
  }`;

const selectClass =
  "w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 font-inter text-sm text-[#1A202C] focus:border-[#1A202C] focus:outline-none";

const CountryFilterPanel = ({ filters, options, onChange }) => {
  const toggleRegion = (region) => {
    const next = filters.regions.includes(region)
      ? filters.regions.filter((r) => r !== region)
      : [...filters.regions, region];
    onChange({ regions: next, subregion: "" });
  };

  return (
    <div>
      <Section title="Name">
        <div className="relative">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={filters.q}
            onChange={(e) => onChange({ q: e.target.value })}
            placeholder="e.g. Kingdom, Tokyo"
            aria-label="Filter by name"
            className={`${selectClass} pl-9`}
          />
        </div>
      </Section>

      <Section title="Region">
        <div className="flex flex-wrap gap-2">
          {options.regions.map(({ value, count }) => (
            <button
              key={value}
              type="button"
              aria-pressed={filters.regions.includes(value)}
              onClick={() => toggleRegion(value)}
              className={pillClass(filters.regions.includes(value))}
            >
              {value}
              <span className="ml-1.5 opacity-60">{count}</span>
            </button>
          ))}
        </div>
        {options.subregions.length > 1 && (
          <select
            value={filters.subregion}
            onChange={(e) => onChange({ subregion: e.target.value })}
            aria-label="Subregion"
            className={`${selectClass} mt-3`}
          >
            <option value="">All subregions</option>
            {options.subregions.map((subregion) => (
              <option key={subregion} value={subregion}>
                {subregion}
              </option>
            ))}
          </select>
        )}
      </Section>

      <Section title="Population">
        <div className="grid grid-cols-2 gap-2">
          {POPULATION_BUCKETS.map((bucket) => (
            <button
              key={bucket.value}
              type="button"
              aria-pressed={filters.pop === bucket.value}
              onClick={() =>
                onChange({ pop: filters.pop === bucket.value ? "" : bucket.value })
              }
              className={pillClass(filters.pop === bucket.value)}
            >
              {bucket.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Language & currency">
        <div className="space-y-3">
          <select
            value={filters.language}
            onChange={(e) => onChange({ language: e.target.value })}
            aria-label="Language"
            className={selectClass}
          >
            <option value="">Any language</option>
            {options.languages.map(({ value, count }) => (
              <option key={value} value={value}>
                {value} ({count})
              </option>
            ))}
          </select>
          <select
            value={filters.currency}
            onChange={(e) => onChange({ currency: e.target.value })}
            aria-label="Currency"
            className={selectClass}
          >
            <option value="">Any currency</option>
            {options.currencies.map(({ value, label, count }) => (
              <option key={value} value={value}>
                {label} ({count})
              </option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="Status">
        <div className="grid grid-cols-3 rounded-xl bg-gray-100 p-1">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={filters.status === option.value}
              onClick={() => onChange({ status: option.value })}
              className={`rounded-lg px-2 py-1.5 font-inter text-sm transition ${
                filters.status === option.value
                  ? "bg-white text-[#1A202C] shadow-sm"
                  : "text-gray-600 hover:text-[#1A202C]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-3 font-inter text-sm text-gray-700">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={filters.un}
              onChange={(e) => onChange({ un: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 accent-[#1A202C]"
            />
            UN member state
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={filters.landlocked}
              onChange={(e) => onChange({ landlocked: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 accent-[#1A202C]"
            />
            Landlocked
          </label>
        </div>
      </Section>
    </div>
  );
};

export default CountryFilterPanel;
