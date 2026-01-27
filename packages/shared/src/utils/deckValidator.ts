import { UNIT_CARDS } from "../data/units";
import { DeckRules, DeckErrorMessages } from "../types";

export const validateDeck = (deckCardIds: string[]): void => {
  if (deckCardIds.length < DeckRules.MIN_DECK_SIZE) {
    throw new Error(DeckErrorMessages.MIN_DECK_SIZE(DeckRules.MIN_DECK_SIZE));
  }

  if (deckCardIds.length > DeckRules.MAX_DECK_SIZE) {
    throw new Error(DeckErrorMessages.MAX_DECK_SIZE(DeckRules.MAX_DECK_SIZE));
  }

  const cardCounts = new Map<string, number>();
  const allCards = Object.values(UNIT_CARDS);

  for (const cardId of deckCardIds) {
    const count = (cardCounts.get(cardId) || 0) + 1;
    const cardData = allCards.find((c: any) => c.cardId === cardId);
    const cardName = cardData ? cardData.name : cardId;
    
    // 3장 초과 체크
    if (count > DeckRules.MAX_COPIES_PER_CARD) {
      throw new Error(DeckErrorMessages.MAX_COPIES_PER_CARD(cardName, DeckRules.MAX_COPIES_PER_CARD));
    }
    
    cardCounts.set(cardId, count);
  }
};