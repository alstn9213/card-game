import { GameState, ErrorCode, TargetSource, createError } from "@card-game/shared";
import { GameUtils } from "../../utils/GameUtils";

export class AttackHandler {
  constructor(
    private getState: () => GameState
  ) {}

  // 공격 함수
  public execute(attackerId: string, targetId: string): void {
    const state = this.getState();
    this.validate(state, attackerId, targetId);

    const attacker = state.playerField.find(u => u?.id === attackerId)!;
    const targetResult = GameUtils.findTarget(state, targetId);
    const { target } = targetResult;

    target!.currentHp -= attacker.attackPower;
    
    // 공격 로그 기록
    state.attackLogs.push({
      attackerId,
      targetId,
      damage: attacker.attackPower
    });

    attacker.hasAttacked = true;

    GameUtils.processUnitDeath(state, targetResult);
  }

  // --- 헬퍼 메서드 ---
  
  private validate(state: GameState, attackerId: string, targetId: string): void {
    const attacker = state.playerField.find(u => u?.id === attackerId);

    if (!attacker) {
      throw createError(ErrorCode.CARD_NOT_FOUND);
    }

    if (attacker.hasAttacked) {
      throw createError(ErrorCode.ALREADY_ATTACKED);
    }

    const { target, source } = GameUtils.findTarget(state, targetId);

    if (!target) {
      throw createError(ErrorCode.TARGET_NOT_FOUND);
    }
    
    if (source !== TargetSource.ENEMY_FIELD) {
      throw createError(ErrorCode.ATTACK_ENEMY_ONLY);
    }
  }
}
