import { Ability, GameState, UNIT_CARDS } from "@card-game/shared";
import { AbilityHandler } from "../types";

export class TransformHandler implements AbilityHandler {
  execute(gameState: GameState, playerId: string, cardInstanceId: string, ability: Ability) {
    // 플레이어 확인 (현재는 플레이어 필드만 처리)
    if (gameState.player.id !== playerId) return;
    
    // 1. 대상 유닛 찾기
    const unitIndex = gameState.playerField.findIndex(u => u?.id === cardInstanceId);
    if (unitIndex === -1) return;

    // 2. 변신 대상 데이터 확인
    if (!ability.targetId) return;
    const targetCardData = UNIT_CARDS.find(c => c.cardId === ability.targetId);
    if (!targetCardData) return;

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