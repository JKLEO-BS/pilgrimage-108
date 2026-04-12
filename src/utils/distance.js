/**
 * Haversine 공식으로 두 위경도 사이의 거리(미터) 계산
 * @param {number} lat1 - 기준점 위도
 * @param {number} lng1 - 기준점 경도
 * @param {number} lat2 - 대상 위도
 * @param {number} lng2 - 대상 경도
 * @returns {number} 거리 (미터)
 */
export function getDistanceInMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000; // 지구 반지름 (미터)
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 사용자가 사찰 반경 내에 있는지 확인
 * @param {number} userLat
 * @param {number} userLng
 * @param {object} temple - { lat, lng }
 * @param {number} radiusMeters - 인증 반경 (기본 500m)
 */
export function isWithinRadius(userLat, userLng, temple, radiusMeters = 500) {
  if (userLat == null || userLng == null) return false;
  const dist = getDistanceInMeters(userLat, userLng, temple.lat, temple.lng);
  return dist <= radiusMeters;
}

/**
 * 거리를 사람이 읽기 쉬운 형식으로 변환
 * @param {number} meters
 * @returns {string} ex) "350m" | "1.2km"
 */
export function formatDistance(meters) {
  if (meters == null) return "-";
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}
