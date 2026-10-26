import React, { useState, useEffect, useRef } from "react";
import CountryCard from "./CountryCard";

const PAGE_SIZE = 24;

const gridClassName =
  "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4";

export const CountryCardSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
    <div className="aspect-[3/2] animate-pulse bg-gray-200" />
    <div className="space-y-3 p-4">
      <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
      <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
    </div>
  </div>
);

// Reveals countries a page at a time as the user scrolls, so a full list of
// 250 flags doesn't load at once.
const CountryGrid = ({ countries, loading }) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);
  const hasMore = visibleCount < countries.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [countries]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) => count + PAGE_SIZE);
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, visibleCount]);

  if (loading) {
    return (
      <div className={gridClassName} aria-busy="true">
        {Array.from({ length: 8 }, (_, index) => (
          <CountryCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className={gridClassName}>
        {countries.slice(0, visibleCount).map((country) => (
          <CountryCard key={country.cca3} country={country} />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="mt-10 flex justify-center">
          <button
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="rounded-full border border-[#1A202C] px-6 py-2 font-poppins text-sm transition hover:bg-[#1A202C] hover:text-white"
          >
            Show more ({countries.length - visibleCount} left)
          </button>
        </div>
      )}
    </>
  );
};

export default CountryGrid;
