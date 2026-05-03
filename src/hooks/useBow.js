import { useState, useEffect } from "react";

const LOCAL_KEY = "bow108Records";
const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Firestore에서 bow108 문서 읽기
async function fetchBowFromFirestore(uid) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/bow108/${uid}?key=${FIREBASE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return {};
  const doc = await res.json();
  if (!doc?.fields) return {};

  const result = {};
  for (const [date, val] of Object.entries(doc.fields)) {
    try {
      // stringValue 직접 또는 mapValue 안 stringValue 모두 처리
      const jsonStr =
        val.stringValue ||
        val.mapValue?.fields?.stringValue?.stringValue;
      if (jsonStr) result[date] = JSON.parse(jsonStr);
    } catch {}
  }
  return result;
}

// Firestore에 bow108 문서 저장 (stringValue로 직접 저장)
async function saveBowToFirestore(uid, records) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/bow108/${uid}?key=${FIREBASE_API_KEY}`;
  const fields = {};
  for (const [date, data] of Object.entries(records)) {
    fields[date] = { stringValue: JSON.stringify(data) };
  }
  await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });
}

export function useBow(userId = null) {
  const [records, setRecords] = useState({});

  useEffect(() => {
    loadFromLocal();
    if (userId) syncFromFirebase(userId);
  }, [userId]);

  const loadFromLocal = () => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) setRecords(JSON.parse(raw));
      else setRecords({});
    } catch {}
  };

  const saveToLocal = (data) => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
    } catch {}
  };

  const syncFromFirebase = async (uid) => {
    try {
      const parsed = await fetchBowFromFirestore(uid);
      if (Object.keys(parsed).length > 0) {
        // 완료된 기록은 Firebase 우선, 나머지는 로컬과 병합
        const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
        const merged = { ...local, ...parsed };
        for (const date of Object.keys(parsed)) {
          if (parsed[date]?.completed) merged[date] = parsed[date];
        }
        setRecords(merged);
        saveToLocal(merged);
      }
    } catch {}
  };

  const saveCount = async (count) => {
    const today = todayStr();
    const completed = count >= 108;

    // records 최신값을 직접 참조하기 위해 함수형 업데이트 사용
    let updated;
    setRecords(prev => {
      updated = {
        ...prev,
        [today]: {
          date: today,
          count: Math.min(count, 108),
          completed,
          completedAt: completed
            ? new Date().toISOString()
            : (prev[today]?.completedAt || null),
        },
      };
      return updated;
    });

    // 저장은 별도로 처리
    setTimeout(async () => {
      if (!updated) return;
      saveToLocal(updated);
      if (userId) {
        try {
          await saveBowToFirestore(userId, updated);
        } catch {}
      }
    }, 0);
  };

  const getTodayRecord = () => {
    const today = todayStr();
    return records[today] || { count: 0, completed: false, date: today };
  };

  const resetToday = async () => {
    const today = todayStr();
    setRecords(prev => {
      const updated = {
        ...prev,
        [today]: { date: today, count: 0, completed: false, completedAt: null },
      };
      saveToLocal(updated);
      if (userId) saveBowToFirestore(userId, updated).catch(() => {});
      return updated;
    });
  };

  return { records, getTodayRecord, saveCount, resetToday };
}
