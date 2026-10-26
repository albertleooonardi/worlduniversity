import React from "react";
import { Link } from "react-router-dom";
import { FiMapPin, FiUsers, FiMessageCircle } from "react-icons/fi";
import { formatCompact } from "../utils/countries";

const CountryCard = ({ country }) => {
  return (
    <Link
      to={`/country/${country.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A202C] focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
        <img
          src={country.flags.svg}
          alt={`Flag of ${country.name.common}`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {!country.independent && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 font-inter text-xs font-medium text-gray-700 shadow-sm">
            Territory
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-poppins text-lg font-medium leading-snug text-[#1A202C]">
            {country.name.common}
          </h3>
          <span className="mt-0.5 shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 font-inter text-xs text-gray-600">
            {country.region}
          </span>
        </div>

        <dl className="mt-3 space-y-1.5 font-inter text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <FiMapPin className="shrink-0 text-gray-400" aria-hidden="true" />
            <dt className="sr-only">Capital</dt>
            <dd className="truncate">{country.capital[0] || "No capital"}</dd>
          </div>
          <div className="flex items-center gap-2">
            <FiUsers className="shrink-0 text-gray-400" aria-hidden="true" />
            <dt className="sr-only">Population</dt>
            <dd>{formatCompact(country.population)} people</dd>
          </div>
          <div className="flex items-center gap-2">
            <FiMessageCircle
              className="shrink-0 text-gray-400"
              aria-hidden="true"
            />
            <dt className="sr-only">Languages</dt>
            <dd className="truncate">
              {country.languages.join(", ") || "No official language"}
            </dd>
          </div>
        </dl>
      </div>
    </Link>
  );
};

export default CountryCard;
