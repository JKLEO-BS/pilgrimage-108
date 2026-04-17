import { useState, useEffect } from "react";

const LOCAL_KEY = "visitedTemples";

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
      }
    } catch (e) {}
  };

  const saveToLocal = (ids, dates) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ ids, dates }));
  };

  const loadFromFirebase = async (uid) => {
    try {
      const { getDb } = await import("../lib/firebase");
      const { doc, getDoc } = await import("firebase/firestore");
      const db = await getDb();
      const ref = doc(db, "pilgrimages", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setVisitedIds(data.visitedIds || []);
        setVisitedDates(data.visitedDates || {});
      } else {
        loadFromLocal();
      }
    } catch (e) {
      console.error("Firebase 로드 실패:", e);
      loadFromLocal();
    }
  };

  const saveToFirebase = async (uid, ids, dates) => {
    try {
      const { getDb } = await import("../lib/firebase");
      const { doc, setDoc } = await import("firebase/firestore");
      const db = await getDb();
      const ref = doc(db, "pilgrimages", uid);
      await setDoc(ref, { visitedIds: ids, visitedDates: dates }, { merge: true });
    } catch (e) {
      console.error("Firebase 저장 실패:", e);
      saveToLocal(ids, dates);
    }
  };

  const markVisited = (templeId) => {
    const date = new Date().toISOString();
    const newIds = visitedIds.includes(templeId) ? visitedIds : [...visitedIds, templeId];
    const newDates = { ...visitedDates, [templeId]: date };
    setVisitedIds(newIds);
    setVisitedDates(newDates);
    if (userId) {
      saveToFirebase(userId, newIds, newDates);
    } else {
      saveToLocal(newIds, newDates);
    }
  };

  const unmarkVisited = (templeId) => {
    const newIds = visitedIds.filter((id) => id !== templeId);
    const newDates = { ...visitedDates };
    delete newDates[templeId];
    setVisitedIds(newIds);
    setVisitedDates(newDates);
    if (userId) {
      saveToFirebase(userId, newIds, newDates);
    } else {
      saveToLocal(newIds, newDates);
    }
  };

  const isVisited = (templeId) => visitedIds.includes(templeId);
  const getVisitedAt = (templeId) => visitedDates[templeId] || null;

  return { visitedIds, markVisited, unmarkVisited, isVisited, getVisitedAt };
}
