import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import KakaoCallback from "./pages/KakaoCallback.jsx";
import "./index.css";
import "./pwa.css";

const path = window.location.pathname;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {path === "/auth/kakao/callback" ? <KakaoCallback /> : <App />}
  </React.StrictMode>
);
