import React, { useState } from "react";
import { REGIONS } from "../../data/temples";

/**
 * 사찰 목록 + 지역 필터 컴포넌트
 */
export default function TempleList({
  temples,
  visitedIds,
  selectedTemple,
  onSelectTemple,
  onRegionChange,
  regionFilter,
}) {
  const [showVisitedOnly, setShowVisitedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = temples.filter((t) => {
    const matchRegion = regionFilter === "전체" || t.region === regionFilter;
    const matchVisited = !showVisitedOnly || visitedIds.includes(t.id);
    const matchSearch =
      !searchQuery ||
      t.name.includes(searchQuery) ||
      t.province.includes(searchQuery) ||
      t.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchRegion && matchVisited && matchSearch;
  });

  return (
    <div className="temple-list-container">
      {/* 검색창 */}
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="사찰 이름 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button className="search-clear" onClick={() => setSearchQuery("")}>✕</button>
        )}
      </div>

      {/* 지역 필터 탭 */}
      <div className="region-tabs">
        {REGIONS.map((r) => (
          <button
            key={r}
            className={`region-tab ${regionFilter === r ? "active" : ""}`}
            onClick={() => onRegionChange(r)}
          >
            {r}
          </button>
        ))}
      </div>

      {/* 방문 완료만 보기 토글 */}
      <div className="filter-toggle">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={showVisitedOnly}
            onChange={(e) => setShowVisitedOnly(e.target.checked)}
            className="toggle-checkbox"
          />
          <span className="toggle-text">방문 완료만 보기</span>
        </label>
        <span className="list-count">{filtered.length}곳</span>
      </div>

      {/* 사찰 목록 */}
      <div className="temple-list">
        {filtered.length === 0 ? (
          <div className="list-empty">검색 결과가 없습니다</div>
        ) : (
          filtered.map((temple) => {
            const isVisited = visitedIds.includes(temple.id);
            const isSelected = selectedTemple?.id === temple.id;

            return (
              <button
                key={temple.id}
                className={`temple-list-item ${isVisited ? "visited" : ""} ${isSelected ? "selected" : ""}`}
                onClick={() => onSelectTemple(temple)}
              >
                <span className="item-index">
                  {String(temple.id).padStart(3, "0")}
                </span>
                <div className="item-info">
                  <span className="item-name">{temple.name}</span>
                  <span className="item-region">{temple.province.replace("특별자치도", "").replace("특별시", "").replace("광역시", "")}</span>
                </div>
                <div className="item-right">
                  {temple.UNESCO && <span className="item-unesco" title="유네스코 세계유산">🌐</span>}
                  <span className={`item-dot ${isVisited ? "gold" : "gray"}`} />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
