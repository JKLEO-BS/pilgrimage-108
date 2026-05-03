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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userId) loadFromFirebase(userId);
    else loadFromLocal();
  }, [userId]);

  const loadFromLocal = () => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) setRecords(JSON.parse(raw));
    } catch {}
  };

  const saveToLocal = (data) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  };

  const loadFromFirebase = async (uid) => {
    try {
      const doc = await firestoreGet("bow108", uid);
      const parsed = parseFirestoreDoc(doc);
      if (Object.keys(parsed).length > 0) setRecords(parsed);
      else loadFromLocal();
    } catch {
      loadFromLocal();
    }
  };

  const saveToFirebase = async (uid, data) => {
    try {
      await firestoreSet("bow108", uid, toFirestoreFields(data));
    } catch {
      saveToLocal(data);
    }
  };

  // 오늘 기록 가져오기
  const getTodayRecord = () => {
    const today = todayStr();
    return records[today] || { count: 0, completed: false, date: today };
  };

  // 카운트 저장
  const saveCount = async (count) => {
    setSaving(true);
    const today = todayStr();
    const completed = count >= 108;
    const updated = {
      ...records,
      [today]: {
        date: today,
        count: Math.min(count, 108),
        completed,
        completedAt: completed ? new Date().toISOString() : null,
      },
    };
    setRecords(updated);
    if (userId) await saveToFirebase(userId, updated);
    else saveToLocal(updated);
    setSaving(false);
  };

  // 오늘 기록 초기화
  const resetToday = async () => {
    const today = todayStr();
    const updated = {
      ...records,
      [today]: { date: today, count: 0, completed: false, completedAt: null },
    };
    setRecords(updated);
    if (userId) await saveToFirebase(userId, updated);
    else saveToLocal(updated);
  };

  return { records, saving, getTodayRecord, saveCount, resetToday };
}
