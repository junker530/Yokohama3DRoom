import { useCallback, useEffect, useState } from "react";
import { fetchLocations } from "../api/locationApi";

export function useLocations() {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setLocations(await fetchLocations());
    } catch (requestError) {
      setLocations([]);
      setError(requestError instanceof Error ? requestError.message : "地点を取得できませんでした。");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchLocations()
      .then((data) => {
        if (active) setLocations(data);
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
  }, []);

  return { locations, isLoading, error, reload };
}
