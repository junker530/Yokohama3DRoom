import { useEffect, useMemo, useState } from "react";
import ErrorMessage from "../../components/common/ErrorMessage";
import LoadingIndicator from "../../components/common/LoadingIndicator";
import RoutePanel from "../../features/map/components/RoutePanel";
import ScanLocationCard from "../../features/map/components/ScanLocationCard";
import ScanMap from "../../features/map/components/ScanMap";
import { useSelectedLocation } from "../../features/map/hooks/useSelectedLocation";
import { useRouteSearch } from "../../features/map/hooks/useRouteSearch";
import { useTransitRoutes } from "../../features/map/hooks/useTransitRoutes";
import { googleTransitDirectionsUrl } from "../../data/transitRoutes";
import { useLocations } from "../../features/locations/hooks/useLocations";
import "./MapPage.css";

function MapPage() {
  const { locations, isLoading, error: locationsError, reload } = useLocations();
  const { selectedLocationId, selectLocation, clearSelection } = useSelectedLocation();
  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === selectedLocationId),
    [locations, selectedLocationId],
  );
  const defaultOriginId = String(import.meta.env.VITE_DEFAULT_ORIGIN_ID || "");
  const origin = useMemo(
    () => locations.find((location) => location.id === defaultOriginId)
      ?? locations.find((location) => location.modelUrl)
      ?? locations[0],
    [locations, defaultOriginId],
  );
  const routeSearch = useRouteSearch(origin, selectedLocation);
  const transitSearch = useTransitRoutes(origin, selectedLocation);
  const [routeMode, setRouteMode] = useState("transit");

  useEffect(() => {
    setRouteMode("transit");
  }, [selectedLocationId]);

  const activeRouteGeometry = routeMode === "transit" ? null : routeSearch.routeGeometry;

  return (
    <main className="map-page">
      <div className="map-page__topbar" aria-label="地図情報">
        <div className="map-page__brand-mark" aria-hidden="true">3d</div>
        <div>
          <p className="map-page__eyebrow">3dROOM</p>
          <h1>横浜の地点を検索</h1>
        </div>
      </div>
      <ScanMap
        locations={locations}
        selectedLocation={selectedLocation}
        onSelect={selectLocation}
        routeGeometry={activeRouteGeometry}
        transitRoutes={routeMode === "transit" ? transitSearch.routes : []}
        selectedTransitRouteId={transitSearch.selectedRouteId}
        onSelectTransitRoute={(routeId) => {
          setRouteMode("transit");
          transitSearch.selectRoute(routeId);
        }}
      />
      {selectedLocation?.kind === "destination" && origin ? (
        <RoutePanel
          origin={origin}
          destination={selectedLocation}
          routes={routeSearch.routes}
          selectedRouteIndex={routeSearch.selectedRouteIndex}
          onSelectRoute={routeSearch.selectRoute}
          walkingMinutes={routeSearch.walkingMinutes}
          transitOptions={transitSearch.routes}
          selectedTransitRouteId={transitSearch.selectedRouteId}
          onSelectTransitRoute={transitSearch.selectRoute}
          transitLoading={transitSearch.isLoading}
          transitError={transitSearch.error}
          transitIsFallback={transitSearch.isFallback}
          transitDirectionsUrl={googleTransitDirectionsUrl(origin, selectedLocation)}
          isLoading={routeSearch.isLoading}
          error={routeSearch.error}
          onModeChange={setRouteMode}
          onClose={clearSelection}
        />
      ) : (
        <ScanLocationCard location={selectedLocation} onClose={clearSelection} />
      )}
      {!selectedLocation && !isLoading && !locationsError && <p className="map-page__hint">ピンを選択すると地点情報が表示されます</p>}
      {isLoading && (
        <div className="map-page__loading" role="status">
          <LoadingIndicator label="Supabaseから地点を読み込んでいます" />
          <span>地点を読み込んでいます…</span>
        </div>
      )}
      {locationsError && (
        <div className="map-page__error">
          <ErrorMessage
            title="地点を読み込めませんでした"
            message={locationsError}
            action={<button type="button" className="map-page__retry" onClick={reload}>再読み込み</button>}
          />
        </div>
      )}
      {!isLoading && !locationsError && locations.length === 0 && (
        <div className="map-page__error">
          <ErrorMessage
            title="地点データがありません"
            message="Supabaseのテーブルにデータがあるか、公開APIの読み取りポリシーを確認してください。"
            action={<button type="button" className="map-page__retry" onClick={reload}>再読み込み</button>}
          />
        </div>
      )}
    </main>
  );
}

export default MapPage;
