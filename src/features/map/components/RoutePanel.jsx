import { useEffect, useState } from "react";
import IconButton from "../../../components/common/IconButton";
import ModelPreview from "../../viewer/components/ModelPreview";
import { formatDistance, formatDuration } from "../../../utils/route";

function CloseIcon() {
  return <span aria-hidden="true" className="route-panel__close-icon">×</span>;
}

function RouteModeIcon({ mode }) {
  const icons = { recommended: "↗", driving: "▰", transit: "▣", walking: "♧" };
  return <span aria-hidden="true">{icons[mode]}</span>;
}

function TransitJourney({ option }) {
  const segments = option.segments?.length
    ? option.segments
    : [
      ...option.lines.map((line) => ({ mode: "TRANSIT", durationMinutes: null, line })),
      ...(option.walkMinutes ? [{ mode: "WALK", durationMinutes: option.walkMinutes }] : []),
    ];

  return (
    <span className="transit-option__journey" aria-label="移動区間">
      {segments.map((segment, index) => (
        <span className="transit-journey__segment" key={segment.id || `${segment.mode}-${index}`}>
          {index > 0 && <span className="transit-journey__arrow" aria-hidden="true">›</span>}
          {segment.mode === "WALK" ? (
            <span className="transit-journey__walk">徒歩 {segment.durationMinutes}分</span>
          ) : (
            <span className="transit-journey__line">
              <b style={{ backgroundColor: segment.line?.color }}>{segment.line?.label}</b>
              {segment.line?.name}
            </span>
          )}
        </span>
      ))}
    </span>
  );
}

function DestinationMedia({ location }) {
  if (location.imageUrl) {
    return <img src={location.imageUrl} alt={location.name} loading="eager" />;
  }
  if (location.modelUrl) return <ModelPreview location={location} />;
  return <div className="route-panel__media-placeholder">LOCATION</div>;
}

