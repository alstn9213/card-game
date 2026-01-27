import { GameState, GameStatus, TargetSource } from "@card-game/shared";
import { GameUtils } from "../utils/GameUtils";

export class EnemyAI {
  public executeTurn(state: GameState): void {
    // 적 필드의 모든 유닛에 대해 행동 결정
    state.enemyField.forEach((enemyUnit) => {
      if (!enemyUnit) return;
      if (enemyUnit.hasAttacked) return;
      if (state.player.currentHp <= 0) return;

      // 공격 가능한 플레이어 유닛 찾기
      const playerUnits = state.playerField
        .map((u, i) => ({ unit: u, index: i }))
        .filter((item) => item.unit !== null);

      if (playerUnits.length > 0) {
        // 전략: 체력이 가장 낮은 유닛을 우선적으로 공격 (Kill Priority)
        playerUnits.sort((a, b) => a.unit!.currentHp - b.unit!.currentHp);
        const target = playerUnits[0];
        const targetUnit = state.playerField[target.index]!;

        // 공격 실행
        targetUnit.currentHp -= enemyUnit.attackPower;

        // 유닛 사망 처리
        GameUtils.processUnitDeath(state, {
          target: targetUnit,
          index: target.index,
          source: TargetSource.PLAYER_FIELD
        });
        
      } else if (state.player.currentHp > 0) {
        // 방해물이 없으면 플레이어 본체 직접 공격
        state.player.currentHp -= enemyUnit.attackPower;
      }

      if (state.player.currentHp <= 0) {
        state.gameStatus = GameStatus.DEFEAT;
      }

      enemyUnit.hasAttacked = true;
    });
  }
}