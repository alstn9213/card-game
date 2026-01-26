import { UNIT_CARDS } from "../data/units";
import { DeckRules } from "../types";

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateDeck = (deckCardIds: string[]): ValidationResult => {
  // 1. 덱 크기 검증
  if (deckCardIds.length < DeckRules.MIN_DECK_SIZE) {
    return {
      isValid: false,
      message: `덱은 최소 ${DeckRules.MIN_DECK_SIZE}장 이상이어야 합니다.`
    };
  }

  if (deckCardIds.length > DeckRules.MAX_DECK_SIZE) {
    return {
      isValid: false,
      message: `덱은 최대 ${DeckRules.MAX_DECK_SIZE}장까지만 구성할 수 있습니다.`
    };
  }

  const cardCounts = new Map<string, number>();
  const allCards = Object.values(UNIT_CARDS);

  for (const cardId of deckCardIds) {
    const count = (cardCounts.get(cardId) || 0) + 1;
    const cardData = allCards.find((c: any) => c.cardId === cardId);
    const cardName = cardData ? cardData.name : cardId;
    
    // 3장 초과 체크
    if (count > DeckRules.MAX_COPIES_PER_CARD) {
      return { 
        isValid: false, 
        message: `'${cardName}' 카드는 최대 ${DeckRules.MAX_COPIES_PER_CARD}장까지만 넣을 수 있습니다.` 
      };
    }
    
    cardCounts.set(cardId, count);
  }

  return { isValid: true };
};