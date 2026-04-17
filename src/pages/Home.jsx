import React from "react";

const LOTUS_SVG = `
<svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
  <circle cx="90" cy="90" r="84" fill="none" stroke="#D4AF37" stroke-width="0.5" stroke-opacity="0.25" stroke-dasharray="2 4"/>
  <circle cx="90" cy="90" r="76" fill="none" stroke="#D4AF37" stroke-width="0.3" stroke-opacity="0.15"/>
  <g transform="translate(90,90)">
    <line x1="0" y1="-84" x2="0" y2="-72" stroke="#D4AF37" stroke-width="0.8" stroke-opacity="0.4"/>
    <line x1="0" y1="72" x2="0" y2="84" stroke="#D4AF37" stroke-width="0.8" stroke-opacity="0.4"/>
    <line x1="-84" y1="0" x2="-72" y2="0" stroke="#D4AF37" stroke-width="0.8" stroke-opacity="0.4"/>
    <line x1="72" y1="0" x2="84" y2="0" stroke="#D4AF37" stroke-width="0.8" stroke-opacity="0.4"/>
    <line x1="-59" y1="-59" x2="-51" y2="-51" stroke="#D4AF37" stroke-width="0.8" stroke-opacity="0.3"/>
    <line x1="51" y1="-51" x2="59" y2="-59" stroke="#D4AF37" stroke-width="0.8" stroke-opacity="0.3"/>
    <line x1="-59" y1="59" x2="-51" y2="51" stroke="#D4AF37" stroke-width="0.8" stroke-opacity="0.3"/>
    <line x1="51" y1="51" x2="59" y2="59" stroke="#D4AF37" stroke-width="0.8" stroke-opacity="0.3"/>
    <circle cx="0" cy="-84" r="1.5" fill="#D4AF37" opacity="0.5"/>
    <circle cx="0" cy="84" r="1.5" fill="#D4AF37" opacity="0.5"/>
    <circle cx="-84" cy="0" r="1.5" fill="#D4AF37" opacity="0.5"/>
    <circle cx="84" cy="0" r="1.5" fill="#D4AF37" opacity="0.5"/>
  </g>
  <g transform="translate(90,90)">
    <ellipse cx="0" cy="-38" rx="5" ry="16" fill="#C4687A" opacity="0.6" transform="rotate(0)"/>
    <ellipse cx="0" cy="-38" rx="5" ry="16" fill="#C4687A" opacity="0.6" transform="rotate(36)"/>
    <ellipse cx="0" cy="-38" rx="5" ry="16" fill="#C4687A" opacity="0.6" transform="rotate(72)"/>
    <ellipse cx="0" cy="-38" rx="5" ry="16" fill="#C4687A" opacity="0.6" transform="rotate(108)"/>
    <ellipse cx="0" cy="-38" rx="5" ry="16" fill="#C4687A" opacity="0.6" transform="rotate(144)"/>
    <ellipse cx="0" cy="-38" rx="5" ry="16" fill="#C4687A" opacity="0.6" transform="rotate(180)"/>
    <ellipse cx="0" cy="-38" rx="5" ry="16" fill="#C4687A" opacity="0.6" transform="rotate(216)"/>
    <ellipse cx="0" cy="-38" rx="5" ry="16" fill="#C4687A" opacity="0.6" transform="rotate(252)"/>
    <ellipse cx="0" cy="-38" rx="5" ry="16" fill="#C4687A" opacity="0.6" transform="rotate(288)"/>
    <ellipse cx="0" cy="-38" rx="5" ry="16" fill="#C4687A" opacity="0.6" transform="rotate(324)"/>
  </g>
  <g transform="translate(90,90)">
    <ellipse cx="0" cy="-26" rx="9" ry="28" fill="#D4849A" opacity="0.85" transform="rotate(0)"/>
    <ellipse cx="0" cy="-26" rx="9" ry="28" fill="#E8A0B4" opacity="0.85" transform="rotate(36)"/>
    <ellipse cx="0" cy="-26" rx="9" ry="28" fill="#D4849A" opacity="0.85" transform="rotate(72)"/>
    <ellipse cx="0" cy="-26" rx="9" ry="28" fill="#E8A0B4" opacity="0.85" transform="rotate(108)"/>
    <ellipse cx="0" cy="-26" rx="9" ry="28" fill="#D4849A" opacity="0.85" transform="rotate(144)"/>
    <ellipse cx="0" cy="-26" rx="9" ry="28" fill="#E8A0B4" opacity="0.85" transform="rotate(180)"/>
    <ellipse cx="0" cy="-26" rx="9" ry="28" fill="#D4849A" opacity="0.85" transform="rotate(216)"/>
    <ellipse cx="0" cy="-26" rx="9" ry="28" fill="#E8A0B4" opacity="0.85" transform="rotate(252)"/>
    <ellipse cx="0" cy="-26" rx="9" ry="28" fill="#D4849A" opacity="0.85" transform="rotate(288)"/>
    <ellipse cx="0" cy="-26" rx="9" ry="28" fill="#E8A0B4" opacity="0.85" transform="rotate(324)"/>
  </g>
  <g transform="translate(90,90)">
    <ellipse cx="0" cy="-20" rx="10" ry="30" fill="#F0B8C8" opacity="0.92" transform="rotate(18)"/>
    <ellipse cx="0" cy="-20" rx="10" ry="30" fill="#F8D0DC" opacity="0.92" transform="rotate(54)"/>
    <ellipse cx="0" cy="-20" rx="10" ry="30" fill="#F0B8C8" opacity="0.92" transform="rotate(90)"/>
    <ellipse cx="0" cy="-20" rx="10" ry="30" fill="#F8D0DC" opacity="0.92" transform="rotate(126)"/>
    <ellipse cx="0" cy="-20" rx="10" ry="30" fill="#F0B8C8" opacity="0.92" transform="rotate(162)"/>
    <ellipse cx="0" cy="-20" rx="10" ry="30" fill="#F8D0DC" opacity="0.92" transform="rotate(198)"/>
    <ellipse cx="0" cy="-20" rx="10" ry="30" fill="#F0B8C8" opacity="0.92" transform="rotate(234)"/>
    <ellipse cx="0" cy="-20" rx="10" ry="30" fill="#F8D0DC" opacity="0.92" transform="rotate(270)"/>
    <ellipse cx="0" cy="-20" rx="10" ry="30" fill="#F0B8C8" opacity="0.92" transform="rotate(306)"/>
    <ellipse cx="0" cy="-20" rx="10" ry="30" fill="#F8D0DC" opacity="0.92" transform="rotate(342)"/>
  </g>
  <g transform="translate(90,90)">
    <circle cx="0" cy="0" r="18" fill="#1c3828"/>
    <circle cx="0" cy="0" r="16" fill="none" stroke="#D4AF37" stroke-width="1" stroke-opacity="0.6"/>
    <circle cx="0" cy="0" r="11" fill="#C4687A" opacity="0.9"/>
    <circle cx="0" cy="0" r="7" fill="#F8D0DC"/>
    <circle cx="0" cy="0" r="3.5" fill="#D4AF37"/>
  </g>
</svg>
`;

