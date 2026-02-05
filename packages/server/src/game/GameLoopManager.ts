import { GameStatus, GameState } from "@card-game/shared";
import { TurnManager } from "./TurnManager";
import { EnemyManager } from "./enemy/EnemyManager";

export class GameLoopManager {
  private timers: NodeJS.Timeout[] = [];

  constructor(
    private getTurnManager: () => TurnManager | null,
    private getGameState: () => GameState | null,
    private getEnemyManager: () => EnemyManager | null,
    private broadcastState: () => void
  ) {}

  public async startEnemyTurnSequence() {
    this.clearTimers();

    try {
      // 적 턴 시작 연출 대기 (1초)
      await this.wait(1000);
      
      const state = this.getGameState();
      const turnManager = this.getTurnManager();
      const enemyManager = this.getEnemyManager();

      if (!turnManager || !state || !enemyManager) {
        console.warn("[GameLoopManager] 매니저 또는 state가 없습니다.");
        return;
      }

      if (state.gameStatus === GameStatus.ENEMY_TURN) {
        turnManager.startEnemyTurn();
        enemyManager.attack();
        turnManager.updateGameStatus();
      }
      
      // 비동기 시간(1초)동안 게임이 끊기는 경우 변경된 상태를 클라이언트에게 전파
      this.broadcastState();

      // 게임이 계속 진행 중이라면 플레이어 턴 전환 대기
      if (state.gameStatus === GameStatus.ENEMY_TURN) {
        const delay = 1500 + (state.attackLogs.length * 600);
        await this.wait(delay);

        // 대기 후 상태 재확인 (그 사이 게임이 끝났거나 유저가 나갔을 수 있음)
        const tm = this.getTurnManager();
        
        if (tm) {
          tm.endEnemyTurn();
          tm.startPlayerTurn();
          this.broadcastState();
        }
      }
      
    } catch (error) {
      console.error("[GameLoopManager] 적 턴 처리중 에러 발생:", error);
      // 에러 발생 시 복구 로직
      const tm = this.getTurnManager();
      const st = this.getGameState();
      // 에러가 나도 게임이 진행 중(적 턴)이었다면 플레이어 턴으로 넘겨줌
      if (tm && st && st.gameStatus === GameStatus.ENEMY_TURN) {
        tm.startPlayerTurn();
        this.broadcastState();
      }
    }
  }

  public clearTimers() {
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];
  }

  // Promise 기반의 대기 함수
  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.timers = this.timers.filter(t => t !== timer);
        resolve();
      }, ms);
      this.timers.push(timer);
    });
  }
}