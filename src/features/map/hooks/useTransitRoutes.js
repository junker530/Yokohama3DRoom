import { useEffect, useState } from "react";
import { getFallbackTransitOptions } from "../../../data/transitRoutes";
import { decodePolyline } from "../../../utils/polyline";

const TRANSITOUS_ENDPOINT = "https://api.transitous.org/api/v6/plan";

const MODE_LABELS = {
  BUS: "バス",
  TRAM: "路面電車",
  SUBWAY: "地下鉄",
  REGIONAL_RAIL: "鉄道",
  METRO: "地下鉄",
  RAIL: "鉄道",
  FERRY: "フェリー",
};

function lineDisplayName(leg) {
  const agencyName = leg.agencyName || "";
  const routeShortName = leg.routeShortName || "";
  const hasUsefulShortName = routeShortName && !/^\d+$/.test(routeShortName);

  if (agencyName.includes("横浜市営地下鉄")) return { label: "B", name: "ブルーライン", color: "#1976d2" };
  if (agencyName.includes("京浜急行")) return { label: "KK", name: "京急本線", color: "#27b7d6" };
  if (agencyName.includes("東急")) return { label: "TY", name: "東急線", color: "#e85298" };
  if (hasUsefulShortName) {
    return {
      label: routeShortName,
      name: leg.routeLongName || agencyName || MODE_LABELS[leg.mode] || leg.mode,
      color: leg.mode === "BUS" ? "#174ea6" : "#188038",
    };
  }

  return {
    label: MODE_LABELS[leg.mode] || leg.mode,
    name: leg.routeLongName || agencyName || MODE_LABELS[leg.mode] || leg.mode,
    color: leg.mode === "BUS" ? "#174ea6" : "#188038",
  };
}

function formatTime(isoTime) {
  if (!isoTime) return "";
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tokyo",
  }).format(new Date(isoTime));
}

function normalizeLeg(leg, index) {
  const mode = leg.mode === "WALK" ? "WALK" : "TRANSIT";
  const coordinates = decodePolyline(leg.legGeometry?.points);
  const line = mode === "TRANSIT" ? lineDisplayName(leg) : null;

  return {
    id: `${mode.toLowerCase()}-${index}`,
    mode,
    durationMinutes: Math.max(1, Math.round(leg.duration / 60)),
    from: leg.from?.name || "出発地",
    to: leg.to?.name || "目的地",
    line,
    geometry: coordinates.length > 1 ? { type: "LineString", coordinates } : null,
  };
}

function normalizeItinerary(itinerary, index) {
  const segments = itinerary.legs.map(normalizeLeg).filter((segment) => segment.geometry);
  const transitLegs = itinerary.legs.filter((leg) => leg.mode !== "WALK");
  const firstTransitLeg = transitLegs[0];
  const lastTransitLeg = transitLegs[transitLegs.length - 1];
  const coordinates = segments.flatMap((segment) => segment.geometry.coordinates);
  const walkMinutes = Math.round(
    itinerary.legs
      .filter((leg) => leg.mode === "WALK")
      .reduce((total, leg) => total + leg.duration, 0) / 60,
  );
  const lines = transitLegs.map(lineDisplayName);

  return {
    id: itinerary.id || `transit-${index}`,
    durationMinutes: Math.max(1, Math.round(itinerary.duration / 60)),
    walkMinutes,
    transferCount: itinerary.transfers ?? Math.max(0, transitLegs.length - 1),
    departure: firstTransitLeg?.from?.name || "出発地",
    arrival: lastTransitLeg?.to?.name || "目的地",
    departureTime: formatTime(itinerary.startTime),
    arrivalTime: formatTime(itinerary.endTime),
    lines,
    segments,
    geometry: coordinates.length > 1 ? { type: "LineString", coordinates } : null,
    isRealtime: itinerary.legs.some((leg) => leg.realTime),
  };
}

export function useTransitRoutes(origin, destination) {
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    if (!origin || !destination || destination.kind !== "destination") {
      setRoutes([]);
      setSelectedRouteId(null);
      setIsLoading(false);
      setError(null);
      setIsFallback(false);
      return undefined;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      fromPlace: `${origin.latitude},${origin.longitude}`,
      toPlace: `${destination.latitude},${destination.longitude}`,
      time: new Date().toISOString(),
      arriveBy: "false",
      searchWindow: "3600",
      numItineraries: "8",
      maxPreTransitTime: "1800",
      maxPostTransitTime: "1800",
    });

    setIsLoading(true);
    setError(null);
    setIsFallback(false);

    fetch(`${TRANSITOUS_ENDPOINT}?${params.toString()}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Transit route request failed");
        return response.json();
      })
      .then((data) => {
        const normalizedRoutes = (data.itineraries ?? [])
          .map(normalizeItinerary)
          .filter((route) => route.lines.length > 0)
          .sort((left, right) => {
            const leftScore = left.durationMinutes * 60 + left.walkMinutes * 25 + left.transferCount * 90;
            const rightScore = right.durationMinutes * 60 + right.walkMinutes * 25 + right.transferCount * 90;
            return leftScore - rightScore;
          });
        if (!normalizedRoutes.length) throw new Error("No transit route found");
        setRoutes(normalizedRoutes);
        setSelectedRouteId(normalizedRoutes[0].id);
        setIsLoading(false);
      })
      .catch((requestError) => {
        if (requestError.name === "AbortError") return;
        const fallbackRoutes = getFallbackTransitOptions(destination.id);
        setRoutes(fallbackRoutes);
        setSelectedRouteId(fallbackRoutes[0]?.id ?? null);
        setIsLoading(false);
        setIsFallback(true);
        setError("最新の公共交通ルートを取得できないため、参考候補を表示しています。");
      });

    return () => controller.abort();
  }, [origin, destination]);

  return {
    routes,
    selectedRoute: routes.find((route) => route.id === selectedRouteId) ?? routes[0],
    selectedRouteId,
    selectRoute: setSelectedRouteId,
    isLoading,
    error,
    isFallback,
  };
}
