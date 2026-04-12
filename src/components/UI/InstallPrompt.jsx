import { useState, useEffect } from "react";

/**
 * PWA 홈화면 설치 유도 배너
 *
 * 동작 원리:
 * 1. 브라우저가 beforeinstallprompt 이벤트를 발생 → 설치 가능 상태
 * 2. 사용자가 "설치" 클릭 → prompt() 호출
 * 3. 사용자가 수락하면 appinstalled 이벤트 발생 → 배너 숨김
 * 4. "다음에" 클릭 → 세션 동안 숨김
 *
 * iOS Safari는 beforeinstallprompt를 지원하지 않으므로
 * 별도 안내 UI를 제공합니다.
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 이미 standalone 모드(설치된 앱)로 실행 중이면 배너 불필요
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // iOS 감지 (Safari는 별도 안내 필요)
    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !window.navigator.standalone;
    setIsIOS(ios);

    // Android / Chrome: beforeinstallprompt 이벤트 대기
    const handler = (e) => {
      e.preventDefault(); // 브라우저 기본 설치 배너 차단
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // 설치 완료 감지
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowBanner(false);
    });

    // iOS는 조건 충족 시 바로 배너 표시
    if (ios) setShowBanner(true);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => setShowBanner(false);

  if (isInstalled || !showBanner) return null;

  // ── iOS 안내 배너 ──────────────────────────────────────────
  if (isIOS) {
    return (
      <div className="install-banner ios">
        <div className="install-icon">🪷</div>
        <div className="install-text">
          <strong>홈화면에 추가하기</strong>
          <p>
            Safari 하단의 <span className="ios-share">공유</span> 버튼을 탭한 후<br />
            <strong>"홈 화면에 추가"</strong>를 선택하세요.
          </p>
        </div>
        <button className="install-close" onClick={handleDismiss} aria-label="닫기">✕</button>
      </div>
    );
  }

  // ── Android / Chrome 설치 배너 ────────────────────────────
  return (
    <div className="install-banner android">
      <div className="install-icon">🪷</div>
      <div className="install-text">
        <strong>앱으로 설치하기</strong>
        <p>오프라인에서도 지도와 순례 기록을 확인할 수 있습니다.</p>
      </div>
      <div className="install-actions">
        <button className="install-btn-dismiss" onClick={handleDismiss}>
          다음에
        </button>
        <button className="install-btn-confirm" onClick={handleInstall}>
          설치
        </button>
      </div>
    </div>
  );
}
