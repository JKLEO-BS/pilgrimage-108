import { useState, useEffect } from "react";

const TOUR_API_KEY = import.meta.env.VITE_TOUR_API_KEY;
const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";

// 검색 시 사찰명 변형 목록 (예: "봉은사" → ["봉은사", "奉恩寺"])
function getSearchVariants(name) {
  // 괄호 제거, 공백 제거 등 변형 시도
  const clean = name.replace(/\s*\(.*?\)\s*/g, "").trim();
  const variants = [name, clean];
  // "사"로 끝나는 경우 앞 글자만으로도 검색
  if (name.endsWith("사") && name.length > 2) {
    variants.push(name.slice(0, -1));
  }
  return [...new Set(variants)];
}

async function searchTemple(name) {
  const variants = getSearchVariants(name);

  for (const keyword of variants) {
    // contentTypeId 12 = 관광지 (사찰 대부분)
    const res = await fetch(
      `${BASE_URL}/searchKeyword2?` +
      new URLSearchParams({
        serviceKey: TOUR_API_KEY,
        keyword,
        contentTypeId: "12",
        numOfRows: "10",
        pageNo: "1",
        MobileOS: "ETC",
        MobileApp: "108sansa",
        _type: "json",
      })
    );
    const data = await res.json();
    const items = data?.response?.body?.items?.item || [];

    // 이름이 정확히 일치하는 항목 우선
    const exact = items.find(
      (i) => i.title && (
        i.title.includes(keyword) || keyword.includes(i.title.replace(/\s/g, ""))
      )
    );
    const target = exact || items[0];
    if (target) return target;
  }
  return null;
}

/**
 * 한국관광공사 Tour API — 사찰 사진·상세정보 훅
 */
export function useTourApi(templeName, contentId = null) {
  const [photo, setPhoto]     = useState(null);
  const [photos, setPhotos]   = useState([]);
  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!templeName) return;
    if (!TOUR_API_KEY) return;

    let cancelled = false;
    setLoading(true);
    setPhoto(null);
    setPhotos([]);
    setDetail(null);

    (async () => {
      try {
        let targetId = contentId;
        let firstImage = null;

        // 1. contentId 없으면 이름으로 검색
        if (!targetId) {
          const item = await searchTemple(templeName);
          if (item) {
            targetId = item.contentid;
            firstImage = item.firstimage || item.firstimage2 || null;
          }
        }

        if (!targetId || cancelled) { setLoading(false); return; }
        if (firstImage && !cancelled) setPhoto(firstImage);

        // 2. 상세 정보
        const detailRes = await fetch(
          `${BASE_URL}/detailCommon2?` +
          new URLSearchParams({
            serviceKey: TOUR_API_KEY,
            contentId: targetId,
            defaultYN: "Y",
            firstImageYN: "Y",
            addrinfoYN: "Y",
            overviewYN: "Y",
            MobileOS: "ETC",
            MobileApp: "108sansa",
            _type: "json",
          })
        );
        const detailData = await detailRes.json();
        const di = detailData?.response?.body?.items?.item?.[0];
        if (!cancelled && di) {
          setDetail({
            overview: di.overview || "",
            homepage: di.homepage || "",
            tel:      di.tel      || "",
            addr1:    di.addr1    || "",
          });
          if (di.firstimage && !firstImage) setPhoto(di.firstimage);
        }

        // 3. 추가 이미지
        const imgRes = await fetch(
          `${BASE_URL}/detailImage2?` +
          new URLSearchParams({
            serviceKey: TOUR_API_KEY,
            contentId: targetId,
            imageYN: "Y",
            subImageYN: "Y",
            MobileOS: "ETC",
            MobileApp: "108sansa",
            _type: "json",
          })
        );
        const imgData = await imgRes.json();
        const imgItems = imgData?.response?.body?.items?.item || [];
        if (!cancelled) {
          const urls = imgItems
            .map((i) => i.originimgurl || i.smallimageurl)
            .filter(Boolean)
            .slice(0, 6);
          setPhotos(urls);
        }

      } catch (e) {
        // 조용히 실패 — 기본 데이터로 표시
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [templeName, contentId]);

  return { photo, photos, detail, loading };
}