export default function Home({ visitedCount, totalCount, onStart, onBrowse }) {
  const percent = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

  return (
    <div className="home-screen">
      <div className="home-bg-glow" />
      <div className="home-content">

        <div className="home-lotus" dangerouslySetInnerHTML={{ __html: LOTUS_SVG }} />

        <p className="home-sub">마음의 정화</p>
        <h1 className="home-title">108 사찰 순례</h1>
        <p className="home-en">Pilgrimage 108</p>

        <div className="home-progress-card">
          <div className="home-progress-top">
            <span className="home-progress-label">나의 순례 현황</span>
            <span className="home-progress-count">{visitedCount} / {totalCount}</span>
          </div>
          <div className="home-progress-track">
            <div className="home-progress-fill" style={{ width: `${percent}%` }} />
          </div>
          <div className="home-progress-pct">{percent}% 완료</div>
        </div>

        <button className="home-btn-primary" onClick={onStart}>
          순례 시작하기
        </button>
        <button className="home-btn-secondary" onClick={onBrowse}>
          108 사찰 둘러보기
        </button>
      </div>

      <div className="home-stats">
        <div className="home-stat-item">
          <span className="home-stat-num">108</span>
          <span className="home-stat-label">전체 사찰</span>
        </div>
        <div className="home-stat-divider" />
        <div className="home-stat-item">
          <span className="home-stat-num">16</span>
          <span className="home-stat-label">유네스코</span>
        </div>
        <div className="home-stat-divider" />
        <div className="home-stat-item">
          <span className="home-stat-num">8</span>
          <span className="home-stat-label">개 지역</span>
        </div>
      </div>
    </div>
  );
}
