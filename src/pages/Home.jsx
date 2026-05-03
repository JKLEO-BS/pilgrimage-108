import React from "react";

export default function Home({ visitedCount, totalCount, onStart, onBrowse, onBow, onBowCalendar, user, loginWithKakao, logout }) {
  const percent = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

  return (
    <div className="home-screen">

      {/* 배경 사진 */}
      <div className="home-photo-bg" />

      {/* 상단 타이틀 영역 */}
      <div className="home-top">
        <p className="home-sub">마음의 정화</p>
        <h1 className="home-title">108 사찰 순례</h1>
        <p className="home-en">Pilgrimage 108</p>
      </div>

      {/* 하단 카드 영역 */}
      <div className="home-bottom">

        {/* 순례 현황 */}
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

        {/* 로그인 / 유저 */}
        {user ? (
          <div className="home-user-bar">
            {user.thumbnail && (
              <img src={user.thumbnail} alt="프로필" className="home-user-thumb" />
            )}
            <span className="home-user-name">{user.nickname}님의 순례</span>
            <button className="home-user-logout" onClick={logout}>로그아웃</button>
          </div>
        ) : (
          <button className="home-btn-kakao" onClick={loginWithKakao}>
            카카오로 로그인 / 기록 동기화
          </button>
        )}

        <button className="home-btn-primary" onClick={onStart}>
          순례 시작하기
        </button>
        <button className="home-btn-bow" onClick={onBow}>
          108배 시작하기
        </button>
        <button className="home-btn-secondary" onClick={onBrowse}>
          108 사찰 둘러보기
        </button>

        {/* 통계 */}
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
    </div>
  );
}
