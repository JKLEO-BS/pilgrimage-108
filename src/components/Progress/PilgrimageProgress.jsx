import React from "react";

/**
 * 순례 진척도 표시 컴포넌트
 * @param {{ visitedCount: number, total: number, visitedUNESCO: number, totalUNESCO: number }} props
 */
export default function PilgrimageProgress({ visitedCount, total, visitedUNESCO, totalUNESCO }) {
  const percent = total > 0 ? Math.round((visitedCount / total) * 100) : 0;

  // 진척도에 따른 단계 메시지
  const getStage = () => {
    if (percent === 0) return { label: "순례를 시작하세요", emoji: "🪷" };
    if (percent < 10) return { label: "첫 발걸음", emoji: "🌱" };
    if (percent < 25) return { label: "구도의 길", emoji: "🛤️" };
    if (percent < 50) return { label: "정진 중", emoji: "🧘" };
    if (percent < 75) return { label: "원력이 깊어지다", emoji: "☸️" };
    if (percent < 100) return { label: "완성을 향해", emoji: "🌕" };
    return { label: "108 순례 완성!", emoji: "🏆" };
  };

  const stage = getStage();

  return (
    <div className="progress-container">
      {/* 상단 수치 */}
      <div className="progress-header">
        <div className="progress-main-count">
          <span className="count-visited">{visitedCount}</span>
          <span className="count-divider"> / </span>
          <span className="count-total">{total}</span>
          <span className="count-unit"> 사찰</span>
        </div>
        <div className="progress-percent">{percent}%</div>
      </div>

      {/* 진척 바 */}
      <div className="progress-bar-bg" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="progress-bar-fill"
          style={{ width: `${percent}%` }}
        />
        {/* 25%, 50%, 75% 마일스톤 마커 */}
        {[25, 50, 75].map((m) => (
          <div
            key={m}
            className={`milestone ${percent >= m ? "reached" : ""}`}
            style={{ left: `${m}%` }}
          />
        ))}
      </div>

      {/* 단계 라벨 */}
      <div className="progress-stage">
        <span className="stage-emoji">{stage.emoji}</span>
        <span className="stage-label">{stage.label}</span>
      </div>

      {/* 유네스코 달성 현황 */}
      <div className="progress-unesco">
        <span className="unesco-label">유네스코 세계유산</span>
        <div className="unesco-dots">
          {Array.from({ length: totalUNESCO }).map((_, i) => (
            <span
              key={i}
              className={`unesco-dot ${i < visitedUNESCO ? "achieved" : ""}`}
              title={i < visitedUNESCO ? "방문 완료" : "미방문"}
            />
          ))}
        </div>
        <span className="unesco-count">{visitedUNESCO}/{totalUNESCO}</span>
      </div>
    </div>
  );
}
