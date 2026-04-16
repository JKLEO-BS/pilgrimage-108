import React, { useState } from "react";
import { formatDistance, isWithinRadius, getDistanceInMeters } from "../../utils/distance";
import { useTourApi } from "../../hooks/useTourApi";

export default function TempleDetail({
  temple, visited, visitedAt, userPosition, onVisit, onUnvisit, onClose,
}) {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);

  const { photo, photos, detail, loading: apiLoading } = useTourApi(
    temple?.name, temple?.contentId || null
  );

  if (!temple) return null;

  const withinRange = isWithinRadius(userPosition?.lat, userPosition?.lng, temple, 500);
  const distanceMeters = userPosition
    ? getDistanceInMeters(userPosition.lat, userPosition.lng, temple.lat, temple.lng)
    : null;
  const formattedDate = visitedAt
    ? new Date(visitedAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
    : null;

  // 사진 목록 — API 대표 사진 + 추가 사진
  const allPhotos = [photo, ...photos].filter(Boolean);

  // 설명 — API 설명 우선, 없으면 기본 설명
  const rawOverview = detail?.overview
    ? detail.overview.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim()
    : temple.description;
  const shortDesc = rawOverview.slice(0, 120);
  const hasMore = rawOverview.length > 120;

  return (
    <div className="detail-panel">
      <button className="detail-close" onClick={onClose} aria-label="닫기">✕</button>

      {/* ── 사진 영역 ── */}
      {apiLoading && (
        <div className="detail-photo-skeleton">🖼️ 사진 불러오는 중...</div>
      )}
      {!apiLoading && allPhotos.length > 0 && (
        <div className="detail-photo-wrap">
          <img
            src={allPhotos[currentPhoto]}
            alt={temple.name}
            className="detail-photo"
            onError={(e) => { e.target.style.display = "none"; }}
          />
          {allPhotos.length > 1 && (
            <div className="detail-photo-thumbs">
              {allPhotos.map((url, i) => (
                <button
                  key={i}
                  className={`thumb-btn ${i === currentPhoto ? "active" : ""}`}
                  onClick={() => setCurrentPhoto(i)}
                >
                  <img src={url} alt={`사진 ${i + 1}`}
                    onError={(e) => { e.target.parentElement.style.display = "none"; }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 방문 상태 ── */}
      <div className="detail-status-row">
        <span className={`detail-status-badge ${visited ? "visited" : "unvisited"}`}>
          {visited ? "🪷 방문 완료" : "○ 미방문"}
        </span>
        {temple.UNESCO && <span className="detail-unesco">🌐 유네스코 세계유산</span>}
      </div>

      <h2 className="detail-name">{temple.name}</h2>
      <p className="detail-name-en">{temple.nameEn}</p>

      {/* ── 기본 정보 ── */}
      <div className="detail-info-grid">
        <InfoRow icon="📍" label="위치" value={detail?.addr1 || temple.address} />
        <InfoRow icon="🏛️" label="종파" value={temple.sect} />
        <InfoRow icon="📅" label="창건" value={temple.founded} />
        {detail?.tel && <InfoRow icon="📞" label="전화" value={detail.tel} />}
        {detail?.homepage && (
          <InfoRow icon="🌐" label="홈페이지"
            value={
              <a
                href={detail.homepage.replace(/<[^>]*>/g, "").replace(/\s/g, "").split("<")[0]}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#2D4A3E", fontSize: "11px", textDecoration: "underline" }}
              >
                바로가기 →
              </a>
            }
          />
        )}
      </div>

      {/* ── 상세 설명 ── */}
      <p className="detail-description">
        {showFullDesc ? rawOverview : shortDesc}
        {hasMore && !showFullDesc && "..."}
      </p>
      {hasMore && (
        <button
          className="detail-more-btn"
          onClick={() => setShowFullDesc((v) => !v)}
        >
          {showFullDesc ? "접기 ▲" : "더보기 ▼"}
        </button>
      )}

      {visited && formattedDate && (
        <p className="detail-visit-date">방문일: {formattedDate}</p>
      )}

      {/* ── GPS 거리 ── */}
      {userPosition ? (
        <p className={`detail-distance ${withinRange ? "in-range" : ""}`}>
          {withinRange
            ? `✅ 인증 가능 반경(500m) 내에 있습니다`
            : `📡 현재 위치에서 ${formatDistance(distanceMeters)} 거리`}
        </p>
      ) : (
        <p className="detail-distance no-gps">📡 GPS 위치 정보 없음</p>
      )}

      {/* ── 방문 인증 ── */}
      <div className="detail-actions">
        {!visited ? (
          <button
            className={`btn-visit ${withinRange ? "enabled" : "disabled"}`}
            onClick={() => withinRange && onVisit(temple.id)}
            disabled={!withinRange}
          >
            {withinRange ? "🪷 방문 인증하기" : "🔒 거리 미달 (500m 이내)"}
          </button>
        ) : (
          <button className="btn-unvisit" onClick={() => onUnvisit(temple.id)}>
            방문 취소
          </button>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="info-row">
      <span className="info-icon">{icon}</span>
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  );
}
