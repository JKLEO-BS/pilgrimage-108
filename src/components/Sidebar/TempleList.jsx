import React from "react";

export default function TempleList({
  temples,
  visitedIds,
  selectedTemple,
  onSelectTemple,
}) {
  return (
    <div className="temple-list-container">
      {temples.length === 0 ? (
        <div className="list-empty">검색 결과가 없습니다</div>
      ) : (
        <div className="temple-list">
          {temples.map((temple) => {
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
                  <span className="item-region">
                    {temple.province
                      .replace("특별자치도", "")
                      .replace("특별시", "")
                      .replace("광역시", "")}
                  </span>
                </div>
                <div className="item-right">
                  {temple.UNESCO && (
                    <span className="item-unesco" title="유네스코 세계유산">🌐</span>
                  )}
                  <span className={`item-dot ${isVisited ? "gold" : "gray"}`} />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
