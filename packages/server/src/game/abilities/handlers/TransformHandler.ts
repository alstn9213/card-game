import { Ability } from "@card-game/shared/src/interfaces";
import { UNIT_CARDS } from "@card-game/shared/src/data/units";
import { GameSession } from "../../GameSession";
import { AbilityHandler } from "../types";

export class TransformHandler implements AbilityHandler {
  execute(session: GameSession, playerId: string, cardInstanceId: string, ability: Ability) {
    const playerState = session.getGameState().player[playerId];
    
    // 1. 대상 유닛 찾기
    const unitIndex = playerState.field.findIndex(u => u.instanceId === cardInstanceId);
    if (unitIndex === -1) return;

    // 2. 변신 대상 데이터 확인
    if (!ability.targetId) return;
    const targetCardData = UNIT_CARDS.find(c => c.cardId === ability.targetId);
    if (!targetCardData) return;

    // 3. 실제 변신 로직 수행
    console.log(`${playerState.field[unitIndex].cardId}이(가) ${targetCardData.name}(으)로 변신합니다! (Handler 처리)`);

    playerState.field[unitIndex] = {
      ...playerState.field[unitIndex],
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