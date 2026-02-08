import { createError, ErrorCode, GameState, GameStatus } from "@card-game/shared";
import { AiAttackHandler } from "./handlers/AiAttackHandler";
import { EnemySpawnHandler } from "./handlers/EnemySpawnHandler";


export class EnemyManager {
  private aiAttackHandler: AiAttackHandler;
  private enemySpawnHandler: EnemySpawnHandler;

  constructor(
    private getState: () => GameState
  ) {
    this.aiAttackHandler = new AiAttackHandler(getState);
    this.enemySpawnHandler = new EnemySpawnHandler(getState);
  }

  // 몬스터 소환 메서드
  public spawnEnemies(): void {
    const state = this.getState();

    if (state.gameStatus !== GameStatus.ENEMY_TURN) {
      throw createError(ErrorCode.NOT_ENEMY_TURN);
    }

    this.enemySpawnHandler.execute();
  }

  // 공격 메서드
  public attack(): void {
    const state = this.getState();

    if (state.gameStatus !== GameStatus.ENEMY_TURN) {
      throw createError(ErrorCode.NOT_ENEMY_TURN);
    }

    this.aiAttackHandler.execute();
  }
}