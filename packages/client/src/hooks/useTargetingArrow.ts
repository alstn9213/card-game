import { useState, useRef, useCallback, type MouseEvent } from "react";

export const useTargetingArrow = (isActive: boolean) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const unitRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isActive) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
  }, [isActive]);

  const getUnitCenter = useCallback((id: string) => {
    const el = unitRefs.current.get(id);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }, []);

  const setUnitRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) {
      unitRefs.current.set(id, el);
    } else {
      unitRefs.current.delete(id);
    }
  }, []);

  const getUnitElement = useCallback((id: string) => {
    return unitRefs.current.get(id) || null;
  }, []);

  return {
    mousePos,
    setMousePos,
    handleMouseMove,
    getUnitCenter,
    setUnitRef,
    getUnitElement
  };
};