import React, { useEffect, useRef, useState } from "react";
import { getDistanceInMeters, formatDistance } from "../../utils/distance";

const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

// 주소 → 좌표 변환 캐시
const geocodeCache = {};

async function getCoordsByAddress(address) {
  if (geocodeCache[address]) return geocodeCache[address];
  return new Promise((resolve) => {
    if (!window.kakao?.maps?.services) { resolve(null); return; }
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result[0]) {
        const coords = {
          lat: parseFloat(result[0].y),
          lng: parseFloat(result[0].x),
        };
        geocodeCache[address] = coords;
        resolve(coords);
      } else {
        resolve(null);
      }
    });
  });
}

export default function TempleMap({
  temples, visitedIds, selectedTemple, onSelectTemple, userPosition, regionFilter = "전체",
}) {
  const mapRef = useRef(null);
  const kakaoMapRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const userMarkerRef = useRef(null);
  const [mapError, setMapError] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);

  // SDK 로드
  useEffect(() => {
    if (!KAKAO_KEY) { setMapError("카카오맵 API 키가 없습니다."); setMapLoading(false); return; }

    function init() {
      if (window.kakao?.maps) { window.kakao.maps.load(initMap); return; }
      const script = document.createElement("script");
      script.id = "kakao-map-sdk";
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false&libraries=services`;
      script.onload = () => window.kakao?.maps ? window.kakao.maps.load(initMap) : setMapError("SDK 로드 실패");
      script.onerror = () => setMapError("카카오맵 스크립트 로드 오류");
      document.head.appendChild(script);
    }

    const existing = document.getElementById("kakao-map-sdk");
    if (existing) { existing.remove(); }
    init();
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

      // 좌표 결정: 저장된 좌표 우선, 없거나 부정확하면 주소로 변환
      let lat = temple.lat;
      let lng = temple.lng;

      if (temple.address && (!lat || !lng)) {
        const coords = await getCoordsByAddress(temple.address);
        if (coords) { lat = coords.lat; lng = coords.lng; }
      }

      if (!lat || !lng) continue;

      const size = isSelected ? 38 : 28;
      const fill = visited ? "#D4AF37" : "#8A8A7A";
      const stroke = isSelected ? "#2D4A3E" : "#ffffff";
      const svg = `<svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="${fill}" stroke="${stroke}" stroke-width="${isSelected ? 3 : 2}"/>
        <text x="20" y="26" text-anchor="middle" font-size="16">🪷</text>
      </svg>`;

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
            <div style="font-size:11px;color:${visited ? "#708238" : "#8A8A7A"};margin-bottom:3px;">${visited ? "✅ 방문완료" : "○ 미방문"}${temple.UNESCO ? " 🌐" : ""}</div>
            <div style="font-size:14px;font-weight:800;color:#2D4A3E;">${temple.name}</div>
            <div style="font-size:11px;color:#8A7A72;">${temple.province}</div>
            ${dist !== null ? `<div style="font-size:11px;color:#1565C0;">📡 ${formatDistance(dist)}</div>` : ""}
          </div>`,
          removable: true,
        });
        iw.open(kakaoMapRef.current, marker);
        infoWindowRef.current = iw;
        onSelectTemple(temple);
      });

      markersRef.current.push(marker);
    }

    if (selectedTemple) {
      // 선택된 사찰로 지도 이동
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

  // 내 위치 마커
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

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%", minHeight: "400px" }} />
      {mapLoading && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#EDE5DE", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "32px" }}>🗺️</div>
          <div style={{ fontFamily: "'Nanum Gothic',sans-serif", fontSize: "14px", color: "#8A7A72" }}>지도 불러오는 중...</div>
        </div>
      )}
      {mapError && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#EDE5DE", flexDirection: "column", gap: "12px", padding: "20px", textAlign: "center" }}>
          <div style={{ fontSize: "32px" }}>⚠️</div>
          <div style={{ fontFamily: "'Nanum Gothic',sans-serif", fontSize: "13px", color: "#A45A52", lineHeight: "1.6" }}>{mapError}</div>
        </div>
      )}
      {!mapLoading && !mapError && (
        <div style={{ position: "absolute", bottom: "30px", right: "12px", background: "rgba(250,250,240,0.92)", border: "1px solid #D8D4C0", borderRadius: "8px", padding: "8px 12px", display: "flex", flexDirection: "column", gap: "5px", fontSize: "12px", zIndex: 10, fontFamily: "'Nanum Gothic',sans-serif" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", color: "#5A4A3A" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#D4AF37", display: "inline-block" }}></span>방문 완료
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", color: "#5A4A3A" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#8A8A7A", display: "inline-block" }}></span>미방문
          </div>
        </div>
      )}
    </div>
  );
}
