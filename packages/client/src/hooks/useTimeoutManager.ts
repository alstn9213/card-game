import { useEffect, useRef, useCallback } from "react";

export const useTimeoutManager = () => {
  // Set을 사용하여 중복 없이 관리하고, 실행 완료된 타이머는 제거하기 용이하게 함
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  // 컴포넌트 언마운트 시 모든 타이머 정리
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      timeoutsRef.current.clear();
    };
  }, []);

  const addTimeout = useCallback((callback: () => void, delay: number) => {
    const id = setTimeout(() => {
      // 콜백 실행 전 Set에서 제거 (메모리 관리)
      timeoutsRef.current.delete(id);
      callback();
    }, delay);
    
    timeoutsRef.current.add(id);
    return id;
  }, []);

  const removeTimeout = useCallback((id: ReturnType<typeof setTimeout>) => {
    clearTimeout(id);
    timeoutsRef.current.delete(id);
  }, []);

  return { addTimeout, removeTimeout };
};