function RoutePanel({
  origin,
  destination,
  routes,
  selectedRouteIndex,
  onSelectRoute,
  walkingMinutes,
  transitOptions,
  selectedTransitRouteId,
  onSelectTransitRoute,
  transitLoading,
  transitError,
  transitIsFallback,
  transitDirectionsUrl,
  isLoading,
  error,
  onModeChange,
  onClose,
}) {
  const [mode, setMode] = useState("transit");
  const [selectedTransitId, setSelectedTransitId] = useState(selectedTransitRouteId ?? transitOptions[0]?.id);

  const changeMode = (nextMode) => {
    setMode(nextMode);
    onModeChange(nextMode);
  };

  useEffect(() => {
    setMode("transit");
    const nextId = selectedTransitRouteId ?? transitOptions[0]?.id;
    setSelectedTransitId(nextId);
    if (nextId) onSelectTransitRoute(nextId);
  }, [destination.id, selectedTransitRouteId, transitOptions, onSelectTransitRoute]);

  const fastestRoute = routes[0];
  const selectedTransit = transitOptions.find((option) => option.id === selectedTransitRouteId)
    ?? transitOptions.find((option) => option.id === selectedTransitId)
    ?? transitOptions[0];

  return (
    <aside className="route-panel" aria-label={`${destination.name}へのルート`}>
      <div className="route-panel__header">
        <div>
          <p className="route-panel__eyebrow">ROUTE</p>
          <h2>ルート</h2>
        </div>
        <IconButton className="route-panel__close" label="ルート検索を閉じる" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>

      <div className="route-panel__media">
        <DestinationMedia location={destination} />
        <div className="route-panel__media-caption">
          <strong>{destination.name}</strong>
          <span>{destination.postalCode && `${destination.postalCode} `}{destination.address}</span>
        </div>
      </div>

      <div className="route-panel__locations">
        <div className="route-panel__location-row">
          <span className="route-panel__dot route-panel__dot--origin" aria-hidden="true" />
          <div>
            <span className="route-panel__location-label">出発地</span>
            <strong>{origin.name}</strong>
            <small>{origin.address}</small>
          </div>
        </div>
        <div className="route-panel__connector" aria-hidden="true" />
        <div className="route-panel__location-row">
          <span className="route-panel__dot route-panel__dot--destination" aria-hidden="true" />
          <div>
            <span className="route-panel__location-label">目的地</span>
            <strong>{destination.name}</strong>
            <small>{destination.address}</small>
          </div>
        </div>
      </div>

      <nav className="route-modes" aria-label="移動手段">
        {["recommended", "driving", "transit", "walking"].map((routeMode) => (
          <button
            key={routeMode}
            type="button"
            className={`route-mode ${mode === routeMode ? "is-selected" : ""}`}
            onClick={() => changeMode(routeMode)}
          >
            <RouteModeIcon mode={routeMode} />
            <span>
              {routeMode === "recommended" && "おすすめ"}
              {routeMode === "driving" && "車"}
              {routeMode === "transit" && "公共交通"}
              {routeMode === "walking" && "徒歩"}
            </span>
          </button>
        ))}
      </nav>

      <div className="route-panel__content">
        <div className="route-panel__section-title">
          <h3>{mode === "transit" ? "公共交通機関の候補" : "ルート候補"}</h3>
          {mode === "transit" && <span>{transitOptions.length}件</span>}
          {mode === "driving" && routes.length > 0 && <span>{routes.length}件</span>}
        </div>

        {mode === "transit" && (
          <div className="route-panel__options">
            {transitLoading && <p className="route-panel__state">公共交通機関のルートを検索しています…</p>}
            {transitError && <p className="route-panel__state route-panel__state--notice">{transitError}</p>}
            {!transitLoading && transitOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`transit-option ${(selectedTransitRouteId ?? selectedTransitId) === option.id ? "is-selected" : ""}`}
                onClick={() => {
                  setSelectedTransitId(option.id);
                  onSelectTransitRoute(option.id);
                }}
              >
                <span className="transit-option__icon" aria-hidden="true">▣</span>
                <span className="transit-option__main">
                  <strong>{option.durationMinutes}分</strong>
                  <TransitJourney option={option} />
                  <span>
                    {option.departureTime && `${option.departureTime}発 · `}
                    {option.departure} → {option.arrival} · 乗換 {option.transferCount}回
                  </span>
                </span>
                <span className="route-option__radio" aria-hidden="true" />
              </button>
            ))}
            {!transitLoading && <a className="transit-option__external" href={transitDirectionsUrl} target="_blank" rel="noreferrer">
              Google Mapsで公共交通機関の詳細を見る
              <span aria-hidden="true">↗</span>
            </a>}
            {transitIsFallback && <p className="route-panel__state route-panel__state--notice">候補は参考値です。最新時刻は外部検索で確認してください。</p>}
          </div>
        )}

        {(mode === "recommended" || mode === "driving") && (
          <div className="route-panel__options">
            {fastestRoute && (
              <button
                type="button"
                className={`route-option ${mode === "driving" ? "is-selected" : ""}`}
                onClick={() => {
                  changeMode("driving");
                  onSelectRoute(0);
                }}
              >
                <span className="route-option__icon" aria-hidden="true">▰</span>
                <span className="route-option__main">
                  <strong>{formatDuration(fastestRoute.duration)}</strong>
                  <span>車 · {formatDistance(fastestRoute.distance)}</span>
                </span>
                <span className="route-option__radio" aria-hidden="true" />
              </button>
            )}
            {!fastestRoute && isLoading && <p className="route-panel__state">ルートを検索しています…</p>}
            {error && <p className="route-panel__state route-panel__state--error">{error}</p>}
            {mode === "recommended" && selectedTransit && (
              <button
                type="button"
                className="transit-option"
                onClick={() => changeMode("transit")}
              >
                <span className="transit-option__icon" aria-hidden="true">▣</span>
                <span className="transit-option__main">
                  <strong>{selectedTransit.durationMinutes}分</strong>
                  <TransitJourney option={selectedTransit} />
                  <span>公共交通機関 · 乗換 {selectedTransit.transferCount}回</span>
                </span>
                <span className="route-option__radio" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {mode === "walking" && (
          <div className="route-panel__options">
            {walkingMinutes && (
              <div className="route-option route-option--walking is-selected">
                <span className="route-option__icon" aria-hidden="true">♧</span>
                <span className="route-option__main">
                  <strong>{walkingMinutes}分</strong>
                  <span>徒歩の目安</span>
                </span>
                <span className="route-option__radio" aria-hidden="true" />
              </div>
            )}
          </div>
        )}
      </div>

      <p className="route-panel__notice">
        公共交通機関の時間は目安です。<a href="https://transitous.org/sources/" target="_blank" rel="noreferrer">Transitousの交通データ</a>を利用しています。
      </p>
    </aside>
  );
}

export default RoutePanel;
