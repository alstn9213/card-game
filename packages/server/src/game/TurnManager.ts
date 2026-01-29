import { GameState, GameStatus, ErrorCode, createError } from "@card-game/shared";
import { PlayerManager } from "./player/PlayerManager";
import { EnemyManager } from "./enemy/EnemyManager";

export class TurnManager {
  private playerManager: PlayerManager;

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
    state.attackLogs = [];
    this.playerManager.onTurnStart();
    this.checkGameOver();
  }

  public endTurn() {
    const state = this.getState();
    if (state.gameStatus !== GameStatus.PLAYING) {
      throw createError(ErrorCode.NOT_YOUR_TURN);
    }
    if (!state.isPlayerTurn) return;
    state.isPlayerTurn = false;
  }

  public processEnemyTurn() {
    const state = this.getState();
    if (state.gameStatus !== GameStatus.PLAYING) return;
    state.attackLogs = [];
    this.enemyManager.executeTurn();
  }

  public checkGameOver() {
    const state = this.getState();    
    if (state.gameStatus !== GameStatus.PLAYING) return;

    if (state.player.currentHp <= 0) {
      state.gameStatus = GameStatus.DEFEAT;
      return;
    } 
    
    else if (state.round > 50) {
      state.gameStatus = GameStatus.VICTORY;
      return;
    }

    // 적 유닛이 모두 제거되었는지 확인
    const activeEnemyCount = state.enemyField.filter(unit => unit !== null).length;

    if (activeEnemyCount === 0) {
        this.onRoundClear();
        return;
    }
  }

  // 라운드 클리어 -> 상점 단계 준비
  private onRoundClear() {
    const state = this.getState();
    state.shopItems = [...state.currentRoundEnemies];
    state.gameStatus = GameStatus.SHOP;
  }

  public startNextRound() {
    const state = this.getState();
    state.gameStatus = GameStatus.PLAYING;
    state.round++;
    this.enemyManager.spawnRandomEnemies(state);    
    this.startPlayerTurn();
  }
}
