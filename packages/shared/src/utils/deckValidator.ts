import { ErrorCode, createError } from "../errors";
import { DeckRules } from "../types";

export const validateDeck = (deckCardIds: string[]): void => {
  if (deckCardIds.length < DeckRules.MIN_DECK_SIZE) {
    throw createError(ErrorCode.MIN_DECK_SIZE);
  }

  if (deckCardIds.length > DeckRules.MAX_DECK_SIZE) {
    throw createError(ErrorCode.MAX_DECK_SIZE);
  }

  const cardCounts = new Map<string, number>();

  for (const cardId of deckCardIds) {
    const count = (cardCounts.get(cardId) || 0) + 1;
    
    if (count > DeckRules.MAX_COPIES_PER_CARD) {
      throw createError(ErrorCode.MAX_COPIES_PER_CARD);
    }
    
    cardCounts.set(cardId, count);
  }
};