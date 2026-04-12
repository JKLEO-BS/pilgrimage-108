import React, { useState } from "react";
import temples, { getStats } from "./data/temples";
import { useVisitedTemples } from "./hooks/useVisitedTemples";
import { useGeolocation } from "./hooks/useGeolocation";
import { useOfflineStatus } from "./hooks/useOfflineStatus";
import TempleMap from "./components/Map/TempleMap";
import TempleList from "./components/Sidebar/TempleList";
import TempleDetail from "./components/Sidebar/TempleDetail";
import PilgrimageProgress from "./components/Progress/PilgrimageProgress";
import InstallPrompt from "./components/UI/InstallPrompt";

export default function App() {
  const { visitedIds, markVisited, unmarkVisited, isVisited, getVisitedAt } =
    useVisitedTemples();
  const { position: userPosition, error: gpsError, loading: gpsLoading, refresh: refreshGps } =
    useGeolocation();
  const isOffline = useOfflineStatus();

  const [selectedTemple, setSelectedTemple] = useState(null);
  const [regionFilter, setRegionFilter] = useState("전체");
  const [sidebarTab, setSidebarTab] = useState("list");

  const stats = getStats(visitedIds);

  const handleSelectTemple = (temple) => {
    setSelectedTemple(temple);
    setSidebarTab("detail");
  };

  const handleCloseDetail = () => {
    setSelectedTemple(null);
    setSidebarTab("list");
  };

  return (
    <div className="app-layout">
      {isOffline && (
        <div className="offline-banner" role="alert">
          📵 오프라인 상태 — 캐시된 지도와 순례 기록은 계속 이용 가능합니다
        </div>
      )}
      <InstallPrompt />

      <aside className="sidebar">

        {/* ── 사진 헤더 ── */}
        <header className="sidebar-header">
          <div className="header-overlay">
            <div className="header-top-row">
              <div>
                <p className="header-eyebrow">불교 성지 순례</p>
                <h1 className="header-title">108 사찰 순례</h1>
              </div>
              <div className="header-badge">
                <span className="badge-num">{stats.visited}</span>
                <span className="badge-label">/ {stats.total}</span>
              </div>
            </div>
            <div className="header-prog-row">
              <div
                className="header-prog-track"
                role="progressbar"
                aria-valuenow={stats.percent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="header-prog-fill"
                  style={{ width: `${stats.percent}%` }}
                />
              </div>
              <span className="header-prog-text">{stats.percent}%</span>
            </div>
          </div>
        </header>

        <div className="gps-status">
          {gpsLoading && <span className="gps-loading">📡 위치 확인 중...</span>}
          {gpsError && (
            <div className="gps-error">
              <span>⚠️ {gpsError}</span>
              <button onClick={refreshGps} className="gps-retry">재시도</button>
            </div>
          )}
          {userPosition && !gpsLoading && (
            <span className="gps-ok">📡 GPS 연결됨 (±{userPosition.accuracy}m)</span>
          )}
        </div>

        <div className="sidebar-tabs">
          <button
            className={`sidebar-tab ${sidebarTab === "list" ? "active" : ""}`}
            onClick={() => setSidebarTab("list")}
          >
            사찰 목록
          </button>
          <button
            className={`sidebar-tab ${sidebarTab === "detail" ? "active" : ""}`}
            onClick={() => setSidebarTab("detail")}
            disabled={!selectedTemple}
          >
            사찰 정보
          </button>
        </div>

        <div className="sidebar-content">
          {sidebarTab === "list" ? (
            <TempleList
              temples={temples}
              visitedIds={visitedIds}
              selectedTemple={selectedTemple}
              onSelectTemple={handleSelectTemple}
              regionFilter={regionFilter}
              onRegionChange={setRegionFilter}
            />
          ) : (
            <TempleDetail
              temple={selectedTemple}
              visited={selectedTemple ? isVisited(selectedTemple.id) : false}
              visitedAt={selectedTemple ? getVisitedAt(selectedTemple.id) : null}
              userPosition={userPosition}
              onVisit={markVisited}
              onUnvisit={unmarkVisited}
              onClose={handleCloseDetail}
            />
          )}
        </div>
      </aside>

      <main className="map-area">
        <TempleMap
          temples={temples}
          visitedIds={visitedIds}
          selectedTemple={selectedTemple}
          onSelectTemple={handleSelectTemple}
          userPosition={userPosition}
          regionFilter={regionFilter}
        />
      </main>
    </div>
  );
}
