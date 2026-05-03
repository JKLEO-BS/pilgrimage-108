import React, { useState, useEffect, useRef } from "react";

const TOTAL = 108;

// 세련된 골드 라인아트 연꽃 SVG
function LotusIcon({ size = 260, pulsing = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 260 260"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: "drop-shadow(0 0 18px rgba(212,175,55,0.35))",
        transition: "transform 0.08s ease, filter 0.08s ease",
        transform: pulsing ? "scale(0.93)" : "scale(1)",
      }}
    >
      {/* 외부 원 */}
      <circle cx="130" cy="130" r="120" fill="none" stroke="rgba(212,175,55,0.12)" strokeWidth="0.8"/>
      <circle cx="130" cy="130" r="108" fill="none" stroke="rgba(212,175,55,0.18)" strokeWidth="0.5" strokeDasharray="3 5"/>

      {/* 꽃잎 — 바깥 레이어 */}
      {[0,36,72,108,144,180,216,252,288,324].map((deg, i) => (
        <ellipse
          key={`outer-${i}`}
          cx="130" cy="68"
          rx="7" ry="28"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="0.9"
          strokeOpacity="0.45"
          transform={`rotate(${deg} 130 130)`}
        />
      ))}

      {/* 꽃잎 — 중간 레이어 */}
      {[18,54,90,126,162,198,234,270,306,342].map((deg, i) => (
        <ellipse
          key={`mid-${i}`}
          cx="130" cy="74"
          rx="9" ry="34"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1.1"
          strokeOpacity="0.65"
          transform={`rotate(${deg} 130 130)`}
        />
      ))}

      {/* 꽃잎 — 안쪽 레이어 */}
      {[0,36,72,108,144,180,216,252,288,324].map((deg, i) => (
        <ellipse
          key={`inner-${i}`}
          cx="130" cy="84"
          rx="10" ry="36"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1.3"
          strokeOpacity="0.85"
          transform={`rotate(${deg} 130 130)`}
        />
      ))}

      {/* 중앙 원 */}
      <circle cx="130" cy="130" r="26" fill="none" stroke="#D4AF37" strokeWidth="1.2" strokeOpacity="0.9"/>
      <circle cx="130" cy="130" r="18" fill="none" stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.6"/>
      <circle cx="130" cy="130" r="8" fill="rgba(212,175,55,0.25)" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.9"/>

      {/* 십자 가이드 라인 */}
      <line x1="130" y1="10" x2="130" y2="22" stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.4"/>
      <line x1="130" y1="238" x2="130" y2="250" stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.4"/>
      <line x1="10" y1="130" x2="22" y2="130" stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.4"/>
      <line x1="238" y1="130" x2="250" y2="130" stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.4"/>
    </svg>
  );
}

export default function BowScreen({ onExit, getTodayRecord, saveCount, saving, onCalendar }) {
  const todayRecord = getTodayRecord();
  const [count, setCount] = useState(todayRecord.count || 0);
  const [pulsing, setPulsing] = useState(false);
  const [completed, setCompleted] = useState(todayRecord.completed || false);
  const [showComplete, setShowComplete] = useState(false);
  const saveTimer = useRef(null);

  // 자동 저장 (1초 디바운스)
  const scheduleSave = (newCount) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveCount(newCount);
    }, 1000);
  };

  const handleTouch = () => {
    if (completed) return;
    const newCount = count + 1;
    setCount(newCount);
    setPulsing(true);
    setTimeout(() => setPulsing(false), 80);
    scheduleSave(newCount);

    if (newCount >= TOTAL) {
      setCompleted(true);
      setShowComplete(true);
      saveCount(newCount);
    }
  };

  const handleExit = async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await saveCount(count);
    onExit();
  };

  const percent = Math.round((count / TOTAL) * 100);

  return (
    <div className="bow-screen">

      {/* 헤더 */}
      <div className="bow-header">
        <button className="bow-exit-btn" onClick={handleExit}>✕ 나가기</button>
        <span className="bow-header-title">108배 수행</span>
        <div style={{ width: 60 }} />
      </div>

      {/* 카운트 표시 */}
      <div className="bow-count-area">
        <div className="bow-count-num">{count}</div>
        <div className="bow-count-label">/ {TOTAL} 배</div>
      </div>

      {/* 연꽃 터치 영역 */}
      <div
        className="bow-lotus-wrap"
        onPointerDown={handleTouch}
      >
        <LotusIcon size={260} pulsing={pulsing} />
        {!completed && (
          <p className="bow-touch-hint">연꽃을 터치하세요</p>
        )}
        {completed && (
          <p className="bow-touch-hint" style={{ color: "#D4AF37" }}>오늘 108배 완료 🙏</p>
        )}
      </div>

      {/* 진행 바 */}
      <div className="bow-progress-area">
        <div className="bow-progress-track">
          <div className="bow-progress-fill" style={{ width: `${percent}%` }} />
        </div>
        <div className="bow-progress-pct">{percent}%</div>
      </div>

      {/* 기록 확인 버튼 */}
      <button className="bow-cal-link" onClick={onCalendar}>
        나의 108배 기록 확인하기
      </button>

      {/* 완료 팝업 */}
      {showComplete && (
        <div className="bow-complete-overlay">
          <div className="bow-complete-card">
            <div className="bow-complete-icon">🙏</div>
            <h2 className="bow-complete-title">108배 완료</h2>
            <p className="bow-complete-desc">오늘의 수행을 마쳤습니다.<br />수고하셨습니다.</p>
            <button className="bow-complete-btn" onClick={() => { setShowComplete(false); onExit(); }}>
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
