import React from "react";
import useCountries from "../hooks/useCountries";
import HeroSection from "../components/HeroSection";
import HistorySection from "../components/HistorySection";
import ExploreNowSection from "../components/ExploreNowSection";
import WhoWeAreSection from "../components/WhoWeAreSection";
import FeaturesSection from "../components/FeaturesSection";
import PopularCountriesSection from "../components/PopularCountriesSection";
import Footer from "../components/Footer";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Home = () => {
  const { countries } = useCountries();
  const totalOfTheCountries = countries.length;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
  };

  const images = [
    "https://images.unsplash.com/photo-1490761668535-35497054764d?q=80&w=2505&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1531975474574-e9d2732e8386?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://plus.unsplash.com/premium_photo-1676657955507-b1f993556e80?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1509195070461-b99ef33ceb67?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ];

  return (
    <div className="overflow-x-hidden">
      <HeroSection />

      <div className="flex flex-col md:space-y-4 space-y-2 justify-center items-center w-full h-20 bg-white mt-10">
        <h2 className="text-sm md:text-xl md:w-full w-[70%] font-poppins font-normal text-center">
          Do you know? There are{" "}
          <span className="font-bold">{totalOfTheCountries}+</span> countries in
          this big world
        </h2>
        <div className="w-full flex justify-center">
          <div className="w-20 h-1 bg-black"></div>
        </div>
      </div>

      <ExploreNowSection images={images} settings={settings} />
      <PopularCountriesSection />
      <HistorySection />
      <FeaturesSection />
      <WhoWeAreSection />
      <Footer />
    </div>
  );
};

export default Home;
