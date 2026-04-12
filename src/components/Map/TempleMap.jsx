import React from "react";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";
import { getDistanceInMeters, formatDistance } from "../../utils/distance";

const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

export default function TempleMap({
  temples, visitedIds, selectedTemple, onSelectTemple, userPosition, regionFilter = "전체",
}) {
  const [loading, error] = useKakaoLoader({ appkey: KAKAO_KEY });

  const visible = regionFilter === "전체"
    ? temples
    : temples.filter((t) => t.region === regionFilter);

  if (loading) return (
    <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"12px", background:"#EDE5DE" }}>
      <div style={{ fontSize:"32px" }}>🗺️</div>
      <div style={{ fontFamily:"'Nanum Gothic',sans-serif", fontSize:"14px", color:"#8A7A72" }}>지도 불러오는 중...</div>
    </div>
  );

  if (error) return (
    <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"12px", background:"#EDE5DE", padding:"20px", textAlign:"center" }}>
      <div style={{ fontSize:"32px" }}>⚠️</div>
      <div style={{ fontFamily:"'Nanum Gothic',sans-serif", fontSize:"13px", color:"#A45A52", lineHeight:"1.6" }}>
        카카오맵 로드 오류<br/>API 키를 확인해주세요.
      </div>
    </div>
  );

  return (
    <div style={{ width:"100%", height:"100%", position:"relative" }}>
      <Map
        center={selectedTemple
          ? { lat: selectedTemple.lat, lng: selectedTemple.lng }
          : { lat: 36.5, lng: 127.8 }
        }
        style={{ width:"100%", height:"100%" }}
        level={selectedTemple ? 5 : 7}
      >
        {/* 사찰 마커 */}
        {visible.map((temple) => {
          const visited = visitedIds.includes(temple.id);
          const isSelected = selectedTemple?.id === temple.id;
          const size = isSelected ? 38 : 28;
          const fill = visited ? "#D4AF37" : "#8A8A7A";
          const stroke = isSelected ? "#2D4A3E" : "#ffffff";
          const sw = isSelected ? 3 : 2;
          const svg = `<svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/><text x="20" y="26" text-anchor="middle" font-size="16">🪷</text></svg>`;

          const dist = userPosition
            ? getDistanceInMeters(userPosition.lat, userPosition.lng, temple.lat, temple.lng)
            : null;

          return (
            <MapMarker
              key={temple.id}
              position={{ lat: temple.lat, lng: temple.lng }}
              image={{
                src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
                size: { width: size, height: size },
                options: { offset: { x: size / 2, y: size / 2 } },
              }}
              title={temple.name}
              onClick={() => onSelectTemple(temple)}
              infoWindowOptions={{ removable: true }}
            >
              {isSelected && (
                <div style={{ padding:"10px 12px", minWidth:"150px", fontFamily:"'Nanum Gothic',sans-serif" }}>
                  <div style={{ fontSize:"11px", color: visited ? "#708238" : "#8A8A7A", marginBottom:"3px" }}>
                    {visited ? "✅ 방문완료" : "○ 미방문"}{temple.UNESCO ? " 🌐" : ""}
                  </div>
                  <div style={{ fontSize:"14px", fontWeight:"800", color:"#2D4A3E" }}>{temple.name}</div>
                  <div style={{ fontSize:"11px", color:"#8A7A72", marginBottom:"3px" }}>{temple.province}</div>
                  {dist !== null && (
                    <div style={{ fontSize:"11px", color:"#1565C0" }}>📡 {formatDistance(dist)}</div>
                  )}
                </div>
              )}
            </MapMarker>
          );
        })}

        {/* 내 위치 마커 */}
        {userPosition && (
          <MapMarker
            position={{ lat: userPosition.lat, lng: userPosition.lng }}
            image={{
              src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
                `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="8" fill="#4A90D9" stroke="white" stroke-width="2.5"/></svg>`
              )}`,
              size: { width: 20, height: 20 },
              options: { offset: { x: 10, y: 10 } },
            }}
            title="내 위치"
          />
        )}
      </Map>

      {/* 범례 */}
      <div style={{
        position:"absolute", bottom:"30px", right:"12px",
        background:"rgba(250,250,240,0.92)", border:"1px solid #D8D4C0",
        borderRadius:"8px", padding:"8px 12px",
        display:"flex", flexDirection:"column", gap:"5px",
        fontSize:"12px", zIndex:10,
        fontFamily:"'Nanum Gothic',sans-serif"
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"7px", color:"#5A4A3A" }}>
          <span style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#D4AF37", display:"inline-block" }}></span>방문 완료
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"7px", color:"#5A4A3A" }}>
          <span style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#8A8A7A", display:"inline-block" }}></span>미방문
        </div>
      </div>
    </div>
  );
}
