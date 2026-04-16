import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

export default function KakaoCallback() {
  const { handleCallback } = useAuth();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      handleCallback(code).then(() => {
        window.location.href = "/";
      });
    }
  }, []);

  return (
    <div style={{
      height: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "#0a0f0c", color: "#D4AF37", fontFamily: "serif", gap: "16px"
    }}>
      <div style={{ fontSize: "40px" }}>🪷</div>
      <div style={{ fontSize: "14px" }}>로그인 처리 중...</div>
    </div>
  );
}
