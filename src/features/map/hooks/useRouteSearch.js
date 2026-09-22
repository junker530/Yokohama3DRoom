import { useEffect, useMemo, useState } from "react";

const ROUTING_ENDPOINT = "https://router.project-osrm.org/route/v1/driving";

export function useRouteSearch(origin, destination) {
  const [routes, setRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!origin || !destination || destination.kind !== "destination") {
      setRoutes([]);
      setSelectedRouteIndex(0);
      setIsLoading(false);
      setError(null);
      return undefined;
    }

    const controller = new AbortController();
    const coordinates = [
      `${origin.longitude},${origin.latitude}`,
      `${destination.longitude},${destination.latitude}`,
    ].join(";");

    setIsLoading(true);
    setError(null);
    setRoutes([]);
    setSelectedRouteIndex(0);

    fetch(`${ROUTING_ENDPOINT}/${coordinates}?alternatives=true&overview=full&geometries=geojson`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Routing request failed");
        return response.json();
      })
      .then((data) => {
        if (data.code !== "Ok" || !data.routes?.length) {
          throw new Error("No route found");
        }
        setRoutes(data.routes);
        setIsLoading(false);
      })
      .catch((requestError) => {
        if (requestError.name === "AbortError") return;
        setIsLoading(false);
        setError("ルートを取得できませんでした。しばらくしてから再度お試しください。");
      });

    return () => controller.abort();
  }, [origin, destination]);

  const selectedRoute = routes[selectedRouteIndex] ?? routes[0];
  const routeGeometry = selectedRoute?.geometry ?? null;
  const walkingMinutes = useMemo(() => {
    if (!selectedRoute) return null;
    return Math.max(1, Math.round(selectedRoute.distance / 1.25 / 60));
  }, [selectedRoute]);

  return {
    routes,
    selectedRoute,
    selectedRouteIndex,
    selectRoute: setSelectedRouteIndex,
    routeGeometry,
    walkingMinutes,
    isLoading,
    error,
  };
}
