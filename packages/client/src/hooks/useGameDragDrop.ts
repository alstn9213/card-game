import { useState, useCallback, type DragEvent } from "react";
import { type CardData, type FieldUnit } from "@card-game/shared";

export const useGameDragDrop = (
  playCard: (index: number, targetUnitId?: string) => void,
  mergeFieldUnits: (sourceId: string, targetId: string) => void
) => {
  const [draggedCard, setDraggedCard] = useState<CardData | null>(null);
  const isDragging = !!draggedCard;

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDraggedCard(null);
    const cardIndexStr = e.dataTransfer.getData("cardIndex");
    if (cardIndexStr) {
      const index = parseInt(cardIndexStr, 10);
      if (!isNaN(index)) {
        playCard(index);
      }
    }
  }, [playCard, setDraggedCard]);

  const handleUnitDragStart = useCallback((e: DragEvent, unit: FieldUnit) => {
    e.dataTransfer.setData("sourceUnitId", unit.id);
    e.dataTransfer.effectAllowed = "move";
    setDraggedCard(unit);
  }, [setDraggedCard]);

  const handleUnitDrop = useCallback((e: DragEvent, unitId: string) => {
    e.preventDefault();
    e.stopPropagation(); // BattleZone의 일반 드롭 방지
    setDraggedCard(null);
    const cardIndexStr = e.dataTransfer.getData("cardIndex");
    const sourceUnitId = e.dataTransfer.getData("sourceUnitId");

    if (cardIndexStr) {
      const index = parseInt(cardIndexStr, 10);
      if (!isNaN(index)) {
        playCard(index, unitId); // 타겟 유닛 ID와 함께 호출하여 병합 시도
      }
    } 
    
    else if (sourceUnitId) {
      if (sourceUnitId !== unitId) {
        mergeFieldUnits(sourceUnitId, unitId);
      }
    }
  }, [playCard, mergeFieldUnits, setDraggedCard]);

  const handleCardDragStart = useCallback((e: DragEvent, card: CardData, index: number) => {
    e.dataTransfer.setData("cardIndex", index.toString());
    e.dataTransfer.effectAllowed = "move";
    setDraggedCard(card);
  }, [setDraggedCard]);

  return {
    draggedCard,
    isDragging,
    setDraggedCard,
    handleDragOver,
    handleDrop,
    handleUnitDragStart,
    handleUnitDrop,
    handleCardDragStart
  };
};