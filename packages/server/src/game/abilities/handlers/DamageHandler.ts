import { AbilityHandler } from "../types";
import { Ability, GameState } from "@card-game/shared";
import { GameUtils } from "../../utils/GameUtils";

export class DamageHandler implements AbilityHandler {
  execute(gameState: GameState, playerId: string, cardInstanceId: string, ability: Ability): void {
    // 데미지 값이나 타겟 ID가 없으면 실행하지 않음
    if (!ability.value || !ability.targetId) return;

    // GameUtils를 사용하여 타겟 찾기
    const targetResult = GameUtils.findTarget(gameState, ability.targetId);
    const { target } = targetResult;

    if (!target) return;

    console.log(`[DamageHandler] ${target.name}에게 ${ability.value} 데미지! (남은 HP: ${target.currentHp} -> ${target.currentHp - ability.value})`);

    target.currentHp -= ability.value;

    GameUtils.processUnitDeath(gameState, targetResult);
  }
}
