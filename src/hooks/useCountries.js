import { useState, useEffect, useCallback } from "react";
import { getCountries } from "../api/countries";

const useCountries = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    getCountries()
      .then((data) => active && setCountries(data))
      .catch((err) => {
        console.error("Error fetching countries:", err);
        if (active) setError(err);
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { countries, loading, error, retry };
};

export default useCountries;
