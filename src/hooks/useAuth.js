import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kakao_user");
      if (saved) setUser(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const loginWithKakao = () => {
    alert("카카오 로그인 준비 중입니다.");
  };

  const logout = () => {
    localStorage.removeItem("kakao_user");
    setUser(null);
  };

  return { user, loading: false, loginWithKakao, logout, handleCallback: async () => {} };
}
