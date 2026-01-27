import { GameState, Entity, FieldUnit, TargetSource } from "@card-game/shared";

export interface TargetResult {
  target: Entity | FieldUnit | undefined;
  index: number;
  source: TargetSource;
}

export class GameUtils {

  /**
   * 게임 상태(GameState)에서 ID를 기반으로 대상을 찾는 함수.
   * 적 본체, 적 유닛, 플레이어 본체, 플레이어 유닛 순으로 검색.
   */
  public static findTarget(state: GameState, targetId: string): TargetResult {
   
    // 적 유닛 확인
    const enemyIndex = state.enemyField.findIndex(u => u?.id === targetId);
    if (enemyIndex !== -1) {
      return { target: state.enemyField[enemyIndex]!, index: enemyIndex, source: TargetSource.ENEMY_FIELD };
    }

    // 플레이어 본체 확인
    if (targetId === "player" || targetId === state.player.id) {
      return { target: state.player, index: -1, source: TargetSource.PLAYER };
    }

    // 플레이어 유닛 확인
    const playerIndex = state.playerField.findIndex(u => u?.id === targetId);
    if (playerIndex !== -1) {
      return { target: state.playerField[playerIndex]!, index: playerIndex, source: TargetSource.PLAYER_FIELD };
    }

    return { target: undefined, index: -1, source: TargetSource.NONE };
  }

  /**
   * 유닛의 체력이 0 이하일 경우 필드에서 제거하는 함수.
   * 플레이어는 제거되지 않음 (게임 종료 조건에서 처리).
   */
  public static processUnitDeath(state: GameState, result: TargetResult): void {
    const { target, index, source } = result;
    if (!target || target.currentHp > 0) return;

    if (source === TargetSource.ENEMY_FIELD) {
      const enemyUnit = target as FieldUnit;
      const reward = enemyUnit.cost; 
      state.currentGold += reward;
      state.enemyField[index] = null;
      
    } else if (source === TargetSource.PLAYER_FIELD) {
      state.playerField[index] = null;
    }
  }

  /**
   * Fisher-Yates 알고리즘을 사용한 배열 셔플 함수
   */
  public static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]; // 원본 보존을 위해 복사
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
