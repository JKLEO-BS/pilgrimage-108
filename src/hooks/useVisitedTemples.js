import { useState, useCallback } from "react";

const STORAGE_KEY = "pilgrimage108_visited";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw); // { [templeId]: { visitedAt: ISO string } }
  } catch {
    return {};
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.warn("localStorage 저장 실패");
  }
}

/**
 * 방문 기록을 localStorage에 저장·관리하는 훅
 */
export function useVisitedTemples() {
  const [visited, setVisited] = useState(loadFromStorage);

  /** 사찰 방문 인증 */
  const markVisited = useCallback((templeId) => {
    setVisited((prev) => {
      const next = {
        ...prev,
        [templeId]: { visitedAt: new Date().toISOString() },
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  /** 방문 취소 (실수 방지용) */
  const unmarkVisited = useCallback((templeId) => {
    setVisited((prev) => {
      const next = { ...prev };
      delete next[templeId];
      saveToStorage(next);
      return next;
    });
  }, []);

  /** 특정 사찰 방문 여부 확인 */
  const isVisited = useCallback(
    (templeId) => Boolean(visited[templeId]),
    [visited]
  );

  /** 방문 날짜 반환 */
  const getVisitedAt = useCallback(
    (templeId) => visited[templeId]?.visitedAt ?? null,
    [visited]
  );

  /** 방문한 사찰 id 배열 */
  const visitedIds = Object.keys(visited).map(Number);

  /** 전체 초기화 */
  const resetAll = useCallback(() => {
    setVisited({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { visited, visitedIds, markVisited, unmarkVisited, isVisited, getVisitedAt, resetAll };
}
