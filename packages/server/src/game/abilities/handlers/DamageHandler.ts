import { AbilityHandler } from "../types";
import { Ability, GameState, ErrorCode } from "@card-game/shared";
import { GameUtils } from "../../utils/GameUtils";
import { createError } from "../../GameErrors";

export class DamageHandler implements AbilityHandler {
  execute(gameState: GameState, playerId: string, cardInstanceId: string, ability: Ability, targetId?: string): void {
    // 동적 타겟(targetId)이 있으면 그것을 사용하고, 없으면 정적 타겟(ability.targetId) 사용
    const finalTargetId = targetId || ability.targetId;

    if (!ability.value || !finalTargetId) {
      throw createError(ErrorCode.INVALID_ABILITY);
    }

    const targetResult = GameUtils.findTarget(gameState, finalTargetId);
    const { target } = targetResult;

    if (!target) {
      throw createError(ErrorCode.TARGET_NOT_FOUND);
    }

    target.currentHp -= ability.value;

    GameUtils.processUnitDeath(gameState, targetResult);
  }
}
