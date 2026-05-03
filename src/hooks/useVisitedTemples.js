import { useState, useEffect } from "react";
import { firestoreGet, firestoreSet } from "./useAuth";

const LOCAL_KEY = "visitedTemples";

function parseFirestoreDoc(doc) {
  if (!doc?.fields) return null;
  const ids = doc.fields.visitedIds?.arrayValue?.values?.map(v => v.stringValue) || [];
  const datesMap = doc.fields.visitedDates?.mapValue?.fields || {};
  const dates = {};
  for (const [k, v] of Object.entries(datesMap)) {
    dates[k] = v.stringValue;
  }
  return { ids, dates };
}

// Firestore REST API 직접 호출 (firestoreSet 우회 - mapValue 직접 처리)
const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

async function savePilgrimageToFirestore(uid, ids, dates) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/pilgrimages/${uid}?key=${FIREBASE_API_KEY}`;

  const datesFields = {};
  for (const [k, v] of Object.entries(dates)) {
    datesFields[k] = { stringValue: String(v) };
  }

  const body = {
    fields: {
      visitedIds: {
        arrayValue: {
          values: ids.map(id => ({ stringValue: id }))
        }
      },
      visitedDates: {
        mapValue: { fields: datesFields }
      }
    }
  };

  await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function useVisitedTemples(userId = null) {
  const [visitedIds, setVisitedIds] = useState([]);
  const [visitedDates, setVisitedDates] = useState({});

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
      if (raw) {
        const data = JSON.parse(raw);
        setVisitedIds(data.ids || []);
        setVisitedDates(data.dates || {});
      } else {
        setVisitedIds([]);
        setVisitedDates({});
      }
    } catch {}
  };

  const saveToLocal = (ids, dates) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ ids, dates }));
  };

  const loadFromFirebase = async (uid) => {
    try {
      const doc = await firestoreGet("pilgrimages", uid);
      const parsed = parseFirestoreDoc(doc);
      if (parsed && parsed.ids.length > 0) {
        setVisitedIds(parsed.ids);
        setVisitedDates(parsed.dates);
        // Firebase 데이터를 localStorage에도 캐시
        saveToLocal(parsed.ids, parsed.dates);
      } else {
        // Firebase에 없으면 로컬 확인
        loadFromLocal();
      }
    } catch {
      loadFromLocal();
    }
  };

  const markVisited = (templeId) => {
    const date = new Date().toISOString();
    const newIds = visitedIds.includes(templeId) ? visitedIds : [...visitedIds, templeId];
    const newDates = { ...visitedDates, [templeId]: date };
    setVisitedIds(newIds);
    setVisitedDates(newDates);
    saveToLocal(newIds, newDates);
    if (userId) savePilgrimageToFirestore(userId, newIds, newDates);
  };

  const unmarkVisited = (templeId) => {
    const newIds = visitedIds.filter((id) => id !== templeId);
    const newDates = { ...visitedDates };
    delete newDates[templeId];
    setVisitedIds(newIds);
    setVisitedDates(newDates);
    saveToLocal(newIds, newDates);
    if (userId) savePilgrimageToFirestore(userId, newIds, newDates);
  };

  const isVisited = (templeId) => visitedIds.includes(templeId);
  const getVisitedAt = (templeId) => visitedDates[templeId] || null;

  return { visitedIds, markVisited, unmarkVisited, isVisited, getVisitedAt };
}
