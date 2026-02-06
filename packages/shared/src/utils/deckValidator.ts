import { ErrorCode, createError, type GameError } from "../errors";
import { DeckRules } from "../types";

export const validateDeck = (deckCardIds: string[], options?: { ignoreMinSize?: boolean }): GameError[] => {
  const errors: GameError[] = [];

  if (!options?.ignoreMinSize && deckCardIds.length < DeckRules.MIN_DECK_SIZE) {
    errors.push(createError(ErrorCode.MIN_DECK_SIZE));
  }

  if (deckCardIds.length > DeckRules.MAX_DECK_SIZE) {
    errors.push(createError(ErrorCode.MAX_DECK_SIZE));
  }

  const cardCounts = new Map<string, number>();
  let hasMaxCopiesError = false;

  for (const cardId of deckCardIds) {
    const count = (cardCounts.get(cardId) || 0) + 1;
    
    if (count > DeckRules.MAX_COPIES_PER_CARD && !hasMaxCopiesError) {
      errors.push(createError(ErrorCode.MAX_COPIES_PER_CARD));
      hasMaxCopiesError = true;
    }
    
    cardCounts.set(cardId, count);
  }

  return errors;
};