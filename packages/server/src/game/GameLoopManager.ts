import { GameStatus, GameState } from "@card-game/shared";
import { TurnManager } from "./TurnManager";

export class GameLoopManager {
  private timers: NodeJS.Timeout[] = [];

  constructor(
    private getTurnManager: () => TurnManager | null,
    private getGameState: () => GameState | null,
    private broadcastState: () => void
  ) {}

  public startEnemyTurnSequence() {
    this.clearTimers();

    // 1초 대기 (적 턴 시작 연출)
    const timer1 = setTimeout(() => {
      const turnManager = this.getTurnManager();
      const state = this.getGameState();
      if (!turnManager || !state) return;
      
      try {
        // 적 행동 계산 및 결과 전송
        turnManager.processEnemyTurn();
        this.broadcastState();
        
        // 게임이 계속 진행 중이라면 플레이어 턴으로 전환 예약
        if (state.gameStatus === GameStatus.PLAYING) {
          const delay = 1500 + (state.attackLogs.length * 300);
          const timer2 = setTimeout(() => {
            const tm = this.getTurnManager();
            if (!tm) return;
            
            tm.startPlayerTurn();
            this.broadcastState();
          }, delay);
          this.timers.push(timer2);
        }
      } catch (error) {
        console.error("Enemy turn error:", error);
        // 에러 발생 시 게임이 멈추지 않도록 안전장치 가동
        // 게임이 진행 중이라면 강제로 플레이어 턴을 시작하게 함
        if (state && state.gameStatus === GameStatus.PLAYING) {
          turnManager.startPlayerTurn();
          this.broadcastState();
        }
      }
    }, 1000);
    
    this.timers.push(timer1);
  }

  public clearTimers() {
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];
  }
}