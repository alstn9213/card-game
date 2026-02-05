import { GameState } from "@card-game/shared";
import { AiAttackHandler } from "./handlers/AiAttackHandler";
import { EnemySpawnHandler } from "./handlers/EnemySpawnHandler";


export class EnemyManager {
  private aiAttackHandler: AiAttackHandler;
  private enemySpawnHandler: EnemySpawnHandler;

  constructor(private getState: () => GameState) {
    this.aiAttackHandler = new AiAttackHandler(getState);
    this.enemySpawnHandler = new EnemySpawnHandler();
  }

  // 몬스터 소환 메서드
  public spawnRandomEnemies(state: GameState): void {
    this.enemySpawnHandler.execute(state);
  }

  // 적 공격 메서드 (AI)
  public attack(): void {
    const state = this.getState();

    this.aiAttackHandler.execute(state);
  }
}