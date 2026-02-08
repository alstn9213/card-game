import { GameState, GameStatus, TargetSource, FieldUnit, ServerEvents } from "@card-game/shared";
import { GameUtils } from "../../utils/GameUtils";

export class AiAttackHandler {
  constructor(
    private getState: () => GameState
  ) {}
  
  public execute(state: GameState): void {
    // 공격 가능한 적 유닛들을 수집하고 공격력이 높은 순서대로 정렬
    const attackers = state.enemyField
      .filter((u): u is FieldUnit => u !== null && !u.hasAttacked)
      .sort((a, b) => b.attackPower - a.attackPower);

    for (const enemyUnit of attackers) {
      if (state.player.currentHp <= 0) {
        console.warn("[AiAttackHandler] 플레이어의 체력이 0 이하입니다.");
        break;
      }

      // 공격 가능한 플레이어 유닛 찾기
      const playerUnits = state.playerField
        .map((u, i) => ({ unit: u, index: i }))
        .filter((item) => item.unit !== null);

      if (playerUnits.length > 0) {
        // 전략: 체력이 가장 낮은 유닛을 우선적으로 공격 (Low HP Priority)
        playerUnits.sort((a, b) => a.unit!.currentHp - b.unit!.currentHp);

        const target = playerUnits[0];
        const targetUnit = state.playerField[target.index]!;
        const targetHpBeforeAttack = targetUnit.currentHp;

        targetUnit.currentHp -= enemyUnit.attackPower;

        this.handleOverkill(state, enemyUnit, targetUnit, targetHpBeforeAttack);

        GameUtils.processUnitDeath(state, {
          target: targetUnit,
          index: target.index,
          source: TargetSource.PLAYER_FIELD
        });
      } 
      
      else {
        state.player.currentHp = Math.max(0, state.player.currentHp - enemyUnit.attackPower);

        state.attackLogs.push({
          attackerId: enemyUnit.id,
          targetId: TargetSource.PLAYER,
          damage: enemyUnit.attackPower
        });
      }

      enemyUnit.hasAttacked = true;

      if (state.player.currentHp <= 0) {
        state.gameStatus = GameStatus.DEFEAT;
        break;
      }
    }
  }

  // --- 헬퍼 메서드 ---

  private handleOverkill(state: GameState, enemyUnit: FieldUnit, targetUnit: FieldUnit, targetHpBeforeAttack: number) {
    // 유닛이 죽고, 오버킬 데미지가 발생한 경우 플레이어에게 데미지 전달
    if (targetUnit.currentHp <= 0) {
      const overkillDamage = enemyUnit.attackPower - targetHpBeforeAttack;
      if (overkillDamage > 0) {
        state.player.currentHp = Math.max(0, state.player.currentHp - overkillDamage);

        state.attackLogs.push({ 
          attackerId: enemyUnit.id, 
          targetId: TargetSource.PLAYER, 
          damage: overkillDamage 
        });
      }
    }
  }
}