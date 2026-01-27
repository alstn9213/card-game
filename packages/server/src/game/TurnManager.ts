import { GameState, GameStatus } from "@card-game/shared";
import { PlayerManager } from "./player/PlayerManager";
import { EnemyManager } from "./enemy/EnemyManager";

export class TurnManager {
  private playerManager!: PlayerManager;
  private enemyTurnTimeout: NodeJS.Timeout | null = null;

  constructor(
    private getState: () => GameState,
    private enemyManager: EnemyManager,
    // GameSession의 broadcastState를 주입받음
    private broadcast: () => void
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
    // 플레이어 턴이 종료된 중간 상태를 즉시 전파
    this.broadcast();

    // 기존 타이머를 정리하고 적 턴을 예약
    this.clearTimers();
    this.enemyTurnTimeout = setTimeout(() => {
      this.enemyTurnTimeout = null;
      this.processEnemyTurn();
    }, 1000);
  }

  public processEnemyTurn() {
    const state = this.getState();
    if (state.gameStatus !== GameStatus.PLAYING) return;

    this.enemyManager.executeTurn();
    this.startPlayerTurn();
    this.broadcast();
  }

  public checkGameOver() {
    const state = this.getState();
    
    // 적 유닛이 모두 제거되었는지 확인
    const activeEnemyCount = state.enemyField.filter(unit => unit !== null).length;

    // 모든 적을 처치했으면 다음 라운드로
    if (activeEnemyCount === 0) {
        this.onRoundClear();
    }

    // 승패 조건 확인
    if (state.player.currentHp <= 0) {
      state.gameStatus = GameStatus.DEFEAT;
    } else if (state.round > 50) {
      state.gameStatus = GameStatus.VICTORY;
    }
  }

  // 게임 종료 또는 재시작 시 타이머를 정리하기 위한 메서드
  public clearTimers() {
    if (this.enemyTurnTimeout) {
      clearTimeout(this.enemyTurnTimeout);
      this.enemyTurnTimeout = null;
    }
  }

  // 라운드 클리어 처리: 체력 회복 및 상점 단계 준비
  private onRoundClear() {
    const state = this.getState();

    //  플레이어 체력 회복 (예: 최대 체력의 10%)
    const healAmount = Math.floor(state.player.maxHp * 0.1) || 1;
    state.player.currentHp = Math.min(state.player.maxHp, state.player.currentHp + healAmount);

    // 상점 단계로 진입하여 게임 진행을 일시 중단
    // 이번 라운드에 등장했던 적들을 상점 판매 목록으로 등록
    state.shopItems = [...state.currentRoundEnemies];
    
    state.gameStatus = GameStatus.SHOP;
    this.broadcast();
  }

  public startNextRound() {
    const state = this.getState();
    // 상점 단계 종료 후 다시 게임 진행 상태로 변경
    state.gameStatus = GameStatus.PLAYING;
    state.round++;
    this.enemyManager.spawnRandomEnemies(state);
  }
}
