import { GameLogic } from "./GameLogic";
import { GameStatus } from "@card-game/shared";

export class GameLoopManager {
  private timers: NodeJS.Timeout[] = [];

  constructor(
    private getGameLogic: () => GameLogic | null,
    private broadcastState: () => void
  ) {}

  public startEnemyTurnSequence() {
    this.clearTimers();

    // 1초 대기 (적 턴 시작 연출)
    const timer1 = setTimeout(() => {
      const gameLogic = this.getGameLogic();
      if (!gameLogic) return;
      
      try {
        // 적 행동 계산 및 결과 전송
        gameLogic.processEnemyTurn();
        this.broadcastState();
        
        const state = gameLogic.getState();

        // 게임이 계속 진행 중이라면 플레이어 턴으로 전환 예약
        if (state.gameStatus === GameStatus.PLAYING) {
          const delay = 1500 + (state.attackLogs.length * 300);
          const timer2 = setTimeout(() => {
            const gameLogic = this.getGameLogic();
            if (!gameLogic) return;
            gameLogic.startPlayerTurn();
            this.broadcastState();
          }, delay);
          this.timers.push(timer2);
        }
      } catch (error) {
        console.error("Enemy turn error:", error);
      }
    }, 1000);
    
    this.timers.push(timer1);
  }

  public clearTimers() {
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];
  }
}