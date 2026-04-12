import { useState, useEffect, useCallback } from "react";

/**
 * 사용자 GPS 위치를 실시간으로 추적하는 훅
 * @returns {{ position, error, loading, refresh }}
 */
export function useGeolocation() {
  const [position, setPosition] = useState(null); // { lat, lng, accuracy }
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000, // 30초 캐시 허용
  };

  const onSuccess = useCallback((pos) => {
    setPosition({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: Math.round(pos.coords.accuracy),
    });
    setError(null);
    setLoading(false);
  }, []);

  const onError = useCallback((err) => {
    const messages = {
      1: "위치 접근 권한이 거부되었습니다. 브라우저 설정에서 허용해 주세요.",
      2: "위치를 가져올 수 없습니다. GPS 신호를 확인해 주세요.",
      3: "위치 요청 시간이 초과되었습니다.",
    };
    setError(messages[err.code] || "알 수 없는 오류가 발생했습니다.");
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("이 브라우저는 위치 서비스를 지원하지 않습니다.");
      return;
    }
    setLoading(true);
    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, options);
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      ...options,
      maximumAge: 0, // 강제 갱신
    });
  }, [onSuccess, onError]);

  return { position, error, loading, refresh };
}
