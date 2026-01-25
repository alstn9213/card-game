import { AbilityHandler } from "../types";
import { GameSession } from "../../GameSession";
import { Ability } from "@card-game/shared";
import { GameUtils } from "../../utils/GameUtils";

export class DamageHandler implements AbilityHandler {
  execute(session: GameSession, playerId: string, cardInstanceId: string, ability: Ability): void {
    // 데미지 값이나 타겟 ID가 없으면 실행하지 않음
    if (!ability.value || !ability.targetId) return;

    const state = session.getGameState();
    
    // GameUtils를 사용하여 타겟 찾기
    const targetResult = GameUtils.findTarget(state, ability.targetId);
    const { target } = targetResult;

    if (!target) return;

    target.currentHp -= ability.value;

    GameUtils.processUnitDeath(state, targetResult);
  }
}
