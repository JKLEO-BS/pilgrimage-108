import React, { useState } from "react";
import temples, { getStats, REGIONS } from "./data/temples";
import { useVisitedTemples } from "./hooks/useVisitedTemples";
import { useGeolocation } from "./hooks/useGeolocation";
import { useOfflineStatus } from "./hooks/useOfflineStatus";
import TempleMap from "./components/Map/TempleMap";
import TempleList from "./components/Sidebar/TempleList";
import TempleDetail from "./components/Sidebar/TempleDetail";
import InstallPrompt from "./components/UI/InstallPrompt";
import Home from "./pages/Home";

export default function App() {
  const { visitedIds, markVisited, unmarkVisited, isVisited, getVisitedAt } =
    useVisitedTemples();
  const {
    position: userPosition,
    error: gpsError,
    loading: gpsLoading,
    refresh: refreshGps,
  } = useGeolocation();
  const isOffline = useOfflineStatus();

  const [selectedTemple, setSelectedTemple] = useState(null);
  const [regionFilter, setRegionFilter] = useState("전체");
  const [mainTab, setMainTab] = useState("map");
  const [searchQuery, setSearchQuery] = useState("");
  const [showVisitedOnly, setShowVisitedOnly] = useState(false);
  const [showHome, setShowHome] = useState(true);

  const stats = getStats(visitedIds);

  const filteredTemples = temples.filter((t) => {
    const matchRegion = regionFilter === "전체" || t.region === regionFilter;
    const matchVisited = !showVisitedOnly || visitedIds.includes(t.id);
    const matchSearch =
      !searchQuery ||
      t.name.includes(searchQuery) ||
      t.province.includes(searchQuery) ||
      (t.nameEn && t.nameEn.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchRegion && matchVisited && matchSearch;
  });

  const handleSelectTemple = (temple) => setSelectedTemple(temple);
  const handleCloseDetail = () => {
    setSelectedTemple(null);
    setMainTab("map");
  };

  return (
    <div className="app-container">
      {showHome ? (
        <Home
          visitedCount={stats.visited}
          totalCount={stats.total}
          onStart={() => { setShowHome(false); setMainTab("map"); }}
          onBrowse={() => { setShowHome(false); setMainTab("map"); }}
        />
      ) : (
        <>
          <InstallPrompt />
          {isOffline && (
            <div className="offline-banner" role="alert">
              📵 오프라인 — 캐시된 지도와 순례 기록 이용 가능
            </div>
          )}
          <header className="app-header-mini">
            <div className="app-header-mini-row1">
              <span className="app-header-mini-title">108 사찰 순례</span>
            </div>
            <div className="app-header-mini-row2">
              <span className="app-header-mini-stat">{stats.visited} / {stats.total}</span>
              <div className="app-header-mini-prog-track">
                <div
                  className="app-header-mini-prog-fill"
                  style={{ width: `${stats.percent}%` }}
                />
              </div>
            </div>
          </header>
          <nav className="main-tab-bar">
            <button
              className={`main-tab-btn ${mainTab === "map" ? "active" : ""}`}
              onClick={() => setMainTab("map")}
            >
              🗺️ 지도·목록
            </button>
            <button
              className={`main-tab-btn ${mainTab === "detail" ? "active" : ""}`}
              onClick={() => selectedTemple && setMainTab("detail")}
              disabled={!selectedTemple}
            >
              🏯 사찰정보{selectedTemple ? ` · ${selectedTemple.name}` : ""}
            </button>
          </nav>
          <div className="filter-bar">
            <div className="filter-bar-row1">
              <div className="filter-search-wrap">
                <span className="filter-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="사찰 이름 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="filter-search-input"
                />
                {searchQuery && (
                  <button className="filter-search-clear" onClick={() => setSearchQuery("")}>✕</button>
                )}
              </div>
              <div className="filter-region-tabs">
                {REGIONS.map((r) => (
                  <button
                    key={r}
                    className={`filter-region-tab ${regionFilter === r ? "active" : ""}`}
                    onClick={() => setRegionFilter(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-bar-row2">
              <label className="filter-visited-label">
                <input
                  type="checkbox"
                  checked={showVisitedOnly}
                  onChange={(e) => setShowVisitedOnly(e.target.checked)}
                  className="filter-visited-check"
                />
                <span>방문 완료만 보기</span>
              </label>
              <span className="filter-count">{filteredTemples.length}곳</span>
            </div>
            <div className="filter-bar-unesco-note">
              <span className="filter-bar-unesco-dot" />
              <span>파란색 사찰명은 유네스코 세계유산</span>
            </div>
          </div>
          {(gpsLoading || gpsError) && (
            <div className="gps-status-bar">
              {gpsLoading && <span>📡 위치 확인 중...</span>}
              {gpsError && (
                <>
                  <span>⚠️ {gpsError}</span>
                  <button onClick={refreshGps} className="gps-retry">재시도</button>
                </>
              )}
            </div>
          )}
          <div className="main-content">
            <div className={`tab-panel split-view ${mainTab === "map" ? "tab-active" : ""}`}>
              <div className="split-list">
                <TempleList
                  temples={filteredTemples}
                  visitedIds={visitedIds}
                  selectedTemple={selectedTemple}
                  onSelectTemple={handleSelectTemple}
                />
              </div>
              <div className="split-map">
                <TempleMap
                  temples={temples}
                  visitedIds={visitedIds}
                  selectedTemple={selectedTemple}
                  onSelectTemple={handleSelectTemple}
                  userPosition={userPosition}
                  regionFilter={regionFilter}
                />
              </div>
            </div>
            <div className={`tab-panel detail-only ${mainTab === "detail" ? "tab-active" : ""}`}>
              {selectedTemple && (
                <TempleDetail
                  temple={selectedTemple}
                  visited={isVisited(selectedTemple.id)}
                  visitedAt={getVisitedAt(selectedTemple.id)}
                  userPosition={userPosition}
                  onVisit={markVisited}
                  onUnvisit={unmarkVisited}
                  onClose={handleCloseDetail}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
