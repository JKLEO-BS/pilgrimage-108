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
      const doc = await firestoreGet("pilgrimages", uid);
      const parsed = parseFirestoreDoc(doc);
      if (parsed) {
        setVisitedIds(parsed.ids);
        setVisitedDates(parsed.dates);
      } else {
        loadFromLocal();
      }
    } catch (e) {
      loadFromLocal();
    }
  };

  const saveToFirebase = async (uid, ids, dates) => {
    try {
      await firestoreSet("pilgrimages", uid, {
        visitedIds: ids,
        visitedDates: dates,
      });
    } catch (e) {
      saveToLocal(ids, dates);
    }
  };

  const markVisited = (templeId) => {
    const date = new Date().toISOString();
    const newIds = visitedIds.includes(templeId) ? visitedIds : [...visitedIds, templeId];
    const newDates = { ...visitedDates, [templeId]: date };
    setVisitedIds(newIds);
    setVisitedDates(newDates);
    if (userId) saveToFirebase(userId, newIds, newDates);
    else saveToLocal(newIds, newDates);
  };

  const unmarkVisited = (templeId) => {
    const newIds = visitedIds.filter((id) => id !== templeId);
    const newDates = { ...visitedDates };
    delete newDates[templeId];
    setVisitedIds(newIds);
    setVisitedDates(newDates);
    if (userId) saveToFirebase(userId, newIds, newDates);
    else saveToLocal(newIds, newDates);
  };

  const isVisited = (templeId) => visitedIds.includes(templeId);
  const getVisitedAt = (templeId) => visitedDates[templeId] || null;

  return { visitedIds, markVisited, unmarkVisited, isVisited, getVisitedAt };
}
