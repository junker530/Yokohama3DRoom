import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "../map.constants";

const EMPTY_ROUTE = {
  type: "FeatureCollection",
  features: [],
};

const OPENFREEMAP_BRIGHT_STYLE = "https://tiles.openfreemap.org/styles/bright";

function locationFeatureCollection(locations, selectedLocationId) {
  return {
    type: "FeatureCollection",
    features: locations.map((location) => ({
      type: "Feature",
      properties: {
        id: location.id,
        kind: location.kind ?? "scan",
        selected: location.id === selectedLocationId,
      },
      geometry: {
        type: "Point",
        coordinates: [location.longitude, location.latitude],
      },
    })),
  };
}

function transitRouteFeatureCollection(routes, selectedRouteId) {
  return {
    type: "FeatureCollection",
    features: routes
      .filter((route) => route.geometry)
      .map((route) => ({
        type: "Feature",
        properties: {
          routeId: route.id,
          selected: route.id === selectedRouteId,
        },
        geometry: route.geometry,
      })),
  };
}

function activeTransitFeatureCollection(route) {
  return {
    type: "FeatureCollection",
    features: (route?.segments ?? []).map((segment) => ({
      type: "Feature",
      properties: { mode: segment.mode },
      geometry: segment.geometry,
    })),
  };
}

function ScanMap({
  locations,
  selectedLocation,
  onSelect,
  routeGeometry,
  transitRoutes = [],
  selectedTransitRouteId,
  onSelectTransitRoute,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const onSelectTransitRouteRef = useRef(onSelectTransitRoute);
  const hasFittedBoundsRef = useRef(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    onSelectTransitRouteRef.current = onSelectTransitRoute;
  }, [onSelectTransitRoute]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return undefined;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_MAP_ZOOM,
      style: OPENFREEMAP_BRIGHT_STYLE,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", () => {
      map.addSource("route", { type: "geojson", data: EMPTY_ROUTE });
      map.addLayer({
        id: "route-casing",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#ffffff",
          "line-width": 10,
          "line-opacity": 0.95,
        },
      });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#1967d2",
          "line-width": 5,
          "line-opacity": 0.96,
        },
      });

      map.addSource("transit-alternatives", {
        type: "geojson",
        data: transitRouteFeatureCollection(transitRoutes, selectedTransitRouteId),
      });
      map.addLayer({
        id: "transit-alternative-casing",
        type: "line",
        source: "transit-alternatives",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#ffffff",
          "line-width": ["case", ["get", "selected"], 9, 7],
          "line-opacity": ["case", ["get", "selected"], 0.82, 0.5],
        },
      });
      map.addLayer({
        id: "transit-alternative-lines",
        type: "line",
        source: "transit-alternatives",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#8ecae6",
          "line-width": ["case", ["get", "selected"], 6, 4],
          "line-opacity": ["case", ["get", "selected"], 0.34, 0.52],
        },
      });
      map.addSource("transit-active", {
        type: "geojson",
        data: activeTransitFeatureCollection(transitRoutes.find((route) => route.id === selectedTransitRouteId)),
      });
      map.addLayer({
        id: "transit-active-casing",
        type: "line",
        source: "transit-active",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#ffffff",
          "line-width": 9,
          "line-opacity": 0.92,
        },
      });
      map.addLayer({
        id: "transit-active-rail",
        type: "line",
        source: "transit-active",
        filter: ["==", ["get", "mode"], "TRANSIT"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#27b7d6",
          "line-width": 6,
          "line-opacity": 0.98,
        },
      });
      map.addLayer({
        id: "transit-active-walk",
        type: "line",
        source: "transit-active",
        filter: ["==", ["get", "mode"], "WALK"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#1967d2",
          "line-width": 4,
          "line-dasharray": [0.5, 1.5],
          "line-opacity": 0.98,
        },
      });

      map.addSource("locations", {
        type: "geojson",
        data: locationFeatureCollection(locations, selectedLocation?.id),
      });
      map.addLayer({
        id: "location-points",
        type: "circle",
        source: "locations",
        paint: {
          "circle-color": ["match", ["get", "kind"], "destination", "#d93025", "#1a73e8"],
          "circle-radius": ["case", ["get", "selected"], 12, 9],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 3,
          "circle-opacity": 1,
        },
      });
      map.addLayer({
        id: "location-point-centers",
        type: "circle",
        source: "locations",
        paint: {
          "circle-color": "#ffffff",
          "circle-radius": ["case", ["get", "selected"], 4, 3],
          "circle-opacity": 1,
        },
      });

      map.on("click", "location-points", (event) => {
        const feature = event.features?.[0];
        if (feature) onSelectRef.current(feature.properties.id);
      });
      map.on("mouseenter", "location-points", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "location-points", () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("click", "transit-alternative-lines", (event) => {
        const routeId = event.features?.[0]?.properties?.routeId;
        if (routeId) onSelectTransitRouteRef.current?.(routeId);
      });
      map.on("mouseenter", "transit-alternative-lines", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "transit-alternative-lines", () => {
        map.getCanvas().style.cursor = "";
      });

      if (locations.length > 1) {
        const bounds = new maplibregl.LngLatBounds();
        locations.forEach((location) => bounds.extend([location.longitude, location.latitude]));
        map.fitBounds(bounds, {
          padding: { top: 96, right: 72, bottom: 72, left: 360 },
          maxZoom: 14,
          duration: 0,
        });
        hasFittedBoundsRef.current = true;
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateLocations = () => {
      const source = map.getSource("locations");
      if (source) source.setData(locationFeatureCollection(locations, selectedLocation?.id));
    };

    if (map.isStyleLoaded()) updateLocations();
    else map.once("load", updateLocations);
  }, [locations, selectedLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || hasFittedBoundsRef.current || locations.length < 2) return;

    const fitLocations = () => {
      const bounds = new maplibregl.LngLatBounds();
      locations.forEach((location) => bounds.extend([location.longitude, location.latitude]));
      map.fitBounds(bounds, {
        padding: { top: 96, right: 72, bottom: 72, left: 360 },
        maxZoom: 14,
        duration: 0,
      });
      hasFittedBoundsRef.current = true;
    };

    if (map.isStyleLoaded()) fitLocations();
    else map.once("load", fitLocations);
  }, [locations]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedLocation) return;
    map.easeTo({
      center: [selectedLocation.longitude, selectedLocation.latitude],
      duration: 350,
      offset: window.innerWidth > 760 ? [170, 0] : [0, -80],
    });
  }, [selectedLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateRoute = () => {
      const source = map.getSource("route");
      if (source) {
        source.setData(routeGeometry ? {
          type: "Feature",
          properties: {},
          geometry: routeGeometry,
        } : EMPTY_ROUTE);
      }
    };

    if (map.isStyleLoaded()) updateRoute();
    else map.once("load", updateRoute);
  }, [routeGeometry]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateTransitRoutes = () => {
      const alternatives = map.getSource("transit-alternatives");
      const active = map.getSource("transit-active");
      if (alternatives) alternatives.setData(transitRouteFeatureCollection(transitRoutes, selectedTransitRouteId));
      if (active) {
        active.setData(activeTransitFeatureCollection(
          transitRoutes.find((route) => route.id === selectedTransitRouteId),
        ));
      }
    };

    if (map.isStyleLoaded()) updateTransitRoutes();
    else map.once("load", updateTransitRoutes);
  }, [transitRoutes, selectedTransitRouteId]);

  return <div ref={mapContainerRef} className="scan-map" aria-label="3Dスキャン地点の地図" />;
}

export default ScanMap;
