import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const PageHero = ({ slides, eyebrow, title, subtitle, children }) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(
      () => setCurrent((index) => (index + 1) % slides.length),
      6000
    );
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  return (
    // z-10 keeps the search suggestions above the page content below the hero.
    <section className="relative isolate z-10 bg-[#1A202C] text-white">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {slides.map((slide, index) => (
          <img
            key={slide.slug}
            src={slide.src}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-cover motion-safe:transition-opacity motion-safe:duration-1000 ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A202C] via-[#1A202C]/70 to-[#1A202C]/30" />
      </div>

      <div className="mx-auto flex min-h-[460px] max-w-6xl flex-col justify-end px-4 pb-10 pt-24 sm:px-8 md:min-h-[520px]">
        {eyebrow && (
          <p className="mb-3 font-inter text-xs font-medium uppercase tracking-[0.2em] text-white/70">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-2xl font-archivo text-4xl font-light leading-tight md:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-xl font-inter text-base font-light text-white/80">
            {subtitle}
          </p>
        )}

        {children && <div className="mt-8 max-w-2xl">{children}</div>}

        <div
          className="mt-8 flex flex-wrap items-center gap-2 font-inter text-sm"
          onMouseLeave={() => setPaused(false)}
        >
          <span className="mr-1 text-white/60">Featured:</span>
          {slides.map((slide, index) => (
            <Link
              key={slide.slug}
              to={`/country/${slide.slug}`}
              onMouseEnter={() => {
                setCurrent(index);
                setPaused(true);
              }}
              onFocus={() => {
                setCurrent(index);
                setPaused(true);
              }}
              className={`rounded-full border px-3 py-1 transition-colors ${
                index === current
                  ? "border-white bg-white text-[#1A202C]"
                  : "border-white/30 text-white/80 hover:border-white/70"
              }`}
            >
              {slide.title}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PageHero;
