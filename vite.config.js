import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // ── 서비스 워커 전략 ──────────────────────────────
      // generateSW: Vite가 서비스 워커를 자동 생성
      // injectManifest: 직접 작성한 sw.js를 사용 (고급)
      strategies: "generateSW",
      registerType: "autoUpdate", // 새 버전 배포 시 자동 업데이트

      // ── 오프라인 캐시 대상 파일 ───────────────────────
      // 빌드 산출물(JS·CSS·HTML) 전체를 자동 precache
      includeAssets: [
        "icons/*.png",
        "icons/*.svg",
        "fonts/*.woff2",
      ],

      // ── Web App Manifest ─────────────────────────────
      manifest: {
        name: "108 사찰 순례 · Pilgrimage 108",
        short_name: "108 순례",
        description: "전국 유명 사찰 108곳을 방문하고 지도로 기록하는 순례 앱",
        start_url: "/",
        display: "standalone",       // 주소창 없이 앱처럼 표시
        orientation: "portrait",
        theme_color: "#2D4A3E",      // 다크 그린 (상태바 색상)
        background_color: "#F5F5DC", // 베이지 (스플래시 배경)
        lang: "ko",
        categories: ["travel", "lifestyle"],
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            // maskable: 안드로이드 어댑티브 아이콘용
            src: "icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "순례 지도 열기",
            short_name: "지도",
            description: "108 사찰 지도로 바로 이동",
            url: "/",
            icons: [{ src: "icons/icon-192.png", sizes: "192x192" }],
          },
        ],
      },

      // ── 서비스 워커 세부 설정 (Workbox) ──────────────
      workbox: {
        // precache: 빌드 산출물 전체
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],

        // 런타임 캐시 전략
        runtimeCaching: [
          {
            // OpenStreetMap 지도 타일 → CacheFirst (지도 오프라인 지원)
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "osm-tiles",
              expiration: {
                maxEntries: 1000,   // 최대 타일 1,000장
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30일 유지
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts → StaleWhileRevalidate
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts",
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 }, // 1년
            },
          },
          {
            // 기타 API 요청 → NetworkFirst (최신 데이터 우선)
            urlPattern: /^https:\/\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 5,
              expiration: { maxAgeSeconds: 60 * 60 * 24 }, // 1일
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },

      devOptions: {
        enabled: false, // 개발 중 SW 비활성화 (핫리로드 충돌 방지)
      },
    }),
  ],
});
