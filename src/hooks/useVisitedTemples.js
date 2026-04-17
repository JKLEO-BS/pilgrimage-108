import { useState, useEffect } from "react";

const LOCAL_KEY = "visitedTemples";

export function useVisitedTemples(userId = null) {
  const [visitedIds, setVisitedIds] = useState([]);
  const [visitedDates, setVisitedDates] = useState({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setVisitedIds(data.ids || []);
        setVisitedDates(data.dates || {});
      }
    } catch (e) {}
  }, []);

  const saveToLocal = (ids, dates) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ ids, dates }));
  };

  const markVisited = (templeId) => {
    const date = new Date().toISOString();
    const newIds = visitedIds.includes(templeId) ? visitedIds : [...visitedIds, templeId];
    const newDates = { ...visitedDates, [templeId]: date };
    setVisitedIds(newIds);
    setVisitedDates(newDates);
    saveToLocal(newIds, newDates);
  };

  const unmarkVisited = (templeId) => {
    const newIds = visitedIds.filter((id) => id !== templeId);
    const newDates = { ...visitedDates };
    delete newDates[templeId];
    setVisitedIds(newIds);
    setVisitedDates(newDates);
    saveToLocal(newIds, newDates);
  };

  const isVisited = (templeId) => visitedIds.includes(templeId);
  const getVisitedAt = (templeId) => visitedDates[templeId] || null;

  return { visitedIds, markVisited, unmarkVisited, isVisited, getVisitedAt };
}
