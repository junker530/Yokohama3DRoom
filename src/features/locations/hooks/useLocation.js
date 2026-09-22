import { useEffect, useState } from "react";
import { fetchLocationById } from "../api/locationApi";

export function useLocation(id) {
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLocation(null);
    setIsLoading(true);
    setError(null);

    fetchLocationById(id)
      .then((data) => {
        if (active) setLocation(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "地点を取得できませんでした。");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  return { location, isLoading, error };
}
