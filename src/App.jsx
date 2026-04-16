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
  const [mainTab, setMainTab] = useState("map"); // "map" | "list"

  const stats = getStats(visitedIds);

  const handleSelectTemple = (temple) => {
    setSelectedTemple(temple);
  };

  const handleCloseDetail = () => {
    setSelectedTemple(null);
  };

  return (
    <div className="app-container">
      {isOffline && (
        <div className="offline-banner" role="alert">
          📵 오프라인 상태 — 캐시된 지도와 순례 기록은 계속 이용 가능합니다
        </div>
      )}
      <InstallPrompt />

      {/* ── 상단 헤더 ── */}
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-header-text">
            <p className="header-eyebrow">불교 성지 순례</p>
            <h1 className="header-title">108 사찰 순례</h1>
          </div>
          <div className="header-badge">
            <span className="badge-num">{stats.visited}</span>
            <span className="badge-label"> / {stats.total}</span>
          </div>
        </div>
        <div className="header-progress-row">
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
          <span className="header-prog-pct">{stats.percent}%</span>
        </div>
      </header>

      {/* ── 지도 / 목록 탭 바 ── */}
      <nav className="main-tab-bar">
        <button
          className={`main-tab-btn ${mainTab === "map" ? "active" : ""}`}
          onClick={() => setMainTab("map")}
        >
          🗺️ 지도
        </button>
        <button
          className={`main-tab-btn ${mainTab === "list" ? "active" : ""}`}
          onClick={() => setMainTab("list")}
        >
          📋 목록
        </button>
      </nav>

      {/* ── GPS 상태 (오류/로딩 시만 표시) ── */}
      {(gpsLoading || gpsError) && (
        <div className="gps-status-bar">
          {gpsLoading && <span className="gps-loading">📡 위치 확인 중...</span>}
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
        {/* 지도 탭 */}
        <div className={`tab-panel ${mainTab === "map" ? "tab-active" : ""}`}>
          <TempleMap
            temples={temples}
            visitedIds={visitedIds}
            selectedTemple={selectedTemple}
            onSelectTemple={handleSelectTemple}
            userPosition={userPosition}
            regionFilter={regionFilter}
          />
        </div>

        {/* 목록 탭 */}
        <div className={`tab-panel ${mainTab === "list" ? "tab-active" : ""}`}>
          <TempleList
            temples={temples}
            visitedIds={visitedIds}
            selectedTemple={selectedTemple}
            onSelectTemple={(temple) => {
              handleSelectTemple(temple);
              setMainTab("map"); // 목록에서 선택하면 지도로 전환
            }}
            regionFilter={regionFilter}
            onRegionChange={setRegionFilter}
          />
        </div>
      </div>

      {/* ── 사찰 상세 슬라이드업 패널 ── */}
      {selectedTemple && (
        <div className="detail-overlay" onClick={handleCloseDetail}>
          <div className="detail-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="detail-sheet-handle" />
            <TempleDetail
              temple={selectedTemple}
              visited={isVisited(selectedTemple.id)}
              visitedAt={getVisitedAt(selectedTemple.id)}
              userPosition={userPosition}
              onVisit={markVisited}
              onUnvisit={unmarkVisited}
              onClose={handleCloseDetail}
            />
          </div>
        </div>
      )}
    </div>
  );
}
