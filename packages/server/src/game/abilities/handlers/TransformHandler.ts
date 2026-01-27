import { Ability, GameState, UNIT_CARDS, ErrorCode } from "@card-game/shared";
import { AbilityHandler } from "../types";
import { createError } from "../../GameErrors";

export class TransformHandler implements AbilityHandler {
  execute(gameState: GameState, playerId: string, cardInstanceId: string, ability: Ability, targetId?: string) {
    if (gameState.player.id !== playerId) {
      throw createError(ErrorCode.INVALID_PLAYER);
    }
    
    // 1. 대상 유닛 찾기
    const unitIndex = gameState.playerField.findIndex(u => u?.id === cardInstanceId);
    if (unitIndex === -1) {
      throw createError(ErrorCode.CARD_NOT_ON_FIELD);
    }

    // 2. 변신 대상 데이터 확인
    if (!ability.targetId) {
      throw createError(ErrorCode.INVALID_ABILITY, "변신 대상 ID가 없습니다.");
    }
    const targetCardData = UNIT_CARDS.find(c => c.cardId === ability.targetId);
    if (!targetCardData) {
      throw createError(ErrorCode.CARD_NOT_FOUND, "변신할 카드 데이터를 찾을 수 없습니다.");
    }

    const currentUnit = gameState.playerField[unitIndex]!;

    // 3. 실제 변신 로직 수행
    console.log(`${currentUnit.name}이(가) ${targetCardData.name}(으)로 변신합니다!`);

    gameState.playerField[unitIndex] = {
      ...currentUnit,
      cardId: targetCardData.cardId,
      name: targetCardData.name,
      description: targetCardData.description,
      type: targetCardData.type,
      targetType: targetCardData.targetType,
      abilities: targetCardData.abilities,
      attackPower: targetCardData.attackPower,
      maxHp: targetCardData.maxHp,
      currentHp: targetCardData.maxHp,
      cost: targetCardData.cost,
    };
  }
}