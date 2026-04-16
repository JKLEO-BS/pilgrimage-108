import React, { useState } from "react";
import temples, { getStats } from "./data/temples";
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
  const [mainTab, setMainTab] = useState("map"); // "map" | "detail"

  const stats = getStats(visitedIds);

  const handleSelectTemple = (temple) => {
    setSelectedTemple(temple);
  };

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

      {/* ── 초소형 헤더 ── */}
      <header className="app-header-mini">
        <div className="app-header-mini-left">
          <span className="app-header-mini-title">108 사찰 순례</span>
          <span className="app-header-mini-sub">불교 성지 순례</span>
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

      {/* ── 탭 바 ── */}
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
          🏯 사찰정보 {selectedTemple ? `· ${selectedTemple.name}` : ""}
        </button>
      </nav>

      {/* ── GPS 오류/로딩 ── */}
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

        {/* 지도·목록 탭: 좌우 분할 */}
        <div className={`tab-panel split-view ${mainTab === "map" ? "tab-active" : ""}`}>
          {/* 왼쪽: 사찰 목록 */}
          <div className="split-list">
            <TempleList
              temples={temples}
              visitedIds={visitedIds}
              selectedTemple={selectedTemple}
              onSelectTemple={(temple) => {
                handleSelectTemple(temple);
              }}
              regionFilter={regionFilter}
              onRegionChange={setRegionFilter}
            />
          </div>

          {/* 오른쪽: 지도 */}
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

        {/* 사찰정보 탭: 단독 상세 */}
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
