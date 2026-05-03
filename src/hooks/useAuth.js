import { useState, useEffect } from "react";
const KAKAO_REST_KEY = import.meta.env.VITE_KAKAO_REST_KEY;
const REDIRECT_URI = "https://pilgrimage-108.vercel.app/auth/kakao/callback";
const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

async function firestoreGet(collection, docId) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}?key=${FIREBASE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return await res.json();
}

async function firestoreSet(collection, docId, data) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}?key=${FIREBASE_API_KEY}`;
  const fields = {};
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === "string") fields[k] = { stringValue: v };
    else if (typeof v === "number") fields[k] = { integerValue: v };
    else if (typeof v === "boolean") fields[k] = { booleanValue: v };
    else if (Array.isArray(v)) fields[k] = { arrayValue: { values: v.map(i => ({ stringValue: String(i) })) } };
    else if (typeof v === "object" && v !== null) {
      const mapFields = {};
      for (const [mk, mv] of Object.entries(v)) {
        mapFields[mk] = { stringValue: String(mv) };
      }
      fields[k] = { mapValue: { fields: mapFields } };
    }
  }
  await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });
}

export { firestoreGet, firestoreSet };

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
        thumbnail: profile.kakao_account?.profile?.thumbnail_image_url || "",
      };

      localStorage.setItem("kakao_user", JSON.stringify(userData));
      setUser(userData);

      await firestoreSet("users", userData.id, {
        id: userData.id,
        nickname: userData.nickname,
        thumbnail: userData.thumbnail,
      });

      return userData;
    } catch (e) {
      console.error("카카오 로그인 실패:", e);
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("kakao_user");
    localStorage.removeItem("visitedTemples");
    localStorage.removeItem("temipleDiaries");
    localStorage.removeItem("bow108Records");
    setUser(null);
    window.location.reload();
  };

  return { user, loading, loginWithKakao, handleCallback, logout };
}
