import { AbilityHandler } from "../types";
import { Ability, GameState, ErrorCode } from "@card-game/shared";
import { GameUtils } from "../../utils/GameUtils";
import { createError } from "../../GameErrors";

export class DamageHandler implements AbilityHandler {
  execute(gameState: GameState, playerId: string, cardInstanceId: string, ability: Ability, targetId?: string): void {
    // 동적 타겟(targetId)이 있으면 그것을 사용하고, 없으면 정적 타겟(ability.targetId) 사용
    const finalTargetId = targetId || ability.targetId;

    // 데미지 값이나 타겟 ID가 없으면 에러
    if (!ability.value || !finalTargetId) {
      throw createError(ErrorCode.INVALID_ABILITY, "데미지 값이나 타겟이 없습니다.");
    }

    // GameUtils를 사용하여 타겟 찾기
    const targetResult = GameUtils.findTarget(gameState, finalTargetId);
    const { target } = targetResult;

    if (!target) {
      throw createError(ErrorCode.TARGET_NOT_FOUND);
    }

    console.log(`[DamageHandler] ${target.name}에게 ${ability.value} 데미지! (남은 HP: ${target.currentHp} -> ${target.currentHp - ability.value})`);

    target.currentHp -= ability.value;

    GameUtils.processUnitDeath(gameState, targetResult);
  }
}
