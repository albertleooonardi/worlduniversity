import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import {
  FiArrowLeft,
  FiMapPin,
  FiUsers,
  FiMaximize,
  FiGrid,
  FiExternalLink,
  FiCompass,
  FiAlertTriangle,
} from "react-icons/fi";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import Footer from "../components/Footer";
import PopulationChart from "../components/PopulationChart";
import StateMessage, {
  primaryButtonClass,
  secondaryButtonClass,
} from "../components/StateMessage";
import useCountries from "../hooks/useCountries";
import {
  findCountry,
  fetchIndicators,
  fetchPopulationHistory,
} from "../api/countries";
import {
  formatNumber,
  formatCompact,
  formatUsd,
  formatPercent,
} from "../utils/countries";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Size the initial map view to the country instead of a fixed ±5°.
const getBounds = ({ latlng: [lat, lng], area }) => {
  const span = Math.min(Math.max(Math.sqrt(area || 1) / 111 / 1.2, 0.3), 25);
  return [
    [lat - span, lng - span],
    [lat + span, lng + span],
  ];
};

const Card = ({ title, children, className = "" }) => (
  <section
    className={`rounded-2xl border border-gray-200 bg-white p-6 ${className}`}
  >
    {title && (
      <h2 className="mb-4 font-poppins text-lg font-medium text-[#1A202C]">
        {title}
      </h2>
    )}
    {children}
  </section>
);

const Stat = ({ icon: Icon, label, value, hint }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5">
    <div className="flex items-center gap-2 font-inter text-xs font-medium uppercase tracking-wider text-gray-500">
      <Icon aria-hidden="true" />
      {label}
    </div>
    <p className="mt-2 truncate font-poppins text-2xl font-medium text-[#1A202C]">
      {value}
    </p>
    {hint && <p className="mt-0.5 font-inter text-xs text-gray-500">{hint}</p>}
  </div>
);

const Fact = ({ label, value, loading }) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-gray-100 py-3 last:border-0">
    <dt className="font-inter text-sm text-gray-500">{label}</dt>
    <dd className="text-right font-inter text-sm font-medium text-[#1A202C]">
      {loading ? (
        <span className="inline-block h-4 w-20 animate-pulse rounded bg-gray-100 align-middle" />
      ) : (
        value || "—"
      )}
    </dd>
  </div>
);

const withYear = (indicator, format) =>
  indicator?.value != null
    ? `${format(indicator.value)} (${indicator.year})`
    : null;

const Badge = ({ children }) => (
  <span className="rounded-full border border-gray-300 px-3 py-1 font-inter text-xs text-gray-700">
    {children}
  </span>
);

const DetailSkeleton = () => (
  <div className="mx-auto max-w-6xl animate-pulse px-4 pb-16 pt-20 sm:px-8 lg:pt-10">
    <div className="h-4 w-48 rounded bg-gray-200" />
    <div className="mt-8 flex gap-6">
      <div className="h-24 w-36 rounded-xl bg-gray-200" />
      <div className="flex-1 space-y-3">
        <div className="h-10 w-1/2 rounded bg-gray-200" />
        <div className="h-4 w-1/3 rounded bg-gray-100" />
      </div>
    </div>
    <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="h-28 rounded-2xl bg-gray-200" />
      ))}
    </div>
    <div className="mt-6 h-96 rounded-2xl bg-gray-200" />
  </div>
);

