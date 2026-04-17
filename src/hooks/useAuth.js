import { useState, useEffect } from "react";

const KAKAO_REST_KEY = import.meta.env.VITE_KAKAO_REST_KEY;
const REDIRECT_URI = "https://pilgrimage-108.vercel.app/auth/kakao/callback";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("kakao_user");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch (e) {}
    }
    setLoading(false);
  }, []);

  const loginWithKakao = () => {
    const url = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
    window.location.href = url;
  };

  const handleCallback = async (code) => {
    try {
      const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: KAKAO_REST_KEY,
          redirect_uri: REDIRECT_URI,
          code,
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) return null;

      const profileRes = await fetch("https://kapi.kakao.com/v2/user/me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profile = await profileRes.json();

      const userData = {
        id: String(profile.id),
        nickname: profile.kakao_account?.profile?.nickname || "순례자",
        thumbnail: profile.kakao_account?.profile?.thumbnail_image_url || null,
      };

      try {
        const { getDb } = await import("../lib/firebase");
        const { doc, setDoc, getDoc } = await import("firebase/firestore");
        const db = await getDb();
        const userRef = doc(db, "users", userData.id);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, { ...userData, createdAt: new Date().toISOString() });
        }
      } catch (e) {
        console.warn("Firebase 저장 실패 (로그인은 유지):", e);
      }

      localStorage.setItem("kakao_user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (e) {
      console.error("카카오 로그인 실패:", e);
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("kakao_user");
    setUser(null);
  };

  return { user, loading, loginWithKakao, handleCallback, logout };
}
