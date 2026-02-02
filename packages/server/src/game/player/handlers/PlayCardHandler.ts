import { CardType, GameState, ErrorCode, UnitCard, SpellCard, createError } from "@card-game/shared";
import { GameUtils } from "../../utils/GameUtils";
import { SpellManager } from "../../spells/SpellManager";

export class PlayCardHandler {
  constructor(
    private getState: () => GameState,
    private spellManager: SpellManager
  ) {}

  // 카드 소환 함수
  public execute(cardIndex: number, targetId: string): void {
    const state = this.getState();
    this.validate(state, cardIndex);

    const card = state.hand[cardIndex]!;

    if (card.type === CardType.UNIT) {
      GameUtils.summonUnit(state, card as unknown as UnitCard);
    } 

    else if (card.type === CardType.SPELL) {
      this.spellManager.execute(card as unknown as SpellCard, cardIndex, targetId);
    }

    // 자원 소모 및 뒷정리
    state.currentGold -= card.cost;
    state.hand.splice(cardIndex, 1);
    state.discardPile.push(card);
  }

  // --- 헬퍼 메서드 ---
  private validate(state: GameState, cardIndex: number): void {
    const card = state.hand[cardIndex];

    if (!card) {
      throw createError(ErrorCode.CARD_NOT_FOUND);
    }
    
    if (state.currentGold < card.cost) {
      throw createError(ErrorCode.NOT_ENOUGH_GOLD);
    }
    
    if (card.type === CardType.UNIT) {
       const hasEmptySlot = state.playerField.some(slot => slot === null);
       if (!hasEmptySlot) {
        throw createError(ErrorCode.FIELD_FULL);
       }
    }
  }
}
