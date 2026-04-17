import React, { useState } from "react";
import temples, { getStats, REGIONS } from "./data/temples";
import { useAuth } from "./hooks/useAuth";
import { useVisitedTemples } from "./hooks/useVisitedTemples";
import { useGeolocation } from "./hooks/useGeolocation";
import { useOfflineStatus } from "./hooks/useOfflineStatus";
import TempleMap from "./components/Map/TempleMap";
import TempleList from "./components/Sidebar/TempleList";
import TempleDetail from "./components/Sidebar/TempleDetail";
import InstallPrompt from "./components/UI/InstallPrompt";
import Home from "./pages/Home";

export default function App() {
  const { user, loading: authLoading, loginWithKakao, logout } = useAuth();
  const { visitedIds, markVisited, unmarkVisited, isVisited, getVisitedAt } =
    useVisitedTemples(user?.id);
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
              className={`main-tab-btn ${mainTab === "map" ?
