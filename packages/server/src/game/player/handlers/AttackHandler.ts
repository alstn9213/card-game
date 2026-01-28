import { GameState, GameStatus, ErrorCode, TargetSource } from "@card-game/shared";
import { GameUtils } from "../../utils/GameUtils";
import { createError } from "../../GameErrors";

export class AttackHandler {
  constructor(
    private getState: () => GameState,
    private checkGameOver: () => void
  ) {}

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

    this.checkGameOver();
  }

  // 헬퍼 메서드
  
  private validate(state: GameState, attackerId: string, targetId: string): void {
    if (!state.isPlayerTurn || state.gameStatus !== GameStatus.PLAYING) {
      throw createError(ErrorCode.NOT_YOUR_TURN);
    }
    const attacker = state.playerField.find(u => u?.id === attackerId);
    if (!attacker) throw createError(ErrorCode.NO_UNIT_TO_ATTACK);
    if (attacker.hasAttacked) throw createError(ErrorCode.ALREADY_ATTACKED);

    const { target, source } = GameUtils.findTarget(state, targetId);

    if (!target) throw createError(ErrorCode.TARGET_NOT_FOUND);
    
    if (source !== TargetSource.ENEMY_FIELD) throw createError(ErrorCode.ATTACK_ENEMY_ONLY);
  }
}
