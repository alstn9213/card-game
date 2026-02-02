import { GameStatus, GameState } from "@card-game/shared";
import { TurnManager } from "./TurnManager";

export class GameLoopManager {
  private timers: NodeJS.Timeout[] = [];

  constructor(
    private getTurnManager: () => TurnManager | null,
    private getGameState: () => GameState | null,
    private broadcastState: () => void
  ) {}

  public async startEnemyTurnSequence() {
    this.clearTimers();

    try {
      // 적 턴 시작 연출 대기 (1초)
      await this.wait(1000);

      const turnManager = this.getTurnManager();
      const state = this.getGameState();

      if (!turnManager || !state) {
        console.warn("[GameLoopManager] turnManager 또는 state가 없습니다.");
        return;
      }

      // 적 행동 계산 및 결과 전송
      turnManager.processEnemyTurn();
      this.broadcastState();

      // 게임이 계속 진행 중이라면 플레이어 턴 전환 대기
      if (state.gameStatus === GameStatus.PLAYING) {
        const delay = 1500 + (state.attackLogs.length * 600);
        await this.wait(delay);

        // 대기 후 상태 재확인 (그 사이 게임이 끝났거나 유저가 나갔을 수 있음)
        const tm = this.getTurnManager();
        if (tm) {
          tm.startPlayerTurn();
          this.broadcastState();
        }
      }
    } catch (error) {
      console.error("[GameLoopManager] 적 턴 처리중 에러 발생:", error);
      // 에러 발생 시 복구 로직
      const tm = this.getTurnManager();
      const st = this.getGameState();
      if (tm && st && st.gameStatus === GameStatus.PLAYING) {
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