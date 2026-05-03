import { useState, useEffect } from "react";
import { firestoreGet, firestoreSet } from "./useAuth";

const LOCAL_KEY = "bow108Records";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseFirestoreDoc(doc) {
  if (!doc?.fields) return {};
  const result = {};
  for (const [date, val] of Object.entries(doc.fields)) {
    try {
      result[date] = JSON.parse(val.stringValue || "{}");
    } catch {
      result[date] = {};
    }
  }
  return result;
}

function toFirestoreFields(records) {
  const fields = {};
  for (const [date, data] of Object.entries(records)) {
    fields[date] = { stringValue: JSON.stringify(data) };
  }
  return fields;
}

export function useBow(userId = null) {
  const [records, setRecords] = useState({});

  useEffect(() => {
    // 항상 localStorage 먼저 로드 (즉시 표시)
    loadFromLocal();
    // 로그인 상태면 Firebase에서 최신 데이터 동기화
    if (userId) syncFromFirebase(userId);
  }, [userId]);

  const loadFromLocal = () => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) setRecords(JSON.parse(raw));
    } catch {}
  };

  const saveToLocal = (data) => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
    } catch {}
  };

  const syncFromFirebase = async (uid) => {
    try {
      const doc = await firestoreGet("bow108", uid);
      const parsed = parseFirestoreDoc(doc);
      if (Object.keys(parsed).length > 0) {
        const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
        const merged = { ...parsed, ...local };
        // 완료된 기록은 Firebase 우선
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
    const updated = {
      ...records,
      [today]: {
        date: today,
        count: Math.min(count, 108),
        completed,
        completedAt: completed
          ? new Date().toISOString()
          : (records[today]?.completedAt || null),
      },
    };

    setRecords(updated);
    saveToLocal(updated);

    if (userId) {
      try {
        await firestoreSet("bow108", userId, toFirestoreFields(updated));
      } catch {}
    }
  };

  const getTodayRecord = () => {
    const today = todayStr();
    return records[today] || { count: 0, completed: false, date: today };
  };

  const resetToday = async () => {
    const today = todayStr();
    const updated = {
      ...records,
      [today]: { date: today, count: 0, completed: false, completedAt: null },
    };
    setRecords(updated);
    saveToLocal(updated);
    if (userId) {
      try {
        await firestoreSet("bow108", userId, toFirestoreFields(updated));
      } catch {}
    }
  };

  return { records, getTodayRecord, saveCount, resetToday };
}
