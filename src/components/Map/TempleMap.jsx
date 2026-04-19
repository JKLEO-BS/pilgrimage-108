import React, { useEffect, useRef, useState } from "react";
import { getDistanceInMeters, formatDistance } from "../../utils/distance";

const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;
const geocodeCache = {};

async function getCoordsByAddress(address) {
  if (geocodeCache[address]) return geocodeCache[address];
  return new Promise((resolve) => {
    if (!window.kakao?.maps?.services) { resolve(null); return; }
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result[0]) {
        const coords = { lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) };
        geocodeCache[address] = coords;
        resolve(coords);
      } else {
        resolve(null);
      }
    });
  });
}

function makeMarkerSvg(temple, visited, isSelected) {
  const size = isSelected ? 40 : 30;
  const strokeW = isSelected ? 3 : 2;
  const strokeOpacity = visited ? "1" : "0.5";
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="18" fill="none" stroke="#D4AF37" stroke-width="${strokeW}" stroke-opacity="${strokeOpacity}"/>
    <text x="20" y="27" text-anchor="middle" font-size="${isSelected ? 20 : 15}">🪷</text>
  </svg>`;
}

export default function TempleMap({
  temples, visitedIds, selectedTemple, onSelectTemple, userPosition, regionFilter = "전체",
}) {
  const mapRef = useRef(null);
  const kakaoMapRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const userMarkerRef = useRef(null);
  const prevSelectedIdRef = useRef(null);
  const [mapError, setMapError] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [isSatellite, setIsSatellite] = useState(false);

  useEffect(() => {
    if (!KAKAO_KEY) { setMapError("카카오맵 API 키가 없습니다."); setMapLoading(false); return; }
    const existing = document.getElementById("kakao-map-sdk");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.id = "kakao-map-sdk";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false&libraries=services`;
    script.onload = () => window.kakao?.maps ? window.kakao.maps.load(initMap) : setMapError("SDK 로드 실패");
    script.onerror = () => setMapError("카카오맵 스크립트 로드 오류");
    document.head.appendChild(script);
  }, []);

  function initMap() {
    const container = mapRef.current;
    if (!container) return;
    try {
      const map = new window.kakao.maps.Map(container, {
        center: new window.kakao.maps.LatLng(36.5, 127.8),
        level: 7,
      });
      kakaoMapRef.current = map;
      map.addControl(new window.kakao.maps.ZoomControl(), window.kakao.maps.ControlPosition.RIGHT);
      setMapLoading(false);
      renderMarkers();
    } catch (e) {
      setMapError("지도 초기화 오류: " + e.message);
      setMapLoading(false);
    }
  }

  useEffect(() => {
    if (kakaoMapRef.current) renderMarkers();
  }, [temples, visitedIds, selectedTemple, regionFilter, userPosition]);

  async function renderMarkers() {
    if (!window.kakao || !kakaoMapRef.current) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    if (infoWindowRef.current) infoWindowRef.current.close();

    const visible = regionFilter === "전체"
      ? temples
      : temples.filter((t) => t.region === regionFilter);

    for (const temple of visible) {
      const visited = visitedIds.includes(temple.id);
      const isSelected = selectedTemple?.id === temple.id;

      let lat = temple.lat;
      let lng = temple.lng;
      if (temple.address && (!lat || !lng)) {
        const coords = await getCoordsByAddress(temple.address);
        if (coords) { lat = coords.lat; lng = coords.lng; }
      }
      if (!lat || !lng) continue;

      const size = isSelected ? 40 : 30;
      const svg = makeMarkerSvg(temple, visited, isSelected);

      const marker = new window.kakao.maps.Marker({
        map: kakaoMapRef.current,
        position: new window.kakao.maps.LatLng(lat, lng),
        image: new window.kakao.maps.MarkerImage(
          `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
          new window.kakao.maps.Size(size, size),
          { offset: new window.kakao.maps.Point(size / 2, size / 2) }
        ),
        title: temple.name,
        zIndex: isSelected ? 10 : visited ? 5 : 1,
      });

      window.kakao.maps.event.addListener(marker, "click", () => {
        if (infoWindowRef.current) infoWindowRef.current.close();
        const dist = userPosition
          ? getDistanceInMeters(userPosition.lat, userPosition.lng, lat, lng)
          : null;
        const iw = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:10px 12px;min-width:150px;font-family:'Nanum Gothic',sans-serif;">
            <div style="font-size:11px;color:${visited ? "#708238" : "#8A8A7A"};margin-bottom:3px;">
              ${visited ? "✅ 방문완료" : "○ 미방문"}${temple.UNESCO ? " 🌐" : ""}
            </div>
            <div style="font-size:14px;font-weight:800;color:#2D4A3E;">${temple.name}</div>
            <div style="font-size:11px;color:#8A7A72;">${temple.province}</div>
            ${dist !== null ? `<div style="font-size:11px;color:#1565C0;margin-top:4px;">📡 ${formatDistance(dist)}</div>` : ""}
          </div>`,
          removable: true,
        });
        iw.open(kakaoMapRef.current, marker);
        infoWindowRef.current = iw;
        onSelectTemple(temple);
      });

      markersRef.current.push(marker);
    }

    if (selectedTemple && selectedTemple.id !== prevSelectedIdRef.current) {
      prevSelectedIdRef.current = selectedTemple.id;
      let lat = selectedTemple.lat;
      let lng = selectedTemple.lng;
      if (selectedTemple.address && (!lat || !lng)) {
        const coords = await getCoordsByAddress(selectedTemple.address);
        if (coords) { lat = coords.lat; lng = coords.lng; }
      }
      if (lat && lng) {
        kakaoMapRef.current.panTo(new window.kakao.maps.LatLng(lat, lng));
      }
    }
  }

  useEffect(() => {
    if (!window.kakao || !kakaoMapRef.current || !userPosition) return;
    if (userMarkerRef.current) userMarkerRef.current.setMap(null);
    const svg = `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" fill="#4A90D9" stroke="white" stroke-width="2.5"/>
    </svg>`;
    userMarkerRef.current = new window.kakao.maps.Marker({
      map: kakaoMapRef.current,
      position: new window.kakao.maps.LatLng(userPosition.lat, userPosition.lng),
      image: new window.kakao.maps.MarkerImage(
        `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
        new window.kakao.maps.Size(20, 20),
        { offset: new window.kakao.maps.Point(10, 10) }
      ),
      title: "내 위치",
      zIndex: 20,
    });
  }, [userPosition]);

  const handleGoToMyLocation = () => {
    if (kakaoMapRef.current && userPosition) {
      kakaoMapRef.current.panTo(new window.kakao.maps.LatLng(userPosition.lat, userPosition.lng));
      kakaoMapRef.current.setLevel(4);
    }
  };

  const handleToggleSatellite = () => {
    if (!kakaoMapRef.current || !window.kakao) return;
    if (isSatellite) {
      kakaoMapRef.current.setMapTypeId(window.kakao.maps.MapTypeId.ROADMAP);
    } else {
      kakaoMapRef.current.setMapTypeId(window.kakao.maps.MapTypeId.HYBRID);
    }
    setIsSatellite(!isSatellite);
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

      {mapLoading && (
        <div className="map-overlay-center">
          <div style={{ fontSize: "32px" }}>🗺️</div>
          <div style={{ fontSize: "14px", color: "#8A7A72" }}>지도 불러오는 중...</div>
        </div>
      )}
      {mapError && (
        <div className="map-overlay-center">
          <div style={{ fontSize: "32px" }}>⚠️</div>
          <div style={{ fontSize: "13px", color: "#A45A52" }}>{mapError}</div>
        </div>
      )}

      {!mapLoading && !mapError && (
        <>
          {/* 위성지도 토글 버튼 — 좌측 상단 */}
          <button
            onClick={handleToggleSatellite}
            style={{
              position: "absolute", top: "10px", left: "10px",
              background: isSatellite ? "#2D4A3E" : "rgba(250,250,240,0.92)",
              color: isSatellite ? "#D4AF37" : "#2D4A3E",
              border: "1px solid #D8D4C0",
              borderRadius: "6px", padding: "5px 10px",
              fontSize: "11px", fontWeight: "600",
              cursor: "pointer", zIndex: 10,
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}
          >
            {isSatellite ? "🛰️ 위성" : "🗺️ 일반"}
          </button>

          {/* 홈 버튼 — 우측 상단 */}
          <button
            onClick={() => { window.location.href = "/"; }}
            title="홈으로"
            style={{
              position: "absolute", top: "10px", right: "10px",
              width: "36px", height: "36px",
              background: "rgba(22, 38, 28, 0.82)",
              border: "1px solid rgba(212, 175, 55, 0.35)",
              borderRadius: "8px",
              cursor: "pointer", zIndex: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(4px)",
              transition: "background 0.18s, border-color 0.18s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(45, 74, 62, 0.95)";
              e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.7)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(22, 38, 28, 0.82)";
              e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.35)";
            }}
          >
            {/* 심플 홈 아이콘 SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 10.5L12 3L21 10.5V21H15V15H9V21H3V10.5Z"
                stroke="#D4AF37" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
            </svg>
          </button>

          {/* 내 위치 버튼 */}
          {userPosition && (
            <button className="map-my-location-btn" onClick={handleGoToMyLocation} title="내 위치로 이동">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="white"/>
                <circle cx="12" cy="12" r="6" stroke="#2D4A3E" strokeWidth="2" fill="none"/>
                <circle cx="12" cy="12" r="1.5" fill="#2D4A3E"/>
                <line x1="12" y1="2" x2="12" y2="5.5" stroke="#2D4A3E" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="18.5" x2="12" y2="22" stroke="#2D4A3E" strokeWidth="2" strokeLinecap="round"/>
                <line x1="2" y1="12" x2="5.5" y2="12" stroke="#2D4A3E" strokeWidth="2" strokeLinecap="round"/>
                <line x1="18.5" y1="12" x2="22" y2="12" stroke="#2D4A3E" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}

          {/* 범례 */}
          <div className="map-legend">
            <div className="map-legend-item">
              <span className="map-legend-dot visited" />방문 완료
            </div>
            <div className="map-legend-item">
              <span className="map-legend-dot unvisited" />미방문
            </div>
            {userPosition && (
              <div className="map-legend-item">
                <span className="map-legend-dot gps" />내 위치
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
