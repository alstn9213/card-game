import { GameState, GameStatus } from "@card-game/shared";
import { PlayerManager } from "./player/PlayerManager";
import { EnemyManager } from "./enemy/EnemyManager";

export class TurnManager {
  private playerManager!: PlayerManager;

  constructor(
    private getState: () => GameState,
    private enemyManager: EnemyManager
  ) {}

  // 순환 의존성 해결을 위해 Setter로 주입
  public setPlayerManager(playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  public startPlayerTurn() {
    const state = this.getState();
    state.turn++;
    state.isPlayerTurn = true;

    // 플레이어 유닛들의 공격권 초기화 및 드로우
    this.playerManager.onTurnStart();

    this.checkGameOver();
  }

  public endTurn() {
    const state = this.getState();
    if (!state.isPlayerTurn) return;
    state.isPlayerTurn = false;
  }

  public processEnemyTurn() {
    const state = this.getState();
    if (state.gameStatus !== GameStatus.PLAYING) return;
    
    this.enemyManager.executeTurn();    
    this.startPlayerTurn();
  }

  public checkGameOver() {
    const state = this.getState();
    
    // 적 유닛 사망 처리 및 보상 지급
    let activeEnemyCount = 0;
    state.enemyField.forEach((unit, index) => {
      if (unit) {
        if (unit.currentHp <= 0) {
          // 몬스터 처치 시 코스트만큼 금화 획득
          state.currentGold += unit.cost;
          state.enemyField[index] = null;
        } else {
          activeEnemyCount++;
        }
      }
    });

    // 모든 적을 처치했으면 다음 라운드로
    if (activeEnemyCount === 0) {
        this.startNextRound();
    }

    // 승패 조건 확인
    if (state.player.currentHp <= 0) {
      state.gameStatus = GameStatus.DEFEAT;
    } else if (state.round > 50) {
      state.gameStatus = GameStatus.VICTORY;
    }
  }

  // 헬퍼 함수 
  private startNextRound() {
    const state = this.getState();
    state.round++;
    this.enemyManager.spawnRandomEnemies(state);
  }
}