const CountryDetail = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const { countries, loading, error, retry } = useCountries();
  const [indicators, setIndicators] = useState(null);
  const [history, setHistory] = useState(null);

  const country = useMemo(() => findCountry(countries, name), [countries, name]);
  const neighbours = useMemo(
    () =>
      country
        ? countries.filter((c) => country.borders.includes(c.cca3))
        : [],
    [countries, country]
  );

  useEffect(() => {
    if (!country) return;
    let active = true;
    setIndicators(null);
    setHistory(null);
    document.title = `${country.name.common} · WorldUniversity`;

    fetchIndicators(country.cca3)
      .then((data) => active && setIndicators(data))
      .catch(() => active && setIndicators({}));
    fetchPopulationHistory(country.cca3)
      .then((data) => active && setHistory(data))
      .catch(() => active && setHistory([]));

    return () => {
      active = false;
    };
  }, [country]);

  const goBack = () =>
    window.history.state?.idx > 0 ? navigate(-1) : navigate("/searchcountry");

  if (loading) return <DetailSkeleton />;

  if (error || !country) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <div className="mx-auto w-full max-w-2xl flex-1 px-4 pt-24">
          {error ? (
            <StateMessage
              icon={FiAlertTriangle}
              title="Couldn't load this country"
              description="Check your connection and try again."
            >
              <button onClick={retry} className={primaryButtonClass}>
                Try again
              </button>
            </StateMessage>
          ) : (
            <StateMessage
              icon={FiCompass}
              title="Country not found"
              description={`We couldn't find a country called “${decodeURIComponent(
                name
              )}”.`}
            >
              <Link to="/searchcountry" className={primaryButtonClass}>
                Search countries
              </Link>
            </StateMessage>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  const [lat, lng] = country.latlng;
  const density =
    country.population && country.area
      ? country.population / country.area
      : null;
  const indicatorsLoading = indicators === null;

  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-8 lg:pt-10">
        <nav className="flex items-center gap-3 font-inter text-sm text-gray-500">
          <button
            onClick={goBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-[#1A202C] transition hover:border-[#1A202C]"
          >
            <FiArrowLeft aria-hidden="true" /> Back
          </button>
          <ol className="flex min-w-0 items-center gap-2">
            <li>
              <Link to="/searchcountry" className="hover:text-[#1A202C]">
                Countries
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                to={`/filtercountry?region=${encodeURIComponent(country.region)}`}
                className="hover:text-[#1A202C]"
              >
                {country.region}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="truncate text-[#1A202C]" aria-current="page">
              {country.name.common}
            </li>
          </ol>
        </nav>

        <header className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
          <img
            src={country.flags.svg}
            alt={`Flag of ${country.name.common}`}
            className="h-24 w-36 shrink-0 rounded-xl object-cover shadow-lg ring-1 ring-black/5 md:h-28 md:w-44"
          />
          <div className="min-w-0">
            <p className="font-inter text-sm text-gray-500">
              {[country.subregion, country.region].filter(Boolean).join(", ")}
            </p>
            <h1 className="font-archivo text-4xl font-light leading-tight text-[#1A202C] md:text-5xl">
              {country.name.common}
            </h1>
            <p className="mt-1 font-inter text-sm text-gray-600">
              {country.name.official}
              {country.name.native &&
                country.name.native !== country.name.common && (
                  <span className="text-gray-400"> · {country.name.native}</span>
                )}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{country.independent ? "Independent" : "Territory"}</Badge>
              {country.unMember && <Badge>UN member</Badge>}
              {country.landlocked && <Badge>Landlocked</Badge>}
              <Badge>
                {country.cca2} · {country.cca3}
              </Badge>
            </div>
          </div>
        </header>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat
            icon={FiMapPin}
            label="Capital"
            value={country.capital.join(", ") || "None"}
          />
          <Stat
            icon={FiUsers}
            label="Population"
            value={formatCompact(country.population)}
            hint={
              country.populationYear
                ? `World Bank, ${country.populationYear}`
                : "Not available"
            }
          />
          <Stat
            icon={FiMaximize}
            label="Area"
            value={`${formatCompact(country.area)} km²`}
            hint={`${formatNumber(country.area)} km²`}
          />
          <Stat
            icon={FiGrid}
            label="Density"
            value={density ? formatNumber(density) : "—"}
            hint="people per km²"
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <Card className="relative z-0 overflow-hidden !p-0 lg:col-span-3">
            <div className="h-80 lg:h-full lg:min-h-[420px]">
              <MapContainer
                key={country.cca3}
                bounds={getBounds(country)}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[lat, lng]}>
                  <Popup>{country.name.common}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </Card>

          <Card title="Population over time" className="lg:col-span-2">
            {history === null ? (
              <div className="h-56 animate-pulse rounded-xl bg-gray-100" />
            ) : (
              <PopulationChart history={history} />
            )}
            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className={secondaryButtonClass}
              >
                <FiMapPin aria-hidden="true" /> Google Maps
              </a>
              <a
                href={`https://en.wikipedia.org/wiki/${encodeURIComponent(
                  country.name.common
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={secondaryButtonClass}
              >
                <FiExternalLink aria-hidden="true" /> Wikipedia
              </a>
            </div>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card title="People & culture">
            <div className="mb-3 flex flex-wrap gap-2">
              {country.languages.length ? (
                country.languages.map((language) => (
                  <Link
                    key={language}
                    to={`/filtercountry?language=${encodeURIComponent(language)}`}
                    className="rounded-full bg-gray-100 px-3 py-1 font-inter text-sm text-[#1A202C] transition hover:bg-gray-200"
                  >
                    {language}
                  </Link>
                ))
              ) : (
                <span className="font-inter text-sm text-gray-500">
                  No official language
                </span>
              )}
            </div>
            <dl>
              <Fact label="Demonym" value={country.demonym} />
              <Fact
                label="Life expectancy"
                loading={indicatorsLoading}
                value={withYear(indicators?.lifeExpectancy, (v) =>
                  `${v.toFixed(1)} yrs`
                )}
              />
              <Fact
                label="Urban population"
                loading={indicatorsLoading}
                value={withYear(indicators?.urbanPopulation, formatPercent)}
              />
            </dl>
          </Card>

          <Card title="Economy">
            <dl>
              <Fact
                label="Currency"
                value={country.currencies
                  .map((c) => `${c.name} (${c.symbol || c.code})`)
                  .join(", ")}
              />
              <Fact
                label="GDP"
                loading={indicatorsLoading}
                value={withYear(indicators?.gdp, formatUsd)}
              />
              <Fact
                label="GDP per capita"
                loading={indicatorsLoading}
                value={withYear(indicators?.gdpPerCapita, (v) =>
                  `$${formatNumber(v)}`
                )}
              />
              <Fact
                label="Internet users"
                loading={indicatorsLoading}
                value={withYear(indicators?.internetUsers, formatPercent)}
              />
            </dl>
          </Card>

          <Card title="Codes & contact">
            <dl>
              <Fact label="ISO alpha-2 / alpha-3" value={`${country.cca2} / ${country.cca3}`} />
              <Fact label="ISO numeric" value={country.ccn3} />
              <Fact label="Calling code" value={country.callingCode} />
              <Fact label="Internet domain" value={country.tld.join(", ")} />
            </dl>
          </Card>
        </div>

        <Card title="Neighbouring countries" className="mt-6">
          {neighbours.length ? (
            <div className="flex flex-wrap gap-3">
              {neighbours.map((neighbour) => (
                <Link
                  key={neighbour.cca3}
                  to={`/country/${neighbour.slug}`}
                  className="inline-flex items-center gap-2.5 rounded-full border border-gray-200 py-1.5 pl-1.5 pr-4 font-inter text-sm text-[#1A202C] transition hover:border-[#1A202C]"
                >
                  <img
                    src={neighbour.flags.svg}
                    alt=""
                    className="h-6 w-6 rounded-full object-cover ring-1 ring-black/10"
                  />
                  {neighbour.name.common}
                </Link>
              ))}
            </div>
          ) : (
            <p className="font-inter text-sm text-gray-500">
              {country.name.common} has no land borders with other countries.
            </p>
          )}
        </Card>

        <p className="mt-8 font-inter text-xs text-gray-400">
          Data: world-countries (mledoze/countries), World Bank Open Data,
          flagcdn.com. Map © OpenStreetMap contributors.
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default CountryDetail;
