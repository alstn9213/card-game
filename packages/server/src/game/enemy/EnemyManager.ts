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

  // 적 턴 진행 메서드
  public executeTurn(): void {
    const state = this.getState();

    // 턴 시작 시 기존 유닛들의 공격권 초기화
    state.enemyField.forEach(unit => {
      if (unit) unit.hasAttacked = false;
    });

    this.aiAttackHandler.execute(state);
  }
}