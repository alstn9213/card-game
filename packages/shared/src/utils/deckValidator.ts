import { GameCard } from "../interfaces";
import {  } from "../interfaces";
import { DeckRules } from "../types";

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateDeck = (deck: GameCard[]): ValidationResult => {
  const cardCounts = new Map<string, number>();

  for (const card of deck) {
    const count = (cardCounts.get(card.orginalId) || 0) + 1;
    
    // 3장 초과 체크
    if (count > DeckRules.MAX_COPIES_PER_CARD) {
      return { 
        isValid: false, 
        message: `'${card.name}' 카드는 최대 ${DeckRules.MAX_COPIES_PER_CARD}장까지만 넣을 수 있습니다.` 
      };
    }
    
    cardCounts.set(card.orginalId, count);
  }

  return { isValid: true };
};