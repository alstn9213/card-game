import { GameState, GameStatus, ErrorCode, GameCard, DeckRules } from "@card-game/shared";
import { v4 as uuidv4 } from 'uuid';
import { createError } from "../GameErrors";

export class ShopManager {
  constructor(private getState: () => GameState) {}

  public buyCard(cardIndex: number): void {
    const state = this.getState();
    
    if (state.gameStatus !== GameStatus.SHOP) {
      throw createError(ErrorCode.UNKNOWN_ERROR);
    }

    const cardData = state.shopItems[cardIndex];
    if (!cardData) {
      throw createError(ErrorCode.CARD_NOT_FOUND);
    }

    // 보유 한도 체크 (3장 제한)
    const currentCount = state.deck.filter(c => c.cardId === cardData.cardId).length;
    if (currentCount >= DeckRules.MAX_COPIES_PER_CARD) {
      throw createError(ErrorCode.UNKNOWN_ERROR);
    }

    if (state.currentGold < cardData.cost) {
      throw createError(ErrorCode.NOT_ENOUGH_GOLD);
    }

    // 구매 처리
    state.currentGold -= cardData.cost;
    
    // 덱에 추가 (새 인스턴스 생성)
    const newCard: GameCard = { ...cardData, id: uuidv4(), ownerId: state.player.id };
    // 덱의 맨 뒤에 추가 (다음 드로우 사이클에 등장)
    state.deck.push(newCard);
    state.shopItems.splice(cardIndex, 1); // 구매한 카드는 목록에서 제거
  }
}
