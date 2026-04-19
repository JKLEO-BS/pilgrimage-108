import { useState, useEffect } from "react";
import { firestoreGet, firestoreSet } from "./useAuth";

const LOCAL_KEY = "temipleDiaries";

// Firestore 문서 파싱
function parseFirestoreDoc(doc) {
  if (!doc?.fields) return {};
  const result = {};
  for (const [templeId, val] of Object.entries(doc.fields)) {
    try {
      result[templeId] = JSON.parse(val.stringValue || "[]");
    } catch {
      result[templeId] = [];
    }
  }
  return result;
}

// Firestore 저장 형식으로 변환
function toFirestoreFields(diaries) {
  const fields = {};
  for (const [templeId, entries] of Object.entries(diaries)) {
    fields[templeId] = { stringValue: JSON.stringify(entries) };
  }
  return fields;
}

export function useDiary(userId = null) {
  // { [templeId]: [{id, date, text, createdAt}, ...] }
  const [diaries, setDiaries] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userId) {
      loadFromFirebase(userId);
    } else {
      loadFromLocal();
    }
  }, [userId]);

  const loadFromLocal = () => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) setDiaries(JSON.parse(raw));
    } catch {}
  };

  const saveToLocal = (data) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  };

  const loadFromFirebase = async (uid) => {
    try {
      const doc = await firestoreGet("diaries", uid);
      const parsed = parseFirestoreDoc(doc);
      if (Object.keys(parsed).length > 0) {
        setDiaries(parsed);
      } else {
        loadFromLocal();
      }
    } catch {
      loadFromLocal();
    }
  };

  const saveToFirebase = async (uid, data) => {
    try {
      await firestoreSet("diaries", uid, toFirestoreFields(data));
    } catch {
      saveToLocal(data);
    }
  };

  // 일기 저장 (추가)
  const saveDiaryEntry = async (templeId, text) => {
    if (!text.trim()) return;
    setSaving(true);

    const newEntry = {
      id: `entry_${Date.now()}`,
      date: new Date().toISOString(),
      text: text.trim(),
    };

    const existing = diaries[templeId] || [];
    const updated = { ...diaries, [templeId]: [newEntry, ...existing] };

    setDiaries(updated);
    if (userId) await saveToFirebase(userId, updated);
    else saveToLocal(updated);

    setSaving(false);
    return newEntry;
  };

  // 일기 삭제
  const deleteDiaryEntry = async (templeId, entryId) => {
    const existing = diaries[templeId] || [];
    const updated = {
      ...diaries,
      [templeId]: existing.filter((e) => e.id !== entryId),
    };
    setDiaries(updated);
    if (userId) await saveToFirebase(userId, updated);
    else saveToLocal(updated);
  };

  // 특정 사찰 일기 목록
  const getDiaryEntries = (templeId) => diaries[templeId] || [];

  return { diaries, saving, saveDiaryEntry, deleteDiaryEntry, getDiaryEntries };
}
