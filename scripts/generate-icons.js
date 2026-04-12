/**
 * PWA 아이콘 생성 스크립트
 * 실행: node scripts/generate-icons.js
 *
 * sharp 라이브러리로 원본 SVG → PNG 변환
 * 설치: npm install -D sharp
 *
 * 준비물: public/icons/icon-source.svg (1024×1024 연꽃 로고)
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";

const ICONS_DIR = path.resolve("public/icons");
if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true });

// 생성할 아이콘 사이즈 목록
const sizes = [
  { size: 192,  name: "icon-192.png" },
  { size: 512,  name: "icon-512.png" },
  { size: 512,  name: "icon-512-maskable.png", padding: 80 }, // maskable: 여백 포함
  { size: 180,  name: "apple-touch-icon.png" }, // iOS 홈화면 아이콘
  { size: 32,   name: "favicon-32.png" },
  { size: 16,   name: "favicon-16.png" },
];

// 임시: SVG 소스가 없으면 베이지 배경 + 연꽃 텍스트로 placeholder 생성
const placeholderSVG = (size, padding = 0) => {
  const inner = size - padding * 2;
  return Buffer.from(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#2D4A3E"/>
      <text
        x="${size / 2}" y="${size / 2 + inner * 0.15}"
        text-anchor="middle"
        font-size="${inner * 0.55}"
        font-family="Apple Color Emoji, Segoe UI Emoji, sans-serif"
      >🪷</text>
      <text
        x="${size / 2}" y="${size * 0.88}"
        text-anchor="middle"
        font-size="${inner * 0.12}"
        font-family="sans-serif"
        fill="#D4AF37"
        letter-spacing="1"
      >108</text>
    </svg>
  `);
};

async function generate() {
  for (const { size, name, padding = 0 } of sizes) {
    const outPath = path.join(ICONS_DIR, name);
    const svgBuf = placeholderSVG(size, padding);

    await sharp(svgBuf)
      .resize(size, size)
      .png()
      .toFile(outPath);

    console.log(`✅ ${name} (${size}×${size})`);
  }
  console.log("\n🪷 모든 아이콘 생성 완료!");
  console.log("※ 실제 서비스 전 디자이너 제작 아이콘으로 교체 권장");
}

generate().catch(console.error);
