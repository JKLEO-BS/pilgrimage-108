import React, { useState } from "react";
import temples, { getStats, REGIONS } from "./data/temples";
import { useVisitedTemples } from "./hooks/useVisitedTemples";
import { useGeolocation } from "./hooks/useGeolocation";
import { useOfflineStatus } from "./hooks/useOfflineStatus";
import TempleMap from "./components/Map/TempleMap";
import TempleList from "./components/Sidebar/TempleList";
import TempleDetail from "./components/Sidebar/TempleDetail";
import InstallPrompt from "./components/UI/InstallPrompt";

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

  const stats = getStats(visitedIds);

  // 필터링된 사찰 목록
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
      {isOffline && (
        <div className="offline-banner" role="alert">
          📵 오프라인 — 캐시된 지도와 순례 기록 이용 가능
        </div>
      )}
      <InstallPrompt />

      {/* ── 헤더 ── */}
      <header className="app-header-mini">
        <div className="app-header-mini-left">
          <span className="app-header-mini-title">108 사찰 순례</span>
        </div>
        <div className="app-header-mini-right">
          <div className="app-header-mini-prog-wrap">
            <div className="app-header-mini-prog-track">
              <div
                className="app-header-mini-prog-fill"
                style={{ width: `${stats.percent}%` }}
              />
            </div>
            <span className="app-header-mini-stat">
              {stats.visited} / {stats.total}
            </span>
          </div>
        </div>
      </header>

      {/* ── 메인 탭 바 ── */}
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

      {/* ── 검색 + 지역 필터 바 (탭 바 바로 아래) ── */}
      <div className="filter-bar">
        {/* 1행: 검색 + 지역 탭 */}
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
        {/* 2행: 방문 완료만 보기 */}
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
      </div>

      {/* ── GPS 오류 ── */}
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

      {/* ── 메인 콘텐츠 ── */}
      <div className="main-content">
        {/* 지도·목록 탭 */}
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

        {/* 사찰정보 탭 */}
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
    </div>
  );
}
