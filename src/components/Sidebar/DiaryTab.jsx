import React, { useState } from "react";

function formatDate(isoString) {
  const d = new Date(isoString);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function DiaryTab({
  selectedTemple,
  visited,
  visitedAt,
  entries,
  onSave,
  onDelete,
  saving,
  user,
  loginWithKakao,
  onGoToDetail,
}) {
  const [text, setText] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // 사찰 미선택
  if (!selectedTemple) {
    return (
      <div className="diary-empty-state">
        <div className="diary-empty-icon">🗺️</div>
        <p className="diary-empty-title">사찰을 선택해주세요</p>
        <p className="diary-empty-desc">
          지도·목록 탭에서 사찰을 선택하면<br />방문 일기를 작성할 수 있습니다
        </p>
      </div>
    );
  }

  // 미방문 사찰
  if (!visited) {
    return (
      <div className="diary-panel">
        <div className="diary-temple-header">
          <div className="diary-temple-name">{selectedTemple.name}</div>
          <div className="diary-temple-meta">{selectedTemple.province}</div>
        </div>
        <div className="diary-locked">
          <div className="diary-locked-icon">🔒</div>
          <p className="diary-locked-title">방문 인증 후 작성 가능</p>
          <p className="diary-locked-desc">
            사찰을 직접 방문하고<br />방문 인증을 완료하면<br />일기를 작성할 수 있습니다
          </p>
          <button className="diary-go-detail-btn" onClick={onGoToDetail}>
            사찰정보에서 방문 인증 →
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!text.trim()) return;
    await onSave(selectedTemple.id, text);
    setText("");
  };

  return (
    <div className="diary-panel">

      {/* 사찰 헤더 */}
      <div className="diary-temple-header">
        <div className="diary-temple-name">{selectedTemple.name}</div>
        <div className="diary-temple-meta">
          {selectedTemple.province}
          <span className="diary-visited-badge">✅ 방문완료</span>
          {visitedAt && (
            <span className="diary-visit-date">방문일 {formatDate(visitedAt)}</span>
          )}
        </div>
      </div>

      {/* 비로그인 안내 (작성은 가능, 저장은 로컬) */}
      {!user && (
        <div className="diary-login-notice">
          <span>💡 로그인하면 기기 간 동기화됩니다</span>
          <button className="diary-login-btn" onClick={loginWithKakao}>
            카카오 로그인
          </button>
        </div>
      )}

      {/* 일기 작성 */}
      <div className="diary-write-section">
        <div className="diary-write-label">✍️ 오늘의 순례 기록</div>
        <textarea
          className="diary-textarea"
          placeholder="이곳에서 느낀 점을 자유롭게 기록하세요..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          maxLength={1000}
        />
        <div className="diary-write-footer">
          <span className="diary-char-count">{text.length} / 1000</span>
          <button
            className={`diary-save-btn ${!text.trim() || saving ? "disabled" : ""}`}
            onClick={handleSave}
            disabled={!text.trim() || saving}
          >
            {saving ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </div>

      {/* 이전 기록 */}
      {entries.length > 0 && (
        <div className="diary-entries-section">
          <div className="diary-entries-label">📋 이전 기록 ({entries.length})</div>
          <div className="diary-entries-list">
            {entries.map((entry) => (
              <div key={entry.id} className="diary-entry-card">
                <div className="diary-entry-header">
                  <span className="diary-entry-date">{formatDate(entry.date)}</span>
                  {deleteConfirmId === entry.id ? (
                    <div className="diary-delete-confirm">
                      <span>삭제할까요?</span>
                      <button
                        className="diary-delete-yes"
                        onClick={() => {
                          onDelete(selectedTemple.id, entry.id);
                          setDeleteConfirmId(null);
                        }}
                      >확인</button>
                      <button
                        className="diary-delete-no"
                        onClick={() => setDeleteConfirmId(null)}
                      >취소</button>
                    </div>
                  ) : (
                    <button
                      className="diary-entry-delete"
                      onClick={() => setDeleteConfirmId(entry.id)}
                    >✕</button>
                  )}
                </div>
                <p className="diary-entry-text">{entry.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="diary-no-entries">
          아직 작성된 기록이 없습니다.<br />첫 번째 순례 일기를 남겨보세요 🪷
        </div>
      )}
    </div>
  );
}
