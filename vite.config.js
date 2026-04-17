import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/*"],
      manifest: {
        name: "108 사찰 순례",
        short_name: "108순례",
        theme_color: "#2D4A3E",
        background_color: "#F5F5DC",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
  optimizeDeps: {
    include: [
      "firebase/app",
      "firebase/firestore",
    ],
  },
  build: {
    commonjsOptions: {
      include: [/firebase/, /node_modules/],
    },
  },
});
