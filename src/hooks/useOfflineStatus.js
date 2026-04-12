import { useState, useEffect } from "react";

/**
 * 네트워크 온/오프라인 상태를 추적하는 훅
 * 산속 사찰처럼 인터넷이 불안정한 환경에서 사용자에게 안내
 */
export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline  = () => setIsOffline(false);

    window.addEventListener("offline", goOffline);
    window.addEventListener("online",  goOnline);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online",  goOnline);
    };
  }, []);

  return isOffline;
}
