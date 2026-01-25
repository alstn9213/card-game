import { GameState, Entity, FieldUnit } from "@card-game/shared";

export interface TargetResult {
  target: Entity | FieldUnit | undefined;
  index: number;
  source: "enemy-hero" | "enemy-field" | "player-hero" | "player-field" | "none";
}

export class GameUtils {
  /**
   * 게임 상태(GameState)에서 ID를 기반으로 대상을 찾습니다.
   * 적 본체, 적 유닛, 플레이어 본체, 플레이어 유닛 순으로 검색합니다.
   */
  public static findTarget(state: GameState, targetId: string): TargetResult {
    // 1. 적 본체 확인
    if (targetId === "enemy" || targetId === state.enemy.id) {
      return { target: state.enemy, index: -1, source: "enemy-hero" };
    }

    // 2. 적 유닛 확인
    const enemyIndex = state.enemyField.findIndex(u => u?.id === targetId);
    if (enemyIndex !== -1) {
      return { target: state.enemyField[enemyIndex]!, index: enemyIndex, source: "enemy-field" };
    }

    // 3. 플레이어 본체 확인
    if (targetId === "player" || targetId === state.player.id) {
      return { target: state.player, index: -1, source: "player-hero" };
    }

    // 4. 플레이어 유닛 확인
    const playerIndex = state.playerField.findIndex(u => u?.id === targetId);
    if (playerIndex !== -1) {
      return { target: state.playerField[playerIndex]!, index: playerIndex, source: "player-field" };
    }

    return { target: undefined, index: -1, source: "none" };
  }

  /**
   * 유닛의 체력이 0 이하일 경우 필드에서 제거합니다.
   * 영웅(Hero)의 경우 제거되지 않습니다 (게임 종료 조건에서 처리).
   */
  public static processUnitDeath(state: GameState, result: TargetResult): void {
    const { target, index, source } = result;
    if (!target || target.currentHp > 0) return;

    if (source === "enemy-field") {
      state.enemyField[index] = null;
    } else if (source === "player-field") {
      state.playerField[index] = null;
    }
  }
}
