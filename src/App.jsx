import React, { useState } from "react";
import temples, { getStats, REGIONS } from "./data/temples";
import { useAuth } from "./hooks/useAuth";
import { useVisitedTemples } from "./hooks/useVisitedTemples";
import { useGeolocation } from "./hooks/useGeolocation";
import { useOfflineStatus } from "./hooks/useOfflineStatus";
import { useDiary } from "./hooks/useDiary";
import { useBow } from "./hooks/useBow";
import TempleMap from "./components/Map/TempleMap";
import TempleList from "./components/Sidebar/TempleList";
import TempleDetail from "./components/Sidebar/TempleDetail";
import DiaryTab from "./components/Sidebar/DiaryTab";
import BowScreen from "./pages/BowScreen";
import BowCalendar from "./pages/BowCalendar";
import InstallPrompt from "./components/UI/InstallPrompt";
import Home from "./pages/Home";

export default function App() {
  const { user, loading: authLoading, loginWithKakao, logout } = useAuth();
  const { visitedIds, markVisited, unmarkVisited, isVisited, getVisitedAt } =
    useVisitedTemples(user?.id);
  const { saving, saveDiaryEntry, deleteDiaryEntry, getDiaryEntries } =
    useDiary(user?.id);
  const { records, getTodayRecord, saveCount } = useBow(user?.id);
  const [showBow, setShowBow] = useState(false);
  const [showBowCalendar, setShowBowCalendar] = useState(false);
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
  const [showUnvisitedOnly, setShowUnvisitedOnly] = useState(false);
  const [showHome, setShowHome] = useState(true);

  const stats = getStats(visitedIds);

  const filteredTemples = temples.filter((t) => {
    const matchRegion = regionFilter === "전체" || t.region === regionFilter;
    const matchVisited = !showVisitedOnly || visitedIds.includes(t.id);
    const matchUnvisited = !showUnvisitedOnly || !visitedIds.includes(t.id);
    const matchSearch =
      !searchQuery ||
      t.name.includes(searchQuery) ||
      t.province.includes(searchQuery) ||
      (t.nameEn && t.nameEn.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchRegion && matchVisited && matchUnvisited && matchSearch;
  });

  const handleSelectTemple = (temple) => setSelectedTemple(temple);
  const handleCloseDetail = () => {
    setSelectedTemple(null);
    setMainTab("map");
  };

  return (
    <div className="app-container">
      {showBow && (
        <BowScreen
          onExit={() => setShowBow(false)}
          getTodayRecord={getTodayRecord}
          saveCount={saveCount}
          onCalendar={() => { setShowBow(false); setShowBowCalendar(true); }}
        />
      )}
      {showBowCalendar && (
        <BowCalendar
          records={records}
          onBack={() => setShowBowCalendar(false)}
        />
      )}
      {showHome ? (
        <Home
          visitedCount={stats.visited}
          totalCount={stats.total}
          onStart={() => { setShowHome(false); setMainTab("map"); }}
          onBrowse={() => { setShowHome(false); setMainTab("map"); }}
          onBow={() => setShowBow(true)}
          onBowCalendar={() => setShowBowCalendar(true)}
          user={user}
          loginWithKakao={loginWithKakao}
          logout={logout}
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
            <div className="app-header-mini-row1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className="app-header-mini-title">108 사찰 순례</span>
              {/* 홈 버튼 */}
              <button
                onClick={() => setShowHome(true)}
                title="홈으로"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: "32px", height: "32px",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  borderRadius: "8px", cursor: "pointer", flexShrink: 0,
                  transition: "background 0.18s, border-color 0.18s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(212,175,55,0.15)";
                  e.currentTarget.style.borderColor = "rgba(212,175,55,0.7)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.borderColor = "rgba(212,175,55,0.3)";
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 10.5L12 3L21 10.5V21H15V15H9V21H3V10.5Z"
                    stroke="#D4AF37" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
                </svg>
              </button>
            </div>
            <div className="app-header-mini-row2">
              <span className="app-header-mini-stat">{stats.visited} / {stats.total}</span>
              <div className="app-header-mini-prog-track">
                <div className="app-header-mini-prog-fill" style={{ width: `${stats.percent}%` }} />
              </div>
            </div>
          </header>

          {/* 탭바 */}
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
            <button
              className={`main-tab-btn ${mainTab === "diary" ? "active" : ""}`}
              onClick={() => setMainTab("diary")}
            >
              📝 방문일기
            </button>
          </nav>

          {mainTab === "map" && (
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
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <label className="filter-visited-label">
                    <input
                      type="checkbox"
                      checked={showVisitedOnly}
                      onChange={(e) => { setShowVisitedOnly(e.target.checked); if (e.target.checked) setShowUnvisitedOnly(false); }}
                      className="filter-visited-check"
                    />
                    <span>완료만 보기</span>
                  </label>
                  <label className="filter-visited-label">
                    <input
                      type="checkbox"
                      checked={showUnvisitedOnly}
                      onChange={(e) => { setShowUnvisitedOnly(e.target.checked); if (e.target.checked) setShowVisitedOnly(false); }}
                      className="filter-visited-check"
                    />
                    <span>미완료만 보기</span>
                  </label>
                </div>
                <span className="filter-count">{filteredTemples.length}곳</span>
              </div>
              <div className="filter-bar-unesco-note">
                <span style={{ color: "#1565C0", fontWeight: "600" }}>파란색 사찰명</span>
                <span>은 유네스코 세계유산</span>
                <span style={{ marginLeft: "10px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "var(--gold)", flexShrink: 0 }} />
                  <span>금색 동그라미는 방문 완료</span>
                </span>
              </div>
          </div>
          )}

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

            {/* 방문일기 탭 */}
            <div className={`tab-panel detail-only ${mainTab === "diary" ? "tab-active" : ""}`}>
              <DiaryTab
                selectedTemple={selectedTemple}
                visited={selectedTemple ? isVisited(selectedTemple.id) : false}
                visitedAt={selectedTemple ? getVisitedAt(selectedTemple.id) : null}
                entries={selectedTemple ? getDiaryEntries(selectedTemple.id) : []}
                onSave={saveDiaryEntry}
                onDelete={deleteDiaryEntry}
                saving={saving}
                user={user}
                loginWithKakao={loginWithKakao}
                onGoToDetail={() => setMainTab("detail")}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
