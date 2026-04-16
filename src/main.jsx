import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./pwa.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
/* ══════════════════════════════════════
   새 탭 레이아웃
══════════════════════════════════════ */

.app-container {
  display: flex;
  flex-direction: column;
  height: 100dvh;           /* 모바일 주소창 고려 */
  overflow: hidden;
  background: #EDE5DE;
}

/* 헤더 */
.app-header {
  background: linear-gradient(135deg, #2D4A3E 0%, #1a2e26 100%);
  color: white;
  padding: 12px 16px 10px;
  flex-shrink: 0;
}
.app-header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.app-header-text .header-eyebrow {
  font-size: 11px;
  opacity: 0.7;
  margin: 0 0 2px;
  letter-spacing: 0.05em;
}
.app-header-text .header-title {
  font-size: 20px;
  font-weight: 900;
  margin: 0;
}
.header-badge {
  background: rgba(255,255,255,0.15);
  border-radius: 20px;
  padding: 4px 12px;
  text-align: center;
}
.badge-num {
  font-size: 22px;
  font-weight: 900;
  color: #D4AF37;
}
.badge-label {
  font-size: 13px;
  opacity: 0.8;
}
.header-progress-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-prog-track {
  flex: 1;
  height: 6px;
  background: rgba(255,255,255,0.2);
  border-radius: 3px;
  overflow: hidden;
}
.header-prog-fill {
  height: 100%;
  background: #D4AF37;
  border-radius: 3px;
  transition: width 0.4s ease;
}
.header-prog-pct {
  font-size: 12px;
  opacity: 0.85;
  min-width: 32px;
  text-align: right;
}

/* 탭 바 */
.main-tab-bar {
  display: flex;
  background: #fff;
  border-bottom: 2px solid #E8E0D8;
  flex-shrink: 0;
}
.main-tab-btn {
  flex: 1;
  padding: 11px 0;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #8A7A72;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.02em;
}
.main-tab-btn.active {
  color: #2D4A3E;
  border-bottom: 3px solid #2D4A3E;
  margin-bottom: -2px;
}

/* GPS 상태 바 */
.gps-status-bar {
  background: #FFF8E1;
  border-bottom: 1px solid #FFE082;
  padding: 6px 14px;
  font-size: 12px;
  color: #5A4A3A;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.gps-retry {
  background: #2D4A3E;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 11px;
  cursor: pointer;
}

/* 메인 콘텐츠 */
.main-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}
.tab-panel {
  display: none;
  width: 100%;
  height: 100%;
}
.tab-panel.tab-active {
  display: block;
}

/* 사찰 상세 슬라이드업 */
.detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}
.detail-sheet {
  background: #FDFAF7;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-height: 80dvh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}
.detail-sheet-handle {
  width: 40px;
  height: 4px;
  background: #D8D4C0;
  border-radius: 2px;
  margin: 12px auto 8px;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

/* 지도 오버레이 */
.map-overlay-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #EDE5DE;
  gap: 12px;
  font-family: 'Nanum Gothic', sans-serif;
}

/* 내 위치 버튼 */
.map-my-location-btn {
  position: absolute;
  bottom: 100px;
  right: 12px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: #2D4A3E;
  color: white;
  font-size: 20px;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(0,0,0,0.3);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s;
}
.map-my-location-btn:active {
  transform: scale(0.92);
}

/* 지도 범례 */
.map-legend {
  position: absolute;
  bottom: 30px;
  right: 12px;
  background: rgba(250,250,240,0.92);
  border: 1px solid #D8D4C0;
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 12px;
  z-index: 10;
  font-family: 'Nanum Gothic', sans-serif;
}
.map-legend-item {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #5A4A3A;
}
.map-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}
.map-legend-dot.visited   { background: #D4AF37; }
.map-legend-dot.unvisited { background: #8A8A7A; }
.map-legend-dot.gps       { background: #4A90D9; }
