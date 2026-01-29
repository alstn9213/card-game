import { GameState, ErrorCode, createError, GameStatus } from "@card-game/shared";
import { PlayCardHandler } from "./handlers/PlayCardHandler";
import { AttackHandler } from "./handlers/AttackHandler";
import { GameUtils } from "../utils/GameUtils";

export class PlayerManager {
  private playCardHandler: PlayCardHandler;
  private attackHandler: AttackHandler;

  constructor(
    private getState: () => GameState
  ) {
    this.playCardHandler = new PlayCardHandler(getState);
    this.attackHandler = new AttackHandler(getState);
  }

  // 카드 소환 함수
  public playCard(cardIndex: number): void {
    const state = this.getState();
    if (state.gameStatus !== GameStatus.PLAYING) {
      throw createError(ErrorCode.NOT_YOUR_TURN);
    }
    this.playCardHandler.execute(cardIndex);
  }

  // 공격 함수
  public attack(attackerId: string, targetId: string): void {
    const state = this.getState();
    if (state.gameStatus !== GameStatus.PLAYING) {
      throw createError(ErrorCode.NOT_YOUR_TURN);
    }
    this.attackHandler.execute(attackerId, targetId);
  }

  // 라운드 시작시, 조건 초기화 함수
  public onTurnStart() {
    const state = this.getState();

    // 유닛 공격권 초기화
    state.playerField.forEach(unit => {
      if (unit) unit.hasAttacked = false;
    });

    GameUtils.drawCard(state);
  }
}