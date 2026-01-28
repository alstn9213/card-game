import { CardType, GameState, GameStatus, ErrorCode, UnitCard } from "@card-game/shared";
import { createError } from "../../GameErrors";
import { GameUtils } from "../../utils/GameUtils";

export class PlayCardHandler {
  constructor(
    private getState: () => GameState,
    private checkGameOver: () => void
  ) {}

  public execute(cardIndex: number): void {
    const state = this.getState();
    this.validate(state, cardIndex);

    const card = state.hand[cardIndex]!;

    if (card.type === CardType.UNIT) {
       GameUtils.summonUnit(state, card as unknown as UnitCard);
    } 

    // 자원 소모 및 뒷정리
    state.currentGold -= card.cost;
    state.hand.splice(cardIndex, 1);
    state.discardPile.push(card);

    this.checkGameOver();
  }

  // --- 헬퍼 메서드 ---
  private validate(state: GameState, cardIndex: number): void {
    if (!state.isPlayerTurn || state.gameStatus !== GameStatus.PLAYING) {
       throw createError(ErrorCode.NOT_YOUR_TURN);
    }
    const card = state.hand[cardIndex];
    if (!card) throw createError(ErrorCode.CARD_NOT_FOUND);
    if (state.currentGold < card.cost) throw createError(ErrorCode.NOT_ENOUGH_GOLD);
    
    if (card.type === CardType.UNIT) {
       const hasEmptySlot = state.playerField.some(slot => slot === null);
       if (!hasEmptySlot) throw createError(ErrorCode.FIELD_FULL);
    }
  }
}
