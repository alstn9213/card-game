import { GameState } from "@card-game/shared";
import { PlayCardHandler } from "./handlers/PlayCardHandler";
import { AttackHandler } from "./handlers/AttackHandler";
import { GameUtils } from "../utils/GameUtils";

export class PlayerManager {
  private playCardHandler: PlayCardHandler;
  private attackHandler: AttackHandler;

  constructor(
    private getState: () => GameState,
    private checkGameOver: () => void
  ) {
    this.playCardHandler = new PlayCardHandler(getState, checkGameOver);
    this.attackHandler = new AttackHandler(getState, checkGameOver);
  }

  public playCard(cardIndex: number): void {
    this.playCardHandler.execute(cardIndex);
  }

  // 공격 함수
  public attack(attackerId: string, targetId: string): void {
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