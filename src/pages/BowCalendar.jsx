import React, { useState } from "react";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function dateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function BowCalendar({ records, onBack }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // 이번 달 완료/미완료 집계
  const monthCompleted = Object.values(records).filter(r => {
    const d = new Date(r.date);
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth && r.completed;
  }).length;

  const totalCompleted = Object.values(records).filter(r => r.completed).length;

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bow-calendar-screen">

      {/* 헤더 */}
      <div className="bow-cal-header">
        <button className="bow-cal-back" onClick={onBack}>← 뒤로</button>
        <span className="bow-cal-title">나의 108배 기록</span>
        <div style={{ width: 60 }} />
      </div>

      {/* 월 통계 */}
      <div className="bow-cal-stats">
        <div className="bow-cal-stat">
          <span className="bow-cal-stat-num">{totalCompleted}</span>
          <span className="bow-cal-stat-label">총 완료</span>
        </div>
        <div className="bow-cal-stat-div" />
        <div className="bow-cal-stat">
          <span className="bow-cal-stat-num">{monthCompleted}</span>
          <span className="bow-cal-stat-label">이번 달</span>
        </div>
      </div>

      {/* 달력 네비 */}
      <div className="bow-cal-nav">
        <button className="bow-cal-nav-btn" onClick={prevMonth}>‹</button>
        <span className="bow-cal-nav-title">{viewYear}년 {MONTHS[viewMonth]}</span>
        <button className="bow-cal-nav-btn" onClick={nextMonth}>›</button>
      </div>

      {/* 요일 헤더 */}
      <div className="bow-cal-grid">
        {DAYS.map(d => (
          <div key={d} className="bow-cal-day-label" style={{ color: d === "일" ? "rgba(212,100,100,0.7)" : d === "토" ? "rgba(100,140,212,0.7)" : "rgba(255,255,255,0.3)" }}>
            {d}
          </div>
        ))}

        {/* 날짜 셀 */}
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;

          const ds = dateStr(viewYear, viewMonth, day);
          const rec = records[ds];
          const isCompleted = rec?.completed;
          const isPartial = rec && !rec.completed && rec.count > 0;
          const isToday = ds === `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

          return (
            <div key={day} className={`bow-cal-cell ${isToday ? "today" : ""}`}>
              <span className="bow-cal-date" style={{
                color: isToday ? "#D4AF37" : "rgba(255,255,255,0.6)",
                fontWeight: isToday ? "700" : "400",
              }}>
                {day}
              </span>

              {/* 완료 — 골드 연꽃 */}
              {isCompleted && (
                <svg width="22" height="22" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                  {[0,36,72,108,144,180,216,252,288,324].map((deg, i) => (
                    <ellipse key={i} cx="20" cy="10" rx="2.5" ry="8"
                      fill="none" stroke="#D4AF37" strokeWidth="0.9"
                      transform={`rotate(${deg} 20 20)`}/>
                  ))}
                  <circle cx="20" cy="20" r="4" fill="rgba(212,175,55,0.3)" stroke="#D4AF37" strokeWidth="0.9"/>
                </svg>
              )}

              {/* 미완료 — 흐린 연꽃 */}
              {isPartial && (
                <div style={{ position: "relative" }}>
                  <svg width="22" height="22" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.3 }}>
                    {[0,36,72,108,144,180,216,252,288,324].map((deg, i) => (
                      <ellipse key={i} cx="20" cy="10" rx="2.5" ry="8"
                        fill="none" stroke="#D4AF37" strokeWidth="0.9"
                        transform={`rotate(${deg} 20 20)`}/>
                    ))}
                    <circle cx="20" cy="20" r="4" fill="none" stroke="#D4AF37" strokeWidth="0.9"/>
                  </svg>
                  <span style={{ position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)", fontSize: "8px", color: "rgba(212,175,55,0.4)", whiteSpace: "nowrap" }}>
                    {rec.count}배
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="bow-cal-legend">
        <div className="bow-cal-legend-item">
          <svg width="14" height="14" viewBox="0 0 40 40">
            {[0,36,72,108,144,180,216,252,288,324].map((deg, i) => (
              <ellipse key={i} cx="20" cy="10" rx="2.5" ry="8" fill="none" stroke="#D4AF37" strokeWidth="1.2" transform={`rotate(${deg} 20 20)`}/>
            ))}
            <circle cx="20" cy="20" r="4" fill="rgba(212,175,55,0.3)" stroke="#D4AF37" strokeWidth="1"/>
          </svg>
          <span>108배 완료</span>
        </div>
        <div className="bow-cal-legend-item">
          <svg width="14" height="14" viewBox="0 0 40 40" style={{ opacity: 0.35 }}>
            {[0,36,72,108,144,180,216,252,288,324].map((deg, i) => (
              <ellipse key={i} cx="20" cy="10" rx="2.5" ry="8" fill="none" stroke="#D4AF37" strokeWidth="1.2" transform={`rotate(${deg} 20 20)`}/>
            ))}
            <circle cx="20" cy="20" r="4" fill="none" stroke="#D4AF37" strokeWidth="1"/>
          </svg>
          <span>수행 중단</span>
        </div>
      </div>
    </div>
  );
}
