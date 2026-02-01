import { createError, ErrorCode, GameState } from "@card-game/shared";
import { GameUtils } from "../../utils/GameUtils";

export class DrawHandler {
  constructor(
    private getState: () => GameState
  ) {}

  public execute(cardIndex: number, amount: number): void {
    const state = this.getState();
    this.validate(state, cardIndex);
    GameUtils.drawCard(state, amount);
  }

  private validate(state: GameState, cardIndex: number): void {
    const card = state.hand[cardIndex];
    if (!card) throw createError(ErrorCode.CARD_NOT_FOUND);
    
    if (state.currentGold < card.cost) throw createError(ErrorCode.NOT_ENOUGH_GOLD);
  }
}