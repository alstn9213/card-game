import { GameState, GameStatus, ErrorCode, createError } from "@card-game/shared";
import { GameUtils } from "./utils/GameUtils";

export class TurnManager {
  constructor(
    private getState: () => GameState,
  ) {}

  // 플레이어의 턴을 시작하는 메서드
  public startPlayerTurn() {
    const state = this.getState();
    state.turn++;
    state.isPlayerTurn = true;
    state.attackLogs = [];

    // 유닛 공격권 초기화
    state.playerField.forEach(unit => {
      if (unit) unit.hasAttacked = false;
    });

    GameUtils.drawCard(state);

    this.updateGameStatus();
  }

  // 플레이어의 턴을 종료하는 메서드
  public endTurn() {
    const state = this.getState();
    if (state.gameStatus !== GameStatus.PLAYING) {
      throw createError(ErrorCode.NOT_YOUR_TURN);
    }
    if (!state.isPlayerTurn) {
      console.warn(`[TurnManager] 플레이어의 턴이 스킵되었습니다. GameStatus: ${state.gameStatus}`);
      return;
    }
    state.isPlayerTurn = false;
  }

  // 게임 상태 업데이트 (승패 체크 및 라운드 클리어 체크)
  public updateGameStatus() {
    if (this.checkGameOver()) {
      return;
    }
    else {
      this.checkRoundClear();
    }
  }

  // 게임 종료 여부 판단 헬퍼 (승리/패배)
  private checkGameOver(): boolean {
    const state = this.getState();
    if (state.gameStatus !== GameStatus.PLAYING) {
      console.warn("[TuenManager] 게임이 종료되었습니다.");
      return true;
    }

    if (state.player.currentHp <= 0) {
      state.gameStatus = GameStatus.DEFEAT;
      console.log(`[TurnManager] 플레이어가 패배했습니다.`);
      return true;
    } 
    
    else if (state.round > 50) {
      state.gameStatus = GameStatus.VICTORY;
      console.log(`[TurnManager] 플레이어가 승리했습니다.`);
      return true;
    }

    return false;
  }

  // 적 몬스터를 전부 무찔렀는지 판단하는 헬퍼
  private checkRoundClear() {
    const state = this.getState();
    const activeEnemyCount = state.enemyField.filter(unit => unit !== null).length;

    if (activeEnemyCount === 0) {
      state.shopItems = [...state.currentRoundEnemies];
      state.gameStatus = GameStatus.SHOP;
    }
  }

  // 다음 라운드를 시작하는 메서드
  public startNextRound() {
    const state = this.getState();

    if (state.gameStatus !== GameStatus.SHOP) {
      throw createError(ErrorCode.GAME_NOT_SHOP);
    }

    state.gameStatus = GameStatus.PLAYING;
    state.round++;
    this.startPlayerTurn();
  }
}
