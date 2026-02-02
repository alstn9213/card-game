import { GameState, GameStatus, ErrorCode, GameCard, DeckRules, createError } from "@card-game/shared";
import { v4 as uuidv4 } from 'uuid';
import { GameUtils } from "../utils/GameUtils";

export class ShopManager {
  constructor(private getState: () => GameState) {}

  public buyCard(cardIndex: number): void {
    const state = this.getState();
    
    if (state.gameStatus !== GameStatus.SHOP) {
      throw createError(ErrorCode.GAME_NOT_SHOP);
    }

    const cardData = state.shopItems[cardIndex];

    if (!cardData) {
      throw createError(ErrorCode.CARD_NOT_FOUND);
    }

    const currentCardCount = state.deck.filter(c => c.cardId === cardData.cardId).length;

    if (currentCardCount >= DeckRules.MAX_COPIES_PER_CARD) {
      throw createError(ErrorCode.MAX_COPIES_PER_CARD);
    }

    else if (state.currentGold < cardData.cost) {
      throw createError(ErrorCode.NOT_ENOUGH_GOLD);
    }

    state.currentGold -= cardData.cost;
    
    // 덱에 추가 (새 인스턴스 생성)
    const newCard: GameCard = { 
      ...cardData,
      id: uuidv4(), 
      ownerId: state.player.id 
    };
    
    state.deck.push(newCard);
    GameUtils.shuffleArray(state.deck);
    state.shopItems.splice(cardIndex, 1); // 구매한 카드는 목록에서 제거
  }
}
