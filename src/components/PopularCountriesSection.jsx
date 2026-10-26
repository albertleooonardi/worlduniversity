import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useCountries from "../hooks/useCountries";

const PopularCountriesSection = () => {
  const navigate = useNavigate();
  const { countries } = useCountries();
  const popularCountries = useMemo(
    () =>
      countries
        .filter((country) => country.population)
        .sort((a, b) => b.population - a.population)
        .slice(0, 5),
    [countries]
  );

  const handleCountryClick = (slug) => {
    navigate(`/country/${slug}`);
  };

  return (
    <div className="flex flex-col justify-center items-center w-full h-auto bg-white p-8 mt-12 font-poppins">
      <h2 className="text-4xl font-semibold mb-6 font-poppins">
        Popular Countries
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-8 w-full px-4">
        {popularCountries.map((country, index) => (
          <div
            key={country.cca3}
            onClick={() => handleCountryClick(country.slug)}
            className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-100 rounded-lg shadow-md cursor-pointer hover:bg-gray-200 transition duration-200"
          >
            <div className="flex items-center">
              <span className="text-3xl font-bold mr-4">#{index + 1}</span>
              <img
                src={country.flags.svg}
                alt={`${country.name.common} flag`}
                className="w-20 h-12 object-cover rounded-lg mr-4"
              />
              <div>
                <h3 className="text-lg font-medium">{country.name.common}</h3>
                <p className="text-sm text-gray-600">
                  Region: {country.region}
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-lg text-gray-800">
                Population: {country.population.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularCountriesSection;
